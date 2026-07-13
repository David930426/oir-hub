import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

type Attachment = { name: string; size: string; type: "pdf" | "docx" | "xlsx" };

const iconFor = (type: Attachment["type"]) =>
  type === "xlsx" ? FileSpreadsheet : FileText;

const colorFor = (type: Attachment["type"]) =>
  type === "pdf"
    ? "text-red-600 bg-red-50"
    : type === "docx"
      ? "text-blue-600 bg-blue-50"
      : "text-emerald-600 bg-emerald-50";

export function AttachmentList({ attachments }: { attachments: Attachment[] }) {
  if (attachments.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">Attachments</h3>
      <ul className="space-y-2">
        {attachments.map((att) => {
          const Icon = iconFor(att.type);
          return (
            <li
              key={att.name}
              className="flex items-center justify-between gap-3 rounded-lg border p-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-md ${colorFor(att.type)}`}
                >
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{att.name}</p>
                  <p className="text-xs uppercase text-muted-foreground">
                    {att.type} · {att.size}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="shrink-0">
                <Download className="size-4" />
                <span className="sr-only">Download {att.name}</span>
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
