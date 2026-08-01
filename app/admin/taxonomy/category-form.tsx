"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
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
import { CATEGORY_KINDS, MAX_SORT_ORDER } from "@/constant";
import {
  createCategoryAction,
  updateCategoryAction,
} from "@/lib/actions/taxonomy.action";
import { categoryKindMeta } from "@/lib/mock/labels";
import {
  createCategorySchema,
  updateCategorySchema,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from "@/lib/validator/taxonomy.validator";

const TAXONOMY_PATH = "/admin/taxonomy";

/**
 * One form for both routes: creating a category and editing one differ only in
 * the id, the action they call, and whether `kind` may still be changed.
 *
 * `kind` is locked once content points at the category — the action refuses the
 * change anyway, and disabling the control explains why before someone tries.
 */
export function CategoryForm({
  category,
  usage = 0,
}: {
  category?: UpdateCategoryInput;
  usage?: number;
}) {
  const router = useRouter();
  const isEdit = Boolean(category);
  const kindLocked = isEdit && usage > 0;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateCategoryInput>({
    resolver: zodResolver(isEdit ? updateCategorySchema : createCategorySchema),
    defaultValues: category ?? {
      slug: "",
      kind: "post",
      nameZh: "",
      nameEn: "",
      sortOrder: 0,
    },
  });

  const onSubmit = async (data: CreateCategoryInput) => {
    const result = category
      ? await updateCategoryAction({ ...data, id: category.id })
      : await createCategoryAction(data);

    if (!result.success) {
      toast.error(
        isEdit ? "Could not save the category" : "Could not create the category",
        { description: result.message },
      );
      return;
    }

    toast.success(isEdit ? "Category updated" : "Category created", {
      description: result.message,
    });
    router.push(TAXONOMY_PATH);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <Card>
        <CardContent>
          <FieldGroup className="gap-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Field data-invalid={!!errors.nameZh}>
                <FieldLabel htmlFor="nameZh">
                  名稱 <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id="nameZh"
                  placeholder="例如：交換計畫"
                  aria-invalid={!!errors.nameZh}
                  {...register("nameZh")}
                />
                {errors.nameZh && <FieldError>{errors.nameZh.message}</FieldError>}
              </Field>

              <Field data-invalid={!!errors.nameEn}>
                <FieldLabel htmlFor="nameEn">English name</FieldLabel>
                <Input
                  id="nameEn"
                  placeholder="Falls back to 中文 when empty"
                  aria-invalid={!!errors.nameEn}
                  {...register("nameEn")}
                />
                {errors.nameEn && <FieldError>{errors.nameEn.message}</FieldError>}
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field data-invalid={!!errors.slug}>
                <FieldLabel htmlFor="slug">Slug</FieldLabel>
                <Input
                  id="slug"
                  placeholder="exchange"
                  className="font-mono"
                  aria-invalid={!!errors.slug}
                  {...register("slug")}
                />
                {errors.slug ? (
                  <FieldError>{errors.slug.message}</FieldError>
                ) : (
                  <FieldDescription>Used in site URLs.</FieldDescription>
                )}
              </Field>

              <Controller
                control={control}
                name="kind"
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor="kind">Kind</FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={kindLocked}
                    >
                      <SelectTrigger id="kind" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORY_KINDS.map((kind) => (
                          <SelectItem key={kind} value={kind}>
                            {categoryKindMeta[kind].label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldDescription>
                      {kindLocked
                        ? `Locked — ${usage} item${usage === 1 ? "" : "s"} use this category.`
                        : "Scopes the category to posts or to FAQs."}
                    </FieldDescription>
                  </Field>
                )}
              />

              <Field data-invalid={!!errors.sortOrder}>
                <FieldLabel htmlFor="sortOrder">Sort order</FieldLabel>
                <Input
                  id="sortOrder"
                  type="number"
                  min={0}
                  max={MAX_SORT_ORDER}
                  aria-invalid={!!errors.sortOrder}
                  {...register("sortOrder", { valueAsNumber: true })}
                />
                {errors.sortOrder ? (
                  <FieldError>{errors.sortOrder.message}</FieldError>
                ) : (
                  <FieldDescription>Lowest first in site filters.</FieldDescription>
                )}
              </Field>
            </div>
          </FieldGroup>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(TAXONOMY_PATH)}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {isEdit ? "Save changes" : "Create category"}
        </Button>
      </div>
    </form>
  );
}
