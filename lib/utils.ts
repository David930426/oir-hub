import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {
  DATE_LOCALE,
  GENERATED_PASSWORD_LENGTH,
  PASSWORD_ALPHABET,
  PG_UNIQUE_VIOLATION,
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
 */
export type ActionResult =
  | { success: true; message: string }
  | { success: false; message: string }

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
