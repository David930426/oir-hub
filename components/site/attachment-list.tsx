import { Download, FileSpreadsheet, FileText, FileType } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/mock/labels";
import type { MediaFile } from "@/lib/mock/types";

/** Short kind label derived from `mimeType`. */
function kindOf(mimeType: string): "pdf" | "docx" | "xlsx" | "file" {
  if (mimeType.includes("pdf")) return "pdf";
  if (mimeType.includes("wordprocessingml")) return "docx";
  if (mimeType.includes("spreadsheetml")) return "xlsx";
  return "file";
}

const iconFor = {
  pdf: FileText,
  docx: FileType,
  xlsx: FileSpreadsheet,
  file: FileText,
} as const;

const colorFor = {
  pdf: "text-red-600 bg-red-50",
  docx: "text-blue-600 bg-blue-50",
  xlsx: "text-emerald-600 bg-emerald-50",
  file: "text-slate-600 bg-slate-100",
} as const;

/**
 * Downloadable media attached to a post, bulletin, funding call, or FAQ.
 * Files carry an academic year and a version so students can tell at a glance
 * whether they are looking at the current edition.
 */
export function AttachmentList({
  files,
  title = "Attachments",
}: {
  files: MediaFile[];
  title?: string;
}) {
  if (files.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="space-y-2">
        {files.map((file) => {
          const kind = kindOf(file.mimeType);
          const Icon = iconFor[kind];
          return (
            <li
              key={file.id}
              className="flex items-center justify-between gap-3 rounded-lg border p-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-md ${colorFor[kind]}`}
                >
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{file.filename}</p>
                  <p className="text-xs text-muted-foreground">
                    <span className="uppercase">{kind}</span> ·{" "}
                    {formatBytes(file.sizeBytes)}
                    {file.academicYear && ` · ${file.academicYear}`}
                    {file.version > 1 && ` · v${file.version}`}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="shrink-0">
                <Download className="size-4" />
                <span className="sr-only">Download {file.filename}</span>
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
