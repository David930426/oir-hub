import "server-only";

import { EXTERNAL_MAX_ATTEMPTS, EXTERNAL_SERVICE_ERROR, EXTERNAL_TIMEOUT_MS } from "@/constant";
import { logger } from "@/lib/logger";

/**
 * The one HTTP client every outside service goes through.
 *
 * `lib/external/` is where the app talks to something it does not own — Ollama
 * and Qdrant today. Those calls fail in ways a database call does not: the
 * service is down, the model is still loading, a request hangs forever. This
 * file turns all of that into one error type carrying a sentence an action can
 * toast, so nothing above it has to know what `ECONNREFUSED` means.
 */

/**
 * A call to an outside service that did not work.
 *
 * `userMessage` is what the console shows; `describeError()` in lib/utils.ts
 * picks it up without importing this file, which keeps a server-only module out
 * of the client bundle.
 */
export class ExternalApiError extends Error {
  readonly service: string;
  readonly status: number | null;
  readonly userMessage: string;

  constructor(
    service: string,
    message: string,
    options: {
      status?: number | null;
      userMessage?: string;
      cause?: unknown;
    } = {},
  ) {
    super(message, { cause: options.cause });
    this.name = "ExternalApiError";
    this.service = service;
    this.status = options.status ?? null;
    this.userMessage = options.userMessage ?? EXTERNAL_SERVICE_ERROR;
  }
}

export function isExternalApiError(error: unknown): error is ExternalApiError {
  return error instanceof ExternalApiError;
}

/**
 * Normalises anything thrown while calling a service into an
 * {@link ExternalApiError}.
 *
 * Callers use it in a `catch` so a `TypeError: fetch failed` from undici and a
 * 503 from Qdrant reach the action as the same shape.
 */
export function parseExternalError(
  error: unknown,
  service: string,
  userMessage?: string,
): ExternalApiError {
  if (isExternalApiError(error)) return error;

  if (error instanceof DOMException && error.name === "TimeoutError") {
    return new ExternalApiError(service, `${service} timed out`, {
      userMessage: userMessage ?? `${service} did not respond in time. Please try again.`,
      cause: error,
    });
  }

  return new ExternalApiError(
    service,
    error instanceof Error ? error.message : "unknown error",
    { userMessage, cause: error },
  );
}

type FetchJsonOptions = RequestInit & {
  /** Name used in logs and in the error — "Ollama", "Qdrant". */
  service: string;
  /** Body to send as JSON. Sets the header and serialises for you. */
  json?: unknown;
  timeoutMs?: number;
  /** Total attempts, including the first. Only retryable failures are retried. */
  attempts?: number;
  /** Overrides the sentence the user sees when this particular call fails. */
  userMessage?: string;
};

/** A failure worth trying again: the service was unreachable, busy, or broken. */
function isRetryable(error: unknown): boolean {
  if (isExternalApiError(error)) {
    return error.status === null || error.status === 429 || error.status >= 500;
  }
  return true;
}

/**
 * JSON in, JSON out, with a timeout and a couple of retries.
 *
 * The timeout matters more than it looks: a model that is still loading holds
 * the socket open, and without `AbortSignal.timeout` a staff member pressing
 * "Re-index" would watch a spinner until the request layer gave up on its own.
 */
export async function fetchJson<TResponse>(
  url: string,
  options: FetchJsonOptions,
): Promise<TResponse> {
  const {
    service,
    json,
    timeoutMs = EXTERNAL_TIMEOUT_MS,
    attempts = EXTERNAL_MAX_ATTEMPTS,
    userMessage,
    headers,
    ...init
  } = options;

  let lastError: unknown;

  for (let attempt = 1; attempt <= Math.max(1, attempts); attempt++) {
    try {
      const response = await fetch(url, {
        ...init,
        headers: {
          ...(json === undefined ? {} : { "Content-Type": "application/json" }),
          ...headers,
        },
        body: json === undefined ? init.body : JSON.stringify(json),
        signal: AbortSignal.timeout(timeoutMs),
        // Never let Next cache a retrieval or a generation.
        cache: "no-store",
      });

      if (!response.ok) {
        // The body usually carries the real reason ("model not found"), so it
        // goes in the log message even though the user sees only `userMessage`.
        const detail = (await response.text().catch(() => "")).slice(0, 500);
        throw new ExternalApiError(
          service,
          `${service} responded ${response.status}: ${detail || response.statusText}`,
          { status: response.status, userMessage },
        );
      }

      return (await response.json()) as TResponse;
    } catch (error) {
      lastError = parseExternalError(error, service, userMessage);

      const canRetry = attempt < attempts && isRetryable(lastError);
      logger.warn(
        { service, url, attempt, retrying: canRetry, error: String(lastError) },
        "external call failed",
      );

      if (!canRetry) break;
    }
  }

  throw parseExternalError(lastError, service, userMessage);
}

/** Reads a required environment variable, failing with something actionable. */
export function requiredEnv(name: string, service: string): string {
  const value = process.env[name];
  if (!value) {
    throw new ExternalApiError(service, `${name} is not set`, {
      userMessage: `${service} is not configured — set ${name} in .env.`,
    });
  }
  return value;
}
