"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  FormActions,
  SelectField,
  StringListField,
  SwitchField,
  TextAreaField,
  TextField,
  type SelectOption,
} from "@/components/admin/form-fields";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MAX_HIGHLIGHTS, PUBLISH_STATUSES } from "@/constant";
import {
  createTestimonialAction,
  updateTestimonialAction,
} from "@/lib/actions/testimonial.action";
import { testimonialStatusMeta } from "@/lib/mock/labels";
import {
  createTestimonialSchema,
  updateTestimonialSchema,
  type CreateTestimonialInput,
  type UpdateTestimonialInput,
} from "@/lib/validator/testimonial.validator";

const TESTIMONIALS_PATH = "/admin/testimonials";

const statusOptions = PUBLISH_STATUSES.map((value) => ({
  value,
  label: testimonialStatusMeta[value].label,
}));

const EMPTY_TESTIMONIAL: CreateTestimonialInput = {
  partnerSchoolId: "",
  displayName: "",
  deptYear: "",
  country: "",
  termLabel: "",
  highlights: [],
  bodyZh: "",
  bodyEn: "",
  fullTextFileId: "",
  consentGiven: false,
  status: "draft",
};

export function TestimonialForm({
  testimonial,
  schools,
  files,
}: {
  testimonial?: UpdateTestimonialInput;
  schools: SelectOption[];
  files: SelectOption[];
}) {
  const router = useRouter();
  const isEdit = Boolean(testimonial);

  const { control, handleSubmit, formState } = useForm<CreateTestimonialInput>({
    resolver: zodResolver(
      isEdit ? updateTestimonialSchema : createTestimonialSchema,
    ),
    defaultValues: testimonial ?? EMPTY_TESTIMONIAL,
  });

  const onSubmit = async (data: CreateTestimonialInput) => {
    const result = testimonial
      ? await updateTestimonialAction({ ...data, id: testimonial.id })
      : await createTestimonialAction(data);

    if (!result.success) {
      toast.error(isEdit ? "Could not save the report" : "Could not add it", {
        description: result.message,
      });
      return;
    }

    toast.success(isEdit ? "Report updated" : "Report added", {
      description: result.message,
    });
    router.push(TESTIMONIALS_PATH);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Who wrote it</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              control={control}
              name="displayName"
              label="Shown as"
              required
              placeholder="例如：L 同學"
              description="Whatever the student agreed to be called."
            />
            <TextField
              control={control}
              name="deptYear"
              label="Department and year"
              required
              placeholder="資工系四年級"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <SelectField
              control={control}
              name="partnerSchoolId"
              label="Partner school"
              required
              options={schools}
            />
            <TextField
              control={control}
              name="country"
              label="Country"
              required
              placeholder="日本"
            />
            <TextField
              control={control}
              name="termLabel"
              label="Term"
              required
              placeholder="114-1"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">The report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <StringListField
            control={control}
            name="highlights"
            label="Highlights"
            placeholder="A short pull quote"
            description={`Up to ${MAX_HIGHLIGHTS}, shown above the body.`}
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <TextAreaField
              control={control}
              name="bodyZh"
              label="心得內容"
              required
              rows={12}
            />
            <TextAreaField
              control={control}
              name="bodyEn"
              label="English version"
              rows={12}
              placeholder="Falls back to 中文 when empty"
            />
          </div>
          <SelectField
            control={control}
            name="fullTextFileId"
            label="Full report file"
            options={files}
            emptyLabel="None attached"
            description="The original document, when the student submitted one."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Consent and publication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SwitchField
            control={control}
            name="consentGiven"
            label="The student has consented to publication"
            description="Required before the report can go on the site. Record it only when you actually have it."
          />
          <SelectField
            control={control}
            name="status"
            label="Status"
            options={statusOptions}
          />
        </CardContent>
      </Card>

      <FormActions
        submitting={formState.isSubmitting}
        onCancel={() => router.push(TESTIMONIALS_PATH)}
        submitLabel={isEdit ? "Save changes" : "Add report"}
      />
    </form>
  );
}
