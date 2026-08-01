"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
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
import { createTagAction, updateTagAction } from "@/lib/actions/taxonomy.action";
import {
  createTagSchema,
  updateTagSchema,
  type CreateTagInput,
  type UpdateTagInput,
} from "@/lib/validator/taxonomy.validator";

const TAXONOMY_PATH = "/admin/taxonomy";

/** One form for both tag routes — see {@link ../category-form}. */
export function TagForm({ tag }: { tag?: UpdateTagInput }) {
  const router = useRouter();
  const isEdit = Boolean(tag);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateTagInput>({
    resolver: zodResolver(isEdit ? updateTagSchema : createTagSchema),
    defaultValues: tag ?? { slug: "", nameZh: "", nameEn: "" },
  });

  const onSubmit = async (data: CreateTagInput) => {
    const result = tag
      ? await updateTagAction({ ...data, id: tag.id })
      : await createTagAction(data);

    if (!result.success) {
      toast.error(isEdit ? "Could not save the tag" : "Could not create the tag", {
        description: result.message,
      });
      return;
    }

    toast.success(isEdit ? "Tag updated" : "Tag created", {
      description: result.message,
    });
    router.push(TAXONOMY_PATH);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <Card>
        <CardContent>
          <FieldGroup className="gap-4">
            <Field data-invalid={!!errors.slug}>
              <FieldLabel htmlFor="slug">Slug</FieldLabel>
              <Input
                id="slug"
                placeholder="scholarship"
                className="font-mono"
                aria-invalid={!!errors.slug}
                {...register("slug")}
              />
              {errors.slug ? (
                <FieldError>{errors.slug.message}</FieldError>
              ) : (
                <FieldDescription>
                  What readers see on a post: #scholarship.
                </FieldDescription>
              )}
            </Field>

            <div className="grid gap-4 lg:grid-cols-2">
              <Field data-invalid={!!errors.nameZh}>
                <FieldLabel htmlFor="nameZh">
                  名稱 <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id="nameZh"
                  placeholder="例如：獎學金"
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
          {isEdit ? "Save changes" : "Create tag"}
        </Button>
      </div>
    </form>
  );
}
