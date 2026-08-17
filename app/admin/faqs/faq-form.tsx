"use client";

import { useRouter } from "next/navigation";
import {
  useController,
  useFieldArray,
  useForm,
  type Control,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  FormActions,
  SelectField,
  SwitchField,
  TextAreaField,
  TextField,
  type SelectOption,
} from "@/components/admin/form-fields";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FAQ_AUDIENCES } from "@/constant";
import { createFaqAction, updateFaqAction } from "@/lib/actions/faq.action";
import { faqAudienceMeta } from "@/lib/mock/labels";
import {
  createFaqSchema,
  updateFaqSchema,
  type CreateFaqInput,
  type UpdateFaqInput,
} from "@/lib/validator/faq.validator";

const FAQ_PATH = "/admin/faqs";

const audienceOptions = FAQ_AUDIENCES.map((value) => ({
  value,
  label: faqAudienceMeta[value].label,
}));

/** Radix refuses "" as an item value, so "no file" travels under a sentinel. */
const NO_FILE = "__none__";

/**
 * The file picker on one source row.
 *
 * Its own component so it can hold a `useController` — reading the value with
 * `watch()` from the parent would re-render every source on each keystroke.
 */
function SourceFileSelect({
  control,
  index,
  files,
}: {
  control: Control<CreateFaqInput>;
  index: number;
  files: SelectOption[];
}) {
  const { field } = useController({
    control,
    name: `sources.${index}.mediaFileId`,
  });

  return (
    <Select
      value={field.value || NO_FILE}
      onValueChange={(next) => field.onChange(next === NO_FILE ? "" : next)}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Attach a file" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NO_FILE}>No file</SelectItem>
        {files.map((file) => (
          <SelectItem key={file.value} value={file.value}>
            {file.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

const EMPTY_FAQ: CreateFaqInput = {
  categoryId: "",
  questionZh: "",
  questionEn: "",
  shortAnswerZh: "",
  shortAnswerEn: "",
  longAnswerZh: "",
  longAnswerEn: "",
  audience: "student",
  needsHumanConfirm: false,
  published: false,
  sources: [],
};

/**
 * One form for writing and editing an FAQ.
 *
 * Sources are edited alongside the answer, not separately: an answer the office
 * publishes without a citation is exactly what this project set out to replace,
 * and the action refuses to publish one.
 */
export function FaqForm({
  faq,
  categories,
  files,
}: {
  faq?: UpdateFaqInput;
  categories: SelectOption[];
  files: SelectOption[];
}) {
  const router = useRouter();
  const isEdit = Boolean(faq);

  const { control, handleSubmit, register, formState } =
    useForm<CreateFaqInput>({
      resolver: zodResolver(isEdit ? updateFaqSchema : createFaqSchema),
      defaultValues: faq ?? EMPTY_FAQ,
    });

  const sources = useFieldArray({ control, name: "sources" });

  const onSubmit = async (data: CreateFaqInput) => {
    const result = faq
      ? await updateFaqAction({ ...data, id: faq.id })
      : await createFaqAction(data);

    if (!result.success) {
      toast.error(isEdit ? "Could not save the answer" : "Could not create it", {
        description: result.message,
      });
      return;
    }

    toast.success(isEdit ? "FAQ updated" : "FAQ created", {
      description: result.message,
    });
    router.push(FAQ_PATH);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Question</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <TextField
              control={control}
              name="questionZh"
              label="問題"
              required
              placeholder="例如：交換申請的截止日是什麼時候？"
            />
            <TextField
              control={control}
              name="questionEn"
              label="English question"
              placeholder="Falls back to 中文 when empty"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              control={control}
              name="categoryId"
              label="Category"
              required
              options={categories}
            />
            <SelectField
              control={control}
              name="audience"
              label="Audience"
              options={audienceOptions}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Answer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <TextAreaField
              control={control}
              name="shortAnswerZh"
              label="簡答"
              required
              rows={3}
              description="One or two sentences — what the site shows before the reader expands the answer."
            />
            <TextAreaField
              control={control}
              name="shortAnswerEn"
              label="English short answer"
              rows={3}
            />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <TextAreaField
              control={control}
              name="longAnswerZh"
              label="詳細說明"
              required
              rows={10}
            />
            <TextAreaField
              control={control}
              name="longAnswerEn"
              label="English long answer"
              rows={10}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <Field>
            <FieldLabel>Where this answer comes from</FieldLabel>
            <div className="space-y-3">
              {sources.fields.map((entry, index) => (
                <div key={entry.id} className="space-y-2 rounded-lg border p-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Label — 例如：115-2 簡章 p.3"
                      {...register(`sources.${index}.label`)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Remove source"
                      onClick={() => sources.remove(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {/* A file, a link, or both — the validator rejects neither. */}
                    <SourceFileSelect control={control} index={index} files={files} />
                    <Input
                      placeholder="https://… (optional)"
                      {...register(`sources.${index}.sourceUrl`)}
                    />
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  sources.append({ label: "", mediaFileId: "", sourceUrl: "" })
                }
              >
                <Plus className="size-4" />
                Add source
              </Button>
            </div>
            <FieldDescription>
              Shown publicly so a student can check the original. At least one is
              required before the answer can be published.
            </FieldDescription>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Publication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SwitchField
            control={control}
            name="needsHumanConfirm"
            label="Readers must confirm this with staff"
            description="For high-risk answers — visas, insurance, anything with legal weight. The page says so beside the answer."
          />
          <SwitchField
            control={control}
            name="published"
            label="Published"
            description="Publishing puts it on the public FAQ page."
          />
        </CardContent>
      </Card>

      <FormActions
        submitting={formState.isSubmitting}
        onCancel={() => router.push(FAQ_PATH)}
        submitLabel={isEdit ? "Save changes" : "Create FAQ"}
      />
    </form>
  );
}
