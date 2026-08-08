"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FormActions, NumberField, TextField } from "@/components/admin/form-fields";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createSiteStatAction,
  updateSiteStatAction,
} from "@/lib/actions/stats.action";
import {
  createSiteStatSchema,
  updateSiteStatSchema,
  type CreateSiteStatInput,
  type UpdateSiteStatInput,
} from "@/lib/validator/stats.validator";

const STATS_PATH = "/admin/stats";

const EMPTY_STAT: CreateSiteStatInput = {
  academicYear: "",
  metricKey: "",
  labelZh: "",
  labelEn: "",
  value: 0,
  unitZh: "",
  unitEn: "",
};

export function StatForm({ stat }: { stat?: UpdateSiteStatInput }) {
  const router = useRouter();
  const isEdit = Boolean(stat);

  const { control, handleSubmit, formState } = useForm<CreateSiteStatInput>({
    resolver: zodResolver(isEdit ? updateSiteStatSchema : createSiteStatSchema),
    defaultValues: stat ?? EMPTY_STAT,
  });

  const onSubmit = async (data: CreateSiteStatInput) => {
    const result = stat
      ? await updateSiteStatAction({ ...data, id: stat.id })
      : await createSiteStatAction(data);

    if (!result.success) {
      toast.error(isEdit ? "Could not save the figure" : "Could not add it", {
        description: result.message,
      });
      return;
    }

    toast.success(isEdit ? "Figure updated" : "Figure added", {
      description: result.message,
    });
    router.push(STATS_PATH);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">The figure</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <TextField
              control={control}
              name="academicYear"
              label="Academic year"
              required
              placeholder="115"
            />
            <TextField
              control={control}
              name="metricKey"
              label="Metric key"
              required
              mono
              placeholder="outbound_count"
              description="Identifies the figure across years."
            />
            <NumberField
              control={control}
              name="value"
              label="Value"
              required
              step={0.1}
            />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <TextField
              control={control}
              name="labelZh"
              label="標籤"
              required
              placeholder="例如：出國交換人數"
            />
            <TextField
              control={control}
              name="labelEn"
              label="English label"
              placeholder="Students who went abroad"
            />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <TextField
              control={control}
              name="unitZh"
              label="單位"
              placeholder="例如：人"
            />
            <TextField
              control={control}
              name="unitEn"
              label="English unit"
              placeholder="students"
            />
          </div>
        </CardContent>
      </Card>

      <FormActions
        submitting={formState.isSubmitting}
        onCancel={() => router.push(STATS_PATH)}
        submitLabel={isEdit ? "Save changes" : "Add figure"}
      />
    </form>
  );
}
