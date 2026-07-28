import {
  categories,
  mediaFiles,
  postAttachments,
  postTags,
  posts,
  tags,
  users,
} from "./cms.mock";
import {
  bulletins,
  fundings,
  partnerSchools,
  programs,
  siteStats,
  tcornerSlots,
  testimonials,
} from "./mobility.mock";
import { faqSources, faqs, kbChunks, kbDocuments } from "./knowledge.mock";
import {
  chatCitations,
  chatFeedback,
  chatMessages,
  chatSessions,
  contactMessages,
  surveyResponses,
} from "./chat.mock";

export * from "./types";
export * from "./labels";
export * from "./cms.mock";
export * from "./mobility.mock";
export * from "./knowledge.mock";
export * from "./chat.mock";

/**
 * Join helpers standing in for the queries the repository layer will run once
 * the backend is wired up. Keeping them here means pages never hand-roll
 * `.find()` chains over the mock arrays.
 */

// ---------- CMS ----------

export const getUser = (id: string) => users.find((u) => u.id === id);

export const getCategory = (id: string) => categories.find((c) => c.id === id);

export const categoriesOfKind = (kind: "post" | "faq") =>
  categories.filter((c) => c.kind === kind).sort((a, b) => a.sortOrder - b.sortOrder);

export const getTag = (id: string) => tags.find((t) => t.id === id);

export const getMediaFile = (id: string | null) =>
  id ? mediaFiles.find((m) => m.id === id) : undefined;

export const getPost = (slug: string) => posts.find((p) => p.slug === slug);

export const publishedPosts = () =>
  posts
    .filter((p) => p.status === "published")
    .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));

export const tagsForPost = (postId: string) =>
  postTags
    .filter((pt) => pt.postId === postId)
    .map((pt) => getTag(pt.tagId))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

export const attachmentsForPost = (postId: string) =>
  postAttachments
    .filter((pa) => pa.postId === postId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((pa) => getMediaFile(pa.mediaFileId))
    .filter((m): m is NonNullable<typeof m> => Boolean(m));

export const postCountForCategory = (categoryId: string) =>
  posts.filter((p) => p.categoryId === categoryId && p.status === "published").length;

// ---------- Mobility ----------

export const getProgram = (id: string) => programs.find((p) => p.id === id);

export const getProgramBySlug = (slug: string) =>
  programs.find((p) => p.slug === slug);

export const bulletinsForProgram = (programId: string) =>
  bulletins
    .filter((b) => b.programId === programId)
    .sort((a, b) => b.announcedAt.localeCompare(a.announcedAt));

export const openBulletins = () =>
  bulletins
    .filter((b) => b.status === "open")
    .sort((a, b) => a.deadlineAt.localeCompare(b.deadlineAt));

export const getBulletin = (id: string) => bulletins.find((b) => b.id === id);

export const schoolsForProgram = (programId: string) =>
  partnerSchools.filter((s) => s.programId === programId);

export const getPartnerSchool = (id: string) =>
  partnerSchools.find((s) => s.id === id);

export const testimonialsForSchool = (partnerSchoolId: string) =>
  testimonials.filter(
    (t) => t.partnerSchoolId === partnerSchoolId && t.status === "published"
  );

export const getTestimonial = (id: string) => testimonials.find((t) => t.id === id);

export const publishedTestimonials = () =>
  testimonials
    .filter((t) => t.status === "published" && t.consentGiven)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

export const getFunding = (id: string) => fundings.find((f) => f.id === id);

export const fundingsForProgram = (programId: string) =>
  fundings.filter((f) => f.programId === programId);

export const activeTcornerSlots = () => tcornerSlots.filter((s) => s.active);

export const statsForYear = (academicYear: string) =>
  siteStats.filter((s) => s.academicYear === academicYear);

/** Distinct region slugs across the partner school table. */
export const schoolRegions = () =>
  Array.from(new Set(partnerSchools.map((s) => s.region))).sort();

/** Distinct countries across the partner school table. */
export const schoolCountries = () =>
  Array.from(new Set(partnerSchools.map((s) => s.country))).sort();

// ---------- Knowledge base ----------

export const getFaq = (id: string) => faqs.find((f) => f.id === id);

export const publishedFaqs = () => faqs.filter((f) => f.published);

export const sourcesForFaq = (faqId: string) =>
  faqSources.filter((s) => s.faqId === faqId);

export const getKbDocument = (id: string) => kbDocuments.find((d) => d.id === id);

export const chunksForDocument = (kbDocumentId: string) =>
  kbChunks
    .filter((c) => c.kbDocumentId === kbDocumentId)
    .sort((a, b) => a.index - b.index);

export const getKbChunk = (id: string) => kbChunks.find((c) => c.id === id);

export const chunkCountForDocument = (kbDocumentId: string) =>
  kbChunks.filter((c) => c.kbDocumentId === kbDocumentId).length;

/** Resolves the human-readable title of the row a KB document was built from. */
export const kbSourceLabel = (documentId: string): string => {
  const doc = getKbDocument(documentId);
  if (!doc) return "—";
  switch (doc.sourceTable) {
    case "faq":
      return getFaq(doc.sourceId)?.question.zh ?? doc.sourceId;
    case "post":
      return posts.find((p) => p.id === doc.sourceId)?.title.zh ?? doc.sourceId;
    case "bulletin":
      return getBulletin(doc.sourceId)?.title.zh ?? doc.sourceId;
    case "testimonial":
      return getTestimonial(doc.sourceId)?.displayName ?? doc.sourceId;
    case "file":
      return getMediaFile(doc.sourceId)?.filename ?? doc.sourceId;
  }
};

// ---------- Chat ----------

export const getChatSession = (id: string) => chatSessions.find((s) => s.id === id);

export const messagesForSession = (sessionId: string) =>
  chatMessages.filter((m) => m.sessionId === sessionId);

export const citationsForMessage = (messageId: string) =>
  chatCitations
    .filter((c) => c.messageId === messageId)
    .sort((a, b) => a.rank - b.rank);

export const feedbackForMessage = (messageId: string) =>
  chatFeedback.find((f) => f.messageId === messageId);

export const surveyForSession = (sessionId: string) =>
  surveyResponses.find((s) => s.sessionId === sessionId);

/** Overall thumbs rating for a session: up, down, or unrated. */
export const sessionRating = (sessionId: string): "up" | "down" | "none" => {
  const ratings = messagesForSession(sessionId)
    .map((m) => feedbackForMessage(m.id))
    .filter((f): f is NonNullable<typeof f> => Boolean(f));
  if (ratings.length === 0) return "none";
  return ratings.some((f) => f.rating === -1) ? "down" : "up";
};

export const sessionEscalated = (sessionId: string) =>
  messagesForSession(sessionId).some((m) => m.escalated);

export const unresolvedContactMessages = () =>
  contactMessages.filter((m) => !m.resolved);
