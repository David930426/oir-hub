"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  FormActions,
  MultiSelectField,
  SelectField,
  TextAreaField,
  TextField,
  type SelectOption,
} from "@/components/admin/form-fields";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { POST_TYPES, PUBLISH_STATUSES, SEO_DESCRIPTION_MAX_LENGTH } from "@/constant";
import { createPostAction, updatePostAction } from "@/lib/actions/post.action";
import { postStatusMeta, postTypeMeta } from "@/lib/mock/labels";
import {
  createPostSchema,
  updatePostSchema,
  type CreatePostInput,
  type UpdatePostInput,
} from "@/lib/validator/post.validator";

const POSTS_PATH = "/admin/posts";

const typeOptions = POST_TYPES.map((value) => ({
  value,
  label: postTypeMeta[value].label,
}));

const statusOptions = PUBLISH_STATUSES.map((value) => ({
  value,
  label: postStatusMeta[value].label,
}));

const EMPTY_POST: CreatePostInput = {
  slug: "",
  titleZh: "",
  titleEn: "",
  bodyZh: "",
  bodyEn: "",
  categoryId: "",
  type: "news",
  status: "draft",
  seoTitle: "",
  seoDescription: "",
  externalUrl: "",
  tagIds: [],
  attachmentIds: [],
};

/**
 * One form for writing and editing a post.
 *
 * Tags and attachments are part of the same submit rather than saved
 * separately, so a post is never half-tagged — the action writes all three in
 * one transaction.
 */
export function PostForm({
  post,
  categories,
  tags,
  files,
}: {
  post?: UpdatePostInput;
  categories: SelectOption[];
  tags: SelectOption[];
  files: SelectOption[];
}) {
  const router = useRouter();
  const isEdit = Boolean(post);

  const { control, handleSubmit, formState } = useForm<CreatePostInput>({
    resolver: zodResolver(isEdit ? updatePostSchema : createPostSchema),
    defaultValues: post ?? EMPTY_POST,
  });

  const onSubmit = async (data: CreatePostInput) => {
    const result = post
      ? await updatePostAction({ ...data, id: post.id })
      : await createPostAction(data);

    if (!result.success) {
      toast.error(isEdit ? "Could not save the post" : "Could not create it", {
        description: result.message,
      });
      return;
    }

    toast.success(isEdit ? "Post updated" : "Post created", {
      description: result.message,
    });
    router.push(POSTS_PATH);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Title</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          <TextField control={control} name="titleZh" label="標題" required />
          <TextField
            control={control}
            name="titleEn"
            label="English title"
            placeholder="Falls back to 中文 when empty"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Body</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          <TextAreaField
            control={control}
            name="bodyZh"
            label="內文"
            required
            rows={16}
            description="Markdown. Separate paragraphs with a blank line."
          />
          <TextAreaField
            control={control}
            name="bodyEn"
            label="English body"
            rows={16}
            placeholder="Falls back to 中文 when empty"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <TextField
              control={control}
              name="slug"
              label="Slug"
              mono
              placeholder="exchange-briefing"
            />
            <SelectField
              control={control}
              name="categoryId"
              label="Category"
              required
              options={categories}
            />
            <SelectField
              control={control}
              name="type"
              label="Type"
              options={typeOptions}
            />
            <SelectField
              control={control}
              name="status"
              label="Status"
              options={statusOptions}
            />
          </div>
          <MultiSelectField
            control={control}
            name="tagIds"
            label="Tags"
            options={tags}
            emptyMessage="No tags yet — create them under Categories & tags."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Attachments and SEO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <MultiSelectField
            control={control}
            name="attachmentIds"
            label="Attached files"
            options={files}
            emptyMessage="Nothing in the media library yet."
            description="Listed under the post in the order shown here."
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <TextField
              control={control}
              name="seoTitle"
              label="SEO title"
              description="Falls back to the post title."
            />
            <TextField
              control={control}
              name="seoDescription"
              label="SEO description"
              description={`Up to ${SEO_DESCRIPTION_MAX_LENGTH} characters.`}
            />
          </div>
          <TextField
            control={control}
            name="externalUrl"
            label="External source"
            placeholder="https://…"
            description="Set when the authoritative version lives on another office's site."
          />
        </CardContent>
      </Card>

      <FormActions
        submitting={formState.isSubmitting}
        onCancel={() => router.push(POSTS_PATH)}
        submitLabel={isEdit ? "Save changes" : "Create post"}
      />
    </form>
  );
}
