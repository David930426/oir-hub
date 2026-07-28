import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { daysUntil, toneClasses, type Tone } from "@/lib/mock/labels";

/**
 * Renders any lowercase ERD enum through its label/tone map, so a stored value
 * like `dualDegree` always reads the same wherever it appears.
 */
export function EnumBadge<T extends string>({
  value,
  meta,
  className,
}: {
  value: T;
  meta: Record<T, { label: string; tone: Tone }>;
  className?: string;
}) {
  const entry = meta[value];
  if (!entry) return <span className="text-xs text-muted-foreground">—</span>;

  return (
    <Badge
      variant="outline"
      className={cn("font-medium", toneClasses[entry.tone], className)}
    >
      {entry.label}
    </Badge>
  );
}

/** Small dot + label, used where a full badge would be too loud. */
export function ToneDot({ tone, label }: { tone: Tone; label: string }) {
  const dotClass: Record<Tone, string> = {
    neutral: "bg-slate-400",
    info: "bg-blue-500",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-red-500",
    accent: "bg-purple-500",
  };
  return (
    <span className="flex items-center gap-2 text-sm">
      <span className={cn("size-2 rounded-full", dotClass[tone])} />
      {label}
    </span>
  );
}

/**
 * Turns a `deadlineAt` date into urgency the reader can act on: how many days
 * are left, or that the date has passed.
 */
export function DeadlineBadge({
  date,
  className,
}: {
  date: string;
  className?: string;
}) {
  const days = daysUntil(date);
  const tone: Tone =
    days < 0 ? "neutral" : days <= 7 ? "danger" : days <= 21 ? "warning" : "success";
  const label =
    days < 0
      ? "Closed"
      : days === 0
        ? "Closes today"
        : days === 1
          ? "1 day left"
          : `${days} days left`;

  return (
    <Badge
      variant="outline"
      className={cn("font-medium tabular-nums", toneClasses[tone], className)}
    >
      {label}
    </Badge>
  );
}

/** Thumbs rating shown in conversation tables. */
export function RatingBadge({ rating }: { rating: "up" | "down" | "none" }) {
  if (rating === "none") {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium",
        rating === "up" ? toneClasses.success : toneClasses.danger
      )}
    >
      {rating === "up" ? "Good" : "Bad"}
    </Badge>
  );
}

/** Active / inactive flag used by rows with a boolean `active` column. */
export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", active ? toneClasses.success : toneClasses.neutral)}
    >
      {active ? "Active" : "Inactive"}
    </Badge>
  );
}
