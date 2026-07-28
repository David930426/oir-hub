import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Localized } from "@/lib/i18n";
import { isUntranslated } from "@/lib/i18n";

/**
 * Paired 中文 / English inputs for the `*Zh` / `*En` column pairs. Chinese is
 * the required side, so the English box is explicitly marked optional and the
 * field flags rows where the translation is still missing.
 */
export function BilingualField({
  id,
  label,
  value,
  multiline = false,
  rows = 4,
  placeholderZh,
  placeholderEn,
}: {
  id: string;
  label: string;
  value: Localized;
  multiline?: boolean;
  rows?: number;
  placeholderZh?: string;
  placeholderEn?: string;
}) {
  const Field = multiline ? Textarea : Input;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={`${id}-zh`}>{label}</Label>
        {isUntranslated(value) && (
          <Badge
            variant="outline"
            className="border-amber-200 bg-amber-100 px-1.5 text-[10px] font-medium text-amber-800"
          >
            EN missing
          </Badge>
        )}
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">
            中文 <span className="text-destructive">*</span>
          </p>
          <Field
            id={`${id}-zh`}
            defaultValue={value.zh}
            placeholder={placeholderZh}
            {...(multiline ? { rows } : {})}
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">
            English <span className="font-normal">(optional)</span>
          </p>
          <Field
            id={`${id}-en`}
            defaultValue={value.en ?? ""}
            placeholder={placeholderEn ?? "Falls back to 中文 when empty"}
            {...(multiline ? { rows } : {})}
          />
        </div>
      </div>
    </div>
  );
}
