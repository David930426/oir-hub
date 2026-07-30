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

// ---------- Filter tabs ----------

/**
 * Status filter tabs, each starting with "all". They mirror the ERD status
 * enums, so a tab list changes only when the enum behind it does.
 */

/** Bulletins and funding calls — both use the open/closed/archived lifecycle. */
export const OPEN_STATUS_TABS = ["all", "open", "closed", "archived"] as const;

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

/** Postgres unique-violation SQLSTATE, used to turn races into a clear message. */
export const PG_UNIQUE_VIOLATION = "23505";

/** How long a toast carrying a one-off password stays up, in milliseconds. */
export const SECRET_TOAST_DURATION_MS = 15_000;
