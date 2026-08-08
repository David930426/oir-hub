"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  FormActions,
  SelectField,
  TextField,
  type SelectOption,
} from "@/components/admin/form-fields";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OPEN_STATUSES, TERM_VALUES } from "@/constant";
import {
  createBulletinAction,
  updateBulletinAction,
} from "@/lib/actions/bulletin.action";
import { bulletinStatusMeta } from "@/lib/mock/labels";
import {
  createBulletinSchema,
  updateBulletinSchema,
  type CreateBulletinInput,
  type UpdateBulletinInput,
} from "@/lib/validator/bulletin.validator";

const BULLETINS_PATH = "/admin/bulletins";

const statusOptions = OPEN_STATUSES.map((value) => ({
  value,
  label: bulletinStatusMeta[value].label,
}));

const termOptions = TERM_VALUES.map((value) => ({
  value,
  label: `Term ${value}`,
}));

const EMPTY_BULLETIN: CreateBulletinInput = {
  programId: "",
  academicYear: "",
  term: "1",
  titleZh: "",
  titleEn: "",
  region: "",
  pdfFileId: "",
  announcedAt: "",
  deadlineAt: "",
  status: "open",
};

/**
 * One form for creating and editing a selection call.
 *
 * The program and PDF pickers are filled by the page from the database, so a
 * writer can only point at rows that exist — the action checks again anyway,
 * for the case where one is deleted while the form is open.
 */
export function BulletinForm({
  bulletin,
  programs,
  files,
}: {
  bulletin?: UpdateBulletinInput;
  programs: SelectOption[];
  files: SelectOption[];
}) {
  const router = useRouter();
  const isEdit = Boolean(bulletin);

  const { control, handleSubmit, formState } = useForm<CreateBulletinInput>({
    resolver: zodResolver(isEdit ? updateBulletinSchema : createBulletinSchema),
    defaultValues: bulletin ?? EMPTY_BULLETIN,
  });

  const onSubmit = async (data: CreateBulletinInput) => {
    const result = bulletin
      ? await updateBulletinAction({ ...data, id: bulletin.id })
      : await createBulletinAction(data);

    if (!result.success) {
      toast.error(isEdit ? "Could not save the bulletin" : "Could not create it", {
        description: result.message,
      });
      return;
    }

    toast.success(isEdit ? "Bulletin updated" : "Bulletin created", {
      description: result.message,
    });
    router.push(BULLETINS_PATH);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Title</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          <TextField
            control={control}
            name="titleZh"
            label="標題"
            required
            placeholder="例如：115學年度第2學期交換學生甄選"
          />
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
          <CardTitle className="text-base">Which call is this?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              control={control}
              name="programId"
              label="Program"
              required
              options={programs}
              placeholder="Choose a program"
            />
            <TextField
              control={control}
              name="region"
              label="Region"
              required
              placeholder="例如：日韓、歐洲"
              description="What students filter the list by."
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              control={control}
              name="academicYear"
              label="Academic year"
              required
              placeholder="115"
              description="Three digits, without the term."
            />
            <SelectField
              control={control}
              name="term"
              label="Term"
              required
              options={termOptions}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dates and document</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <TextField
              control={control}
              name="announcedAt"
              label="Announced"
              required
              type="date"
            />
            <TextField
              control={control}
              name="deadlineAt"
              label="Deadline"
              required
              type="date"
              description="Shown as a countdown on the site."
            />
            <SelectField
              control={control}
              name="status"
              label="Status"
              options={statusOptions}
            />
          </div>
          <SelectField
            control={control}
            name="pdfFileId"
            label="Bulletin PDF"
            options={files}
            emptyLabel="Not uploaded yet"
            description="The binding document. Upload it in the media library first."
          />
        </CardContent>
      </Card>

      <FormActions
        submitting={formState.isSubmitting}
        onCancel={() => router.push(BULLETINS_PATH)}
        submitLabel={isEdit ? "Save changes" : "Create bulletin"}
      />
    </form>
  );
}
