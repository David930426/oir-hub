import type {
  ChatCitation,
  ChatFeedback,
  ChatMessage,
  ChatSession,
  ContactMessage,
  SurveyResponse,
} from "./types";

/** Chat, evaluation, and contact-inbox rows. The public chat has no login. */

export const chatSessions: ChatSession[] = [
  {
    id: "cse-01",
    anonId: "8f2ka91c-4d1e-4b77-9a30-1c0f5b2e77aa",
    locale: "zh-TW",
    userAgent: "Chrome 141 · Windows",
    createdAt: "2026-07-28 10:42",
  },
  {
    id: "cse-02",
    anonId: "1cd0e3b7-2f88-4a05-8c61-93bb0d4a1f20",
    locale: "en",
    userAgent: "Safari 19 · iPhone",
    createdAt: "2026-07-28 09:15",
  },
  {
    id: "cse-03",
    anonId: "77aeb022-9e51-4c3a-b0d8-6a4f21c9e134",
    locale: "en",
    userAgent: "Chrome 141 · macOS",
    createdAt: "2026-07-27 16:30",
  },
  {
    id: "cse-04",
    anonId: "5b19c443-0a76-4f19-9d55-2e7c8b6a0d91",
    locale: "zh-TW",
    userAgent: "Edge 141 · Windows",
    createdAt: "2026-07-27 14:02",
  },
  {
    id: "cse-05",
    anonId: "c30d112f-6b48-4e0d-a1c7-58f39d2b4e60",
    locale: "en",
    userAgent: "Firefox 143 · Linux",
    createdAt: "2026-07-26 20:48",
  },
  {
    id: "cse-06",
    anonId: "e91f7a80-3c25-49b6-8f42-7d10ab5c9e33",
    locale: "zh-TW",
    userAgent: "Chrome 140 · Android",
    createdAt: "2026-07-26 11:23",
  },
];

export const chatMessages: ChatMessage[] = [
  // Session 02 — the transcript rendered in the admin detail view.
  {
    id: "cms-0201",
    sessionId: "cse-02",
    role: "user",
    content: "When is the deadline for the 115-2 exchange application?",
    escalated: false,
    model: null,
    retrievalMs: null,
    generationMs: null,
    createdAt: "2026-07-28 09:15",
  },
  {
    id: "cms-0202",
    sessionId: "cse-02",
    role: "assistant",
    content:
      "The 115-2 semester exchange application closes on 15 August 2026 at 17:00. Late submissions are not accepted.\n\nThe Japan & Korea round closes a week earlier, on 8 August 2026 — check which bulletin applies to the schools on your list.",
    escalated: false,
    model: "qwen2.5:7b",
    retrievalMs: 182,
    generationMs: 1_940,
    createdAt: "2026-07-28 09:15",
  },
  {
    id: "cms-0203",
    sessionId: "cse-02",
    role: "user",
    content: "What GPA do I need?",
    escalated: false,
    model: null,
    retrievalMs: null,
    generationMs: null,
    createdAt: "2026-07-28 09:17",
  },
  {
    id: "cms-0204",
    sessionId: "cse-02",
    role: "assistant",
    content:
      "You need a cumulative GPA of 3.0 or above and at least two completed semesters at the time of departure. Individual partner schools set higher thresholds — Kyoto University asks for 3.3 and UC Berkeley for 3.5.\n\nSelection weights department review at 40%, the OIR interview at 40%, and language scores at 20%.",
    escalated: false,
    model: "qwen2.5:7b",
    retrievalMs: 165,
    generationMs: 2_210,
    createdAt: "2026-07-28 09:17",
  },
  // Session 03 — escalated to a human.
  {
    id: "cms-0301",
    sessionId: "cse-03",
    role: "user",
    content: "Can I still apply for Xuehai Feiyang if my GPA is 2.9?",
    escalated: false,
    model: null,
    retrievalMs: null,
    generationMs: null,
    createdAt: "2026-07-27 16:30",
  },
  {
    id: "cms-0302",
    sessionId: "cse-03",
    role: "assistant",
    content:
      "This depends on your individual record, so I've passed it to an OIR advisor rather than answering directly. The published requirement is an average of 80 or above in the previous academic year, but exceptions are considered case by case.",
    escalated: true,
    model: "qwen2.5:7b",
    retrievalMs: 201,
    generationMs: 1_760,
    createdAt: "2026-07-27 16:31",
  },
];

export const chatCitations: ChatCitation[] = [
  { id: "cit-01", messageId: "cms-0202", kbChunkId: "chk-0303", score: 0.91, rank: 1 },
  { id: "cit-02", messageId: "cms-0202", kbChunkId: "chk-0304", score: 0.84, rank: 2 },
  { id: "cit-03", messageId: "cms-0202", kbChunkId: "chk-0301", score: 0.62, rank: 3 },
  { id: "cit-04", messageId: "cms-0204", kbChunkId: "chk-0302", score: 0.94, rank: 1 },
  { id: "cit-05", messageId: "cms-0204", kbChunkId: "chk-0305", score: 0.79, rank: 2 },
  { id: "cit-06", messageId: "cms-0302", kbChunkId: "chk-0301", score: 0.58, rank: 1 },
];

export const chatFeedback: ChatFeedback[] = [
  {
    id: "cfb-01",
    messageId: "cms-0202",
    rating: 1,
    reason: null,
    comment: "Exactly what I needed, and it caught the Japan round difference.",
    createdAt: "2026-07-28 09:16",
  },
  {
    id: "cfb-02",
    messageId: "cms-0204",
    rating: 1,
    reason: null,
    comment: null,
    createdAt: "2026-07-28 09:18",
  },
  {
    id: "cfb-03",
    messageId: "cms-0302",
    rating: -1,
    reason: "incomplete",
    comment: "It just handed me off without telling me who to contact.",
    createdAt: "2026-07-27 16:33",
  },
];

export const surveyResponses: SurveyResponse[] = [
  {
    id: "srv-01",
    sessionId: "cse-02",
    susAnswers: [5, 2, 5, 1, 4, 2, 5, 2, 4, 2],
    susScore: 85,
    confidenceBefore: 2,
    confidenceAfter: 4,
    comment: "Much faster than digging through the PDF bulletin.",
    createdAt: "2026-07-28 09:20",
  },
  {
    id: "srv-02",
    sessionId: "cse-03",
    susAnswers: [3, 3, 4, 2, 3, 3, 4, 3, 3, 3],
    susScore: 60,
    confidenceBefore: 3,
    confidenceAfter: 3,
    comment: "Answer was vague on my specific case.",
    createdAt: "2026-07-27 16:35",
  },
  {
    id: "srv-03",
    sessionId: "cse-05",
    susAnswers: [4, 2, 5, 1, 4, 2, 4, 2, 4, 1],
    susScore: 82.5,
    confidenceBefore: 2,
    confidenceAfter: 5,
    comment: null,
    createdAt: "2026-07-26 21:05",
  },
  {
    id: "srv-04",
    sessionId: "cse-06",
    susAnswers: [4, 3, 4, 2, 4, 2, 4, 3, 3, 2],
    susScore: 72.5,
    confidenceBefore: 1,
    confidenceAfter: 4,
    comment: "希望可以直接附上簡章的頁碼。",
    createdAt: "2026-07-26 11:40",
  },
];

export const contactMessages: ContactMessage[] = [
  {
    id: "cnt-01",
    name: "Liu Yu-Chen",
    email: "s10712345@thu.edu.tw",
    topic: "Funding",
    body: "My GPA is 2.9 — the chatbot said an advisor should confirm whether I can still apply for Xuehai Feiyang. Could someone let me know before the March round?",
    fromSessionId: "cse-03",
    resolved: false,
    createdAt: "2026-07-27 16:34",
  },
  {
    id: "cnt-02",
    name: "Chang Min-Hsuan",
    email: "s10698765@thu.edu.tw",
    topic: "Credit transfer",
    body: "我在TUM修了一門五學分的課，回國後系上說只能抵三學分，想確認課程大綱相符度是怎麼認定的。",
    fromSessionId: null,
    resolved: false,
    createdAt: "2026-07-26 09:12",
  },
  {
    id: "cnt-03",
    name: "Mrs. Kao",
    email: "kao.family@gmail.com",
    topic: "Parent enquiry",
    body: "My son is applying to Kyoto University. Could you tell me roughly how much the total cost for one semester would be, including housing?",
    fromSessionId: null,
    resolved: true,
    createdAt: "2026-07-24 14:47",
  },
  {
    id: "cnt-04",
    name: "Wu Pei-Shan",
    email: "s10755511@thu.edu.tw",
    topic: "Visa",
    body: "AIT 面試預約已經排到九月了，交換是八月底出發，這種情況國際處可以協助發函嗎？",
    fromSessionId: "cse-06",
    resolved: false,
    createdAt: "2026-07-26 11:41",
  },
  {
    id: "cnt-05",
    name: "Dept. of Industrial Engineering",
    email: "ie@thu.edu.tw",
    topic: "New partnership",
    body: "We would like to propose a partnership with Chulalongkorn University in Thailand. What is the proposal form and the committee timeline?",
    fromSessionId: null,
    resolved: true,
    createdAt: "2026-07-21 10:03",
  },
  {
    id: "cnt-06",
    name: "Kao Cheng-En",
    email: "s10733322@thu.edu.tw",
    topic: "Housing",
    body: "Melbourne housing priority deadline is 31 October — does the OIR nomination arrive before then, or should I apply first?",
    fromSessionId: null,
    resolved: false,
    createdAt: "2026-07-20 19:22",
  },
];

/** Aggregates used by the admin dashboard while there is no backend. */

export const chatsPerDay = [
  { day: "Jul 22", count: 34 },
  { day: "Jul 23", count: 41 },
  { day: "Jul 24", count: 29 },
  { day: "Jul 25", count: 52 },
  { day: "Jul 26", count: 47 },
  { day: "Jul 27", count: 38 },
  { day: "Jul 28", count: 44 },
];

export const goodRatingTrend = [
  { week: "Jun 29", good: 78 },
  { week: "Jul 6", good: 81 },
  { week: "Jul 13", good: 79 },
  { week: "Jul 20", good: 85 },
  { week: "Jul 27", good: 87 },
];

export const modelComparison = [
  { model: "qwen2.5:7b", answers: 412, good: 91, avgRetrievalMs: 178, avgGenerationMs: 2_060 },
  { model: "llama3.1:8b", answers: 388, good: 82, avgRetrievalMs: 165, avgGenerationMs: 1_580 },
];

export const susItems = [
  { item: "q1", statement: "I would like to use this assistant frequently.", score: 4.2, inverted: false },
  { item: "q2", statement: "I found the assistant unnecessarily complex.", score: 1.8, inverted: true },
  { item: "q3", statement: "I thought the assistant was easy to use.", score: 4.5, inverted: false },
  { item: "q4", statement: "I would need support to be able to use this assistant.", score: 1.5, inverted: true },
  { item: "q5", statement: "The answers were well integrated with their sources.", score: 4.1, inverted: false },
  { item: "q6", statement: "There was too much inconsistency in the answers.", score: 2.0, inverted: true },
  { item: "q7", statement: "Most students would learn to use this very quickly.", score: 4.4, inverted: false },
  { item: "q8", statement: "I found the assistant very cumbersome to use.", score: 1.6, inverted: true },
  { item: "q9", statement: "I felt confident using the assistant.", score: 4.0, inverted: false },
  { item: "q10", statement: "I needed to learn a lot before I could get going.", score: 1.7, inverted: true },
];

export const suggestedQuestions = [
  "When does the 115-2 exchange application close?",
  "Which partner schools accept a GPA of 3.0?",
  "How many credits can I transfer back?",
  "What funding can I apply for alongside an exchange?",
];
