import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {
  DATE_LOCALE,
  GENERATED_PASSWORD_LENGTH,
  PASSWORD_ALPHABET,
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

/** Up to two initials for an avatar, working for "Chen Yi-Ling 陳怡玲" too. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  return parts
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
}
