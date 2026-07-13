import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  READY: "bg-emerald-100 text-emerald-800 border-emerald-200",
  PROCESSING: "bg-blue-100 text-blue-800 border-blue-200",
  PENDING: "bg-amber-100 text-amber-800 border-amber-200",
  FAILED: "bg-red-100 text-red-800 border-red-200",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={cn("font-medium", statusStyles[status])}>
      {status}
    </Badge>
  );
}

export function RatingBadge({ rating }: { rating: "good" | "bad" | "none" }) {
  if (rating === "none") {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium",
        rating === "good"
          ? "bg-emerald-100 text-emerald-800 border-emerald-200"
          : "bg-red-100 text-red-800 border-red-200"
      )}
    >
      {rating === "good" ? "Good" : "Bad"}
    </Badge>
  );
}

const roleStyles: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-800 border-purple-200",
  STAFF: "bg-blue-100 text-blue-800 border-blue-200",
  STUDENT: "bg-slate-100 text-slate-700 border-slate-200",
};

export function RoleBadge({ role }: { role: string }) {
  return (
    <Badge variant="outline" className={cn("font-medium", roleStyles[role])}>
      {role}
    </Badge>
  );
}
