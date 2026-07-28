import type { Faq, FaqSource, KbChunk, KbDocument } from "./types";

/**
 * Knowledge base rows. FAQs are authored by staff and shown on the site;
 * KB documents and chunks are the derived index the RAG chatbot retrieves from.
 */

export const faqs: Faq[] = [
  {
    id: "faq-01",
    categoryId: "cat-12",
    question: {
      zh: "交換學生的申請流程是什麼？",
      en: "What is the exchange application process?",
    },
    shortAnswer: {
      zh: "線上報名、系所初審、國際處面試、公告錄取，最後由本處提名至姊妹校。",
      en: "Apply online, pass department review, interview with the OIR, receive the result, then we nominate you to the partner school.",
    },
    longAnswer: {
      zh: "第一步是在簡章公告期間完成線上報名，並上傳成績單、語言檢定證明與讀書計畫。\n\n第二步為系所初審，系上會依學業表現與適合度排序推薦。\n\n第三步是國際處面試，採中英雙語進行，主要了解申請動機與適應能力。\n\n錄取名單公告後，本處會將您提名至姊妹校，後續申請文件依姊妹校規定辦理。整體流程約需兩個月。",
      en: "First, submit the online form during the bulletin's open period, uploading your transcript, language certificate, and study plan.\n\nSecond, your department reviews and ranks applicants by academic record and fit.\n\nThird, you interview with the OIR. The interview is bilingual and focuses on motivation and adaptability.\n\nAfter results are announced, the OIR nominates you to the partner university, and the remaining documents follow that school's own process. The whole cycle takes about two months.",
    },
    audience: "student",
    needsHumanConfirm: false,
    published: true,
    lastReviewedAt: "2026-07-14",
    reviewedById: "usr-01",
  },
  {
    id: "faq-02",
    categoryId: "cat-12",
    question: {
      zh: "GPA 沒有達到姊妹校門檻還能申請嗎？",
      en: "Can I apply if my GPA is below the partner school's threshold?",
    },
    shortAnswer: {
      zh: "可以報名，但錄取機率低；建議同時填寫門檻較低的志願。",
      en: "You may apply, but your chances are low. List a lower-threshold school as a backup choice.",
    },
    longAnswer: {
      zh: "簡章列出的GPA為姊妹校要求的最低標準，本處不會在報名階段擋件，但提名時姊妹校可能直接拒絕。\n\n建議在志願序中至少納入一所門檻低於您GPA 0.2以上的學校。語言檢定成績突出時，部分姊妹校會個案考量，但無法保證。\n\n此題涉及個別條件判斷，建議至T-Corner與承辦人當面討論。",
      en: "The GPA listed in a bulletin is the partner university's minimum. We do not block applications at the form stage, but the partner school may reject the nomination outright.\n\nInclude at least one school whose threshold is 0.2 or more below your GPA. A strong language score is sometimes considered case by case, but never guaranteed.\n\nBecause this depends on your individual record, discuss it in person at T-Corner.",
    },
    audience: "student",
    needsHumanConfirm: true,
    published: true,
    lastReviewedAt: "2026-07-14",
    reviewedById: "usr-01",
  },
  {
    id: "faq-03",
    categoryId: "cat-11",
    question: {
      zh: "學生簽證要多久前開始辦理？",
      en: "How early should I start my student visa application?",
    },
    shortAnswer: {
      zh: "建議出發前三個月開始，暑假面試名額特別緊張。",
      en: "Start three months before departure — interview slots are scarce over the summer.",
    },
    longAnswer: {
      zh: "各國作業時間不同，但三個月是安全的起點。\n\n美國需先取得I-20、繳交SEVIS費用、填寫DS-160，再至AIT預約面試；暑假面試名額常在開放當天額滿。\n\n歐洲申根國家多為線上預約後親送文件，德國與荷蘭作業時間約六至八週。\n\n日本與韓國由姊妹校代為申請在留資格認定證明書，取得後再至代表處換簽，總計約四至六週。",
      en: "Processing times vary by country, but three months is a safe starting point.\n\nFor the United States you need the I-20, the SEVIS fee receipt, and the DS-160 before booking an AIT interview — summer slots often fill on the day they open.\n\nMost Schengen countries require an online appointment followed by an in-person document submission; Germany and the Netherlands take six to eight weeks.\n\nFor Japan and Korea the partner university applies for your Certificate of Eligibility first, after which you exchange it for a visa at the representative office — four to six weeks in total.",
    },
    audience: "student",
    needsHumanConfirm: false,
    published: true,
    lastReviewedAt: "2026-06-30",
    reviewedById: "usr-03",
  },
  {
    id: "faq-04",
    categoryId: "cat-13",
    question: {
      zh: "交換的學分一定抵得回來嗎？",
      en: "Are exchange credits always transferable?",
    },
    shortAnswer: {
      zh: "只有事先經系主任核可的課程才保證抵免，每學期上限25學分。",
      en: "Only courses approved in advance by your department chair are guaranteed, capped at 25 credits per semester.",
    },
    longAnswer: {
      zh: "抵免的關鍵是行前的「學習計畫書」（Learning Agreement）。未列於計畫書、且未經系主任事後同意的課程，可能無法採計。\n\n抵免上限為每學期25學分，其中通識課程最多6學分。專業必修課需課程大綱相符度達七成以上。\n\n返國後兩週內須繳交姊妹校正式成績單正本、課程大綱與抵免申請表，先送系辦初審，再轉教務處。",
      en: "Everything hinges on the Learning Agreement you file before departure. Courses not listed there, and not approved afterwards by your chair, may not count.\n\nThe cap is 25 credits per semester, of which at most 6 may be general education. Required major courses need at least 70% syllabus overlap.\n\nWithin two weeks of returning, submit the original host transcript, the syllabi, and the transfer form to your department office, which forwards it to Academic Affairs.",
    },
    audience: "student",
    needsHumanConfirm: true,
    published: true,
    lastReviewedAt: "2026-06-30",
    reviewedById: "usr-03",
  },
  {
    id: "faq-05",
    categoryId: "cat-14",
    question: {
      zh: "姊妹校都會提供宿舍嗎？",
      en: "Do all partner schools provide housing?",
    },
    shortAnswer: {
      zh: "不一定。姊妹校頁面標示「提供宿舍」者才保證有床位。",
      en: "No. Only schools flagged \"housing provided\" on the partner school page guarantee a bed.",
    },
    longAnswer: {
      zh: "亞洲與大洋洲的姊妹校多數提供國際學生宿舍，歐美學校則常需自行租屋。\n\n慕尼黑、柏克萊等城市租屋市場緊張，建議錄取後立即開始尋找，並避免在抵達前簽署任何長期租約。\n\n提供宿舍的學校仍有申請截止日，錯過者視同放棄，請務必確認姊妹校網頁上的日期。",
      en: "Most partners in Asia and Oceania offer an international dorm; many in Europe and North America expect you to rent privately.\n\nRental markets in cities such as Munich and Berkeley are tight — start looking as soon as you are accepted, and never sign a long lease before you arrive.\n\nSchools that do provide housing still have an application deadline; missing it counts as declining. Check the date on the partner school's own page.",
    },
    audience: "student",
    needsHumanConfirm: false,
    published: true,
    lastReviewedAt: "2026-05-20",
    reviewedById: "usr-03",
  },
  {
    id: "faq-06",
    categoryId: "cat-15",
    question: {
      zh: "出國期間健保還有效嗎？",
      en: "Does my National Health Insurance still work abroad?",
    },
    shortAnswer: {
      zh: "健保持續有效，海外緊急就醫可於六個月內申請部分核退。",
      en: "NHI stays active, and emergency treatment abroad can be partially reimbursed within six months.",
    },
    longAnswer: {
      zh: "健保不會因出國而中斷，海外緊急傷病可於就醫日起六個月內檢附診斷書與費用明細申請核退，但核退金額有上限。\n\n德國、日本與澳洲另強制加入當地保險：德國公保約每月120歐元，日本國民健康保險約每月2,000日圓，澳洲OSHC約每年500澳元。\n\n美國姊妹校多要求購買學校保險，豁免極少通過，請預留每年美金1,500至2,500元。",
      en: "NHI is not suspended when you go abroad. Emergency treatment can be partially reimbursed within six months of the treatment date, with a diagnosis certificate and itemised costs, up to a capped amount.\n\nGermany, Japan, and Australia additionally require local cover: German public insurance at roughly EUR 120 a month, Japanese NHI at roughly JPY 2,000 a month, and Australian OSHC at roughly AUD 500 a year.\n\nUS partner universities usually require their own student plan and rarely grant waivers — budget USD 1,500–2,500 per year.",
    },
    audience: "student",
    needsHumanConfirm: false,
    published: true,
    lastReviewedAt: "2026-04-08",
    reviewedById: "usr-03",
  },
  {
    id: "faq-07",
    categoryId: "cat-12",
    question: {
      zh: "家長可以代替學生洽詢或送件嗎？",
      en: "Can parents enquire or submit documents on a student's behalf?",
    },
    shortAnswer: {
      zh: "可以洽詢一般資訊，但申請文件須由學生本人送出。",
      en: "Parents may ask general questions, but application documents must be submitted by the student.",
    },
    longAnswer: {
      zh: "為保護學生個資，本處僅能向家長說明公開資訊，例如簡章期程、費用估算與姊妹校概況。\n\n個別申請進度、面試結果與成績相關事項，須由學生本人詢問，或由學生以書面授權後辦理。\n\n歡迎家長於T-Corner時段陪同學生一同前來討論。",
      en: "To protect student privacy, we can only share public information with parents — bulletin timelines, cost estimates, and general facts about partner schools.\n\nIndividual application status, interview outcomes, and grade-related matters must come from the student, or from a parent holding written authorisation.\n\nParents are welcome to join students at T-Corner sessions.",
    },
    audience: "parent",
    needsHumanConfirm: false,
    published: true,
    lastReviewedAt: "2026-05-20",
    reviewedById: "usr-01",
  },
  {
    id: "faq-08",
    categoryId: "cat-13",
    question: {
      zh: "系所如何提報新的姊妹校合作意向？",
      en: "How does a department propose a new partner university?",
    },
    shortAnswer: {
      zh: "填寫合作意向表送國際處，經校級會議審議後啟動簽約程序。",
      en: "Submit a partnership proposal form to the OIR; it goes to a university-level committee before signing begins.",
    },
    longAnswer: {
      zh: "系所可於每學期初提出合作意向，需說明對方校系排名、課程相符度與預期交換人數。\n\n國際處初審後提送國際事務委員會，通過者由本處與對方學校洽談MOU與學生交換協議，通常需六至十二個月。\n\n協議簽署後，姊妹校資料會建入本系統並於下一梯次簡章公告。",
      en: "Departments may propose a partnership at the start of each semester, describing the counterpart's ranking, curriculum overlap, and expected exchange volume.\n\nThe OIR screens the proposal and forwards it to the International Affairs Committee. Approved proposals move to MOU and exchange agreement negotiation, typically six to twelve months.\n\nOnce signed, the partner is added to this system and appears in the next bulletin.",
    },
    audience: "dept",
    needsHumanConfirm: false,
    published: true,
    lastReviewedAt: "2026-03-11",
    reviewedById: "usr-02",
  },
  {
    id: "faq-09",
    categoryId: "cat-11",
    question: {
      zh: "簽證被行政審查（221g）怎麼辦？",
      en: "What should I do if my visa goes into administrative processing (221g)?",
    },
    shortAnswer: {
      zh: "立即通知國際處，本處會協助向姊妹校說明可能延誤。",
      en: "Tell the OIR immediately so we can notify the partner university of a possible delay.",
    },
    longAnswer: {
      zh: "此題尚未經承辦人複核，內容可能不完整。\n\n常見原因包含財力證明不齊、就讀敏感科系。收到221g通知單後請保留正本並拍照留存。",
      en: "This answer has not yet been reviewed and may be incomplete.\n\nCommon triggers are incomplete financial documents and sensitive fields of study. Keep the original 221g slip and photograph it for your records.",
    },
    audience: "student",
    needsHumanConfirm: true,
    published: false,
    lastReviewedAt: "2026-07-22",
    reviewedById: "usr-02",
  },
];

export const faqSources: FaqSource[] = [
  {
    id: "fsr-01",
    faqId: "faq-01",
    mediaFileId: "med-01",
    sourceUrl: null,
    label: "115-2 簡章 p.2 申請流程",
  },
  {
    id: "fsr-02",
    faqId: "faq-02",
    mediaFileId: "med-01",
    sourceUrl: null,
    label: "115-2 簡章 p.5 甄選標準",
  },
  {
    id: "fsr-03",
    faqId: "faq-03",
    mediaFileId: null,
    sourceUrl: "https://www.ait.org.tw/visas/",
    label: "AIT — Nonimmigrant visa information",
  },
  {
    id: "fsr-04",
    faqId: "faq-04",
    mediaFileId: "med-10",
    sourceUrl: null,
    label: "學分抵免辦法 (115 修訂) p.1–3",
  },
  {
    id: "fsr-05",
    faqId: "faq-05",
    mediaFileId: "med-05",
    sourceUrl: null,
    label: "115-2 姊妹校一覽表",
  },
  {
    id: "fsr-06",
    faqId: "faq-06",
    mediaFileId: "med-11",
    sourceUrl: null,
    label: "各國保險規定對照表 p.1",
  },
  {
    id: "fsr-07",
    faqId: "faq-06",
    mediaFileId: null,
    sourceUrl: "https://www.nhi.gov.tw/",
    label: "衛生福利部中央健康保險署",
  },
  {
    id: "fsr-08",
    faqId: "faq-08",
    mediaFileId: null,
    sourceUrl: "https://oir.thu.edu.tw/partnership",
    label: "姊妹校締約作業要點",
  },
];

export const kbDocuments: KbDocument[] = [
  {
    id: "kbd-01",
    sourceTable: "faq",
    sourceId: "faq-01",
    title: "交換學生的申請流程是什麼？",
    content:
      "第一步是在簡章公告期間完成線上報名，並上傳成績單、語言檢定證明與讀書計畫。第二步為系所初審。第三步是國際處面試，採中英雙語進行。錄取名單公告後，本處會將您提名至姊妹校。",
    language: "zh-TW",
    academicYear: "115",
    version: 3,
    status: "indexed",
    errorMessage: null,
    indexedAt: "2026-07-14 11:20",
  },
  {
    id: "kbd-02",
    sourceTable: "faq",
    sourceId: "faq-04",
    title: "交換的學分一定抵得回來嗎？",
    content:
      "抵免的關鍵是行前的學習計畫書。抵免上限為每學期25學分，其中通識課程最多6學分。返國後兩週內須繳交姊妹校正式成績單正本、課程大綱與抵免申請表。",
    language: "zh-TW",
    academicYear: "115",
    version: 2,
    status: "indexed",
    errorMessage: null,
    indexedAt: "2026-06-30 09:05",
  },
  {
    id: "kbd-03",
    sourceTable: "bulletin",
    sourceId: "bul-01",
    title: "115學年度第2學期交換學生甄選簡章（全球）",
    content:
      "本梯次共開放18個國家、42所姊妹校。申請資格為在校修業滿兩學期、累計GPA 3.0以上。線上報名系統於2026年8月15日17:00關閉。說明會於7月22日與7月29日在國際大樓302室舉行。",
    language: "zh-TW",
    academicYear: "115-2",
    version: 2,
    status: "indexed",
    errorMessage: null,
    indexedAt: "2026-07-14 15:42",
  },
  {
    id: "kbd-04",
    sourceTable: "bulletin",
    sourceId: "bul-02",
    title: "115學年度第2學期交換學生甄選簡章（日韓專案）",
    content:
      "日韓專案共開放京都大學、早稻田大學、延世大學等11校。報名截止日為2026年8月8日，較全球梯次提前一週。JLPT N2或TOPIK 4級為多數學校門檻。",
    language: "zh-TW",
    academicYear: "115-2",
    version: 1,
    status: "indexed",
    errorMessage: null,
    indexedAt: "2026-07-14 15:44",
  },
  {
    id: "kbd-05",
    sourceTable: "post",
    sourceId: "post-05",
    title: "交換返國學分抵免完整指南",
    content:
      "出國前務必完成學習計畫書並取得系主任簽章。返國後兩週內送交系辦初審。每學期抵免上限為25學分，通識課程最多6學分。",
    language: "zh-TW",
    academicYear: "115",
    version: 1,
    status: "indexed",
    errorMessage: null,
    indexedAt: "2026-06-30 10:12",
  },
  {
    id: "kbd-06",
    sourceTable: "testimonial",
    sourceId: "tst-01",
    title: "京都大學交換心得 — 114-1 資工系",
    content:
      "京大提供的國際學生宿舍每月約32,000日圓，走路到吉田校區15分鐘。JLPT N2只是門檻，實際上專題討論的語速非常快。",
    language: "zh-TW",
    academicYear: "114-1",
    version: 1,
    status: "indexed",
    errorMessage: null,
    indexedAt: "2026-03-19 16:30",
  },
  {
    id: "kbd-07",
    sourceTable: "file",
    sourceId: "med-11",
    title: "各國保險規定對照表",
    content:
      "德國公保約每月120歐元，日本國民健康保險約每月2,000日圓，澳洲OSHC約每年500澳元。美國姊妹校多要求購買學校保險，每年約美金1,500至2,500元。",
    language: "zh-TW",
    academicYear: "115",
    version: 1,
    status: "stale",
    errorMessage: null,
    indexedAt: "2026-04-08 14:02",
  },
  {
    id: "kbd-08",
    sourceTable: "post",
    sourceId: "post-01",
    title: "115學年度第2學期交換學生甄選開始受理",
    content:
      "國際處自即日起受理115學年度第2學期交換學生申請。線上報名系統於2026年8月15日17:00關閉，逾期恕不受理。",
    language: "zh-TW",
    academicYear: "115-2",
    version: 1,
    status: "pending",
    errorMessage: null,
    indexedAt: null,
  },
  {
    id: "kbd-09",
    sourceTable: "file",
    sourceId: "med-05",
    title: "115-2 姊妹校一覽表",
    content: "",
    language: "zh-TW",
    academicYear: "115-2",
    version: 1,
    status: "failed",
    errorMessage:
      "Unsupported sheet layout: merged header cells in rows 1–3 could not be flattened to text.",
    indexedAt: null,
  },
  {
    id: "kbd-10",
    sourceTable: "faq",
    sourceId: "faq-06",
    title: "出國期間健保還有效嗎？",
    content:
      "健保不會因出國而中斷，海外緊急傷病可於就醫日起六個月內申請核退。德國、日本與澳洲另強制加入當地保險。",
    language: "zh-TW",
    academicYear: "115",
    version: 1,
    status: "indexed",
    errorMessage: null,
    indexedAt: "2026-04-08 14:10",
  },
];

export const kbChunks: KbChunk[] = [
  {
    id: "chk-0301",
    kbDocumentId: "kbd-03",
    index: 0,
    content:
      "115學年度第2學期交換學生甄選簡章（全球）。本梯次共開放18個國家、42所姊妹校，其中歐洲地區新增6校，名額共計86名。",
    tokenCount: 168,
    embeddingModel: "multilingual-e5-base",
    createdAt: "2026-07-14 15:42",
  },
  {
    id: "chk-0302",
    kbDocumentId: "kbd-03",
    index: 1,
    content:
      "申請資格：在校修業滿兩學期、累計GPA 3.0以上，並符合姊妹校語言門檻。個別學校之語言要求依簡章附表辦理。",
    tokenCount: 154,
    embeddingModel: "multilingual-e5-base",
    createdAt: "2026-07-14 15:42",
  },
  {
    id: "chk-0303",
    kbDocumentId: "kbd-03",
    index: 2,
    content:
      "線上報名系統於2026年8月15日17:00關閉，逾期恕不受理。報名時須上傳成績單、語言檢定證明與讀書計畫。",
    tokenCount: 142,
    embeddingModel: "multilingual-e5-base",
    createdAt: "2026-07-14 15:42",
  },
  {
    id: "chk-0304",
    kbDocumentId: "kbd-03",
    index: 3,
    content:
      "說明會將於國際大樓302室舉行兩場：7月22日（三）與7月29日（三），12:10–13:00，兩場內容相同，無需報名。",
    tokenCount: 138,
    embeddingModel: "multilingual-e5-base",
    createdAt: "2026-07-14 15:42",
  },
  {
    id: "chk-0305",
    kbDocumentId: "kbd-03",
    index: 4,
    content:
      "甄選方式：系所初審佔40%，國際處面試佔40%，語言檢定成績佔20%。面試預計於8月下旬舉行，時間另行公告。",
    tokenCount: 149,
    embeddingModel: "multilingual-e5-base",
    createdAt: "2026-07-14 15:42",
  },
  {
    id: "chk-0201",
    kbDocumentId: "kbd-02",
    index: 0,
    content:
      "抵免的關鍵是行前的學習計畫書（Learning Agreement）。未列於計畫書、且未經系主任事後同意的課程，可能無法採計。",
    tokenCount: 161,
    embeddingModel: "multilingual-e5-base",
    createdAt: "2026-06-30 09:05",
  },
  {
    id: "chk-0202",
    kbDocumentId: "kbd-02",
    index: 1,
    content:
      "抵免上限為每學期25學分，其中通識課程最多6學分。專業必修課需課程大綱相符度達七成以上。",
    tokenCount: 133,
    embeddingModel: "multilingual-e5-base",
    createdAt: "2026-06-30 09:05",
  },
  {
    id: "chk-0203",
    kbDocumentId: "kbd-02",
    index: 2,
    content:
      "返國後兩週內須繳交姊妹校正式成績單正本、課程大綱與抵免申請表，先送系辦初審，再轉教務處。",
    tokenCount: 129,
    embeddingModel: "multilingual-e5-base",
    createdAt: "2026-06-30 09:05",
  },
  {
    id: "chk-0601",
    kbDocumentId: "kbd-06",
    index: 0,
    content:
      "京大提供的國際學生宿舍每月約32,000日圓，含水電，走路到吉田校區15分鐘。物價比台中高，學餐一餐約500日圓。",
    tokenCount: 147,
    embeddingModel: "multilingual-e5-base",
    createdAt: "2026-03-19 16:30",
  },
  {
    id: "chk-0602",
    kbDocumentId: "kbd-06",
    index: 1,
    content:
      "JLPT N2只是門檻，實際上專題討論的語速非常快。出發前多聽學術演講的錄音會很有幫助。",
    tokenCount: 124,
    embeddingModel: "multilingual-e5-base",
    createdAt: "2026-03-19 16:30",
  },
  {
    id: "chk-1001",
    kbDocumentId: "kbd-10",
    index: 0,
    content:
      "健保不會因出國而中斷，海外緊急傷病可於就醫日起六個月內檢附診斷書與費用明細申請核退，但核退金額有上限。",
    tokenCount: 152,
    embeddingModel: "multilingual-e5-base",
    createdAt: "2026-04-08 14:10",
  },
];
