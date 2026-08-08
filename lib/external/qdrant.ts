import "server-only";

import {
  EMBEDDING_DIMENSIONS,
  QDRANT_COLLECTION,
  RAG_MIN_SCORE,
  RAG_TOP_K,
} from "@/constant";
import { fetchJson, isExternalApiError } from "./http";

/**
 * Qdrant — the vector store the assistant retrieves from.
 *
 * One point per KB_CHUNKS row, sharing its id, so a hit can be resolved back to
 * its text and its source document with a single lookup in Postgres. Payload is
 * kept small on purpose: enough to filter on (document, source, year) and
 * nothing that would go stale the moment a staff member edits the FAQ behind it.
 */

const SERVICE = "Qdrant";

function baseUrl(): string {
  return (process.env.QDRANT_URL ?? "http://localhost:6333").replace(/\/+$/, "");
}

function headers(): Record<string, string> {
  const key = process.env.QDRANT_API_KEY;
  return key ? { "api-key": key } : {};
}

export type ChunkPayload = {
  kbDocumentId: string;
  sourceTable: string;
  sourceId: string;
  title: string;
  academicYear: string | null;
  language: string;
  index: number;
};

export type ChunkPoint = {
  /** The KB_CHUNKS row id — a UUID, which is what Qdrant accepts as a point id. */
  id: string;
  vector: number[];
  payload: ChunkPayload;
};

export type SearchHit = {
  id: string;
  score: number;
  payload: ChunkPayload;
};

/**
 * Creates the collection if it is not there yet.
 *
 * Called before every upsert rather than once at boot: the container is wiped
 * often in development, and a re-index that fails with "collection not found"
 * teaches staff nothing.
 */
export async function ensureCollection(): Promise<void> {
  try {
    await fetchJson(`${baseUrl()}/collections/${QDRANT_COLLECTION}`, {
      service: SERVICE,
      headers: headers(),
      attempts: 1,
    });
    return;
  } catch (error) {
    // Anything but "not found" is a real problem — a down service must not be
    // mistaken for a missing collection.
    if (!isExternalApiError(error) || error.status !== 404) throw error;
  }

  await fetchJson(`${baseUrl()}/collections/${QDRANT_COLLECTION}`, {
    service: SERVICE,
    method: "PUT",
    headers: headers(),
    json: {
      vectors: { size: EMBEDDING_DIMENSIONS, distance: "Cosine" },
    },
  });
}

/** Writes points, waiting for them to be searchable before returning. */
export async function upsertChunks(points: ChunkPoint[]): Promise<void> {
  if (points.length === 0) return;

  await fetchJson(
    // `wait=true` so a re-index that reports success is actually retrievable —
    // otherwise the next question could still miss the chunk it just wrote.
    `${baseUrl()}/collections/${QDRANT_COLLECTION}/points?wait=true`,
    {
      service: SERVICE,
      method: "PUT",
      headers: headers(),
      json: { points },
    },
  );
}

/** Removes every point belonging to one KB document. */
export async function deleteChunksByDocument(kbDocumentId: string): Promise<void> {
  await fetchJson(
    `${baseUrl()}/collections/${QDRANT_COLLECTION}/points/delete?wait=true`,
    {
      service: SERVICE,
      method: "POST",
      headers: headers(),
      json: {
        filter: { must: [{ key: "kbDocumentId", match: { value: kbDocumentId } }] },
      },
    },
  );
}

type SearchResponse = {
  result: { id: string; score: number; payload: ChunkPayload }[];
};

/**
 * Nearest chunks to a question vector.
 *
 * `RAG_MIN_SCORE` is applied by Qdrant rather than after the fact, so a
 * question the index cannot support comes back empty and the caller can say so
 * instead of quoting the least-bad paragraph it owns.
 */
export async function searchChunks(
  vector: number[],
  options: { limit?: number; minScore?: number; academicYear?: string } = {},
): Promise<SearchHit[]> {
  const filter = options.academicYear
    ? {
        must: [{ key: "academicYear", match: { value: options.academicYear } }],
      }
    : undefined;

  const response = await fetchJson<SearchResponse>(
    `${baseUrl()}/collections/${QDRANT_COLLECTION}/points/search`,
    {
      service: SERVICE,
      method: "POST",
      headers: headers(),
      json: {
        vector,
        limit: options.limit ?? RAG_TOP_K,
        score_threshold: options.minScore ?? RAG_MIN_SCORE,
        with_payload: true,
        filter,
      },
      userMessage:
        "The search index is not responding. Please try again in a moment.",
    },
  );

  return (response.result ?? []).map((hit) => ({
    id: String(hit.id),
    score: hit.score,
    payload: hit.payload,
  }));
}

/** True when Qdrant answers at all — used by the console's health panel. */
export async function isQdrantReachable(): Promise<boolean> {
  try {
    await fetchJson(`${baseUrl()}/collections`, {
      service: SERVICE,
      headers: headers(),
      attempts: 1,
      timeoutMs: 3_000,
    });
    return true;
  } catch {
    return false;
  }
}
