import "server-only";

import { EXTERNAL_TIMEOUT_MS } from "@/constant";
import { fetchJson, requiredEnv } from "./http";

/**
 * Ollama — the local LLM that both embeds text for the index and writes the
 * assistant's answers.
 *
 * Two models are in play and they are not interchangeable: EMBEDDING_MODEL
 * (bge-m3) turns text into the vectors Qdrant stores, CHAT_MODEL (qwen2.5)
 * writes prose. Re-embedding with a different model invalidates the whole
 * collection, which is why the model name is stored on every KB_CHUNKS row.
 */

const SERVICE = "Ollama";

function baseUrl(): string {
  return (process.env.OLLAMA_BASE_URL ?? "http://localhost:11434").replace(/\/+$/, "");
}

export function embeddingModel(): string {
  return requiredEnv("EMBEDDING_MODEL", SERVICE);
}

export function chatModel(): string {
  return requiredEnv("CHAT_MODEL", SERVICE);
}

type EmbedResponse = { embeddings: number[][] };

/**
 * Embeds a batch of texts, in order.
 *
 * Generation is slower than retrieval and a re-index sends whole documents, so
 * this one gets a longer ceiling than the shared default.
 */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const response = await fetchJson<EmbedResponse>(`${baseUrl()}/api/embed`, {
    service: SERVICE,
    method: "POST",
    json: { model: embeddingModel(), input: texts },
    timeoutMs: EXTERNAL_TIMEOUT_MS * 2,
    userMessage:
      "The embedding service is not responding. Check that Ollama is running, then try again.",
  });

  const embeddings = response.embeddings ?? [];
  if (embeddings.length !== texts.length) {
    // A short batch would silently misalign chunks and vectors, which is far
    // worse than a failed re-index: every answer afterwards would cite the
    // wrong passage.
    throw new Error(
      `Ollama returned ${embeddings.length} embeddings for ${texts.length} inputs`,
    );
  }

  return embeddings;
}

/** Convenience for the single-question case: embedding a chat message. */
export async function embedText(text: string): Promise<number[]> {
  const [embedding] = await embedTexts([text]);
  return embedding;
}

export type ChatTurn = { role: "system" | "user" | "assistant"; content: string };

type ChatResponse = { message?: { content?: string } };

/**
 * Runs a chat completion and returns the text.
 *
 * `stream: false` on purpose — the answer is written to CHAT_MESSAGES with its
 * citations in one transaction, so there is nothing to show until it is whole.
 */
export async function generateChat(
  messages: ChatTurn[],
  options: { temperature?: number } = {},
): Promise<string> {
  const response = await fetchJson<ChatResponse>(`${baseUrl()}/api/chat`, {
    service: SERVICE,
    method: "POST",
    json: {
      model: chatModel(),
      messages,
      stream: false,
      options: { temperature: options.temperature ?? 0.2 },
    },
    timeoutMs: EXTERNAL_TIMEOUT_MS * 4,
    userMessage:
      "The assistant is not responding right now. Please try again in a moment.",
  });

  return response.message?.content?.trim() ?? "";
}

/** True when Ollama answers at all — used by the console's health panel. */
export async function isOllamaReachable(): Promise<boolean> {
  try {
    await fetchJson(`${baseUrl()}/api/tags`, {
      service: SERVICE,
      attempts: 1,
      timeoutMs: 3_000,
    });
    return true;
  } catch {
    return false;
  }
}
