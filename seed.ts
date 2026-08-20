import "dotenv/config";

import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";
import { db } from "@/db";
import { account, user } from "@/db/schema/auth.schema";
import {
  bulletins,
  fundings,
  partnerSchools,
  programs,
  siteStats,
  tcornerSlots,
  testimonials,
} from "@/db/schema/mobility.schema";
import { categories, postTags, posts, tags } from "@/db/schema/cms.schema";
import { faqs } from "@/db/schema/knowledge.schema";

/**
 * Seeds a working local database in one pass:
 *
 *   1. The first administrator account, so someone can get into the console.
 *   2. The mobility domain — PROGRAMS, PARTNER_SCHOOLS, BULLETINS, FUNDINGS,
 *      and TCORNER_SLOTS — with the same content that used to live in
 *      lib/mock/mobility.mock.ts, now written as real rows.
 *
 * Step 2 is skipped automatically if `programs` already has rows, so
 * re-running `pnpm seed` after the first time only touches the admin account
 * (promote/reactivate, same as before) and leaves your program data alone.
 * Pass --force to wipe and re-insert the mobility fixture data too.
 *
 * TCORNER_SLOTS.hostUserId is a required foreign key to a real `user` row.
 * The original mock data had five different named advisors, none of which
 * are real accounts yet — so every slot here is attributed to the seeded
 * admin as a placeholder. Swap in real staff accounts once they exist.
 *
 *   3. A handful of FAQ categories and published FAQs, so /faqs has content.
 *      Like T-Corner, faqs.reviewedById is a required real user — every
 *      seeded FAQ is attributed to the admin as a placeholder reviewer.
 *
 *   4. The newsroom — post CATEGORIES, TAGS, POSTS and POST_TAGS — so /news
 *      lists something and the homepage has notices to show. Seven posts are
 *      published and one is left as a draft, so /admin/posts has both states
 *      to look at. posts.authorId is a required real user: the admin again.
 *
 *   5. TESTIMONIALS and SITE_STATS, which fill /testimonials and the
 *      hand-entered figures on the homepage.
 *
 * Every step is skipped if its own table already has rows, so re-running
 * `pnpm seed` is safe. --force wipes and re-inserts all of them.
 *
 * Not seeded: MEDIA_FILES and POST_ATTACHMENTS. A media row without a real
 * object in MinIO would 404 on download, which is worse than an empty library
 * — upload through /admin/media/upload instead. CONTACT_MESSAGES is left
 * empty too: it is an inbox, and it should fill from the contact form.
 *
 * Run it with:
 *   pnpm seed
 *   pnpm seed --email=ylchen@thu.edu.tw --name="Chen Yi-Ling" --password=secret
 *   pnpm seed --force            # also reset the admin password, AND
 *                                 # wipe + re-insert the mobility fixture data
 *
 * It writes the `user` and `account` rows directly rather than going through
 * `auth.api.signUpEmail`, for two reasons: the `nextCookies` plugin expects a
 * request context that does not exist in a CLI script, and `role` is declared
 * `input: false` in lib/auth.ts, so it cannot be set at sign-up anyway.
 *
 * The password is hashed with better-auth's own `hashPassword`, which is the
 * default hasher configured in lib/auth.ts — so the credential this creates is
 * exactly what the login form verifies against.
 */

const DEFAULTS = {
  email: "admin@thu.edu.tw",
  name: "admin",
  password: "admin123"
};

// ---------- Arguments ----------

type Args = {
  email: string;
  name: string;
  password: string;
  /** True when the password came from a flag or env, not from DEFAULTS. */
  passwordExplicit: boolean;
  force: boolean;
};

function parseArgs(): Args {
  const flags = new Map<string, string>();
  let force = false;

  for (const arg of process.argv.slice(2)) {
    if (arg === "--force") {
      force = true;
      continue;
    }
    const match = /^--([^=]+)=(.*)$/.exec(arg);
    if (match) flags.set(match[1], match[2]);
  }

  const password = flags.get("password") ?? process.env.SEED_ADMIN_PASSWORD;

  return {
    email: flags.get("email") ?? process.env.SEED_ADMIN_EMAIL ?? DEFAULTS.email,
    name: flags.get("name") ?? process.env.SEED_ADMIN_NAME ?? DEFAULTS.name,
    password: password ?? DEFAULTS.password,
    passwordExplicit: password !== undefined,
    force,
  };
}

// ---------- Step 1: Admin account ----------

/** Returns the admin's userId, for TCORNER_SLOTS.hostUserId in step 2. */
async function seedAdmin(args: Args): Promise<string> {
  const email = args.email.trim().toLowerCase();
  const existing = await db.query.user.findFirst({
    where: eq(user.email, email),
  });

  // ----- Existing account: promote, and optionally reset the password -----
  if (existing) {
    const changes: string[] = [];

    if (existing.role !== "admin") {
      await db.update(user).set({ role: "admin" }).where(eq(user.id, existing.id));
      changes.push(`role ${existing.role} → admin`);
    }

    if (!existing.active) {
      await db.update(user).set({ active: true }).where(eq(user.id, existing.id));
      changes.push("reactivated");
    }

    // Only touch the password when explicitly asked. Re-running `pnpm seed` to
    // promote a colleague must not silently reset their password to the default.
    let issuedPassword: string | null = null;
    if (args.force || args.passwordExplicit) {
      const password = args.password;
      const hash = await hashPassword(password);

      const credential = await db.query.account.findFirst({
        where: eq(account.userId, existing.id),
      });

      if (credential && credential.providerId === "credential") {
        await db
          .update(account)
          .set({ password: hash })
          .where(eq(account.id, credential.id));
      } else {
        await db.insert(account).values({
          id: randomUUID(),
          userId: existing.id,
          accountId: existing.id,
          providerId: "credential",
          password: hash,
        });
      }

      issuedPassword = password;
      changes.push("password reset");
    }

    if (changes.length === 0) {
      console.log(`\n✓ ${email} is already an active admin — nothing to do.`);
      console.log(
        `  Its password was left alone. Pass --force to reset it to "${args.password}".\n`
      );
    } else {
      console.log(`\n✓ Updated existing account: ${changes.join(", ")}`);
      report(email, issuedPassword, args.passwordExplicit);
    }

    return existing.id;
  }

  // ----- New account -----
  const password = args.password;
  const userId = randomUUID();

  await db.transaction(async (tx) => {
    await tx.insert(user).values({
      id: userId,
      name: args.name,
      email,
      // No verification email is wired up yet, so trust the seeded address.
      emailVerified: true,
      role: "admin",
      locale: "zh-TW",
      active: true,
    });

    await tx.insert(account).values({
      id: randomUUID(),
      userId,
      accountId: userId,
      providerId: "credential",
      password: await hashPassword(password),
    });
  });

  console.log("\n✓ Created administrator account.");
  report(email, password, args.passwordExplicit);

  return userId;
}

/**
 * Prints the credentials to sign in with. `password` is null when the account
 * already existed and its password was deliberately left untouched.
 */
function report(email: string, password: string | null, wasSupplied: boolean) {
  console.log(`  Email:    ${email}`);

  if (!password) {
    console.log("  Password: unchanged");
  } else if (wasSupplied) {
    console.log("  Password: (the one you supplied)");
  } else {
    console.log(`  Password: ${password}`);
    console.log(
      `\n  ⚠ This is the built-in default from DEFAULTS in seed.ts.`
    );
    console.log("    Change it before this ever runs against a real database.");
  }
}

// ---------- Step 2: Mobility domain fixture data ----------

const PROGRAM_ROWS: (typeof programs.$inferInsert)[] = [
  {
    id: "prg-01",
    slug: "exchange",
    type: "exchange",
    nameZh: "交換學生",
    nameEn: "Semester Exchange",
    overviewZh:
      "以東海學生身分赴姊妹校修讀一至兩學期，免繳姊妹校學費，返校後辦理學分抵免。適合想體驗完整學期海外學習、且能負擔生活費的大二至大四學生。",
    overviewEn:
      "Study at a partner university for one or two semesters as a Tunghai student. Tuition at the host university is waived and credits transfer back on return. Best suited to second- to fourth-year students who want a full semester abroad and can cover living costs.",
    active: true,
    sortOrder: 1,
  },
  {
    id: "prg-02",
    slug: "dual-degree",
    type: "dualDegree",
    nameZh: "雙聯學位",
    nameEn: "Dual Degree",
    overviewZh:
      "在本校與姊妹校各修業一段期間，畢業時同時取得兩校學位。多數學程為「3+1」或「2+2」，需提前一年規劃並經系上審查。",
    overviewEn:
      "Spend part of your studies here and part at a partner university, graduating with a degree from both. Most tracks run 3+1 or 2+2, need a year of planning, and require departmental approval.",
    active: true,
    sortOrder: 2,
  },
  {
    id: "prg-03",
    slug: "short-term",
    type: "shortTerm",
    nameZh: "短期研修",
    nameEn: "Short-Term Programs",
    overviewZh:
      "寒暑假期間為期二至六週的海外研修，涵蓋專題工作坊、文化體驗與企業參訪。無語言門檻限制，是第一次出國的入門選擇。",
    overviewEn:
      "Two- to six-week programs during winter and summer break: topic workshops, cultural immersion, and company visits. No language threshold, making it a good first trip abroad.",
    active: true,
    sortOrder: 3,
  },
  {
    id: "prg-04",
    slug: "internship",
    type: "internship",
    nameZh: "海外實習",
    nameEn: "Overseas Internship",
    overviewZh:
      "由國際處與合作企業、駐外單位共同媒合的海外實習機會，期間三至六個月，部分職缺提供生活津貼。需具備工作語言能力。",
    overviewEn:
      "Internships arranged with partner companies and overseas offices, lasting three to six months. Some placements include a living allowance. Working-language proficiency is required.",
    active: true,
    sortOrder: 4,
  },
  {
    id: "prg-05",
    slug: "language",
    type: "language",
    nameZh: "語言研習",
    nameEn: "Language Study",
    overviewZh:
      "赴姊妹校語言中心進行一學期或一學年的語言密集課程，適合準備雙聯或未來留學、需先補強語言的同學。",
    overviewEn:
      "One semester or one year of intensive language study at a partner language centre — for students preparing for a dual degree or graduate study who need to build proficiency first.",
    active: true,
    sortOrder: 5,
  },
];

const BULLETIN_ROWS: (typeof bulletins.$inferInsert)[] = [
  {
    id: "bul-01",
    programId: "prg-01",
    academicYear: "115",
    term: "2",
    titleZh: "115學年度第2學期交換學生甄選簡章（全球）",
    titleEn: "115-2 Exchange Student Selection — Global",
    region: "global",
    announcedAt: "2026-07-14",
    deadlineAt: "2026-08-15",
    status: "open",
  },
  {
    id: "bul-02",
    programId: "prg-01",
    academicYear: "115",
    term: "2",
    titleZh: "115學年度第2學期交換學生甄選簡章（日韓專案）",
    titleEn: "115-2 Exchange Student Selection — Japan & Korea",
    region: "japan-korea",
    announcedAt: "2026-07-14",
    deadlineAt: "2026-08-08",
    status: "open",
  },
  {
    id: "bul-03",
    programId: "prg-03",
    academicYear: "115",
    term: "2",
    titleZh: "115學年度寒假短期研修計畫簡章",
    titleEn: "115 Winter Short-Term Program Call",
    region: "asia",
    announcedAt: "2026-07-20",
    deadlineAt: "2026-09-30",
    status: "open",
  },
  {
    id: "bul-04",
    programId: "prg-02",
    academicYear: "116",
    term: "1",
    titleZh: "116學年度雙聯學位甄選簡章",
    titleEn: "116-1 Dual Degree Selection",
    region: "global",
    announcedAt: "2026-07-25",
    deadlineAt: "2026-10-15",
    status: "open",
  },
  {
    id: "bul-05",
    programId: "prg-01",
    academicYear: "115",
    term: "1",
    titleZh: "115學年度第1學期交換學生甄選簡章（全球）",
    titleEn: "115-1 Exchange Student Selection — Global",
    region: "global",
    announcedAt: "2026-01-08",
    deadlineAt: "2026-03-15",
    status: "closed",
  },
  {
    id: "bul-06",
    programId: "prg-04",
    academicYear: "115",
    term: "1",
    titleZh: "115學年度海外實習媒合公告",
    titleEn: "115-1 Overseas Internship Placement Call",
    region: "asia",
    announcedAt: "2025-11-03",
    deadlineAt: "2026-01-20",
    status: "archived",
  },
];

const PARTNER_SCHOOL_ROWS: (typeof partnerSchools.$inferInsert)[] = [
  {
    id: "sch-01",
    programId: "prg-01",
    nameZh: "京都大學",
    nameEn: "Kyoto University",
    country: "Japan",
    region: "asia",
    quota: 2,
    gpaMin: 3.3,
    languageReq: [
      { test: "JLPT", score: "N2" },
      { test: "TOEFL iBT", score: "80" },
    ],
    eligibleColleges: ["Engineering", "Science", "Letters", "Agriculture"],
    englishTaught: true,
    housingProvided: true,
    websiteUrl: "https://www.kyoto-u.ac.jp/en",
    active: true,
  },
  {
    id: "sch-02",
    programId: "prg-01",
    nameZh: "慕尼黑工業大學",
    nameEn: "Technical University of Munich",
    country: "Germany",
    region: "europe",
    quota: 3,
    gpaMin: 3.0,
    languageReq: [
      { test: "TOEFL iBT", score: "88" },
      { test: "Goethe", score: "B2" },
    ],
    eligibleColleges: ["Engineering", "Science", "Management"],
    englishTaught: true,
    housingProvided: false,
    websiteUrl: "https://www.tum.de/en/",
    active: true,
  },
  {
    id: "sch-03",
    programId: "prg-01",
    nameZh: "墨爾本大學",
    nameEn: "University of Melbourne",
    country: "Australia",
    region: "oceania",
    quota: 2,
    gpaMin: 3.2,
    languageReq: [{ test: "IELTS", score: "6.5" }],
    eligibleColleges: ["All colleges"],
    englishTaught: true,
    housingProvided: true,
    websiteUrl: "https://www.unimelb.edu.au/",
    active: true,
  },
  {
    id: "sch-04",
    programId: "prg-01",
    nameZh: "加州大學柏克萊分校",
    nameEn: "University of California, Berkeley",
    country: "United States",
    region: "americas",
    quota: 1,
    gpaMin: 3.5,
    languageReq: [{ test: "TOEFL iBT", score: "90" }],
    eligibleColleges: ["Engineering", "Management", "Social Sciences"],
    englishTaught: true,
    housingProvided: false,
    websiteUrl: "https://www.berkeley.edu/",
    active: true,
  },
  {
    id: "sch-05",
    programId: "prg-01",
    nameZh: "新加坡國立大學",
    nameEn: "National University of Singapore",
    country: "Singapore",
    region: "asia",
    quota: 2,
    gpaMin: 3.4,
    languageReq: [{ test: "TOEFL iBT", score: "85" }],
    eligibleColleges: ["Engineering", "Management", "Science"],
    englishTaught: true,
    housingProvided: true,
    websiteUrl: "https://nus.edu.sg/",
    active: true,
  },
  {
    id: "sch-06",
    programId: "prg-02",
    nameZh: "魯汶大學",
    nameEn: "KU Leuven",
    country: "Belgium",
    region: "europe",
    quota: 4,
    gpaMin: 3.2,
    languageReq: [{ test: "TOEFL iBT", score: "90" }],
    eligibleColleges: [
      "Engineering",
      "Management",
      "Social Sciences",
      "Biomedical",
    ],
    englishTaught: true,
    housingProvided: false,
    websiteUrl: "https://www.kuleuven.be/english/",
    active: true,
  },
  {
    id: "sch-07",
    programId: "prg-02",
    nameZh: "早稻田大學",
    nameEn: "Waseda University",
    country: "Japan",
    region: "asia",
    quota: 2,
    gpaMin: 3.3,
    languageReq: [
      { test: "JLPT", score: "N1" },
      { test: "TOEFL iBT", score: "85" },
    ],
    eligibleColleges: ["Management", "Social Sciences", "Letters"],
    englishTaught: true,
    housingProvided: true,
    websiteUrl: "https://www.waseda.jp/top/en",
    active: true,
  },
  {
    id: "sch-08",
    programId: "prg-05",
    nameZh: "延世大學語學堂",
    nameEn: "Yonsei University Korean Language Institute",
    country: "South Korea",
    region: "asia",
    quota: 6,
    gpaMin: 2.8,
    languageReq: [{ test: "TOPIK", score: "Level 1 (beginner welcome)" }],
    eligibleColleges: ["All colleges"],
    englishTaught: false,
    housingProvided: true,
    websiteUrl: "https://www.yonsei.ac.kr/en_sc/",
    active: true,
  },
  {
    id: "sch-09",
    programId: "prg-03",
    nameZh: "香港中文大學",
    nameEn: "The Chinese University of Hong Kong",
    country: "Hong Kong",
    region: "asia",
    quota: 10,
    gpaMin: 2.5,
    languageReq: [{ test: "None", score: "—" }],
    eligibleColleges: ["All colleges"],
    englishTaught: true,
    housingProvided: true,
    websiteUrl: "https://www.cuhk.edu.hk/english/",
    active: true,
  },
  {
    id: "sch-10",
    programId: "prg-04",
    nameZh: "越南台商聯誼會實習專案",
    nameEn: "Vietnam Taiwan Business Association Internship",
    country: "Vietnam",
    region: "asia",
    quota: 8,
    gpaMin: 2.5,
    languageReq: [{ test: "TOEIC", score: "600" }],
    eligibleColleges: ["Management", "Engineering", "Social Sciences"],
    englishTaught: true,
    housingProvided: true,
    websiteUrl: "https://www.thu.edu.tw/",
    active: false,
  },
];

const FUNDING_ROWS: (typeof fundings.$inferInsert)[] = [
  {
    id: "fnd-01",
    programId: "prg-01",
    nameZh: "學海飛颺",
    nameEn: "Xuehai Feiyang Study Abroad Grant",
    source: "moe",
    eligibilityZh:
      "已錄取交換學生資格、修業滿兩學期、前一學年平均成績80分以上之大學部學生。",
    eligibilityEn:
      "Undergraduates who have been selected for exchange, completed at least two semesters, and averaged 80 or above in the previous academic year.",
    amountMax: 120_000,
    applyMonths: [3, 9],
    requiredDocs: [
      "Application form",
      "Transcript of the previous academic year",
      "Exchange acceptance letter",
      "Study plan (1,000 words)",
      "Financial need statement (optional)",
    ],
    notesZh:
      "教育部補助款，名額依當年度核定額度調整，通常為12至18名。獲補助者返國後須繳交心得報告。",
    notesEn:
      "Funded by the Ministry of Education. The number of awards follows the annual allocation, usually 12 to 18. Recipients must submit a report after returning.",
    contactName: "Chen Yi-Ling",
    contactEmail: "ylchen@thu.edu.tw",
    status: "open",
  },
  {
    id: "fnd-02",
    programId: "prg-01",
    nameZh: "留學獎勵金",
    nameEn: "Study Abroad Encouragement Award",
    source: "university",
    eligibilityZh: "本校在學學生，取得姊妹校交換或雙聯錄取資格者皆可申請，不限年級。",
    eligibilityEn:
      "Any enrolled Tunghai student who has been accepted for an exchange or dual-degree place, regardless of year.",
    amountMax: 50_000,
    applyMonths: [4, 10],
    requiredDocs: ["Application form", "Acceptance letter", "Bank account details"],
    notesZh: "由本校校務基金支應，115學年度共核發28名。與學海系列補助可同時領取。",
    notesEn:
      "Funded by the university endowment; 28 awards were made in academic year 115. It can be held alongside the Xuehai grants.",
    contactName: "Lin Hsiao-Mei",
    contactEmail: "hmlin@thu.edu.tw",
    status: "open",
  },
  {
    id: "fnd-03",
    programId: "prg-04",
    nameZh: "學海築夢",
    nameEn: "Xuehai Zhumeng Overseas Internship Grant",
    source: "moe",
    eligibilityZh: "參加國際處媒合之海外實習計畫，實習期間滿兩個月以上之在學學生。",
    eligibilityEn:
      "Enrolled students on an OIR-arranged overseas internship lasting two months or more.",
    amountMax: 100_000,
    applyMonths: [3],
    requiredDocs: [
      "Application form",
      "Internship agreement",
      "Internship plan",
      "Supervisor recommendation",
    ],
    notesZh: "補助以實習國家別分級計算，機票與生活費分開核銷。",
    notesEn:
      "The award is tiered by destination country, with airfare and living costs claimed separately.",
    contactName: "Huang Wei-Ting",
    contactEmail: "wthuang@thu.edu.tw",
    status: "closed",
  },
  {
    id: "fnd-04",
    programId: null,
    nameZh: "傅爾布萊特留美獎助金",
    nameEn: "Fulbright Taiwan Graduate Study Grant",
    source: "external",
    eligibilityZh: "具中華民國國籍、2027年6月前取得學士學位，赴美攻讀碩博士學位者。",
    eligibilityEn:
      "Taiwan citizens holding a bachelor's degree by June 2027 who will pursue a master's or doctorate in the United States.",
    amountMax: 900_000,
    applyMonths: [6, 7],
    requiredDocs: [
      "Three recommendation letters",
      "Study objective essay",
      "TOEFL or IELTS score report",
      "Transcript",
    ],
    notesZh:
      "由學術交流基金會辦理，非本校核發。國際處提供研究計畫書審閱服務。2027–2028年度截止日延長至2026年7月31日。",
    notesEn:
      "Administered by the Foundation for Scholarly Exchange, not by the university. The OIR reviews study objective drafts. The 2027–2028 deadline was extended to 31 July 2026.",
    contactName: "Chen Yi-Ling",
    contactEmail: "ylchen@thu.edu.tw",
    status: "open",
  },
  {
    id: "fnd-05",
    programId: "prg-05",
    nameZh: "日本交流協會短期留學獎學金",
    nameEn: "Japan-Taiwan Exchange Association Scholarship",
    source: "external",
    eligibilityZh: "赴日本姊妹校交換或語言研習，具JLPT N2以上程度之在學學生。",
    eligibilityEn:
      "Enrolled students going to a Japanese partner university for exchange or language study, with JLPT N2 or above.",
    amountMax: 240_000,
    applyMonths: [4],
    requiredDocs: [
      "Application form",
      "JLPT certificate",
      "Study plan",
      "Acceptance letter",
    ],
    notesZh: "每月支給日幣80,000元，最長12個月。名額極少，建議同時申請學海飛颺。",
    notesEn:
      "Pays JPY 80,000 per month for up to 12 months. Places are very limited — apply for Xuehai Feiyang in parallel.",
    contactName: "Huang Wei-Ting",
    contactEmail: "wthuang@thu.edu.tw",
    status: "open",
  },
];

// `id` has a default, so `$inferInsert` makes it optional — but this script
// writes fixed ids so it can delete exactly the rows it owns, and the delete
// below needs to know they are always there.
const FAQ_CATEGORY_ROWS: (typeof categories.$inferInsert & { id: string })[] = [
  {
    id: "cat-faq-exchange",
    slug: "exchange",
    kind: "faq",
    nameZh: "交換學生",
    nameEn: "Exchange",
    sortOrder: 1,
  },
  {
    id: "cat-faq-dual-degree",
    slug: "dual-degree",
    kind: "faq",
    nameZh: "雙聯學位",
    nameEn: "Dual Degree",
    sortOrder: 2,
  },
  {
    id: "cat-faq-funding",
    slug: "funding",
    kind: "faq",
    nameZh: "獎助金",
    nameEn: "Funding",
    sortOrder: 3,
  },
  {
    id: "cat-faq-general",
    slug: "general",
    kind: "faq",
    nameZh: "一般問題",
    nameEn: "General",
    sortOrder: 4,
  },
];

/** Built after seedAdmin, since reviewedById needs a real user.id. */
function buildFaqRows(reviewedById: string): (typeof faqs.$inferInsert)[] {
  return [
    {
      id: "faq-01",
      categoryId: "cat-faq-exchange",
      questionZh: "GPA 沒有達到姊妹校門檻可以申請嗎？",
      questionEn: "Can I apply if my GPA is below a partner school's minimum?",
      shortAnswerZh: "不行，Min GPA 是硬性門檻，未達標的姊妹校無法列入志願序。",
      shortAnswerEn:
        "No — the listed Min GPA is a hard cutoff. A school you don't meet the threshold for can't be included in your ranked choices.",
      longAnswerZh:
        "各姊妹校的 GPA 門檻列在 Partner schools 頁面，是校方協議中的硬性規定，國際處無法個案通融。若你的 GPA 接近門檻，建議選擇門檻較低的姊妹校，或等待下一學期成績更新後再次計算。",
      longAnswerEn:
        "The GPA minimum on the Partner Schools page comes directly from each inter-institutional agreement and cannot be waived case by case. If you're close to a threshold, consider a school with a lower minimum, or wait for next term's grades before recalculating.",
      audience: "student",
      needsHumanConfirm: false,
      published: true,
      reviewedById,
    },
    {
      id: "faq-02",
      categoryId: "cat-faq-exchange",
      questionZh: "交換期間學費要繳給哪一邊？",
      questionEn: "Which school do I pay tuition to while on exchange?",
      shortAnswerZh: "維持繳交東海學費，姊妹校學費予以免除。",
      shortAnswerEn:
        "You keep paying tuition to Tunghai as normal — the host university's tuition is waived.",
      longAnswerZh:
        "這是交換與雙聯學位最大的不同：交換學生仍以東海學生身分註冊，僅需照常繳交本校學費，姊妹校端的學費由校際協議免除。生活費、住宿與機票則由學生自行負擔，可參考 Funding 頁面的補助項目。",
      longAnswerEn:
        "This is the key difference from dual degree: exchange students stay registered at Tunghai and pay Tunghai tuition as usual, while the host university's tuition is waived under the inter-institutional agreement. Living costs, housing, and flights are the student's own responsibility — see the Funding page for available grants.",
      audience: "student",
      needsHumanConfirm: false,
      published: true,
      reviewedById,
    },
    {
      id: "faq-03",
      categoryId: "cat-faq-dual-degree",
      questionZh: "雙聯學位一定要「3+1」或「2+2」嗎？",
      questionEn: "Does dual degree always follow a 3+1 or 2+2 structure?",
      shortAnswerZh: "目前開放的雙聯學程確實都是 3+1 或 2+2，年限由雙方協議決定。",
      shortAnswerEn:
        "The dual-degree tracks currently open do follow 3+1 or 2+2 — the split is fixed by each inter-institutional agreement.",
      longAnswerZh:
        "3+1 代表在東海修業三年、姊妹校一年；2+2 則是各兩年，實際年限依各校協議與科系規劃而定，詳見 Partner schools 頁面的 Program length 欄位。無論哪種結構，畢業時都會同時取得兩校學位，且都需要提前一年規劃並經系上審查通過。",
      longAnswerEn:
        "3+1 means three years at Tunghai and one at the partner school; 2+2 splits it evenly. The exact split depends on each school's agreement and department planning — see the Program Length column on the Partner Schools page. Either way, you graduate with degrees from both schools, and both structures require applying a year ahead of departure with departmental approval.",
      audience: "student",
      needsHumanConfirm: false,
      published: true,
      reviewedById,
    },
    {
      id: "faq-04",
      categoryId: "cat-faq-dual-degree",
      questionZh: "雙聯學位的姊妹校學費誰負擔？",
      questionEn: "Who pays the partner school's tuition on a dual-degree track?",
      shortAnswerZh: "學生自行負擔，部分姊妹校提供交通補助或獎學金，但非全額免除。",
      shortAnswerEn:
        "The student pays it — some partner schools offer a partial travel grant or scholarship, but tuition itself is not waived.",
      longAnswerZh:
        "這是雙聯學位與交換最大的差異：姊妹校端的學費由學生自行繳納，並非如交換生一般予以免除。實際金額與是否有補助，詳見 Partner schools 頁面的 Subsidy 欄位；務必在出發前向國際處確認最新費率。",
      longAnswerEn:
        "This is the main difference from exchange: partner-school tuition is billed to the student directly, not waived the way it is for exchange students. Actual amounts and any available subsidy are listed in the Subsidy column on the Partner Schools page — confirm current rates with the International Office before departure.",
      audience: "student",
      needsHumanConfirm: false,
      published: true,
      reviewedById,
    },
    {
      id: "faq-05",
      categoryId: "cat-faq-funding",
      questionZh: "學海飛颺可以跟留學獎勵金一起領嗎？",
      questionEn: "Can I receive Xuehai Feiyang and the Study Abroad Encouragement Award together?",
      shortAnswerZh: "可以，兩者可同時申請並領取。",
      shortAnswerEn: "Yes, the two can be applied for and received at the same time.",
      longAnswerZh:
        "學海飛颺為教育部補助，留學獎勵金為本校校務基金支應，兩者資金來源不同，符合資格者可同時領取。申請時仍須分別備齊各自要求的文件，詳見 Funding 頁面各項目的 Required docs 欄位。",
      longAnswerEn:
        "Xuehai Feiyang is funded by the Ministry of Education, while the Study Abroad Encouragement Award comes from the university's own endowment — different sources, so eligible students can hold both. Each still needs its own set of documents at application time; see the Required Docs column on the Funding page for each.",
      audience: "student",
      needsHumanConfirm: false,
      published: true,
      reviewedById,
    },
    {
      id: "faq-06",
      categoryId: "cat-faq-general",
      questionZh: "簡章內容跟這個網站不一致，以哪個為準？",
      questionEn: "If the bulletin PDF disagrees with this site, which one wins?",
      shortAnswerZh: "以簡章（PDF）為準，網站僅供快速查詢。",
      shortAnswerEn: "The bulletin PDF is binding — this site is for quick reference only.",
      longAnswerZh:
        "每份簡章公告後即為正式文件，網站上的摘要可能因排版整理而與細節有落差。若兩者不一致，一律以 Bulletins 頁面連結的 PDF 原文為準；如有疑義，歡迎至 T-Corner 或聯繫國際處確認。",
      longAnswerEn:
        "Once a bulletin is announced, the PDF is the official document — the site's summary may lag behind small details due to reformatting. Where the two disagree, the PDF linked from the Bulletins page always wins. If anything's unclear, bring it to a T-Corner session or contact the International Office directly.",
      audience: "student",
      needsHumanConfirm: true,
      published: true,
      reviewedById,
    },
  ];
}

/** Every T-Corner slot is hosted by the seeded admin — see the file header. */
function buildTcornerRows(
  hostUserId: string
): (typeof tcornerSlots.$inferInsert)[] {
  return [
    {
      id: "tcn-01",
      weekday: "mon",
      startTime: "12:10",
      endTime: "13:30",
      location: "International Building 3F, T-Corner",
      advisorName: "Chen Yi-Ling",
      hostUserId,
      topics: [
        "Exchange application strategy",
        "Which partner school fits my GPA",
        "Reading a bulletin (簡章)",
      ],
      bookingRequired: false,
      active: true,
    },
    {
      id: "tcn-02",
      weekday: "wed",
      startTime: "14:00",
      endTime: "16:00",
      location: "International Building 3F, T-Corner",
      advisorName: "Lin Hsiao-Mei",
      hostUserId,
      topics: [
        "Study plan and motivation letter review",
        "Recommendation letter requests",
        "Funding applications",
      ],
      bookingRequired: true,
      bookingUrl: "https://calendar.thu.edu.tw/oir/t-corner",
      active: true,
    },
    {
      id: "tcn-03",
      weekday: "thu",
      startTime: "10:00",
      endTime: "11:30",
      location: "Library 2F, Group Study Room B",
      advisorName: "Huang Wei-Ting",
      hostUserId,
      topics: [
        "Japan & Korea programs",
        "JLPT / TOPIK planning",
        "Returning student Q&A",
      ],
      bookingRequired: false,
      active: true,
    },
    {
      id: "tcn-04",
      weekday: "fri",
      startTime: "13:00",
      endTime: "15:00",
      location: "International Building 3F, T-Corner",
      advisorName: "Chen Yi-Ling",
      hostUserId,
      topics: ["Visa document check", "Pre-departure briefing"],
      bookingRequired: true,
      bookingUrl: "https://calendar.thu.edu.tw/oir/t-corner",
      active: true,
    },
    {
      id: "tcn-05",
      weekday: "tue",
      startTime: "15:00",
      endTime: "16:30",
      location: "International Building 3F, T-Corner",
      advisorName: "Wu Pei-Shan",
      hostUserId,
      topics: ["Credit transfer questions"],
      bookingRequired: false,
      active: false,
    },
  ];
}

// ---------- Step 4: Newsroom (categories, tags, posts) ----------

/*
 * `categories.slug` is unique across the whole table, not per `kind` — so a
 * post category cannot reuse a slug the FAQ categories already hold. The two
 * that would collide ("exchange" and "funding", both taken by
 * FAQ_CATEGORY_ROWS above) carry a `news-` prefix here. Nothing routes on these
 * slugs today; the news page filters by category id.
 */
const POST_CATEGORY_ROWS: (typeof categories.$inferInsert & { id: string })[] = [
  { id: "pcat-exchange", slug: "news-exchange", kind: "post", nameZh: "交換計畫", nameEn: "Exchange", sortOrder: 1 },
  { id: "pcat-funding", slug: "news-funding", kind: "post", nameZh: "獎助學金", nameEn: "Funding", sortOrder: 2 },
  { id: "pcat-partnership", slug: "partnership", kind: "post", nameZh: "姊妹校消息", nameEn: "Partnerships", sortOrder: 3 },
  { id: "pcat-office", slug: "office", kind: "post", nameZh: "辦公室公告", nameEn: "Office notices", sortOrder: 4 },
];

const TAG_ROWS: (typeof tags.$inferInsert & { id: string })[] = [
  { id: "tag-01", slug: "deadline", nameZh: "截止日", nameEn: "Deadline" },
  { id: "tag-02", slug: "info-session", nameZh: "說明會", nameEn: "Info session" },
  { id: "tag-03", slug: "japan", nameZh: "日本", nameEn: "Japan" },
  { id: "tag-04", slug: "europe", nameZh: "歐洲", nameEn: "Europe" },
  { id: "tag-05", slug: "scholarship", nameZh: "獎學金", nameEn: "Scholarship" },
  { id: "tag-06", slug: "new-partner", nameZh: "新姊妹校", nameEn: "New partner" },
  { id: "tag-07", slug: "results", nameZh: "錄取公告", nameEn: "Results" },
  { id: "tag-08", slug: "office-hours", nameZh: "服務時間", nameEn: "Office hours" },
];

function buildPostRows(authorId: string): (typeof posts.$inferInsert & { id: string })[] {
  return [
    {
      id: "post-01",
      slug: "115-2-exchange-application-open",
      titleZh: "115學年度第2學期交換學生甄選開始受理",
      titleEn: "115-2 Exchange Student Selection Now Open",
      bodyZh: "國際處自即日起受理115學年度第2學期交換學生申請。本梯次共開放18個國家、42所姊妹校，其中歐洲地區新增6校。\n\n申請資格為在校修業滿兩學期、累計GPA 3.0以上，並符合姊妹校語言門檻。線上報名系統於2026年8月15日17:00關閉，逾期恕不受理。\n\n說明會將於國際大樓302室舉行兩場：7月22日（三）與7月29日（三），12:10–13:00，兩場內容相同。",
      bodyEn: "The Office of International Relations is accepting applications for the 115-2 semester exchange program. This round covers 42 partner universities in 18 countries, including 6 new partners in Europe.\n\nApplicants must have completed at least two semesters, hold a cumulative GPA of 3.0 or above, and meet the language requirement of the host university. The online form closes on 15 August 2026 at 17:00 — late submissions are not accepted.\n\nTwo information sessions will be held in International Building Room 302 on 22 July and 29 July (Wednesdays, 12:10–13:00). Both cover the same content.",
      categoryId: "pcat-exchange",
      type: "notice",
      status: "published",
      publishedAt: new Date("2026-07-14"),
      seoTitle: "115-2 Exchange Student Selection Now Open | OIR Tunghai",
      seoDescription: "Applications for the 115-2 semester exchange program are open until 15 August 2026. 42 partner universities across 18 countries.",
      externalUrl: null,
      authorId,
    },
    {
      id: "post-02",
      slug: "fulbright-graduate-grant-deadline-extended",
      titleZh: "傅爾布萊特留美獎助金截止日延長",
      titleEn: "Fulbright Taiwan Graduate Grants — Deadline Extended",
      bodyZh: "學術交流基金會（Fulbright Taiwan）宣布，2027–2028年度留美獎助金申請截止日延長至2026年7月31日。\n\n獎助金支持赴美攻讀碩博士學位，每學年最高補助美金30,000元，可續領一年。申請者須具中華民國國籍，並於2027年6月前取得學士學位。\n\n申請文件包含三封推薦信、研究計畫書及有效TOEFL或IELTS成績。國際處提供計畫書審閱服務，請至聯絡頁面預約。",
      bodyEn: "The Foundation for Scholarly Exchange (Fulbright Taiwan) has extended the deadline for 2027–2028 graduate study grants to 31 July 2026.\n\nGrants support master's or doctoral study in the United States and cover up to USD 30,000 per academic year, renewable once. Applicants must hold Taiwan citizenship and a bachelor's degree by June 2027.\n\nApplications require three recommendation letters, a study objective essay, and valid TOEFL or IELTS scores. The OIR reviews essay drafts — book a slot from the contact page.",
      categoryId: "pcat-funding",
      type: "news",
      status: "published",
      publishedAt: new Date("2026-07-06"),
      seoTitle: "Fulbright Taiwan graduate grant deadline extended to 31 July 2026",
      seoDescription: "Fulbright Taiwan extended its 2027–2028 graduate study grant deadline to 31 July 2026. Up to USD 30,000 per year.",
      externalUrl: "https://www.fulbright.org.tw/",
      authorId,
    },
    {
      id: "post-03",
      slug: "new-partnership-ku-leuven",
      titleZh: "與比利時魯汶大學簽署交換協議",
      titleEn: "New Partnership Signed with KU Leuven, Belgium",
      bodyZh: "本校與比利時魯汶大學（KU Leuven）正式簽署學生交換協議。魯汶大學創校於1425年，是比利時排名第一、歐洲歷史最悠久的大學之一。\n\n自116學年度起，每年提供4個交換名額，免繳姊妹校學費。工學院、管理學院、社科院及生醫領域皆有英語授課課程。\n\n魯汶距布魯塞爾約25分鐘車程，學生回報每月生活費含住宿約為900至1,100歐元。首次甄選將併入116學年度交換申請，預計2027年1月開放。",
      bodyEn: "We have signed a student exchange agreement with KU Leuven, Belgium's highest-ranked university and one of Europe's oldest, founded in 1425.\n\nStarting in academic year 116, four students per year can study at KU Leuven with tuition fully waived. English-taught courses are available across engineering, management, social sciences, and biomedical fields.\n\nLeuven is a 25-minute train ride from Brussels, and students report living costs of roughly EUR 900–1,100 per month including housing. The first selection round will be folded into the 116 exchange call, opening January 2027.",
      categoryId: "pcat-partnership",
      type: "news",
      status: "published",
      publishedAt: new Date("2026-06-28"),
      seoTitle: "Tunghai signs exchange agreement with KU Leuven",
      seoDescription: "A new exchange agreement with KU Leuven opens 4 tuition-waived spots per year from academic year 116.",
      externalUrl: null,
      authorId,
    },
    {
      id: "post-04",
      slug: "summer-office-hours",
      titleZh: "暑假期間服務時間與文件領取方式",
      titleEn: "Summer Office Hours & Document Pick-up",
      bodyZh: "暑假期間（7月1日至8月31日），國際處櫃檯服務時間為週一至週五09:00–16:00，中午12:00–13:00休息。\n\n需辦理在學證明、推薦信或成績單驗證的同學，請至少於領件前一個工作天提出申請。\n\n僅簽證面試可受理當日急件，請攜帶面試預約證明。",
      bodyEn: "During the summer break (1 July – 31 August), the OIR front desk is open Monday to Friday, 09:00–16:00, closed 12:00–13:00 for lunch.\n\nStudents needing enrolment certificates, nomination letters, or transcript verification should submit the request at least one working day before pick-up.\n\nSame-day requests are only accepted for visa interview appointments — bring proof of your appointment time.",
      categoryId: "pcat-office",
      type: "notice",
      status: "published",
      publishedAt: new Date("2026-06-25"),
      seoTitle: "OIR summer office hours",
      seoDescription: "OIR front desk hours during July and August, and how to request documents for pick-up.",
      externalUrl: null,
      authorId,
    },
    {
      id: "post-05",
      slug: "credit-transfer-guide",
      titleZh: "交換返國學分抵免完整指南",
      titleEn: "Credit Transfer Guide for Returning Exchange Students",
      bodyZh: "學分抵免是交換結束後最常被詢問的流程。本指南說明從行前選課到返國送件的每個步驟。\n\n出國前務必完成「學習計畫書」（Learning Agreement），並取得系主任簽章。未事先核可的課程返國後可能無法抵免。\n\n返國後兩週內，請將姊妹校正式成績單正本、課程大綱及抵免申請表送交系辦公室初審，再轉送教務處。\n\n每學期抵免上限為25學分，通識課程最多抵免6學分。詳細規定請參閱附件。",
      bodyEn: "Credit transfer is the most-asked question after an exchange. This guide walks through every step, from picking courses before departure to filing documents after you return.\n\nBefore leaving, complete the Learning Agreement and have it signed by your department chair. Courses not approved in advance may not transfer.\n\nWithin two weeks of returning, submit the original transcript from the host university, course syllabi, and the credit transfer form to your department office for first review, then to the Office of Academic Affairs.\n\nThe cap is 25 credits per semester, with a maximum of 6 general-education credits. Full rules are in the attachment.",
      categoryId: "pcat-exchange",
      type: "guide",
      status: "published",
      publishedAt: new Date("2026-06-30"),
      seoTitle: "Credit transfer guide for exchange students",
      seoDescription: "How to get exchange courses recognised: Learning Agreement, transcript submission, and the 25-credit cap.",
      externalUrl: null,
      authorId,
    },
    {
      id: "post-06",
      slug: "115-study-abroad-award-results",
      titleZh: "115學年度留學獎勵金錄取名單公告",
      titleEn: "115 Study Abroad Encouragement Award — Results",
      bodyZh: "評選委員會已完成115學年度留學獎勵金審查，共28位同學獲獎，每人核發新臺幣50,000元，用於支應交換相關支出。\n\n錄取名單（學號部分遮蔽）如附件。獲獎通知書自6月5日起可持學生證至國際處櫃檯領取。\n\n獎助金將於6月底前匯入同學登記之帳戶。",
      bodyEn: "The selection committee has awarded the 115 Study Abroad Encouragement Award to 28 students. Each awardee receives NT$50,000 towards exchange-related expenses.\n\nThe awardee list (student IDs partially masked) is attached. Award letters can be collected at the OIR front desk with your student ID card from 5 June.\n\nThe stipend will be transferred to your registered bank account by the end of June.",
      categoryId: "pcat-funding",
      type: "news",
      status: "published",
      publishedAt: new Date("2026-06-02"),
      seoTitle: "115 Study Abroad Encouragement Award results",
      seoDescription: "28 students received the 115 Study Abroad Encouragement Award of NT$50,000 each.",
      externalUrl: null,
      authorId,
    },
    {
      id: "post-07",
      slug: "about-oir",
      titleZh: "關於國際處",
      titleEn: "About the Office of International Relations",
      bodyZh: "國際處負責推動本校國際化，業務涵蓋姊妹校締約、學生交換、國際學生招生、留學獎助金及國際活動辦理。\n\n本處位於國際大樓3樓，設有國際交流組與境外生輔導組。",
      bodyEn: "The Office of International Relations advances the university's internationalisation: partner agreements, student exchange, international admissions, study-abroad funding, and international events.\n\nThe office is on the 3rd floor of the International Building and comprises the Exchange Section and the International Student Services Section.",
      categoryId: "pcat-office",
      type: "page",
      status: "published",
      publishedAt: new Date("2026-01-15"),
      seoTitle: "About the Office of International Relations",
      seoDescription: "What the Tunghai Office of International Relations does and where to find us.",
      externalUrl: null,
      authorId,
    },
    {
      id: "post-08",
      slug: "116-1-exchange-call-preview",
      titleZh: "116學年度第1學期交換甄選預告",
      titleEn: "116-1 Exchange Call — Preview",
      bodyZh: "116學年度第1學期交換甄選預計於2026年11月開放，本篇為草稿，內容尚未定案。",
      bodyEn: "The 116-1 exchange selection round is expected to open in November 2026. This is a draft and the details are not final.",
      categoryId: "pcat-exchange",
      type: "notice",
      status: "draft",
      publishedAt: null,
      seoTitle: "",
      seoDescription: "",
      externalUrl: null,
      authorId,
    },
  ];
}

const POST_TAG_ROWS: (typeof postTags.$inferInsert)[] = [
  { postId: "post-01", tagId: "tag-01" },
  { postId: "post-01", tagId: "tag-02" },
  { postId: "post-02", tagId: "tag-01" },
  { postId: "post-02", tagId: "tag-05" },
  { postId: "post-03", tagId: "tag-04" },
  { postId: "post-03", tagId: "tag-06" },
  { postId: "post-04", tagId: "tag-08" },
  { postId: "post-05", tagId: "tag-04" },
  { postId: "post-06", tagId: "tag-05" },
  { postId: "post-06", tagId: "tag-07" },
  { postId: "post-08", tagId: "tag-01" },
];

// ---------- Step 5: Testimonials and site stats ----------

const TESTIMONIAL_ROWS: (typeof testimonials.$inferInsert)[] = [
  {
    id: "tst-01",
    partnerSchoolId: "sch-01",
    displayName: "L 同學",
    deptYear: "資工系四年級",
    country: "Japan",
    termLabel: "114-1",
    highlights: ["研究室文化比想像中開放，教授鼓勵提問","宿舍每月約 32,000 日圓，含水電","JLPT N2 夠用，但專題討論還是吃力"],
    bodyZh: "我在114學年度第1學期到京都大學交換，主修資訊工程。最大的收穫不是課程本身，而是研究室的討論文化。\n\n生活方面，京大提供的國際學生宿舍每月約32,000日圓，走路到吉田校區15分鐘。物價比台中高，但學餐一餐約500日圓仍可負擔。\n\n給學弟妹的建議：JLPT N2只是門檻，實際上專題討論的語速非常快。出發前多聽學術演講的錄音會很有幫助。",
    bodyEn: "I spent 114-1 at Kyoto University studying computer science. The biggest gain was not the coursework but the discussion culture in the lab.\n\nThe international dorm costs about JPY 32,000 a month and is a 15-minute walk to the Yoshida campus. Prices are higher than Taichung, but the canteen at around JPY 500 a meal is manageable.\n\nAdvice: JLPT N2 is only the threshold. Seminar discussions move fast — listening to recorded academic talks before you go helps a lot.",
    // fullTextFileId stays null: it points at media_files, and no
    // object exists in MinIO for a seeded row to reference.
    fullTextFileId: null,
    consentGiven: true,
    status: "published",
  },
  {
    id: "tst-02",
    partnerSchoolId: "sch-02",
    displayName: "Chang Wei-Chen",
    deptYear: "Industrial Engineering, Year 3",
    country: "Germany",
    termLabel: "114-2",
    highlights: ["Course registration is self-service and closes fast","Find housing before you fly — Munich is tight","Semester ticket covers all public transport"],
    bodyZh: "慕尼黑工大的選課完全自助，熱門課程開放後兩天就額滿，務必提前研究課表。\n\n住宿是最大挑戰。學校不保證宿舍，我在出發前三個月就開始在 Studentenwerk 排隊，仍等到開學前兩週才拿到房間。\n\n學期票（Semesterticket）已包含在註冊費中，慕尼黑全區大眾運輸都能搭，非常划算。",
    bodyEn: "Course registration at TUM is entirely self-service, and popular courses fill within two days of opening — study the catalogue in advance.\n\nHousing was the hardest part. TUM does not guarantee a room; I joined the Studentenwerk queue three months before departure and still only got a place two weeks before the semester started.\n\nThe Semesterticket is bundled into the registration fee and covers all public transport in Munich, which is excellent value.",
    // fullTextFileId stays null: it points at media_files, and no
    // object exists in MinIO for a seeded row to reference.
    fullTextFileId: null,
    consentGiven: true,
    status: "published",
  },
  {
    id: "tst-03",
    partnerSchoolId: "sch-03",
    displayName: "W 同學",
    deptYear: "國際經營與貿易學系三年級",
    country: "Australia",
    termLabel: "114-2",
    highlights: ["宿舍申請要趕優先截止日","打工每週上限 24 小時，時薪約 26 澳幣","小組報告佔分很重，別低估"],
    bodyZh: "墨爾本大學對交換生的宿舍申請有優先截止日，錯過就只能自己找房。我在10月31日前送出，順利分配到自炊式公寓，每週約400澳幣。\n\n課程評分方式與台灣差異很大，小組報告與課堂參與常佔一半以上，期末考反而比重不高。\n\n生活費含住宿每月約1,800澳幣，學生簽證允許每兩週工作48小時，可以補貼一部分。",
    bodyEn: "Melbourne has a priority deadline for exchange student housing — miss it and you are on your own. I applied before 31 October and got a self-catered apartment at about AUD 400 a week.\n\nAssessment differs a lot from Taiwan: group projects and participation often make up more than half the grade, while finals count for less.\n\nLiving costs including housing run about AUD 1,800 a month. The student visa allows 48 hours of work per fortnight, which covers part of it.",
    // fullTextFileId stays null: it points at media_files, and no
    // object exists in MinIO for a seeded row to reference.
    fullTextFileId: null,
    consentGiven: true,
    status: "published",
  },
  {
    id: "tst-04",
    partnerSchoolId: "sch-05",
    displayName: "K 同學",
    deptYear: "化學工程學系四年級",
    country: "Singapore",
    termLabel: "114-1",
    highlights: ["課程節奏快，一週兩次小考是常態","宿舍在校內，通勤時間為零","英語授課但同學語速很快"],
    bodyZh: "新加坡國立大學的課業壓力比預期高，多數課程每兩週就有一次評量，期中期末只是其中兩次。\n\n宿舍在校內，走路十分鐘到系館，省下的通勤時間全部拿來念書。\n\n雖然全英語授課，但同學多為雙語背景，討論時語速很快，前一個月需要適應。",
    bodyEn: "NUS is more demanding than I expected — most courses assess you every two weeks, with the midterm and final being just two of those.\n\nThe dorm is on campus, a ten-minute walk from the department, and the time saved on commuting went straight into study.\n\nTeaching is in English, but most classmates are bilingual and discussions move quickly. The first month takes adjusting.",
    // fullTextFileId stays null: it points at media_files, and no
    // object exists in MinIO for a seeded row to reference.
    fullTextFileId: null,
    consentGiven: true,
    status: "published",
  },
  {
    id: "tst-05",
    partnerSchoolId: "sch-07",
    displayName: "H 同學",
    deptYear: "企業管理學系三年級",
    country: "Japan",
    termLabel: "115-1",
    highlights: ["早大的社團文化值得參加","東京生活費比京都高約 30%","雙聯課程銜接順利"],
    bodyZh: "這份心得尚未取得同意公開，僅供國際處內部參考。",
    bodyEn: "This testimonial has not yet been cleared for publication and is for internal OIR reference only.",
    // fullTextFileId stays null: it points at media_files, and no
    // object exists in MinIO for a seeded row to reference.
    fullTextFileId: null,
    consentGiven: false,
    status: "draft",
  },
];

function buildSiteStatRows(updatedById: string): (typeof siteStats.$inferInsert)[] {
  return [
    {
      id: "stt-01",
      academicYear: "115",
      metricKey: "outbound_count",
      labelZh: "本學年出國交換人數",
      labelEn: "Students abroad this year",
      value: 148,
      unitZh: "人",
      unitEn: "students",
      updatedById,
    },
    {
      id: "stt-02",
      academicYear: "115",
      metricKey: "partner_school_count",
      labelZh: "姊妹校總數",
      labelEn: "Partner universities",
      value: 42,
      unitZh: "校",
      unitEn: "schools",
      updatedById,
    },
    {
      id: "stt-03",
      academicYear: "115",
      metricKey: "country_count",
      labelZh: "涵蓋國家與地區",
      labelEn: "Countries & regions",
      value: 18,
      unitZh: "國",
      unitEn: "countries",
      updatedById,
    },
    {
      id: "stt-04",
      academicYear: "115",
      metricKey: "funding_total",
      labelZh: "本學年核發獎助金",
      labelEn: "Funding awarded this year",
      value: 4260000,
      unitZh: "新臺幣",
      unitEn: "TWD",
      updatedById,
    },
    {
      id: "stt-05",
      academicYear: "114",
      metricKey: "outbound_count",
      labelZh: "上學年出國交換人數",
      labelEn: "Students abroad last year",
      value: 131,
      unitZh: "人",
      unitEn: "students",
      updatedById,
    },
  ];
}


async function seedMobility(force: boolean, adminUserId: string) {
  const existingCount = await db.$count(programs);

  if (existingCount > 0 && !force) {
    console.log(
      `✓ programs already has ${existingCount} row(s) — leaving mobility data alone.`
    );
    console.log("  Pass --force to wipe and re-insert it.\n");
    return;
  }

  await db.transaction(async (tx) => {
    if (force) {
      // Children first — everything below references programs.id with
      // onDelete: "restrict", so programs must be deleted last.
      await tx.delete(tcornerSlots);
      await tx.delete(fundings);
      await tx.delete(bulletins);
      await tx.delete(partnerSchools);
      await tx.delete(programs);
    }

    await tx.insert(programs).values(PROGRAM_ROWS);
    await tx.insert(partnerSchools).values(PARTNER_SCHOOL_ROWS);
    await tx.insert(bulletins).values(BULLETIN_ROWS);
    await tx.insert(fundings).values(FUNDING_ROWS);
    await tx.insert(tcornerSlots).values(buildTcornerRows(adminUserId));
  });

  console.log("✓ Seeded mobility domain data.");
  console.log(`  ${PROGRAM_ROWS.length} programs`);
  console.log(`  ${PARTNER_SCHOOL_ROWS.length} partner schools`);
  console.log(`  ${BULLETIN_ROWS.length} bulletins`);
  console.log(`  ${FUNDING_ROWS.length} fundings`);
  console.log("  5 T-Corner slots (hosted by the seeded admin — placeholder)");
  console.log("");
}

async function seedKnowledge(force: boolean, adminUserId: string) {
  const existingCount = await db.$count(faqs);

  if (existingCount > 0 && !force) {
    console.log(
      `✓ faqs already has ${existingCount} row(s) — leaving FAQ data alone.`
    );
    console.log("  Pass --force to wipe and re-insert it.\n");
    return;
  }

  await db.transaction(async (tx) => {
    if (force) {
      // faqs.categoryId references categories with onDelete: "restrict", so
      // faqs must go first. faq_sources cascades from faqs, nothing to do there.
      await tx.delete(faqs);
      // Only remove the FAQ categories this script owns — never touch "post"
      // kind categories, which belong to a different seed step entirely.
      for (const row of FAQ_CATEGORY_ROWS) {
        await tx.delete(categories).where(eq(categories.id, row.id));
      }
    }

    await tx.insert(categories).values(FAQ_CATEGORY_ROWS);
    await tx.insert(faqs).values(buildFaqRows(adminUserId));
  });

  console.log("✓ Seeded knowledge base data.");
  console.log(`  ${FAQ_CATEGORY_ROWS.length} FAQ categories`);
  console.log(`  ${buildFaqRows(adminUserId).length} FAQs (reviewed by the seeded admin — placeholder)\n`);
}

async function seedNewsroom(force: boolean, adminUserId: string) {
  const existingCount = await db.$count(posts);

  if (existingCount > 0 && !force) {
    console.log(
      `✓ posts already has ${existingCount} row(s) — leaving newsroom data alone.`
    );
    console.log("  Pass --force to wipe and re-insert it.\n");
    return;
  }

  const postRows = buildPostRows(adminUserId);

  await db.transaction(async (tx) => {
    if (force) {
      // post_tags cascades from posts, but deleting it explicitly keeps the
      // order readable. posts.categoryId is onDelete: "restrict", so the
      // categories this step owns can only go once their posts are gone.
      await tx.delete(postTags);
      await tx.delete(posts);
      await tx.delete(tags);
      for (const row of POST_CATEGORY_ROWS) {
        await tx.delete(categories).where(eq(categories.id, row.id));
      }
    }

    await tx.insert(categories).values(POST_CATEGORY_ROWS);
    await tx.insert(tags).values(TAG_ROWS);
    await tx.insert(posts).values(postRows);
    await tx.insert(postTags).values(POST_TAG_ROWS);
  });

  const published = postRows.filter((row) => row.status === "published").length;

  console.log("✓ Seeded newsroom data.");
  console.log(`  ${POST_CATEGORY_ROWS.length} post categories`);
  console.log(`  ${TAG_ROWS.length} tags`);
  console.log(
    `  ${postRows.length} posts (${published} published, ${postRows.length - published} draft) — authored by the seeded admin`
  );
  console.log(`  ${POST_TAG_ROWS.length} post–tag links\n`);
}

async function seedShowcase(force: boolean, adminUserId: string) {
  const existingCount = await db.$count(testimonials);

  if (existingCount > 0 && !force) {
    console.log(
      `✓ testimonials already has ${existingCount} row(s) — leaving showcase data alone.`
    );
    console.log("  Pass --force to wipe and re-insert it.\n");
    return;
  }

  const statRows = buildSiteStatRows(adminUserId);

  /*
   * Every testimonial names the school it came from, and that column is a
   * required foreign key. This step guards on `testimonials` being empty, not
   * on the mobility step having run — so on a database that already had its own
   * programs, step 2 is skipped, sch-01…sch-10 never exist, and inserting the
   * whole fixture blows up on the constraint.
   *
   * So: insert the ones whose school is actually present, and say plainly which
   * were left out. Site stats have no such dependency and always go in.
   */
  const presentSchools = new Set(
    (await db.select({ id: partnerSchools.id }).from(partnerSchools)).map(
      (row) => row.id
    )
  );
  const testimonialRows = TESTIMONIAL_ROWS.filter((row) =>
    presentSchools.has(row.partnerSchoolId)
  );
  const skipped = TESTIMONIAL_ROWS.length - testimonialRows.length;

  await db.transaction(async (tx) => {
    if (force) {
      await tx.delete(testimonials);
      await tx.delete(siteStats);
    }

    if (testimonialRows.length > 0) {
      await tx.insert(testimonials).values(testimonialRows);
    }
    await tx.insert(siteStats).values(statRows);
  });

  // One fixture row is deliberately an unconsented draft, so /admin/testimonials
  // has a row in that state to work with — hence counting rather than asserting.
  const live = testimonialRows.filter(
    (row) => row.status === "published" && row.consentGiven
  ).length;

  console.log("✓ Seeded testimonials and site stats.");
  console.log(
    `  ${testimonialRows.length} testimonials (${live} published, ${testimonialRows.length - live} awaiting consent)`
  );
  if (skipped > 0) {
    console.log(
      `  ${skipped} skipped — they reference seeded partner schools (sch-01…sch-10)`
    );
    console.log(
      "    that this database does not have. Run with --force to seed the"
    );
    console.log("    mobility fixture too, then re-run to pick them up.");
  }
  console.log(
    `  ${statRows.length} site stats — credited to the seeded admin as a placeholder\n`
  );
}

// ---------- Run ----------

async function main() {
  const args = parseArgs();

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set — copy .env.example to .env first.");
  }

  const adminUserId = await seedAdmin(args);
  console.log("\n  Sign in at /login, then open /admin.\n");

  await seedMobility(args.force, adminUserId);
  await seedKnowledge(args.force, adminUserId);
  await seedNewsroom(args.force, adminUserId);
  await seedShowcase(args.force, adminUserId);
}

/** A `docker run` line whose credentials match whatever DATABASE_URL says. */
function dockerHint(): string {
  try {
    const url = new URL(process.env.DATABASE_URL ?? "");
    const dbName = url.pathname.replace(/^\//, "") || "postgres";
    return [
      "docker run --name oir-db -d",
      `-e POSTGRES_USER=${decodeURIComponent(url.username) || "postgres"}`,
      `-e POSTGRES_PASSWORD=${decodeURIComponent(url.password) || "postgres"}`,
      `-e POSTGRES_DB=${dbName}`,
      `-p ${url.port || "5432"}:5432 postgres:17`,
    ].join(" ");
  } catch {
    return "docker run --name oir-db -d -p 5432:5432 postgres:17";
  }
}

/**
 * Drizzle wraps driver errors, so the useful part — "connection refused",
 * "relation does not exist" — sits on `cause`. Unwrap it and turn the
 * failures people actually hit into instructions.
 */
function explain(error: unknown): string {
  const cause = (error as { cause?: { code?: string; message?: string } })?.cause;
  const code = cause?.code ?? (error as { code?: string })?.code;
  const message =
    cause?.message ?? (error instanceof Error ? error.message : String(error));

  if (code === "ECONNREFUSED" || code === "ENOTFOUND") {
    return [
      `Cannot reach the database at ${process.env.DATABASE_URL ?? "(unset)"}.`,
      "",
      "  Start PostgreSQL, then try again. With Docker, matching your .env:",
      `    ${dockerHint()}`,
    ].join("\n");
  }

  if (code === "42P01") {
    return [
      "Some tables do not exist yet.",
      "",
      "  Create them first:  pnpm migrate",
    ].join("\n");
  }

  if (code === "42703" || code === "42804") {
    return [
      `The database is behind the schema in db/schema: ${message}`,
      "",
      "  Push the current schema, then seed again:  pnpm migrate",
    ].join("\n");
  }

  if (code === "28P01" || code === "3D000") {
    return `The database rejected the credentials in DATABASE_URL: ${message}`;
  }

  if (code === "23505") {
    return `A row with that id already exists: ${message}\n\n  Re-run with --force to wipe and re-insert.`;
  }

  return message;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n✗ Seeding failed.\n");
    console.error(`  ${explain(error).replace(/\n/g, "\n  ")}\n`);
    process.exit(1);
  });