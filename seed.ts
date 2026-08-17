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
  tcornerSlots,
} from "@/db/schema/mobility.schema";
import { categories } from "@/db/schema/cms.schema";
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
 * Not seeded: TESTIMONIALS, SITE_STATS — same "needs a real staff user"
 * situation as T-Corner and FAQs, left for later since attributing them to
 * the single admin felt like a worse placeholder for a byline than for a
 * reviewed-by or hosted-by credit.
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
  console.log("\n  Not seeded: testimonials, site_stats, faqs.\n");
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