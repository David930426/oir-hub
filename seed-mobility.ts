import "dotenv/config";

import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  bulletins,
  fundings,
  partnerSchools,
  programs,
} from "@/db/schema/mobility.schema";

/**
 * Seeds the mobility domain — PROGRAMS, BULLETINS, PARTNER_SCHOOLS, and
 * FUNDINGS — with the same content that used to live in lib/mock/mobility.mock.ts,
 * now written as real rows.
 *
 * Deliberately does not seed TESTIMONIALS, TCORNER_SLOTS, or SITE_STATS here:
 * tcornerSlots.hostUserId and siteStats.updatedById both reference a real
 * staff `user` row, and the only account this project seeds by default is a
 * single admin (see seed.ts). Wiring those up needs a decision about which
 * real staff accounts to attribute them to, so they're left for a follow-up
 * script once that's settled.
 *
 * Run it with:
 *   pnpm seed:mobility
 *   pnpm seed:mobility --force     # wipe and re-insert even if rows exist
 *
 * Safe to run against a database that already has the admin seeded — this
 * script never touches the `user` or `account` tables.
 */

// ---------- Arguments ----------

function parseArgs() {
  const force = process.argv.slice(2).includes("--force");
  return { force };
}

// ---------- Fixture data (ported from lib/mock/mobility.mock.ts) ----------

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

// ---------- Seed ----------

async function seedMobility() {
  const { force } = parseArgs();

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set — copy .env.example to .env first.");
  }

  const existingCount = await db.$count(programs);

  if (existingCount > 0 && !force) {
    console.log(
      `\n✓ programs already has ${existingCount} row(s) — nothing to do.`
    );
    console.log("  Pass --force to wipe and re-insert the mobility fixture data.\n");
    return;
  }

  await db.transaction(async (tx) => {
    if (force) {
      // Children first — fundings/bulletins/partnerSchools all reference
      // programs.id with onDelete: "restrict", so programs must go last.
      await tx.delete(fundings);
      await tx.delete(bulletins);
      await tx.delete(partnerSchools);
      await tx.delete(programs);
    }

    await tx.insert(programs).values(PROGRAM_ROWS);
    await tx.insert(partnerSchools).values(PARTNER_SCHOOL_ROWS);
    await tx.insert(bulletins).values(BULLETIN_ROWS);
    await tx.insert(fundings).values(FUNDING_ROWS);
  });

  console.log("\n✓ Seeded mobility domain data.");
  console.log(`  ${PROGRAM_ROWS.length} programs`);
  console.log(`  ${PARTNER_SCHOOL_ROWS.length} partner schools`);
  console.log(`  ${BULLETIN_ROWS.length} bulletins`);
  console.log(`  ${FUNDING_ROWS.length} fundings`);
  console.log(
    "\n  Not seeded: testimonials, tcorner_slots, site_stats — these need a"
  );
  console.log(
    "  real staff user to attribute to, beyond the single seeded admin.\n"
  );
}

/**
 * Same shape as seed.ts's explain() — unwraps the driver error Drizzle
 * wraps, and turns the common failures into next steps.
 */
function explain(error: unknown): string {
  const cause = (error as { cause?: { code?: string; message?: string } })
    ?.cause;
  const code = cause?.code ?? (error as { code?: string })?.code;
  const message =
    cause?.message ?? (error instanceof Error ? error.message : String(error));

  if (code === "ECONNREFUSED" || code === "ENOTFOUND") {
    return `Cannot reach the database at ${process.env.DATABASE_URL ?? "(unset)"}. Start PostgreSQL, then try again.`;
  }

  if (code === "42P01") {
    return "The mobility tables do not exist yet.\n\n  Create them first:  pnpm migrate";
  }

  if (code === "42703" || code === "42804") {
    return `The database is behind the schema in db/schema: ${message}\n\n  Push the current schema, then seed again:  pnpm migrate`;
  }

  if (code === "23505") {
    return `A row with that id already exists: ${message}\n\n  Re-run with --force to wipe and re-insert.`;
  }

  return message;
}

seedMobility()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n✗ Seeding mobility data failed.\n");
    console.error(`  ${explain(error).replace(/\n/g, "\n  ")}\n`);
    process.exit(1);
  });