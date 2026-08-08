import { asc, count, desc, eq, max, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  chatCitations,
  chatFeedback,
  chatMessages,
  chatSessions,
  surveyResponses,
} from "@/db/schema/chat.schema";
import type { FeedbackReasonValue } from "@/lib/validator/chat.validator";

/**
 * The assistant's transcripts — the ERD's CHAT_SESSIONS, CHAT_MESSAGES,
 * CHAT_CITATIONS, CHAT_FEEDBACK and SURVEY_RESPONSES.
 *
 * A session carries an `anonId` the browser generates and no user id at all:
 * the assistant is anonymous by design, so nothing here can be traced back to a
 * named student, including by staff reading the console.
 */

export async function createChatSession(input: {
  anonId: string;
  locale: string;
  userAgent: string | null;
}): Promise<string> {
  const [row] = await db
    .insert(chatSessions)
    .values(input)
    .returning({ id: chatSessions.id });
  return row.id;
}

export async function findChatSessionById(id: string) {
  return db.query.chatSessions.findFirst({ where: eq(chatSessions.id, id) });
}

export async function listSessionMessages(sessionId: string) {
  return db.query.chatMessages.findMany({
    where: eq(chatMessages.sessionId, sessionId),
    orderBy: [asc(chatMessages.createdAt)],
  });
}

export async function findChatMessageById(id: string) {
  return db.query.chatMessages.findFirst({ where: eq(chatMessages.id, id) });
}

export async function createUserMessage(input: {
  sessionId: string;
  content: string;
}): Promise<string> {
  const [row] = await db
    .insert(chatMessages)
    .values({ ...input, role: "user" })
    .returning({ id: chatMessages.id });
  return row.id;
}

export type CitationWrite = {
  /** Null when the chunk was re-indexed away between retrieval and writing. */
  kbChunkId: string | null;
  score: number;
  rank: number;
};

/**
 * Writes the answer and what it was built from, together.
 *
 * One transaction because a message without its citations is exactly the thing
 * this project is meant not to produce: an answer nobody can check.
 */
export async function saveAssistantTurn(input: {
  sessionId: string;
  content: string;
  escalated: boolean;
  model: string | null;
  retrievalMs: number | null;
  generationMs: number | null;
  citations: CitationWrite[];
}): Promise<string> {
  const { citations, ...message } = input;

  return db.transaction(async (tx) => {
    const [row] = await tx
      .insert(chatMessages)
      .values({ ...message, role: "assistant" })
      .returning({ id: chatMessages.id });

    if (citations.length > 0) {
      await tx
        .insert(chatCitations)
        .values(citations.map((citation) => ({ ...citation, messageId: row.id })));
    }

    return row.id;
  });
}

/** The citations behind one answer, best match first. */
export async function listCitationsForMessage(messageId: string) {
  return db.query.chatCitations.findMany({
    where: eq(chatCitations.messageId, messageId),
    orderBy: [asc(chatCitations.rank)],
    with: { chunk: true },
  });
}

/**
 * Records a rating, replacing an earlier one for the same message.
 *
 * CHAT_FEEDBACK.messageId is unique — one rating per message — so a visitor
 * changing their mind updates rather than collides.
 */
export async function upsertChatFeedback(input: {
  messageId: string;
  rating: number;
  reason: FeedbackReasonValue | null;
  comment: string | null;
}) {
  await db
    .insert(chatFeedback)
    .values(input)
    .onConflictDoUpdate({
      target: chatFeedback.messageId,
      set: {
        rating: input.rating,
        reason: input.reason,
        comment: input.comment,
        createdAt: new Date(),
      },
    });
}

export async function createSurveyResponse(input: {
  sessionId: string;
  susAnswers: number[];
  susScore: number;
  confidenceBefore: number | null;
  confidenceAfter: number | null;
  comment: string | null;
}): Promise<string> {
  const [row] = await db
    .insert(surveyResponses)
    .values(input)
    .returning({ id: surveyResponses.id });
  return row.id;
}

export async function findSurveyResponseForSession(sessionId: string) {
  return db.query.surveyResponses.findFirst({
    where: eq(surveyResponses.sessionId, sessionId),
  });
}

export type ConversationRecord = {
  id: string;
  locale: string;
  createdAt: Date;
  messageCount: number;
  escalatedCount: number;
  lastMessageAt: Date | null;
};

/** Sessions for the console's conversations screen, most recent first. */
export async function listConversations(): Promise<ConversationRecord[]> {
  return db
    .select({
      id: chatSessions.id,
      locale: chatSessions.locale,
      createdAt: chatSessions.createdAt,
      messageCount: count(chatMessages.id),
      escalatedCount: sql<number>`count(*) filter (where ${chatMessages.escalated})`.mapWith(
        Number,
      ),
      lastMessageAt: max(chatMessages.createdAt),
    })
    .from(chatSessions)
    .leftJoin(chatMessages, eq(chatMessages.sessionId, chatSessions.id))
    .groupBy(chatSessions.id)
    .orderBy(desc(chatSessions.createdAt));
}

/** One transcript, with every answer's citations. */
export async function findConversationById(sessionId: string) {
  return db.query.chatSessions.findFirst({
    where: eq(chatSessions.id, sessionId),
    with: {
      messages: {
        orderBy: [asc(chatMessages.createdAt)],
        with: {
          citations: { orderBy: [asc(chatCitations.rank)], with: { chunk: true } },
          feedback: true,
        },
      },
    },
  });
}

/** Ratings for the console's feedback screen, newest first. */
export async function listChatFeedback() {
  return db
    .select({
      id: chatFeedback.id,
      messageId: chatFeedback.messageId,
      rating: chatFeedback.rating,
      reason: chatFeedback.reason,
      comment: chatFeedback.comment,
      createdAt: chatFeedback.createdAt,
      answer: chatMessages.content,
      sessionId: chatMessages.sessionId,
    })
    .from(chatFeedback)
    .innerJoin(chatMessages, eq(chatMessages.id, chatFeedback.messageId))
    .orderBy(desc(chatFeedback.createdAt));
}

/** Headline numbers for the console's stats screen. */
export async function getChatTotals() {
  const [sessions] = await db.select({ total: count() }).from(chatSessions);
  const [messages] = await db.select({ total: count() }).from(chatMessages);
  const [ratings] = await db
    .select({
      up: sql<number>`count(*) filter (where ${chatFeedback.rating} > 0)`.mapWith(
        Number,
      ),
      down: sql<number>`count(*) filter (where ${chatFeedback.rating} < 0)`.mapWith(
        Number,
      ),
    })
    .from(chatFeedback);
  const [survey] = await db
    .select({
      responses: count(),
      averageSus: sql<number>`coalesce(avg(${surveyResponses.susScore}), 0)`.mapWith(
        Number,
      ),
    })
    .from(surveyResponses);

  return {
    sessions: sessions?.total ?? 0,
    messages: messages?.total ?? 0,
    thumbsUp: ratings?.up ?? 0,
    thumbsDown: ratings?.down ?? 0,
    surveyResponses: survey?.responses ?? 0,
    averageSus: survey?.averageSus ?? 0,
  };
}
