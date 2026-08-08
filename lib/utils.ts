import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ZodType, output as ZodOutput } from "zod"
import {
  DATE_LOCALE,
  GENERATED_PASSWORD_LENGTH,
  GENERIC_ACTION_ERROR,
  KB_CHUNK_OVERLAP,
  KB_CHUNK_SIZE,
  PASSWORD_ALPHABET,
  PG_UNIQUE_VIOLATION,
  SLUG_MAX_LENGTH,
  TIME_ZONE,
} from "@/constant"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Date formatting is pinned to the office's timezone and a fixed locale so a
 * server-rendered table matches what the browser paints — a bare
 * `toLocaleString()` would use the visitor's own settings and mismatch on
 * hydration.
 */
const dayFormatter = new Intl.DateTimeFormat(DATE_LOCALE, {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: TIME_ZONE,
})

const minuteFormatter = new Intl.DateTimeFormat(DATE_LOCALE, {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: TIME_ZONE,
})

/** `2026-07-30` */
export function formatDay(date: Date): string {
  return dayFormatter.format(date)
}

/** `2026-07-30 08:55` */
export function formatMinute(date: Date): string {
  return minuteFormatter.format(date).replace(", ", " ")
}

/**
 * A one-off password for a new or reset staff account. It is read off a screen
 * and typed by hand, so the alphabet in constant.ts leaves out lookalikes.
 */
export function generatePassword(length = GENERATED_PASSWORD_LENGTH): string {
  const values = new Uint32Array(length)
  crypto.getRandomValues(values)

  let out = ""
  for (const value of values) {
    out += PASSWORD_ALPHABET[value % PASSWORD_ALPHABET.length]
  }
  return out
}

/**
 * What every server action returns: a flag the caller branches on and a
 * sentence it can toast, success or failure alike.
 *
 * `data` is for the few actions whose caller needs a value back — the id of a
 * row it should navigate to, the answer the assistant produced. It defaults to
 * `never`, so a plain `ActionResult` stays exactly the two-field shape the
 * console has always toasted.
 */
export type ActionResult<TData = never> =
  | { success: true; message: string; data?: TData }
  | { success: false; message: string }

/** A successful result, optionally carrying a value for the caller. */
export function ok<TData = never>(
  message: string,
  data?: TData,
): ActionResult<TData> {
  return data === undefined
    ? { success: true, message }
    : { success: true, message, data }
}

/** A failed result. The message is the sentence the caller toasts. */
export function fail(message: string): ActionResult<never> {
  return { success: false, message }
}

/**
 * Validates an action's input and flattens zod's error into the one sentence
 * an action can return.
 *
 * The failure branch is already an `ActionResult`, so a caller writes
 * `if (!parsed.success) return parsed` rather than rebuilding the message in
 * every action.
 */
export function parseInput<TSchema extends ZodType>(
  schema: TSchema,
  input: unknown,
):
  | { success: true; data: ZodOutput<TSchema> }
  | { success: false; message: string } {
  const parsed = schema.safeParse(input)
  if (parsed.success) return { success: true, data: parsed.data }

  return {
    success: false,
    message: parsed.error.issues[0]?.message ?? "Invalid input.",
  }
}

/**
 * The sentence to show for a thrown error.
 *
 * Errors raised deliberately for the user — a missing bucket, an unreachable
 * Ollama — carry a `userMessage`; everything else is an internal failure the
 * user can do nothing about and is reported generically, with the real error
 * left to the log. Read by property rather than by `instanceof` so this file
 * stays importable from client components.
 */
export function describeError(
  error: unknown,
  fallback: string = GENERIC_ACTION_ERROR,
): string {
  const userMessage = (error as { userMessage?: unknown })?.userMessage
  return typeof userMessage === "string" && userMessage ? userMessage : fallback
}

/**
 * True when a write failed because it collided with a unique index — a taken
 * email or slug. Drizzle wraps the driver error, so the SQLSTATE can sit on
 * either the error or its `cause`. Actions use it to turn a lost race into the
 * same message the pre-check would have produced.
 */
export function isUniqueViolation(error: unknown): boolean {
  const code =
    (error as { code?: string })?.code ??
    (error as { cause?: { code?: string } })?.cause?.code
  return code === PG_UNIQUE_VIOLATION
}

/** File sizes as the media library shows them: `18 KB`, `2.4 MB`. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

/** Up to two initials for an avatar, working for "Chen Yi-Ling 陳怡玲" too. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  return parts
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
}

/**
 * `3 posts`, `1 post` — the count and its noun, agreeing.
 *
 * Actions say "still used by N posts" often enough that getting the `s` right
 * inline stopped being readable.
 */
export function pluralize(
  count: number,
  singular: string,
  plural = `${singular}s`,
): string {
  return `${count} ${count === 1 ? singular : plural}`
}

/**
 * A slug suggestion for a title. Latin text becomes `dual-degree`; Chinese
 * titles survive as-is, since a transliteration would be worse than the
 * original — the forms let staff overwrite whatever this produces.
 */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .toLowerCase()
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\p{Script=Han}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX_LENGTH)
}

/**
 * A form's empty string as the column wants it: NULL.
 *
 * Optional `*En` translations and URLs come back from react-hook-form as `""`,
 * and storing that would make `isUntranslated()` and every `IS NULL` check
 * wrong.
 */
export function emptyToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

/**
 * Scores a System Usability Scale response, 0–100.
 *
 * The scale is not an average: odd-numbered statements are positive and score
 * `answer - 1`, even-numbered ones are negative and score `5 - answer`, and the
 * total is multiplied by 2.5. Computed here rather than stored from the client
 * so every response in the study is scored the same way.
 */
export function susScore(answers: number[]): number {
  const total = answers.reduce((sum, answer, position) => {
    const isPositive = position % 2 === 0
    return sum + (isPositive ? answer - 1 : 5 - answer)
  }, 0)

  return Math.round(total * 2.5 * 10) / 10
}

/**
 * Cuts flattened document text into overlapping windows for embedding.
 *
 * Paragraphs are kept whole where they fit, so a chunk reads as prose rather
 * than starting mid-sentence, and consecutive chunks overlap so an answer that
 * straddles a boundary is still retrievable from one of them.
 */
export function chunkText(
  text: string,
  size: number = KB_CHUNK_SIZE,
  overlap: number = KB_CHUNK_OVERLAP,
): string[] {
  const normalized = text.replace(/\r\n/g, "\n").trim()
  if (!normalized) return []
  if (normalized.length <= size) return [normalized]

  const paragraphs = normalized.split(/\n{2,}/).flatMap((paragraph) => {
    const trimmed = paragraph.trim()
    if (!trimmed) return []
    // A single paragraph longer than the window is cut on its own, otherwise
    // it would never fit and the loop below could not place it.
    if (trimmed.length <= size) return [trimmed]

    const pieces: string[] = []
    for (let start = 0; start < trimmed.length; start += size - overlap) {
      pieces.push(trimmed.slice(start, start + size))
      if (start + size >= trimmed.length) break
    }
    return pieces
  })

  const chunks: string[] = []
  let current = ""

  for (const paragraph of paragraphs) {
    const candidate = current ? `${current}\n\n${paragraph}` : paragraph
    if (candidate.length <= size) {
      current = candidate
      continue
    }

    if (current) chunks.push(current)
    // Carry the tail of the finished chunk into the next one.
    const tail = current.slice(-overlap).trim()
    current = tail && tail.length + paragraph.length <= size
      ? `${tail}\n\n${paragraph}`
      : paragraph
  }

  if (current) chunks.push(current)
  return chunks
}
