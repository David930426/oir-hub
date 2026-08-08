"use client";

import { useState } from "react";
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Loader2, Plus, Save, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

/**
 * Form controls shared by every create/edit screen in the console.
 *
 * All of them go through `useController` rather than `register`, for one
 * reason: a Select, a Switch and a chip list have no native input to register,
 * and having text fields work the same way means every field in a form reads
 * alike. They also carry the console's two standing conventions — Chinese
 * fields are marked required, English ones say what happens when left empty.
 */

type BaseProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

export function TextField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  required,
  disabled,
  className,
  type = "text",
  mono,
}: BaseProps<T> & { type?: string; mono?: boolean }) {
  const { field, fieldState } = useController({ control, name });
  const id = `field-${name}`;

  return (
    <Field data-invalid={!!fieldState.error} className={className}>
      <FieldLabel htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </FieldLabel>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={!!fieldState.error}
        className={mono ? "font-mono" : undefined}
        {...field}
        value={field.value ?? ""}
      />
      {fieldState.error ? (
        <FieldError>{fieldState.error.message}</FieldError>
      ) : (
        description && <FieldDescription>{description}</FieldDescription>
      )}
    </Field>
  );
}

/**
 * A number input that hands the form a number rather than a string.
 *
 * `valueAsNumber` on an empty box gives `NaN`, which zod reports as "expected
 * number, received nan" — meaningless to a staff member who simply cleared the
 * field — so an empty box becomes 0 here instead.
 */
export function NumberField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  required,
  disabled,
  className,
  min = 0,
  max,
  step,
}: BaseProps<T> & { min?: number; max?: number; step?: number }) {
  const { field, fieldState } = useController({ control, name });
  const id = `field-${name}`;

  return (
    <Field data-invalid={!!fieldState.error} className={className}>
      <FieldLabel htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </FieldLabel>
      <Input
        id={id}
        type="number"
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={!!fieldState.error}
        {...field}
        value={field.value ?? 0}
        onChange={(event) =>
          field.onChange(event.target.value === "" ? 0 : event.target.valueAsNumber)
        }
      />
      {fieldState.error ? (
        <FieldError>{fieldState.error.message}</FieldError>
      ) : (
        description && <FieldDescription>{description}</FieldDescription>
      )}
    </Field>
  );
}

export function TextAreaField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  required,
  disabled,
  className,
  rows = 6,
}: BaseProps<T> & { rows?: number }) {
  const { field, fieldState } = useController({ control, name });
  const id = `field-${name}`;

  return (
    <Field data-invalid={!!fieldState.error} className={className}>
      <FieldLabel htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </FieldLabel>
      <Textarea
        id={id}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={!!fieldState.error}
        {...field}
        value={field.value ?? ""}
      />
      {fieldState.error ? (
        <FieldError>{fieldState.error.message}</FieldError>
      ) : (
        description && <FieldDescription>{description}</FieldDescription>
      )}
    </Field>
  );
}

export type SelectOption = { value: string; label: string };

export function SelectField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  required,
  disabled,
  className,
  options,
  /** Adds a "none" entry submitting "" — for the optional references. */
  emptyLabel,
}: BaseProps<T> & { options: SelectOption[]; emptyLabel?: string }) {
  const { field, fieldState } = useController({ control, name });
  const id = `field-${name}`;

  // Radix treats "" as "nothing selected" and refuses it as an item value, so
  // the empty choice travels under a sentinel and is mapped back on the way out.
  const NONE = "__none__";

  return (
    <Field data-invalid={!!fieldState.error} className={className}>
      <FieldLabel htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </FieldLabel>
      <Select
        value={field.value ? String(field.value) : emptyLabel ? NONE : undefined}
        onValueChange={(next) => field.onChange(next === NONE ? "" : next)}
        disabled={disabled}
      >
        <SelectTrigger id={id} className="w-full" aria-invalid={!!fieldState.error}>
          <SelectValue placeholder={placeholder ?? "Choose…"} />
        </SelectTrigger>
        <SelectContent>
          {emptyLabel && <SelectItem value={NONE}>{emptyLabel}</SelectItem>}
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {fieldState.error ? (
        <FieldError>{fieldState.error.message}</FieldError>
      ) : (
        description && <FieldDescription>{description}</FieldDescription>
      )}
    </Field>
  );
}

export function SwitchField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  disabled,
  className,
}: Omit<BaseProps<T>, "placeholder" | "required">) {
  const { field } = useController({ control, name });
  const id = `field-${name}`;

  return (
    <div
      className={`flex items-start justify-between gap-4 rounded-lg border p-3 ${className ?? ""}`}
    >
      <div className="space-y-0.5">
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        {description && <FieldDescription>{description}</FieldDescription>}
      </div>
      <Switch
        id={id}
        checked={Boolean(field.value)}
        onCheckedChange={field.onChange}
        disabled={disabled}
      />
    </div>
  );
}

/**
 * A list of short strings edited as chips — topics, highlights, required
 * documents.
 *
 * Kept deliberately plain: type, press Enter, click the × to remove. The
 * alternative, a repeating sub-form, is more machinery than a list of phrases
 * deserves.
 */
export function StringListField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  disabled,
  className,
}: Omit<BaseProps<T>, "required">) {
  const { field, fieldState } = useController({ control, name });
  const [draft, setDraft] = useState("");
  const values: string[] = Array.isArray(field.value) ? field.value : [];
  const id = `field-${name}`;

  function add() {
    const value = draft.trim();
    if (!value || values.includes(value)) {
      setDraft("");
      return;
    }
    field.onChange([...values, value]);
    setDraft("");
  }

  return (
    <Field data-invalid={!!fieldState.error} className={className}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="flex gap-2">
        <Input
          id={id}
          value={draft}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            // Enter adds an entry; without this it would submit the whole form.
            if (event.key === "Enter") {
              event.preventDefault();
              add();
            }
          }}
        />
        <Button type="button" variant="outline" onClick={add} disabled={disabled}>
          <Plus className="size-4" />
          Add
        </Button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {values.map((value) => (
            <Badge key={value} variant="secondary" className="gap-1 font-normal">
              {value}
              <button
                type="button"
                aria-label={`Remove ${value}`}
                onClick={() => field.onChange(values.filter((v) => v !== value))}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      {fieldState.error ? (
        <FieldError>{fieldState.error.message}</FieldError>
      ) : (
        description && <FieldDescription>{description}</FieldDescription>
      )}
    </Field>
  );
}

/**
 * Picks several rows from a list — the tags on a post, the files attached to
 * it.
 *
 * A checkbox list rather than a combobox: the office has tens of tags, not
 * thousands, and seeing all of them is how someone notices the tag they meant
 * already exists.
 */
export function MultiSelectField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  options,
  emptyMessage = "Nothing to choose from yet.",
  className,
}: Omit<BaseProps<T>, "placeholder" | "required"> & {
  options: SelectOption[];
  emptyMessage?: string;
}) {
  const { field, fieldState } = useController({ control, name });
  const values: string[] = Array.isArray(field.value) ? field.value : [];

  return (
    <Field data-invalid={!!fieldState.error} className={className}>
      <FieldLabel>{label}</FieldLabel>
      {options.length === 0 ? (
        <FieldDescription>{emptyMessage}</FieldDescription>
      ) : (
        <div className="grid max-h-56 gap-2 overflow-y-auto rounded-lg border p-3 sm:grid-cols-2">
          {options.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <Checkbox
                checked={values.includes(option.value)}
                onCheckedChange={(checked) =>
                  field.onChange(
                    checked
                      ? [...values, option.value]
                      : values.filter((value) => value !== option.value),
                  )
                }
              />
              <span className="truncate">{option.label}</span>
            </label>
          ))}
        </div>
      )}
      {fieldState.error ? (
        <FieldError>{fieldState.error.message}</FieldError>
      ) : (
        description && <FieldDescription>{description}</FieldDescription>
      )}
    </Field>
  );
}

/** A set of checkboxes over fixed values — the months a funding call opens. */
export function CheckboxGroupField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  options,
  className,
}: Omit<BaseProps<T>, "placeholder" | "required"> & {
  options: { value: number; label: string }[];
}) {
  const { field, fieldState } = useController({ control, name });
  const values: number[] = Array.isArray(field.value) ? field.value : [];

  return (
    <Field data-invalid={!!fieldState.error} className={className}>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex flex-wrap gap-3 pt-1">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-center gap-2 text-sm"
          >
            <Checkbox
              checked={values.includes(option.value)}
              onCheckedChange={(checked) =>
                field.onChange(
                  checked
                    ? [...values, option.value].sort((a, b) => a - b)
                    : values.filter((value) => value !== option.value),
                )
              }
            />
            {option.label}
          </label>
        ))}
      </div>
      {fieldState.error ? (
        <FieldError>{fieldState.error.message}</FieldError>
      ) : (
        description && <FieldDescription>{description}</FieldDescription>
      )}
    </Field>
  );
}

/** Cancel and submit, in the order every form in the console uses. */
export function FormActions({
  submitting,
  onCancel,
  submitLabel,
}: {
  submitting: boolean;
  onCancel: () => void;
  submitLabel: string;
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
        Cancel
      </Button>
      <Button type="submit" disabled={submitting}>
        {submitting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Save className="size-4" />
        )}
        {submitLabel}
      </Button>
    </div>
  );
}
