"use client";

import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  FormActions,
  NumberField,
  SelectField,
  StringListField,
  SwitchField,
  TextField,
  type SelectOption,
} from "@/components/admin/form-fields";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MAX_GPA, MAX_QUOTA } from "@/constant";
import {
  createPartnerSchoolAction,
  updatePartnerSchoolAction,
} from "@/lib/actions/school.action";
import {
  createPartnerSchoolSchema,
  updatePartnerSchoolSchema,
  type CreatePartnerSchoolInput,
  type UpdatePartnerSchoolInput,
} from "@/lib/validator/school.validator";

const SCHOOLS_PATH = "/admin/schools";

const EMPTY_SCHOOL: CreatePartnerSchoolInput = {
  programId: "",
  nameZh: "",
  nameEn: "",
  country: "",
  region: "",
  quota: 0,
  gpaMin: 0,
  languageReq: [],
  eligibleColleges: [],
  englishTaught: false,
  housingProvided: false,
  websiteUrl: "",
  briefFileId: "",
  active: true,
};

export function SchoolForm({
  school,
  programs,
  files,
}: {
  school?: UpdatePartnerSchoolInput;
  programs: SelectOption[];
  files: SelectOption[];
}) {
  const router = useRouter();
  const isEdit = Boolean(school);

  const { control, handleSubmit, register, formState } =
    useForm<CreatePartnerSchoolInput>({
      resolver: zodResolver(
        isEdit ? updatePartnerSchoolSchema : createPartnerSchoolSchema,
      ),
      defaultValues: school ?? EMPTY_SCHOOL,
    });

  // Language thresholds are pairs rather than plain strings, so they get a
  // repeating row instead of the chip list the other JSONB columns use.
  const languageReq = useFieldArray({ control, name: "languageReq" });

  const onSubmit = async (data: CreatePartnerSchoolInput) => {
    const result = school
      ? await updatePartnerSchoolAction({ ...data, id: school.id })
      : await createPartnerSchoolAction(data);

    if (!result.success) {
      toast.error(isEdit ? "Could not save the school" : "Could not add it", {
        description: result.message,
      });
      return;
    }

    toast.success(isEdit ? "School updated" : "School added", {
      description: result.message,
    });
    router.push(SCHOOLS_PATH);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">School</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <TextField
              control={control}
              name="nameZh"
              label="學校名稱"
              required
              placeholder="例如：早稻田大學"
            />
            <TextField
              control={control}
              name="nameEn"
              label="English name"
              placeholder="Waseda University"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <SelectField
              control={control}
              name="programId"
              label="Program"
              required
              options={programs}
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
              name="region"
              label="Region"
              required
              placeholder="asia"
              description="Groups the directory filters."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Who may apply</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField
              control={control}
              name="quota"
              label="Quota per term"
              max={MAX_QUOTA}
            />
            <NumberField
              control={control}
              name="gpaMin"
              label="Minimum GPA"
              max={MAX_GPA}
              step={0.1}
              description="0 means no GPA threshold."
            />
          </div>

          <Field>
            <FieldLabel>Language requirements</FieldLabel>
            <div className="space-y-2">
              {languageReq.fields.map((entry, index) => (
                <div key={entry.id} className="flex gap-2">
                  <Input
                    placeholder="Test — JLPT, TOEFL iBT…"
                    {...register(`languageReq.${index}.test`)}
                  />
                  <Input
                    placeholder="Score — N2, 79…"
                    {...register(`languageReq.${index}.score`)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Remove requirement"
                    onClick={() => languageReq.remove(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => languageReq.append({ test: "", score: "" })}
              >
                <Plus className="size-4" />
                Add requirement
              </Button>
            </div>
            <FieldDescription>
              Each threshold a student must clear. Leave empty when the school
              sets none.
            </FieldDescription>
          </Field>

          <StringListField
            control={control}
            name="eligibleColleges"
            label="Eligible colleges"
            placeholder="Add a college or department code"
            description="Leave empty when the agreement is open to the whole university."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Practicalities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <SwitchField
              control={control}
              name="englishTaught"
              label="English-taught courses"
              description="Students without the local language can still study here."
            />
            <SwitchField
              control={control}
              name="housingProvided"
              label="Housing provided"
              description="On-campus or arranged accommodation."
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              control={control}
              name="websiteUrl"
              label="Website"
              placeholder="https://www.example.ac.jp"
            />
            <SelectField
              control={control}
              name="briefFileId"
              label="Fact sheet"
              options={files}
              emptyLabel="None attached"
            />
          </div>
          <SwitchField
            control={control}
            name="active"
            label="Show in the directory"
            description="Turn off when the agreement lapses; its testimonials stay published."
          />
        </CardContent>
      </Card>

      <FormActions
        submitting={formState.isSubmitting}
        onCancel={() => router.push(SCHOOLS_PATH)}
        submitLabel={isEdit ? "Save changes" : "Add school"}
      />
    </form>
  );
}
