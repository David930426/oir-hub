"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileUp, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MEDIA_ACCEPT_ATTR, MEDIA_MAX_BYTES } from "@/constant";
import { uploadMediaAction } from "@/lib/actions/media.action";
import { cn, formatBytes } from "@/lib/utils";
import { mediaFileSchema, uploadMediaSchema } from "@/lib/validator/media.validator";

const MEDIA_PATH = "/admin/media";
const NEW_FILE = "none";

/**
 * A plain form rather than react-hook-form: the payload is a FormData carrying
 * the file itself, so the action receives the upload directly instead of a
 * serialised object.
 */
export function UploadForm({
  candidates,
  replacesId: initialReplacesId,
  academicYear: initialAcademicYear,
}: {
  candidates: { id: string; filename: string; version: number }[];
  replacesId: string;
  academicYear: string | null;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [academicYear, setAcademicYear] = useState(initialAcademicYear ?? "");
  const [replacesId, setReplacesId] = useState(initialReplacesId || NEW_FILE);
  const [errors, setErrors] = useState<{ file?: string; academicYear?: string }>({});
  const [dragging, setDragging] = useState(false);
  const [pending, startTransition] = useTransition();

  function pick(next: File | null) {
    setFile(next);
    setErrors((current) => ({ ...current, file: undefined }));
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // The same schemas the action enforces, so the form can point at the field
    // instead of showing a toast for something it could have caught.
    const parsedFile = mediaFileSchema.safeParse(file);
    const parsedFields = uploadMediaSchema.safeParse({
      academicYear,
      replacesId: replacesId === NEW_FILE ? "" : replacesId,
    });

    if (!parsedFile.success || !parsedFields.success) {
      setErrors({
        file: parsedFile.success ? undefined : parsedFile.error.issues[0]?.message,
        academicYear: parsedFields.success
          ? undefined
          : parsedFields.error.issues[0]?.message,
      });
      return;
    }

    const payload = new FormData();
    payload.set("file", parsedFile.data);
    payload.set("academicYear", parsedFields.data.academicYear);
    payload.set("replacesId", parsedFields.data.replacesId);

    startTransition(async () => {
      const result = await uploadMediaAction(payload);

      if (!result.success) {
        toast.error("Upload failed", { description: result.message });
        return;
      }

      toast.success("File uploaded", { description: result.message });
      router.push(MEDIA_PATH);
    });
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <Card>
        <CardContent>
          <FieldGroup className="gap-4">
            <Field data-invalid={!!errors.file}>
              <FieldLabel htmlFor="file">File</FieldLabel>
              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragging(false);
                  pick(event.dataTransfer.files[0] ?? null);
                }}
                onClick={() => inputRef.current?.click()}
                className={cn(
                  "flex h-32 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed text-sm transition-colors",
                  dragging
                    ? "border-primary/60 bg-accent/40 text-foreground"
                    : "text-muted-foreground hover:border-primary/50 hover:text-foreground",
                  errors.file && "border-destructive/60",
                )}
              >
                <FileUp className="size-5" />
                {file ? (
                  <span className="flex items-center gap-2 font-medium text-foreground">
                    {file.name}
                    <span className="text-xs font-normal text-muted-foreground tabular-nums">
                      {formatBytes(file.size)}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-6"
                      onClick={(event) => {
                        event.stopPropagation();
                        pick(null);
                        if (inputRef.current) inputRef.current.value = "";
                      }}
                    >
                      <X className="size-3.5" />
                      <span className="sr-only">Clear</span>
                    </Button>
                  </span>
                ) : (
                  <span>Drag a file here or click to browse</span>
                )}
              </div>
              <input
                ref={inputRef}
                id="file"
                type="file"
                className="sr-only"
                accept={MEDIA_ACCEPT_ATTR}
                onChange={(event) => pick(event.target.files?.[0] ?? null)}
              />
              {errors.file ? (
                <FieldError>{errors.file}</FieldError>
              ) : (
                <FieldDescription>
                  PDF, Word or Excel, up to{" "}
                  {Math.round(MEDIA_MAX_BYTES / 1024 / 1024)} MB.
                </FieldDescription>
              )}
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={!!errors.academicYear}>
                <FieldLabel htmlFor="academicYear">Academic year</FieldLabel>
                <Input
                  id="academicYear"
                  placeholder="115-2"
                  value={academicYear}
                  onChange={(event) => {
                    setAcademicYear(event.target.value);
                    setErrors((current) => ({ ...current, academicYear: undefined }));
                  }}
                  aria-invalid={!!errors.academicYear}
                />
                {errors.academicYear ? (
                  <FieldError>{errors.academicYear}</FieldError>
                ) : (
                  <FieldDescription>Optional, for year-bound documents.</FieldDescription>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="replaces">Replaces</FieldLabel>
                <Select value={replacesId} onValueChange={setReplacesId}>
                  <SelectTrigger id="replaces" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NEW_FILE}>Nothing — new file</SelectItem>
                    {candidates.map((candidate) => (
                      <SelectItem key={candidate.id} value={candidate.id}>
                        {candidate.filename} (v{candidate.version})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldDescription>
                  Archives that version and bumps the version number by one.
                </FieldDescription>
              </Field>
            </div>
          </FieldGroup>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(MEDIA_PATH)}
          disabled={pending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
          Upload
        </Button>
      </div>
    </form>
  );
}
