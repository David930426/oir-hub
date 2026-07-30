import type {
  BulletinStatus,
  CategoryKind,
  FaqAudience,
  FeedbackReason,
  FundingSource,
  FundingStatus,
  KbSourceTable,
  KbStatus,
  PostStatus,
  PostType,
  ProgramType,
  TestimonialStatus,
  UserRole,
  Weekday,
} from "./types";

/**
 * Display labels and badge tones for every ERD enum. Stored values stay
 * lowercase; only these maps decide how they read on screen.
 */

export type Tone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "accent";

export const toneClasses: Record<Tone, string> = {
  neutral: "bg-slate-100 text-slate-700 border-slate-200",
  info: "bg-blue-100 text-blue-800 border-blue-200",
  success: "bg-emerald-100 text-emerald-800 border-emerald-200",
  warning: "bg-amber-100 text-amber-800 border-amber-200",
  danger: "bg-red-100 text-red-800 border-red-200",
  accent: "bg-purple-100 text-purple-800 border-purple-200",
};

type Meta<T extends string> = Record<T, { label: string; tone: Tone }>;

export const userRoleMeta: Meta<UserRole> = {
  admin: { label: "Admin", tone: "accent" },
  editor: { label: "Editor", tone: "info" },
  viewer: { label: "Viewer", tone: "neutral" },
};

export const categoryKindMeta: Meta<CategoryKind> = {
  post: { label: "Post", tone: "info" },
  faq: { label: "FAQ", tone: "warning" },
};

export const postTypeMeta: Meta<PostType> = {
  news: { label: "News", tone: "success" },
  guide: { label: "Guide", tone: "info" },
  page: { label: "Page", tone: "neutral" },
  notice: { label: "Notice", tone: "warning" },
};

export const postStatusMeta: Meta<PostStatus> = {
  draft: { label: "Draft", tone: "neutral" },
  published: { label: "Published", tone: "success" },
  archived: { label: "Archived", tone: "neutral" },
};

export const programTypeMeta: Meta<ProgramType> = {
  exchange: { label: "Exchange", tone: "info" },
  dualDegree: { label: "Dual degree", tone: "accent" },
  shortTerm: { label: "Short term", tone: "success" },
  internship: { label: "Internship", tone: "warning" },
  language: { label: "Language", tone: "neutral" },
};

export const bulletinStatusMeta: Meta<BulletinStatus> = {
  open: { label: "Open", tone: "success" },
  closed: { label: "Closed", tone: "neutral" },
  archived: { label: "Archived", tone: "neutral" },
};

export const testimonialStatusMeta: Meta<TestimonialStatus> = {
  draft: { label: "Draft", tone: "neutral" },
  published: { label: "Published", tone: "success" },
  archived: { label: "Archived", tone: "neutral" },
};

export const fundingSourceMeta: Meta<FundingSource> = {
  moe: { label: "Ministry of Education", tone: "accent" },
  university: { label: "University", tone: "info" },
  external: { label: "External", tone: "warning" },
};

export const fundingStatusMeta: Meta<FundingStatus> = {
  open: { label: "Open", tone: "success" },
  closed: { label: "Closed", tone: "neutral" },
  archived: { label: "Archived", tone: "neutral" },
};

export const faqAudienceMeta: Meta<FaqAudience> = {
  student: { label: "Students", tone: "info" },
  parent: { label: "Parents", tone: "accent" },
  dept: { label: "Departments", tone: "warning" },
};

export const kbSourceTableMeta: Meta<KbSourceTable> = {
  faq: { label: "FAQ", tone: "warning" },
  post: { label: "Post", tone: "info" },
  bulletin: { label: "Bulletin", tone: "accent" },
  testimonial: { label: "Testimonial", tone: "success" },
  file: { label: "File", tone: "neutral" },
};

export const kbStatusMeta: Meta<KbStatus> = {
  pending: { label: "Pending", tone: "warning" },
  indexed: { label: "Indexed", tone: "success" },
  stale: { label: "Stale", tone: "info" },
  failed: { label: "Failed", tone: "danger" },
};

export const feedbackReasonMeta: Meta<FeedbackReason> = {
  wrong: { label: "Wrong", tone: "danger" },
  outdated: { label: "Outdated", tone: "warning" },
  unclear: { label: "Unclear", tone: "info" },
  incomplete: { label: "Incomplete", tone: "neutral" },
};

export const weekdayMeta: Meta<Weekday> = {
  mon: { label: "Monday", tone: "neutral" },
  tue: { label: "Tuesday", tone: "neutral" },
  wed: { label: "Wednesday", tone: "neutral" },
  thu: { label: "Thursday", tone: "neutral" },
  fri: { label: "Friday", tone: "neutral" },
};

export const weekdayOrder: Weekday[] = ["mon", "tue", "wed", "thu", "fri"];

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Renders a `applyMonths` array such as `[3, 9]` as "March · September". */
export function formatApplyMonths(months: number[]): string {
  return months.map((m) => monthNames[m - 1] ?? String(m)).join(" · ");
}

/** Renders `academicYear` + `term` the way the office writes it: "115-2". */
export function formatTerm(academicYear: string, term: string): string {
  return `${academicYear}-${term}`;
}

/** TWD amounts, e.g. `NT$120,000`. */
export function formatTwd(amount: number): string {
  return `NT$${amount.toLocaleString("en-US")}`;
}

/**
 * Whole days between today and a deadline. Negative once the date has passed.
 * The mock layer pins "today" so server and client renders agree.
 */
export const today = new Date("2026-07-28T00:00:00Z");

export function daysUntil(date: string): number {
  const ms = new Date(`${date}T00:00:00Z`).getTime() - today.getTime();
  return Math.round(ms / 86_400_000);
}
