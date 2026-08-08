"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { GENERIC_ACTION_ERROR, NO_ANSWER_MESSAGE, RAG_TOP_K } from "@/constant";
import { chatModel, embedText, generateChat } from "@/lib/external/ollama";
import { searchChunks } from "@/lib/external/qdrant";
import { logger } from "@/lib/logger";
import {
  createChatSession,
  createUserMessage,
  findChatMessageById,
  findChatSessionById,
  findSurveyResponseForSession,
  saveAssistantTurn,
  upsertChatFeedback,
  createSurveyResponse,
} from "@/lib/repositories/chat.repository";
import { findChunksByIds } from "@/lib/repositories/knowledge.repository";
import {
  describeError,
  emptyToNull,
  fail,
  ok,
  parseInput,
  susScore,
  type ActionResult,
} from "@/lib/utils";
import {
  rateMessageSchema,
  sendChatMessageSchema,
  startChatSessionSchema,
  submitSurveySchema,
  type RateMessageInput,
  type SendChatMessageInput,
  type StartChatSessionInput,
  type SubmitSurveyInput,
} from "@/lib/validator/chat.validator";

/**
 * The public assistant.
 *
 * These are the only actions in the project with no `dal.ts` guard, and that is
 * the design rather than an oversight: the assistant is anonymous, a session is
 * keyed by a UUID the browser generates, and requiring a login would defeat the
 * point of a service students use before they dare email the office. What
 * stands in for a guard is the validator — every input is length-limited, and
 * an action only ever writes to the session id it was given.
 *
 * Retrieval and generation both go through `lib/external/`, so an unreachable
 * Ollama surfaces as a sentence the chat window can show rather than a stack
 * trace.
 */

/**
 * The assistant's standing instructions.
 *
 * The two rules that matter: answer only from the passages supplied, and say so
 * when they do not cover the question. An office assistant that guesses at a
 * deadline is worse than no assistant at all.
 */
const SYSTEM_PROMPT = `你是國際事務處（OIR）的問答助理，服務對象是本校學生與家長。

規則：
1. 只能根據下列「參考資料」回答；資料未涵蓋的內容，請直接說明你無法確認，並建議聯繫國際事務處。
2. 不要猜測日期、金額、名額或資格條件。
3. 回答簡潔，先講重點；必要時列點。
4. 使用者用哪種語言提問，就用哪種語言回答（預設繁體中文）。
5. 引用內容時，標明資料標題。`;

/** Lays the retrieved passages out for the model, numbered so it can cite them. */
function buildContext(
  passages: { title: string; content: string; academicYear: string | null }[],
): string {
  return passages
    .map((passage, index) => {
      const year = passage.academicYear ? `（${passage.academicYear}）` : "";
      return `【${index + 1}】${passage.title}${year}\n${passage.content}`;
    })
    .join("\n\n");
}

// ---------- Sessions ----------

export async function startChatSessionAction(
  input: StartChatSessionInput,
): Promise<ActionResult<string>> {
  const action = "startChatSessionAction";

  const parsed = parseInput(startChatSessionSchema, input);
  if (!parsed.success) return parsed;

  try {
    const userAgent = (await headers()).get("user-agent");

    const id = await createChatSession({
      anonId: parsed.data.anonId,
      locale: parsed.data.locale,
      // Kept for the evaluation write-up — which devices the assistant was used
      // on — and for nothing else; it is not an identifier.
      userAgent: userAgent?.slice(0, 400) ?? null,
    });

    return ok("New conversation started.", id);
  } catch (error) {
    logger.error({ action, error }, "failed to start chat session");
    return fail(GENERIC_ACTION_ERROR);
  }
}

// ---------- Asking ----------

export type ChatAnswer = {
  messageId: string;
  answer: string;
  escalated: boolean;
  citations: { chunkId: string; title: string; score: number; rank: number }[];
};

/**
 * One turn: store the question, retrieve, generate, store the answer.
 *
 * Retrieval and generation are timed separately because that is what the
 * project reports on — a slow answer is a different problem depending on which
 * half of it was slow, and CHAT_MESSAGES has a column for each.
 */
export async function sendChatMessageAction(
  input: SendChatMessageInput,
): Promise<ActionResult<ChatAnswer>> {
  const action = "sendChatMessageAction";

  const parsed = parseInput(sendChatMessageSchema, input);
  if (!parsed.success) return parsed;

  const { sessionId, content } = parsed.data;

  try {
    if (!(await findChatSessionById(sessionId))) {
      return fail("This conversation has expired. Start a new one.");
    }

    await createUserMessage({ sessionId, content });

    // ---- Retrieve ----
    const retrievalStart = Date.now();
    const vector = await embedText(content);
    const hits = await searchChunks(vector, { limit: RAG_TOP_K });
    const chunks = await findChunksByIds(hits.map((hit) => hit.id));
    const retrievalMs = Date.now() - retrievalStart;

    // Nothing above the score threshold: say so and hand the question to a
    // human rather than answering from whatever came closest.
    if (chunks.length === 0) {
      const messageId = await saveAssistantTurn({
        sessionId,
        content: NO_ANSWER_MESSAGE,
        escalated: true,
        model: null,
        retrievalMs,
        generationMs: null,
        citations: [],
      });

      return ok("Answered.", {
        messageId,
        answer: NO_ANSWER_MESSAGE,
        escalated: true,
        citations: [],
      });
    }

    // Keep the retrieval ranking: the lookup came back in whatever order the
    // database chose, and the model should read the best match first.
    const ranked = hits
      .map((hit) => ({ hit, chunk: chunks.find((c) => c.id === hit.id) }))
      .filter((entry): entry is { hit: typeof entry.hit; chunk: NonNullable<typeof entry.chunk> } =>
        Boolean(entry.chunk),
      );

    // ---- Generate ----
    const generationStart = Date.now();
    const answer = await generateChat([
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `參考資料：\n${buildContext(ranked.map((entry) => entry.chunk))}\n\n問題：${content}`,
      },
    ]);
    const generationMs = Date.now() - generationStart;

    const finalAnswer = answer || NO_ANSWER_MESSAGE;

    const messageId = await saveAssistantTurn({
      sessionId,
      content: finalAnswer,
      escalated: !answer,
      model: chatModel(),
      retrievalMs,
      generationMs,
      citations: ranked.map((entry, index) => ({
        kbChunkId: entry.chunk.id,
        score: entry.hit.score,
        rank: index + 1,
      })),
    });

    return ok("Answered.", {
      messageId,
      answer: finalAnswer,
      escalated: !answer,
      citations: ranked.map((entry, index) => ({
        chunkId: entry.chunk.id,
        title: entry.chunk.title,
        score: entry.hit.score,
        rank: index + 1,
      })),
    });
  } catch (error) {
    // The question is already stored, which is deliberate: an unanswered
    // question is exactly what the office wants to see in the console.
    logger.error({ action, error, sessionId }, "failed to answer chat message");
    return fail(describeError(error));
  }
}

// ---------- Feedback ----------

export async function rateMessageAction(
  input: RateMessageInput,
): Promise<ActionResult> {
  const action = "rateMessageAction";

  const parsed = parseInput(rateMessageSchema, input);
  if (!parsed.success) return parsed;

  const { messageId, rating, reason, comment } = parsed.data;

  try {
    const message = await findChatMessageById(messageId);
    if (!message) return fail("That message is no longer available.");
    if (message.role !== "assistant") {
      return fail("Only the assistant's answers can be rated.");
    }

    await upsertChatFeedback({
      messageId,
      rating,
      reason: reason ?? null,
      comment: emptyToNull(comment),
    });

    revalidatePath("/admin/feedback");
    return ok(
      rating === 1
        ? "Thanks — glad that helped."
        : "Thanks. The office reviews every answer marked unhelpful.",
    );
  } catch (error) {
    logger.error({ action, error, messageId }, "failed to record rating");
    return fail(GENERIC_ACTION_ERROR);
  }
}

/**
 * The System Usability Scale, plus the confidence question this study adds.
 *
 * The score is computed from the ten answers here rather than taken from the
 * client, so every response in the dataset is scored the same way.
 */
export async function submitSurveyAction(
  input: SubmitSurveyInput,
): Promise<ActionResult> {
  const action = "submitSurveyAction";

  const parsed = parseInput(submitSurveySchema, input);
  if (!parsed.success) return parsed;

  const { sessionId, susAnswers, confidenceBefore, confidenceAfter, comment } =
    parsed.data;

  try {
    if (!(await findChatSessionById(sessionId))) {
      return fail("This conversation has expired, so the survey cannot be linked to it.");
    }
    if (await findSurveyResponseForSession(sessionId)) {
      return fail("You have already completed the survey for this conversation.");
    }

    await createSurveyResponse({
      sessionId,
      susAnswers,
      susScore: susScore(susAnswers),
      confidenceBefore: confidenceBefore ?? null,
      confidenceAfter: confidenceAfter ?? null,
      comment: emptyToNull(comment),
    });

    revalidatePath("/admin/stats");
    return ok("Thank you — your answers have been recorded.");
  } catch (error) {
    logger.error({ action, error, sessionId }, "failed to record survey response");
    return fail(GENERIC_ACTION_ERROR);
  }
}
