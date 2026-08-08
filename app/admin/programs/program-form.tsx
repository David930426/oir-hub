"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  FormActions,
  NumberField,
  SelectField,
  SwitchField,
  TextAreaField,
  TextField,
} from "@/components/admin/form-fields";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MAX_SORT_ORDER, PROGRAM_TYPES } from "@/constant";
import {
  createProgramAction,
  updateProgramAction,
} from "@/lib/actions/program.action";
import { programTypeMeta } from "@/lib/mock/labels";
import {
  createProgramSchema,
  updateProgramSchema,
  type CreateProgramInput,
  type UpdateProgramInput,
} from "@/lib/validator/program.validator";

const PROGRAMS_PATH = "/admin/programs";

const typeOptions = PROGRAM_TYPES.map((value) => ({
  value,
  label: programTypeMeta[value].label,
}));

/** Empty form, kept beside the screen that uses it as CLAUDE.md asks. */
const EMPTY_PROGRAM: CreateProgramInput = {
  slug: "",
  type: "exchange",
  nameZh: "",
  nameEn: "",
  overviewZh: "",
  overviewEn: "",
  active: true,
  sortOrder: 0,
};

/**
 * One form for both routes: creating a program and editing one differ only in
 * the id and the action they call.
 */
export function ProgramForm({ program }: { program?: UpdateProgramInput }) {
  const router = useRouter();
  const isEdit = Boolean(program);

  const { control, handleSubmit, formState } = useForm<CreateProgramInput>({
    resolver: zodResolver(isEdit ? updateProgramSchema : createProgramSchema),
    defaultValues: program ?? EMPTY_PROGRAM,
  });

  const onSubmit = async (data: CreateProgramInput) => {
    const result = program
      ? await updateProgramAction({ ...data, id: program.id })
      : await createProgramAction(data);

    if (!result.success) {
      toast.error(isEdit ? "Could not save the program" : "Could not create it", {
        description: result.message,
      });
      return;
    }

    toast.success(isEdit ? "Program updated" : "Program created", {
      description: result.message,
    });
    router.push(PROGRAMS_PATH);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Name</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          <TextField
            control={control}
            name="nameZh"
            label="名稱"
            required
            placeholder="例如：交換學生"
          />
          <TextField
            control={control}
            name="nameEn"
            label="English name"
            placeholder="Falls back to 中文 when empty"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          <TextAreaField
            control={control}
            name="overviewZh"
            label="說明"
            required
            rows={8}
            placeholder="這個計畫是什麼、適合什麼樣的學生"
          />
          <TextAreaField
            control={control}
            name="overviewEn"
            label="English overview"
            rows={8}
            placeholder="Falls back to 中文 when empty"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Placement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <TextField
              control={control}
              name="slug"
              label="Slug"
              mono
              placeholder="dual-degree"
              description="Used in the site URL."
            />
            <SelectField
              control={control}
              name="type"
              label="Type"
              options={typeOptions}
            />
            <NumberField
              control={control}
              name="sortOrder"
              label="Sort order"
              max={MAX_SORT_ORDER}
              description="Lowest first."
            />
          </div>
          <SwitchField
            control={control}
            name="active"
            label="Show on the site"
            description="Turn off to retire a program without deleting its bulletins and schools."
          />
        </CardContent>
      </Card>

      <FormActions
        submitting={formState.isSubmitting}
        onCancel={() => router.push(PROGRAMS_PATH)}
        submitLabel={isEdit ? "Save changes" : "Create program"}
      />
    </form>
  );
}
