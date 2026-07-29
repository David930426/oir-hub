import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth.schema";
import { mediaFiles } from "./cms.schema";

/**
 * Mobility domain — what a student can apply for and who has already been:
 * PROGRAMS, BULLETINS, PARTNER_SCHOOLS, TESTIMONIALS, FUNDINGS, TCORNER_SLOTS
 * and SITE_STATS.
 */

export const programType = pgEnum("program_type", [
  "exchange",
  "dualDegree",
  "shortTerm",
  "internship",
  "language",
]);

export const bulletinStatus = pgEnum("bulletin_status", [
  "open",
  "closed",
  "archived",
]);

export const testimonialStatus = pgEnum("testimonial_status", [
  "draft",
  "published",
  "archived",
]);

export const fundingSource = pgEnum("funding_source", [
  "moe", // Ministry of Education
  "university",
  "external",
]);

export const fundingStatus = pgEnum("funding_status", [
  "open",
  "closed",
  "archived",
]);

export const weekday = pgEnum("weekday", ["mon", "tue", "wed", "thu", "fri"]);

/** One language threshold a partner school accepts, e.g. JLPT N2. */
export type LanguageRequirement = { test: string; score: string };

/** The top-level offering every other mobility row hangs off. */
export const programs = pgTable(
  "programs",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    slug: text("slug").notNull().unique(), // "exchange", "dual-degree"
    type: programType("type").notNull(),
    nameZh: text("name_zh").notNull(),
    nameEn: text("name_en"),
    overviewZh: text("overview_zh").notNull(), // what it is, who it suits
    overviewEn: text("overview_en"),
    active: boolean("active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [index("programs_active_idx").on(table.active)]
);

/** A selection call (簡章) for one program, term, and region. */
export const bulletins = pgTable(
  "bulletins",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    programId: text("program_id")
      .notNull()
      .references(() => programs.id, { onDelete: "restrict" }),
    academicYear: text("academic_year").notNull(), // "115"
    term: text("term").notNull(), // "1" | "2"
    titleZh: text("title_zh").notNull(),
    titleEn: text("title_en"),
    region: text("region").notNull(), // "global", "japan-korea", ...
    // The binding PDF. Null until the document has been uploaded.
    pdfFileId: text("pdf_file_id").references(() => mediaFiles.id, {
      onDelete: "set null",
    }),
    announcedAt: date("announced_at").notNull(),
    deadlineAt: date("deadline_at").notNull(),
    status: bulletinStatus("status").notNull().default("open"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("bulletins_program_id_idx").on(table.programId),
    index("bulletins_status_idx").on(table.status),
    index("bulletins_deadline_at_idx").on(table.deadlineAt),
    index("bulletins_academic_year_term_idx").on(table.academicYear, table.term),
  ]
);

/** A signed agreement, and the thresholds a student must clear to be nominated. */
export const partnerSchools = pgTable(
  "partner_schools",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    programId: text("program_id")
      .notNull()
      .references(() => programs.id, { onDelete: "restrict" }),
    nameZh: text("name_zh").notNull(),
    nameEn: text("name_en"),
    country: text("country").notNull(),
    region: text("region").notNull(), // "asia", "europe", "americas", ...
    quota: integer("quota").notNull().default(0), // slots per term
    gpaMin: doublePrecision("gpa_min").notNull().default(0),
    languageReq: jsonb("language_req")
      .notNull()
      .$type<LanguageRequirement[]>()
      .default([]),
    // Department or college codes allowed to apply.
    eligibleColleges: jsonb("eligible_colleges")
      .notNull()
      .$type<string[]>()
      .default([]),
    englishTaught: boolean("english_taught").notNull().default(false),
    housingProvided: boolean("housing_provided").notNull().default(false),
    websiteUrl: text("website_url"),
    briefFileId: text("brief_file_id").references(() => mediaFiles.id, {
      onDelete: "set null",
    }),
    active: boolean("active").notNull().default(true),
  },
  (table) => [
    index("partner_schools_program_id_idx").on(table.programId),
    index("partner_schools_region_idx").on(table.region),
    index("partner_schools_country_idx").on(table.country),
    index("partner_schools_active_idx").on(table.active),
  ]
);

/** A report written by a student after returning. */
export const testimonials = pgTable(
  "testimonials",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    partnerSchoolId: text("partner_school_id")
      .notNull()
      .references(() => partnerSchools.id, { onDelete: "restrict" }),
    displayName: text("display_name").notNull(), // real name or "L 同學"
    deptYear: text("dept_year").notNull(), // "資工系四年級"
    country: text("country").notNull(),
    termLabel: text("term_label").notNull(), // "114-1"
    // Three short pull quotes shown before the body.
    highlights: jsonb("highlights").notNull().$type<string[]>().default([]),
    bodyZh: text("body_zh").notNull(),
    bodyEn: text("body_en"),
    fullTextFileId: text("full_text_file_id").references(() => mediaFiles.id, {
      onDelete: "set null",
    }),
    // Publication is blocked until the student agrees — see the admin screen.
    consentGiven: boolean("consent_given").notNull().default(false),
    status: testimonialStatus("status").notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("testimonials_partner_school_id_idx").on(table.partnerSchoolId),
    index("testimonials_status_idx").on(table.status),
  ]
);

/** Grants and scholarships. A null `programId` means "any program". */
export const fundings = pgTable(
  "fundings",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    programId: text("program_id").references(() => programs.id, {
      onDelete: "set null",
    }),
    nameZh: text("name_zh").notNull(), // "學海飛颺"
    nameEn: text("name_en"),
    source: fundingSource("source").notNull(),
    eligibilityZh: text("eligibility_zh").notNull(),
    eligibilityEn: text("eligibility_en"),
    amountMax: integer("amount_max").notNull().default(0), // TWD
    // Months the call opens, e.g. [3, 9].
    applyMonths: jsonb("apply_months").notNull().$type<number[]>().default([]),
    requiredDocs: jsonb("required_docs").notNull().$type<string[]>().default([]),
    notesZh: text("notes_zh"),
    notesEn: text("notes_en"),
    contactName: text("contact_name"),
    contactEmail: text("contact_email"),
    formFileId: text("form_file_id").references(() => mediaFiles.id, {
      onDelete: "set null",
    }),
    status: fundingStatus("status").notNull().default("open"),
  },
  (table) => [
    index("fundings_program_id_idx").on(table.programId),
    index("fundings_status_idx").on(table.status),
    index("fundings_source_idx").on(table.source),
  ]
);

/** Weekly walk-in advising hours. */
export const tcornerSlots = pgTable(
  "tcorner_slots",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    weekday: weekday("weekday").notNull(),
    startTime: text("start_time").notNull(), // "12:10"
    endTime: text("end_time").notNull(), // "13:30"
    location: text("location").notNull(),
    advisorName: text("advisor_name").notNull(),
    hostUserId: text("host_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    // What a student may ask about in this session.
    topics: jsonb("topics").notNull().$type<string[]>().default([]),
    bookingRequired: boolean("booking_required").notNull().default(false),
    bookingUrl: text("booking_url"),
    active: boolean("active").notNull().default(true),
  },
  (table) => [
    index("tcorner_slots_host_user_id_idx").on(table.hostUserId),
    index("tcorner_slots_active_idx").on(table.active),
  ]
);

/** Hand-entered figures shown on the public homepage. */
export const siteStats = pgTable(
  "site_stats",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    academicYear: text("academic_year").notNull(),
    metricKey: text("metric_key").notNull(), // "outbound_count"
    labelZh: text("label_zh").notNull(),
    labelEn: text("label_en"),
    value: doublePrecision("value").notNull(),
    unitZh: text("unit_zh"),
    unitEn: text("unit_en"),
    updatedById: text("updated_by_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    // One value per metric per year.
    uniqueIndex("site_stats_academic_year_metric_key_idx").on(
      table.academicYear,
      table.metricKey
    ),
  ]
);

// ---------- Relations ----------

export const programsRelations = relations(programs, ({ many }) => ({
  bulletins: many(bulletins),
  partnerSchools: many(partnerSchools),
  fundings: many(fundings),
}));

export const bulletinsRelations = relations(bulletins, ({ one }) => ({
  program: one(programs, {
    fields: [bulletins.programId],
    references: [programs.id],
  }),
  pdfFile: one(mediaFiles, {
    fields: [bulletins.pdfFileId],
    references: [mediaFiles.id],
  }),
}));

export const partnerSchoolsRelations = relations(
  partnerSchools,
  ({ one, many }) => ({
    program: one(programs, {
      fields: [partnerSchools.programId],
      references: [programs.id],
    }),
    briefFile: one(mediaFiles, {
      fields: [partnerSchools.briefFileId],
      references: [mediaFiles.id],
    }),
    testimonials: many(testimonials),
  })
);

export const testimonialsRelations = relations(testimonials, ({ one }) => ({
  partnerSchool: one(partnerSchools, {
    fields: [testimonials.partnerSchoolId],
    references: [partnerSchools.id],
  }),
  fullTextFile: one(mediaFiles, {
    fields: [testimonials.fullTextFileId],
    references: [mediaFiles.id],
  }),
}));

export const fundingsRelations = relations(fundings, ({ one }) => ({
  program: one(programs, {
    fields: [fundings.programId],
    references: [programs.id],
  }),
  formFile: one(mediaFiles, {
    fields: [fundings.formFileId],
    references: [mediaFiles.id],
  }),
}));

export const tcornerSlotsRelations = relations(tcornerSlots, ({ one }) => ({
  host: one(user, {
    fields: [tcornerSlots.hostUserId],
    references: [user.id],
  }),
}));

export const siteStatsRelations = relations(siteStats, ({ one }) => ({
  updatedBy: one(user, {
    fields: [siteStats.updatedById],
    references: [user.id],
  }),
}));
