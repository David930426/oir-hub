/**
 * Project-wide constants.
 *
 * Anything fixed and shared — enum value lists, limits, formats, repeated
 * copy — belongs here rather than inline in a page, action, or repository, so
 * there is one place to change it. Keep this file free of imports from `db/`,
 * `dal.ts`, or anything server-only: client components import from it too.
 */

// ---------- Roles & locales ----------

/** The ERD's USERS.role enum. There are no student accounts. */
export const STAFF_ROLES = ["admin", "editor", "viewer"] as const;

/** Roles allowed to create or change content. Viewers are read-only. */
export const WRITER_ROLES = ["admin", "editor"] as const;

/** Role filter tabs on the users screen: the roles, plus "everyone". */
export const USER_ROLE_TABS = ["all", ...STAFF_ROLES] as const;

/** Console languages — mirrors Locale in lib/i18n.ts. */
export const LOCALE_VALUES = ["zh-TW", "en"] as const;

/** What each role may do, shown so admins pick deliberately. */
export const ROLE_PERMISSIONS: Record<(typeof STAFF_ROLES)[number], string> = {
  admin: "Full access, including user management and deletion.",
  editor: "Create and publish content; cannot manage users.",
  viewer: "Read-only access to the console and its reports.",
};

// ---------- Accounts & passwords ----------

export const PASSWORD_MIN_LENGTH = 8;

/** Length of the one-off passwords the console generates for staff. */
export const GENERATED_PASSWORD_LENGTH = 14;

/**
 * Alphabet for generated passwords. Ambiguous characters (0/O, 1/l/I) are left
 * out because these are read off a screen and typed by hand.
 */
export const PASSWORD_ALPHABET =
  "abcdefghjkmnpqrstuvwxyzACDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Better Auth's provider id for email + password credentials. */
export const CREDENTIAL_PROVIDER_ID = "credential";

// ---------- Dates ----------

/** The office's timezone. Server-side formatting uses it so staff read local time. */
export const TIME_ZONE = "Asia/Taipei";

/** Formatting locale. `en-CA` gives ISO-like `2026-07-30`, as the tables expect. */
export const DATE_LOCALE = "en-CA";

// ---------- Taxonomy ----------

/** The ERD's CATEGORIES.kind enum: a category is scoped to posts or to FAQs. */
export const CATEGORY_KINDS = ["post", "faq"] as const;

/** Kind filter tabs on the taxonomy screen. */
export const CATEGORY_KIND_TABS = ["all", ...CATEGORY_KINDS] as const;

/** Slugs are lowercase words joined by single hyphens: `dual-degree`. */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const SLUG_MAX_LENGTH = 64;
export const NAME_MAX_LENGTH = 120;

/** Highest `sortOrder` the forms accept — the column is a plain integer. */
export const MAX_SORT_ORDER = 999;

// ---------- Domain enums ----------

/**
 * The ERD's enum columns, listed once here and read by both sides: the pgEnum
 * declarations in `db/schema/` and the zod schemas in `lib/validator/`. The
 * validators cannot import the schema files — those are server-only and the
 * forms share their schemas — so this file is where the two meet.
 */

/** POSTS.type — what kind of article a row is. */
export const POST_TYPES = ["news", "guide", "page", "notice"] as const;

/** POSTS.status and TESTIMONIALS.status share the same lifecycle. */
export const PUBLISH_STATUSES = ["draft", "published", "archived"] as const;

/** BULLETINS.status and FUNDINGS.status — a call is open, closed, or filed away. */
export const OPEN_STATUSES = ["open", "closed", "archived"] as const;

/** PROGRAMS.type. */
export const PROGRAM_TYPES = [
  "exchange",
  "dualDegree",
  "shortTerm",
  "internship",
  "language",
] as const;

/** FUNDINGS.source — who pays. */
export const FUNDING_SOURCES = ["moe", "university", "external"] as const;

/** TCORNER_SLOTS.weekday — the office does not hold walk-in hours at weekends. */
export const WEEKDAYS = ["mon", "tue", "wed", "thu", "fri"] as const;

/** FAQS.audience — who an answer is written for. */
export const FAQ_AUDIENCES = ["student", "parent", "dept"] as const;

/** KB_DOCUMENTS.sourceTable — the content row a document was flattened from. */
export const KB_SOURCE_TABLES = [
  "faq",
  "post",
  "bulletin",
  "testimonial",
  "file",
] as const;

/** KB_DOCUMENTS.status — where a document is in the indexing pipeline. */
export const KB_STATUSES = ["pending", "indexed", "stale", "failed"] as const;

/** CHAT_MESSAGES.role. */
export const CHAT_ROLES = ["user", "assistant"] as const;

/** CHAT_FEEDBACK.reason — why a thumbs-down was given. */
export const FEEDBACK_REASONS = [
  "wrong",
  "outdated",
  "unclear",
  "incomplete",
] as const;

/** BULLETINS.term — the academic year has two of them. */
export const TERM_VALUES = ["1", "2"] as const;

// ---------- Field limits & formats ----------

export const TITLE_MAX_LENGTH = 200;
export const BODY_MAX_LENGTH = 50_000;
export const LABEL_MAX_LENGTH = 200;
export const SEO_TITLE_MAX_LENGTH = 70;
export const SEO_DESCRIPTION_MAX_LENGTH = 160;

/** Longest question the public assistant accepts in one turn. */
export const CHAT_MESSAGE_MAX_LENGTH = 2_000;

/** Free-text comment on a rating or a survey. */
export const COMMENT_MAX_LENGTH = 1_000;

/** The contact form's body — long enough to describe a case, not an essay. */
export const CONTACT_BODY_MAX_LENGTH = 4_000;

/** Bare academic year, without a term: `115`. */
export const ACADEMIC_YEAR_ONLY_PATTERN = /^\d{3}$/;

/** Wall-clock time as the T-Corner schedule writes it: `12:10`. */
export const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

/** A metric key is a snake_case identifier: `outbound_count`. */
export const METRIC_KEY_PATTERN = /^[a-z][a-z0-9_]*$/;

/** Grant ceilings are entered in whole TWD. */
export const MAX_FUNDING_AMOUNT = 10_000_000;

/** Months a funding call may open in, as month numbers. */
export const MONTH_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

/** GPA is on the 0–4.3 scale the registrar uses. */
export const MAX_GPA = 4.3;

/** Slots a partner school may offer per term. */
export const MAX_QUOTA = 999;

/** Pull quotes shown above a testimonial body. */
export const MAX_HIGHLIGHTS = 5;

// ---------- Survey ----------

/** The System Usability Scale is ten statements, each scored 1–5. */
export const SUS_ITEM_COUNT = 10;
export const SUS_SCALE_MIN = 1;
export const SUS_SCALE_MAX = 5;

/** Self-reported confidence, before and after using the assistant. */
export const CONFIDENCE_SCALE_MIN = 1;
export const CONFIDENCE_SCALE_MAX = 5;

// ---------- Retrieval-augmented generation ----------

/**
 * How a document is cut up before it is embedded. The window is measured in
 * characters rather than tokens because the text is mostly Chinese, where one
 * character is roughly one token — close enough for a chunker, and it avoids
 * shipping a tokenizer to do it.
 */
export const KB_CHUNK_SIZE = 800;
export const KB_CHUNK_OVERLAP = 120;

/** Chunks pulled from Qdrant for one question. */
export const RAG_TOP_K = 5;

/**
 * Cosine similarity below which a hit is treated as noise. A question the index
 * cannot support is answered with "ask the office" rather than a guess.
 */
export const RAG_MIN_SCORE = 0.35;

/** The Qdrant collection holding one point per KB_CHUNKS row. */
export const QDRANT_COLLECTION = "oir_chunks";

/** Vector width of the embedding model — bge-m3 emits 1024 dimensions. */
export const EMBEDDING_DIMENSIONS = 1024;

/** How long any single call to Ollama or Qdrant may take. */
export const EXTERNAL_TIMEOUT_MS = 30_000;

/** Retries for an external call that failed in a way that may be transient. */
export const EXTERNAL_MAX_ATTEMPTS = 2;

// ---------- Media library ----------

/** Upload ceiling, matching what the upload form promises. */
export const MEDIA_MAX_BYTES = 20 * 1024 * 1024;

/**
 * Accepted uploads, mapped to the short label the table shows. The office
 * publishes forms and guidelines, so this is deliberately a short list.
 */
export const MEDIA_MIME_LABELS: Record<string, string> = {
  "application/pdf": "PDF",
  "application/msword": "DOC",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
  "application/vnd.ms-excel": "XLS",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
};

/** `accept` attribute for the file input. Same list as above, as a string. */
export const MEDIA_ACCEPT_ATTR = Object.keys(MEDIA_MIME_LABELS).join(",");

/** How long a presigned download link stays valid, in seconds. */
export const MEDIA_DOWNLOAD_TTL_SECONDS = 300;

/** Academic year as the office writes it: `115-2` — year, then term 1 or 2. */
export const ACADEMIC_YEAR_PATTERN = /^\d{3}-[12]$/;

// ---------- Filter tabs ----------

/**
 * Status filter tabs, each starting with "all". They mirror the ERD status
 * enums, so a tab list changes only when the enum behind it does.
 */

/** Bulletins and funding calls — both use the open/closed/archived lifecycle. */
export const OPEN_STATUS_TABS = ["all", ...OPEN_STATUSES] as const;

/** Posts and testimonials. */
export const PUBLISH_STATUS_TABS = ["all", "published", "draft", "archived"] as const;

/** FAQs, which are simply published or not. */
export const FAQ_PUBLISH_TABS = ["all", "published", "unpublished"] as const;

/** Knowledge-base indexing state. */
export const KB_STATUS_TABS = [
  "all",
  "indexed",
  "pending",
  "stale",
  "failed",
] as const;

/** Contact messages — unresolved first, because that is the working queue. */
export const CONTACT_STATE_TABS = ["unresolved", "resolved", "all"] as const;

// ---------- Content review ----------

/** How long an FAQ may go unreviewed before the console calls it stale. */
export const REVIEW_INTERVAL_DAYS = 180;

// ---------- Tables ----------

/** Rows per page in a DataTable before pagination kicks in. */
export const DEFAULT_PAGE_SIZE = 10;

// ---------- Messages ----------

/** Shown when an action fails for a reason the user cannot act on. */
export const GENERIC_ACTION_ERROR =
  "Something went wrong. Please try again later.";

/**
 * Shown when Ollama or Qdrant is unreachable. Named rather than generic
 * because the fix is different: the service is down, not the app.
 */
export const EXTERNAL_SERVICE_ERROR =
  "A service this depends on is not responding. Please try again in a moment.";

/** What the assistant says when retrieval found nothing it can stand behind. */
export const NO_ANSWER_MESSAGE =
  "I could not find this in the office's published material. Please contact the OIR directly so a staff member can answer.";

/** Postgres unique-violation SQLSTATE, used to turn races into a clear message. */
export const PG_UNIQUE_VIOLATION = "23505";

/** How long a toast carrying a one-off password stays up, in milliseconds. */
export const SECRET_TOAST_DURATION_MS = 15_000;
