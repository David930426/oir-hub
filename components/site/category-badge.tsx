import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  Scholarship: "bg-amber-100 text-amber-800 border-amber-200",
  Announcement: "bg-blue-100 text-blue-800 border-blue-200",
  News: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

export function CategoryBadge({ category }: { category: string }) {
  return (
    <Badge variant="outline" className={cn("font-medium", styles[category])}>
      {category}
    </Badge>
  );
}
