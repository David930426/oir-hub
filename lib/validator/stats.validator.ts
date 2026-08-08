import z from "zod";
import { METRIC_KEY_PATTERN, NAME_MAX_LENGTH } from "@/constant";
import {
  academicYearOnlySchema,
  idSchema,
  optionalText,
  requiredZh,
} from "./common.validator";

/**
 * Site stats — the ERD's SITE_STATS, the hand-entered figures on the public
 * homepage ("312 students went abroad in 115").
 *
 * `metricKey` plus `academicYear` is unique in the database, so the same metric
 * cannot be entered twice for one year.
 */

export const createSiteStatSchema = z.object({
  academicYear: academicYearOnlySchema,
  metricKey: z
    .string()
    .trim()
    .min(1, "A metric key is required.")
    .max(64, "Metric key is too long.")
    .regex(
      METRIC_KEY_PATTERN,
      "Use lowercase letters, numbers and underscores: outbound_count.",
    ),
  labelZh: requiredZh("label"),
  labelEn: optionalText("Label"),
  value: z.number("Value must be a number.").finite("Value must be a number."),
  unitZh: optionalText("Unit", NAME_MAX_LENGTH),
  unitEn: optionalText("Unit", NAME_MAX_LENGTH),
});

export const updateSiteStatSchema = createSiteStatSchema.extend({ id: idSchema });

export type CreateSiteStatInput = z.infer<typeof createSiteStatSchema>;
export type UpdateSiteStatInput = z.infer<typeof updateSiteStatSchema>;
