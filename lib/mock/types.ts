import type { Localized } from "@/lib/i18n";

/**
 * Row shapes for the OIR Hub ERD, used by the static mock layer while the
 * backend is not connected. Every enum value is lowercase (camelCase when the
 * value is multi-word) so the UI never has to shout.
 */

// ---------- Auth ----------

export type UserRole = "admin" | "editor" | "viewer";

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  locale: "zh-TW" | "en";
  active: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
};

// ---------- CMS core ----------

export type CategoryKind = "post" | "faq";

export type Category = {
  id: string;
  slug: string;
  kind: CategoryKind;
  name: Localized;
  sortOrder: number;
};

export type Tag = {
  id: string;
  slug: string;
  name: Localized;
};

export type PostTag = {
  postId: string;
  tagId: string;
};

export type PostType = "news" | "guide" | "page" | "notice";
export type PostStatus = "draft" | "published" | "archived";

export type Post = {
  id: string;
  slug: string;
  title: Localized;
  /** Markdown body; paragraphs separated by a blank line. */
  body: Localized;
  categoryId: string;
  type: PostType;
  status: PostStatus;
  publishedAt: string | null;
  seoTitle: string;
  seoDescription: string;
  externalUrl: string | null;
  authorId: string;
  createdAt: string;
  updatedAt: string;
};

export type PostAttachment = {
  id: string;
  postId: string;
  mediaFileId: string;
  sortOrder: number;
};

export type MediaFile = {
  id: string;
  filename: string;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
  academicYear: string | null;
  /** Bumped on re-upload; older rows are flagged `archived`. */
  version: number;
  archived: boolean;
  replacesId: string | null;
  uploadedById: string;
  createdAt: string;
};

// ---------- Domain (mobility) ----------

export type ProgramType =
  | "exchange"
  | "dualDegree"
  | "shortTerm"
  | "internship"
  | "language";

export type Program = {
  id: string;
  slug: string;
  type: ProgramType;
  name: Localized;
  overview: Localized;
  active: boolean;
  sortOrder: number;
  eligibleYears?: Localized;
  departmentNote?: Localized;
};

export type BulletinStatus = "open" | "closed" | "archived";

export type Bulletin = {
  id: string;
  programId: string;
  academicYear: string;
  term: "1" | "2";
  title: Localized;
  region: string;
  pdfFileId: string | null;
  announcedAt: string;
  deadlineAt: string;
  status: BulletinStatus;
  createdAt: string;
};

export type PartnerSchool = {
  id: string;
  programId: string;
  name: Localized;
  country: string;
  region: string;
  /** Slots available per term. */
  quota: number;
  gpaMin: number;
  languageReq: { test: string; score: string }[];
  eligibleColleges: string[];
  englishTaught: boolean;
  housingProvided: boolean;
  websiteUrl: string;
  briefFileId: string | null;
  active: boolean;
  tuitionHome?: string;
  tuitionPartner?: string;
  subsidyNote?: Localized;
};

export type TestimonialStatus = "draft" | "published" | "archived";

export type Testimonial = {
  id: string;
  partnerSchoolId: string;
  displayName: string;
  deptYear: string;
  country: string;
  termLabel: string;
  highlights: string[];
  body: Localized;
  fullTextFileId: string | null;
  /** Publication is blocked until the student consents. */
  consentGiven: boolean;
  status: TestimonialStatus;
  createdAt: string;
};

export type FundingSource = "moe" | "university" | "external";
export type FundingStatus = "open" | "closed" | "archived";

export type Funding = {
  id: string;
  programId: string | null;
  name: Localized;
  source: FundingSource;
  eligibility: Localized;
  /** Ceiling in TWD. */
  amountMax: number;
  applyMonths: number[];
  requiredDocs: string[];
  notes: Localized;
  contactName: string;
  contactEmail: string;
  formFileId: string | null;
  status: FundingStatus;
};

export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri";

export type TCornerSlot = {
  id: string;
  weekday: Weekday;
  startTime: string;
  endTime: string;
  location: string;
  advisorName: string;
  hostUserId: string;
  topics: string[];
  bookingRequired: boolean;
  bookingUrl: string | null;
  active: boolean;
};

export type SiteStat = {
  id: string;
  academicYear: string;
  metricKey: string;
  label: Localized;
  value: number;
  unit: Localized;
  updatedById: string;
  updatedAt: string;
};

// ---------- Knowledge base ----------

export type FaqAudience = "student" | "parent" | "dept";

export type Faq = {
  id: string;
  categoryId: string;
  question: Localized;
  shortAnswer: Localized;
  longAnswer: Localized;
  audience: FaqAudience;
  /** High-risk answers a human must confirm before the bot may use them. */
  needsHumanConfirm: boolean;
  published: boolean;
  lastReviewedAt: string;
  reviewedById: string;
};

export type FaqSource = {
  id: string;
  faqId: string;
  mediaFileId: string | null;
  sourceUrl: string | null;
  label: string;
};

export type KbSourceTable = "faq" | "post" | "bulletin" | "testimonial" | "file";
export type KbStatus = "pending" | "indexed" | "stale" | "failed";

export type KbDocument = {
  id: string;
  sourceTable: KbSourceTable;
  sourceId: string;
  title: string;
  /** Flattened plain text handed to the chunker. */
  content: string;
  language: "zh-TW" | "en";
  academicYear: string | null;
  version: number;
  status: KbStatus;
  errorMessage: string | null;
  indexedAt: string | null;
};

export type KbChunk = {
  /** Doubles as the Qdrant point ID. */
  id: string;
  kbDocumentId: string;
  index: number;
  content: string;
  tokenCount: number;
  embeddingModel: string;
  createdAt: string;
};

// ---------- Chat & evaluation ----------

export type ChatSession = {
  id: string;
  /** Browser-generated UUID — the public chat has no login. */
  anonId: string;
  locale: "zh-TW" | "en";
  userAgent: string;
  createdAt: string;
};

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  sessionId: string;
  role: ChatRole;
  content: string;
  /** True when the answer was handed off to a human. */
  escalated: boolean;
  model: string | null;
  retrievalMs: number | null;
  generationMs: number | null;
  createdAt: string;
};

export type ChatCitation = {
  id: string;
  messageId: string;
  kbChunkId: string;
  score: number;
  rank: number;
};

export type FeedbackReason = "wrong" | "outdated" | "unclear" | "incomplete";

export type ChatFeedback = {
  id: string;
  messageId: string;
  /** 1 = thumbs up, -1 = thumbs down. */
  rating: 1 | -1;
  reason: FeedbackReason | null;
  comment: string | null;
  createdAt: string;
};

export type SurveyResponse = {
  id: string;
  sessionId: string;
  /** SUS items q1–q10, scored 1–5. */
  susAnswers: number[];
  susScore: number;
  confidenceBefore: number;
  confidenceAfter: number;
  comment: string | null;
  createdAt: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  topic: string;
  body: string;
  /** Set when the visitor escalated from a chat session. */
  fromSessionId: string | null;
  resolved: boolean;
  createdAt: string;
};
