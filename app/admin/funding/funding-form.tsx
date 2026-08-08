"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  CheckboxGroupField,
  FormActions,
  NumberField,
  SelectField,
  StringListField,
  TextAreaField,
  TextField,
  type SelectOption,
} from "@/components/admin/form-fields";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FUNDING_SOURCES,
  MAX_FUNDING_AMOUNT,
  MONTH_VALUES,
  OPEN_STATUSES,
} from "@/constant";
import {
  createFundingAction,
  updateFundingAction,
} from "@/lib/actions/funding.action";
import { fundingSourceMeta, fundingStatusMeta } from "@/lib/mock/labels";
import {
  createFundingSchema,
  updateFundingSchema,
  type CreateFundingInput,
  type UpdateFundingInput,
} from "@/lib/validator/funding.validator";

const FUNDING_PATH = "/admin/funding";

const sourceOptions = FUNDING_SOURCES.map((value) => ({
  value,
  label: fundingSourceMeta[value].label,
}));

const statusOptions = OPEN_STATUSES.map((value) => ({
  value,
  label: fundingStatusMeta[value].label,
}));

const monthOptions = MONTH_VALUES.map((month) => ({
  value: month,
  label: new Date(2000, month - 1, 1).toLocaleString("en", { month: "short" }),
}));

const EMPTY_FUNDING: CreateFundingInput = {
  programId: "",
  nameZh: "",
  nameEn: "",
  source: "moe",
  eligibilityZh: "",
  eligibilityEn: "",
  amountMax: 0,
  applyMonths: [],
  requiredDocs: [],
  notesZh: "",
  notesEn: "",
  contactName: "",
  contactEmail: "",
  formFileId: "",
  status: "open",
};

export function FundingForm({
  funding,
  programs,
  files,
}: {
  funding?: UpdateFundingInput;
  programs: SelectOption[];
  files: SelectOption[];
}) {
  const router = useRouter();
  const isEdit = Boolean(funding);

  const { control, handleSubmit, formState } = useForm<CreateFundingInput>({
    resolver: zodResolver(isEdit ? updateFundingSchema : createFundingSchema),
    defaultValues: funding ?? EMPTY_FUNDING,
  });

  const onSubmit = async (data: CreateFundingInput) => {
    const result = funding
      ? await updateFundingAction({ ...data, id: funding.id })
      : await createFundingAction(data);

    if (!result.success) {
      toast.error(isEdit ? "Could not save the funding call" : "Could not add it", {
        description: result.message,
      });
      return;
    }

    toast.success(isEdit ? "Funding updated" : "Funding added", {
      description: result.message,
    });
    router.push(FUNDING_PATH);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">The scheme</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <TextField
              control={control}
              name="nameZh"
              label="名稱"
              required
              placeholder="例如：學海飛颺"
            />
            <TextField
              control={control}
              name="nameEn"
              label="English name"
              placeholder="Falls back to 中文 when empty"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <SelectField
              control={control}
              name="source"
              label="Source"
              options={sourceOptions}
            />
            <SelectField
              control={control}
              name="programId"
              label="Program"
              options={programs}
              emptyLabel="Any program"
              description="Leave open for external awards."
            />
            <SelectField
              control={control}
              name="status"
              label="Status"
              options={statusOptions}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Who qualifies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <TextAreaField
              control={control}
              name="eligibilityZh"
              label="申請資格"
              required
              rows={6}
            />
            <TextAreaField
              control={control}
              name="eligibilityEn"
              label="English eligibility"
              rows={6}
              placeholder="Falls back to 中文 when empty"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField
              control={control}
              name="amountMax"
              label="Maximum amount (TWD)"
              max={MAX_FUNDING_AMOUNT}
              description="0 when the award has no published ceiling."
            />
            <StringListField
              control={control}
              name="requiredDocs"
              label="Required documents"
              placeholder="例如：成績單"
            />
          </div>
          <CheckboxGroupField
            control={control}
            name="applyMonths"
            label="Applications open in"
            options={monthOptions}
            description="The months the call opens each year."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notes and contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <TextAreaField control={control} name="notesZh" label="備註" rows={4} />
            <TextAreaField
              control={control}
              name="notesEn"
              label="English notes"
              rows={4}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <TextField control={control} name="contactName" label="Contact name" />
            <TextField
              control={control}
              name="contactEmail"
              label="Contact email"
              type="email"
            />
            <SelectField
              control={control}
              name="formFileId"
              label="Application form"
              options={files}
              emptyLabel="None attached"
            />
          </div>
        </CardContent>
      </Card>

      <FormActions
        submitting={formState.isSubmitting}
        onCancel={() => router.push(FUNDING_PATH)}
        submitLabel={isEdit ? "Save changes" : "Add funding"}
      />
    </form>
  );
}
