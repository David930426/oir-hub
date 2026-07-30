import z from "zod";
import {
  ACADEMIC_YEAR_PATTERN,
  MEDIA_MAX_BYTES,
  MEDIA_MIME_LABELS,
} from "@/constant";

/**
 * Media uploads.
 *
 * The file itself is validated here too, so the same rules the form shows are
 * the ones the action enforces — a hand-rolled POST cannot slip a 200 MB
 * executable past a disabled button.
 */

export const mediaFileSchema = z
  .instanceof(File, { message: "Choose a file to upload." })
  .refine((file) => file.size > 0, "That file is empty.")
  .refine(
    (file) => file.size <= MEDIA_MAX_BYTES,
    `Files must be ${Math.round(MEDIA_MAX_BYTES / 1024 / 1024)} MB or smaller.`,
  )
  .refine(
    // Read inside the check, not at module scope: this module is bundled for the
    // browser, and reaching into an imported object while modules are still
    // being evaluated is how you get "Cannot convert undefined to object".
    (file) => Object.hasOwn(MEDIA_MIME_LABELS, file.type),
    "Only PDF, Word and Excel files are accepted.",
  );

/** The metadata beside the file. Both fields are optional, hence the "". */
export const uploadMediaSchema = z.object({
  academicYear: z
    .string()
    .regex(ACADEMIC_YEAR_PATTERN, "Write the year as 115-2 — year, then term 1 or 2.")
    .or(z.literal("")),
  /** Id of the file this upload supersedes; "" for a plain new file. */
  replacesId: z.string().or(z.literal("")),
});

export type UploadMediaInput = z.infer<typeof uploadMediaSchema>;
