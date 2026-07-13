// Static mock data used across the frontend while the backend is not connected.

export type KnowledgeCategory =
  | "Visa & Immigration"
  | "Scholarships"
  | "Housing & Dormitory"
  | "Exchange Programs"
  | "Application Documents"
  | "Insurance & Health";

export const knowledgeCategories: {
  name: KnowledgeCategory;
  slug: string;
  description: string;
  count: number;
}[] = [
  {
    name: "Visa & Immigration",
    slug: "visa",
    description: "Student visa types, application steps, and interview tips.",
    count: 12,
  },
  {
    name: "Scholarships",
    slug: "scholarships",
    description: "Government and partner-university scholarships and grants.",
    count: 9,
  },
  {
    name: "Housing & Dormitory",
    slug: "dormitory",
    description: "On-campus dorms, off-campus rentals, and housing deadlines.",
    count: 7,
  },
  {
    name: "Exchange Programs",
    slug: "exchange",
    description: "Semester exchange, dual degree, and short-term programs.",
    count: 14,
  },
  {
    name: "Application Documents",
    slug: "documents",
    description: "Transcripts, recommendation letters, and study plans.",
    count: 10,
  },
  {
    name: "Insurance & Health",
    slug: "insurance",
    description: "Health insurance requirements and medical check-ups.",
    count: 5,
  },
];

export const partnerSchools = [
  "All Schools",
  "University of California, Berkeley",
  "Kyoto University",
  "University of Melbourne",
  "Technical University of Munich",
  "KU Leuven",
  "National University of Singapore",
  "University of British Columbia",
];

export type KnowledgeDoc = {
  id: string;
  title: string;
  category: KnowledgeCategory;
  school: string;
  summary: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  attachments: { name: string; size: string; type: "pdf" | "docx" | "xlsx" }[];
  content: string[];
};

export const knowledgeDocs: KnowledgeDoc[] = [
  {
    id: "kb-001",
    title: "F-1 Student Visa Application Guide (United States)",
    category: "Visa & Immigration",
    school: "University of California, Berkeley",
    summary:
      "Step-by-step guide for applying for the U.S. F-1 student visa, including SEVIS fee, DS-160 form, and interview preparation.",
    author: "Ms. Chen Yi-Ling (OIR)",
    publishedAt: "2026-06-18",
    updatedAt: "2026-07-02",
    attachments: [
      { name: "F1-visa-checklist.pdf", size: "412 KB", type: "pdf" },
      { name: "DS-160-sample.pdf", size: "1.2 MB", type: "pdf" },
    ],
    content: [
      "Students accepted to a U.S. partner university must apply for an F-1 student visa before departure. Start the process at least three months before your program begins, as interview slots at AIT (American Institute in Taiwan) fill up quickly during summer.",
      "First, receive your Form I-20 from the host university. Check that your name matches your passport exactly. Any mismatch must be corrected by the host school before you continue.",
      "Second, pay the SEVIS I-901 fee (currently USD 350) on fmjfee.com and keep the receipt. You will need the receipt number for the DS-160 form and the interview.",
      "Third, complete the DS-160 online application. Upload a photo that meets the U.S. photo requirements — the photo booth on the 2nd floor of the library produces compliant photos.",
      "Finally, schedule your interview at AIT Taipei or Kaohsiung. Bring your passport, I-20, SEVIS receipt, DS-160 confirmation, financial proof, and transcripts. Most student interviews take less than five minutes.",
    ],
  },
  {
    id: "kb-002",
    title: "MEXT & JASSO Scholarships for Exchange in Japan",
    category: "Scholarships",
    school: "Kyoto University",
    summary:
      "Overview of Japanese government (MEXT) and JASSO scholarships available to exchange students, with eligibility and monthly stipend details.",
    author: "Mr. Huang Wei-Ting (OIR)",
    publishedAt: "2026-05-30",
    updatedAt: "2026-06-21",
    attachments: [{ name: "JASSO-eligibility-2026.pdf", size: "680 KB", type: "pdf" }],
    content: [
      "Exchange students nominated to Kyoto University may be eligible for the JASSO Student Exchange Support Program, which provides JPY 80,000 per month during the exchange period.",
      "Eligibility requires a GPA of at least 2.30 on JASSO's 3.00 scale — roughly equivalent to a 3.2/4.3 GPA at our university. The OIR converts your transcript automatically during nomination; you do not need to calculate it yourself.",
      "JASSO selection is made by the host university after nomination, so no separate application is needed. Results are usually announced together with the acceptance letter.",
      "MEXT scholarships follow a separate, earlier timeline through the Japan-Taiwan Exchange Association. Applications typically open in April for programs starting the following spring.",
    ],
  },
  {
    id: "kb-003",
    title: "On-Campus Housing Application — University of Melbourne",
    category: "Housing & Dormitory",
    school: "University of Melbourne",
    summary:
      "How to apply for residential colleges and university apartments in Melbourne, including costs and application deadlines.",
    author: "Ms. Lin Hsiao-Mei (OIR)",
    publishedAt: "2026-06-05",
    updatedAt: "2026-06-05",
    attachments: [
      { name: "melbourne-housing-comparison.xlsx", size: "88 KB", type: "xlsx" },
    ],
    content: [
      "The University of Melbourne guarantees a housing offer for exchange students who apply before the priority deadline (October 31 for Semester 1 entry; April 30 for Semester 2 entry).",
      "Options include residential colleges (meals included, AUD 650–900/week) and self-catered university apartments (AUD 300–500/week). Most exchange students choose university apartments for cost reasons.",
      "Apply through the housing portal after receiving your student ID from Melbourne. You will need a AUD 500 refundable deposit paid by credit card.",
      "If you prefer off-campus housing, avoid signing any lease before arriving. The attached spreadsheet compares typical costs and commute times by suburb.",
    ],
  },
  {
    id: "kb-004",
    title: "TUM Exchange Nomination & Learning Agreement",
    category: "Exchange Programs",
    school: "Technical University of Munich",
    summary:
      "Nomination timeline for TUM exchange, how to complete the Learning Agreement, and credit-transfer rules.",
    author: "Ms. Chen Yi-Ling (OIR)",
    publishedAt: "2026-04-22",
    updatedAt: "2026-06-30",
    attachments: [
      { name: "TUM-learning-agreement-template.docx", size: "156 KB", type: "docx" },
      { name: "credit-transfer-rules.pdf", size: "240 KB", type: "pdf" },
    ],
    content: [
      "Nomination to TUM happens twice a year: end of March for Winter Semester and end of September for Summer Semester. Internal selection at our university closes one month before each nomination round.",
      "After nomination, TUM sends an email with your application portal account. Complete the online application within two weeks, uploading a transcript, a study plan, and B2-level English or German proficiency proof.",
      "The Learning Agreement lists the courses you plan to take. It must be signed by your department chair before departure — courses without prior approval may not transfer back as credits.",
      "TUM course catalogs open about six weeks before the semester. It is normal to change courses after arrival; submit the 'Changes to Learning Agreement' form within the first month.",
    ],
  },
  {
    id: "kb-005",
    title: "Preparing Recommendation Letters & Study Plans",
    category: "Application Documents",
    school: "All Schools",
    summary:
      "How to request recommendation letters properly and structure a convincing study plan for exchange or degree applications.",
    author: "Mr. Huang Wei-Ting (OIR)",
    publishedAt: "2026-03-14",
    updatedAt: "2026-05-11",
    attachments: [
      { name: "study-plan-outline.docx", size: "64 KB", type: "docx" },
    ],
    content: [
      "Most partner universities require one or two recommendation letters. Ask professors who actually know your work at least four weeks before the deadline, and provide them your CV, transcript, and the program description.",
      "Letters should be printed on department letterhead and signed. Some schools require professors to submit letters directly through an online system — check the application portal early.",
      "A study plan (motivation letter) is usually 500–800 words. Structure it in four parts: why this field, why this university, what you will do there, and how it connects to your future goals.",
      "The OIR offers a document review service every Wednesday afternoon. Book a slot through the contact page — bring a printed draft.",
    ],
  },
  {
    id: "kb-006",
    title: "Overseas Health Insurance Requirements by Country",
    category: "Insurance & Health",
    school: "All Schools",
    summary:
      "Which countries require local insurance enrollment, what NHI covers abroad, and how to file overseas reimbursement claims.",
    author: "Ms. Lin Hsiao-Mei (OIR)",
    publishedAt: "2026-02-27",
    updatedAt: "2026-04-08",
    attachments: [
      { name: "insurance-requirements-table.pdf", size: "310 KB", type: "pdf" },
    ],
    content: [
      "Taiwan's National Health Insurance (NHI) continues while you study abroad, and emergency treatment overseas can be partially reimbursed within six months of the treatment date.",
      "Germany, Japan, and Australia require enrollment in a local insurance scheme regardless of NHI: German public insurance (~EUR 120/month), Japanese NHI (~JPY 2,000/month), and Australia's OSHC (~AUD 500/year).",
      "For the U.S., partner universities require you to buy their student health plan unless you can prove equivalent coverage — waivers are rarely granted, so budget USD 1,500–2,500 per year.",
      "Keep every receipt and diagnosis certificate. The attached table summarizes requirements and typical costs by country.",
    ],
  },
];

export type Announcement = {
  id: string;
  title: string;
  category: "Scholarship" | "Announcement" | "News";
  summary: string;
  author: string;
  publishedAt: string;
  pinned?: boolean;
  attachments: { name: string; size: string; type: "pdf" | "docx" | "xlsx" }[];
  content: string[];
};

export const announcements: Announcement[] = [
  {
    id: "ann-001",
    title: "2027 Spring Exchange Program Application Now Open",
    category: "Announcement",
    summary:
      "Applications for Spring 2027 semester exchange are open until August 15, 2026. Info sessions will be held on July 22 and July 29.",
    author: "Office of International Relations",
    publishedAt: "2026-07-10",
    pinned: true,
    attachments: [
      { name: "spring-2027-partner-list.pdf", size: "520 KB", type: "pdf" },
      { name: "application-form.docx", size: "92 KB", type: "docx" },
    ],
    content: [
      "The Office of International Relations is pleased to announce that applications for the Spring 2027 semester exchange program are now open. This round includes 42 partner universities across 18 countries, with 6 new partners in Europe.",
      "Eligible students must have completed at least two semesters at the time of departure, hold a cumulative GPA of 3.0 or above, and meet the language requirement of the host university.",
      "The online application closes on August 15, 2026 at 17:00. Late submissions will not be accepted under any circumstances.",
      "Two information sessions will be held in the International Building Room 302: July 22 (Wednesday) 12:10–13:00 and July 29 (Wednesday) 12:10–13:00. The same content is covered in both sessions.",
    ],
  },
  {
    id: "ann-002",
    title: "Fulbright Taiwan Graduate Study Grants — Deadline Extended",
    category: "Scholarship",
    summary:
      "The Fulbright graduate study grant deadline has been extended to July 31, 2026. Grants cover up to USD 30,000 per academic year.",
    author: "Ms. Chen Yi-Ling",
    publishedAt: "2026-07-06",
    attachments: [{ name: "fulbright-2027-guidelines.pdf", size: "1.1 MB", type: "pdf" }],
    content: [
      "The Foundation for Scholarly Exchange (Fulbright Taiwan) has extended the application deadline for 2027–2028 graduate study grants to July 31, 2026.",
      "Grants support master's or doctoral study in the United States and cover up to USD 30,000 per academic year, renewable once. Applicants must hold Taiwan citizenship and a bachelor's degree by June 2027.",
      "Applications require three recommendation letters, a study objective essay, and valid TOEFL or IELTS scores. The OIR can review your essay draft — book an appointment through the contact page.",
      "Shortlisted candidates will be interviewed in Taipei in October 2026.",
    ],
  },
  {
    id: "ann-003",
    title: "New Partnership Signed with KU Leuven, Belgium",
    category: "News",
    summary:
      "A new student exchange agreement with KU Leuven opens 4 exchange spots per year starting Fall 2027, tuition waived.",
    author: "Office of International Relations",
    publishedAt: "2026-06-28",
    attachments: [],
    content: [
      "We are delighted to announce a new student exchange agreement with KU Leuven, Belgium's highest-ranked university and one of Europe's oldest, founded in 1425.",
      "Starting Fall 2027, four students per year can study at KU Leuven with tuition fully waived. Courses are available in English across engineering, business, social sciences, and biomedical fields.",
      "Leuven is a 25-minute train ride from Brussels, and students report living costs of roughly EUR 900–1,100 per month including housing.",
      "The first application round will be included in the Fall 2027 exchange call, opening in January 2027.",
    ],
  },
  {
    id: "ann-004",
    title: "Summer Office Hours & Document Pick-up Schedule",
    category: "Announcement",
    summary:
      "During July–August the OIR front desk operates 09:00–16:00 on weekdays. Certificate pick-up requires a one-day advance request.",
    author: "Office of International Relations",
    publishedAt: "2026-06-25",
    attachments: [],
    content: [
      "During the summer break (July 1 – August 31), the OIR front desk operates Monday to Friday, 09:00–16:00, closed 12:00–13:00 for lunch.",
      "Students needing enrollment certificates, nomination letters, or transcript verification for study-abroad applications should submit the request form at least one working day before pick-up.",
      "Urgent same-day requests are only possible for visa interview appointments — bring proof of your appointment time.",
    ],
  },
  {
    id: "ann-005",
    title: "Taiwan–Europe Youth Mobility Scheme Now Includes Czechia",
    category: "News",
    summary:
      "Czechia joins the youth mobility scheme, allowing graduates aged 18–30 to work and travel for up to one year after studies.",
    author: "Mr. Huang Wei-Ting",
    publishedAt: "2026-06-12",
    attachments: [{ name: "youth-mobility-factsheet.pdf", size: "205 KB", type: "pdf" }],
    content: [
      "The Ministry of Foreign Affairs announced that Czechia has joined Taiwan's youth mobility scheme, joining 9 other countries.",
      "Taiwanese citizens aged 18–30 can apply for a one-year working holiday visa, which many students use to stay in Europe after finishing an exchange or degree program.",
      "The quota is 200 visas per year, opening each January. Details are in the attached factsheet.",
    ],
  },
  {
    id: "ann-006",
    title: "Scholarship Result: 2026 Study Abroad Encouragement Award",
    category: "Scholarship",
    summary:
      "28 students have been awarded the 2026 Study Abroad Encouragement Award of NT$50,000 each. Award letters are ready for pick-up.",
    author: "Ms. Lin Hsiao-Mei",
    publishedAt: "2026-06-02",
    attachments: [{ name: "2026-awardee-list.pdf", size: "130 KB", type: "pdf" }],
    content: [
      "The selection committee has awarded the 2026 Study Abroad Encouragement Award to 28 students. Each awardee receives NT$50,000 to support exchange-related expenses.",
      "The awardee list (student ID partially masked) is attached. Award letters can be picked up at the OIR front desk with your student ID card starting June 5.",
      "The stipend will be transferred to your registered bank account by the end of June.",
    ],
  },
];

// ---------- Admin mock data ----------

export type AdminDocument = {
  id: string;
  filename: string;
  title: string;
  category: KnowledgeCategory;
  school: string;
  status: "READY" | "PROCESSING" | "FAILED" | "PENDING";
  chunks: number;
  uploadedBy: string;
  uploadedAt: string;
  size: string;
};

export const adminDocuments: AdminDocument[] = [
  { id: "kb-001", filename: "f1-visa-guide-2026.pdf", title: "F-1 Student Visa Application Guide (United States)", category: "Visa & Immigration", school: "University of California, Berkeley", status: "READY", chunks: 18, uploadedBy: "Chen Yi-Ling", uploadedAt: "2026-06-18", size: "1.4 MB" },
  { id: "kb-002", filename: "mext-jasso-overview.pdf", title: "MEXT & JASSO Scholarships for Exchange in Japan", category: "Scholarships", school: "Kyoto University", status: "READY", chunks: 12, uploadedBy: "Huang Wei-Ting", uploadedAt: "2026-05-30", size: "820 KB" },
  { id: "kb-003", filename: "melbourne-housing.docx", title: "On-Campus Housing Application — University of Melbourne", category: "Housing & Dormitory", school: "University of Melbourne", status: "READY", chunks: 9, uploadedBy: "Lin Hsiao-Mei", uploadedAt: "2026-06-05", size: "310 KB" },
  { id: "kb-004", filename: "tum-nomination-la.pdf", title: "TUM Exchange Nomination & Learning Agreement", category: "Exchange Programs", school: "Technical University of Munich", status: "PROCESSING", chunks: 0, uploadedBy: "Chen Yi-Ling", uploadedAt: "2026-07-12", size: "2.1 MB" },
  { id: "kb-005", filename: "recommendation-study-plan.docx", title: "Preparing Recommendation Letters & Study Plans", category: "Application Documents", school: "All Schools", status: "READY", chunks: 11, uploadedBy: "Huang Wei-Ting", uploadedAt: "2026-03-14", size: "150 KB" },
  { id: "kb-006", filename: "insurance-by-country.pdf", title: "Overseas Health Insurance Requirements by Country", category: "Insurance & Health", school: "All Schools", status: "READY", chunks: 14, uploadedBy: "Lin Hsiao-Mei", uploadedAt: "2026-02-27", size: "640 KB" },
  { id: "kb-007", filename: "nus-course-mapping.xlsx", title: "NUS Course Mapping Table", category: "Exchange Programs", school: "National University of Singapore", status: "FAILED", chunks: 0, uploadedBy: "Chen Yi-Ling", uploadedAt: "2026-07-11", size: "96 KB" },
  { id: "kb-008", filename: "ubc-scholarship-faq.pdf", title: "UBC Entrance Scholarships FAQ", category: "Scholarships", school: "University of British Columbia", status: "PENDING", chunks: 0, uploadedBy: "Huang Wei-Ting", uploadedAt: "2026-07-13", size: "480 KB" },
];

export type Chunk = {
  index: number;
  tokens: number;
  text: string;
};

export const documentChunks: Chunk[] = [
  { index: 0, tokens: 182, text: "Students accepted to a U.S. partner university must apply for an F-1 student visa before departure. Start the process at least three months before your program begins, as interview slots at AIT (American Institute in Taiwan) fill up quickly during summer." },
  { index: 1, tokens: 156, text: "First, receive your Form I-20 from the host university. Check that your name matches your passport exactly. Any mismatch must be corrected by the host school before you continue." },
  { index: 2, tokens: 174, text: "Second, pay the SEVIS I-901 fee (currently USD 350) on fmjfee.com and keep the receipt. You will need the receipt number for the DS-160 form and the interview." },
  { index: 3, tokens: 168, text: "Third, complete the DS-160 online application. Upload a photo that meets the U.S. photo requirements — the photo booth on the 2nd floor of the library produces compliant photos." },
  { index: 4, tokens: 201, text: "Finally, schedule your interview at AIT Taipei or Kaohsiung. Bring your passport, I-20, SEVIS receipt, DS-160 confirmation, financial proof, and transcripts. Most student interviews take less than five minutes." },
  { index: 5, tokens: 143, text: "Common reasons for administrative processing (221g) include incomplete financial documents and sensitive fields of study. If you receive a 221g slip, notify the OIR immediately so we can inform your host university of possible delays." },
];

export type Conversation = {
  id: string;
  sessionId: string;
  user: string;
  language: "EN" | "中文";
  messages: number;
  rating: "good" | "bad" | "none";
  model: string;
  startedAt: string;
  lastMessage: string;
};

export const conversations: Conversation[] = [
  { id: "conv-001", sessionId: "sess_8f2ka91", user: "Anonymous", language: "中文", messages: 6, rating: "good", model: "claude-sonnet-5", startedAt: "2026-07-13 10:42", lastMessage: "申請美國學生簽證需要準備哪些文件?" },
  { id: "conv-002", sessionId: "sess_1cd0e3b", user: "s10712345", language: "EN", messages: 4, rating: "good", model: "claude-sonnet-5", startedAt: "2026-07-13 09:15", lastMessage: "When is the deadline for the Spring 2027 exchange application?" },
  { id: "conv-003", sessionId: "sess_77aeb02", user: "Anonymous", language: "EN", messages: 9, rating: "bad", model: "gpt-4o-mini", startedAt: "2026-07-12 16:30", lastMessage: "Can I apply for JASSO if my GPA is 2.9?" },
  { id: "conv-004", sessionId: "sess_5b19c44", user: "s10698765", language: "中文", messages: 3, rating: "none", model: "claude-sonnet-5", startedAt: "2026-07-12 14:02", lastMessage: "墨爾本大學的宿舍押金是多少?" },
  { id: "conv-005", sessionId: "sess_c30d112", user: "Anonymous", language: "EN", messages: 12, rating: "good", model: "gpt-4o-mini", startedAt: "2026-07-11 20:48", lastMessage: "How do I transfer credits back after my exchange at TUM?" },
  { id: "conv-006", sessionId: "sess_e91f7a8", user: "s10755511", language: "中文", messages: 5, rating: "bad", model: "claude-sonnet-5", startedAt: "2026-07-11 11:23", lastMessage: "海外健康保險理賠要在多久內申請?" },
];

export type TranscriptTurn = {
  role: "user" | "assistant";
  text: string;
  retrievedChunks?: { docTitle: string; chunkIndex: number; score: number }[];
};

export const transcript: TranscriptTurn[] = [
  {
    role: "user",
    text: "When is the deadline for the Spring 2027 exchange application?",
  },
  {
    role: "assistant",
    text: "The application for the Spring 2027 semester exchange program closes on August 15, 2026 at 17:00. Late submissions are not accepted. There are also two info sessions on July 22 and July 29 in the International Building Room 302 if you'd like more details before applying.",
    retrievedChunks: [
      { docTitle: "2027 Spring Exchange Program Application Now Open", chunkIndex: 2, score: 0.91 },
      { docTitle: "2027 Spring Exchange Program Application Now Open", chunkIndex: 3, score: 0.87 },
      { docTitle: "TUM Exchange Nomination & Learning Agreement", chunkIndex: 0, score: 0.62 },
    ],
  },
  {
    role: "user",
    text: "What GPA do I need?",
  },
  {
    role: "assistant",
    text: "You need a cumulative GPA of 3.0 or above at the time of application, and you must have completed at least two semesters by the time of departure. You also need to meet the language requirement of the host university you're applying to — this varies by school.",
    retrievedChunks: [
      { docTitle: "2027 Spring Exchange Program Application Now Open", chunkIndex: 1, score: 0.94 },
      { docTitle: "MEXT & JASSO Scholarships for Exchange in Japan", chunkIndex: 1, score: 0.58 },
    ],
  },
];

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "STAFF" | "STUDENT";
  studentId?: string;
  major?: string;
  status: "active" | "deactivated";
  createdAt: string;
  lastLogin: string;
};

export const adminUsers: AdminUser[] = [
  { id: "u-001", name: "Chen Yi-Ling", email: "ylchen@thu.edu.tw", role: "ADMIN", status: "active", createdAt: "2025-09-01", lastLogin: "2026-07-13 08:55" },
  { id: "u-002", name: "Huang Wei-Ting", email: "wthuang@thu.edu.tw", role: "STAFF", status: "active", createdAt: "2025-09-01", lastLogin: "2026-07-12 17:20" },
  { id: "u-003", name: "Lin Hsiao-Mei", email: "hmlin@thu.edu.tw", role: "STAFF", status: "active", createdAt: "2025-10-15", lastLogin: "2026-07-13 09:41" },
  { id: "u-004", name: "Wang Chih-Hao", email: "chwang@thu.edu.tw", role: "STAFF", status: "deactivated", createdAt: "2025-09-01", lastLogin: "2026-03-02 13:10" },
  { id: "u-101", name: "Liu Yu-Chen", email: "s10712345@thu.edu.tw", role: "STUDENT", studentId: "s10712345", major: "International Business", status: "active", createdAt: "2026-02-11", lastLogin: "2026-07-13 09:15" },
  { id: "u-102", name: "Chang Min-Hsuan", email: "s10698765@thu.edu.tw", role: "STUDENT", studentId: "s10698765", major: "Computer Science", status: "active", createdAt: "2026-03-04", lastLogin: "2026-07-12 14:02" },
  { id: "u-103", name: "Wu Pei-Shan", email: "s10755511@thu.edu.tw", role: "STUDENT", studentId: "s10755511", major: "Foreign Languages", status: "active", createdAt: "2026-04-18", lastLogin: "2026-07-11 11:23" },
  { id: "u-104", name: "Kao Cheng-En", email: "s10733322@thu.edu.tw", role: "STUDENT", studentId: "s10733322", major: "Chemical Engineering", status: "deactivated", createdAt: "2026-01-27", lastLogin: "2026-05-30 19:44" },
];

export const chatsPerDay = [
  { day: "Jul 7", count: 34 },
  { day: "Jul 8", count: 41 },
  { day: "Jul 9", count: 29 },
  { day: "Jul 10", count: 52 },
  { day: "Jul 11", count: 47 },
  { day: "Jul 12", count: 38 },
  { day: "Jul 13", count: 44 },
];

export const suggestedQuestions = [
  "How do I apply for a U.S. student visa?",
  "What scholarships are available for exchange in Japan?",
  "When does the Spring 2027 exchange application close?",
  "What documents do I need for the TUM exchange?",
];
