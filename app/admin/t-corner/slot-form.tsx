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
  TextField,
  type SelectOption,
} from "@/components/admin/form-fields";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WEEKDAYS } from "@/constant";
import {
  createTcornerSlotAction,
  updateTcornerSlotAction,
} from "@/lib/actions/tcorner.action";
import { weekdayMeta } from "@/lib/mock/labels";
import {
  createTcornerSlotSchema,
  updateTcornerSlotSchema,
  type CreateTcornerSlotInput,
  type UpdateTcornerSlotInput,
} from "@/lib/validator/tcorner.validator";

const TCORNER_PATH = "/admin/t-corner";

const weekdayOptions = WEEKDAYS.map((value) => ({
  value,
  label: weekdayMeta[value].label,
}));

const EMPTY_SLOT: CreateTcornerSlotInput = {
  weekday: "mon",
  startTime: "12:10",
  endTime: "13:30",
  location: "",
  advisorName: "",
  hostUserId: "",
  topics: [],
  bookingRequired: false,
  bookingUrl: "",
  active: true,
};

export function SlotForm({
  slot,
  hosts,
}: {
  slot?: UpdateTcornerSlotInput;
  hosts: SelectOption[];
}) {
  const router = useRouter();
  const isEdit = Boolean(slot);

  const { control, handleSubmit, formState } = useForm<CreateTcornerSlotInput>({
    resolver: zodResolver(isEdit ? updateTcornerSlotSchema : createTcornerSlotSchema),
    defaultValues: slot ?? EMPTY_SLOT,
  });

  const onSubmit = async (data: CreateTcornerSlotInput) => {
    const result = slot
      ? await updateTcornerSlotAction({ ...data, id: slot.id })
      : await createTcornerSlotAction(data);

    if (!result.success) {
      toast.error(isEdit ? "Could not save the slot" : "Could not add it", {
        description: result.message,
      });
      return;
    }

    toast.success(isEdit ? "Slot updated" : "Slot added", {
      description: result.message,
    });
    router.push(TCORNER_PATH);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">When and where</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <SelectField
              control={control}
              name="weekday"
              label="Weekday"
              options={weekdayOptions}
            />
            <TextField
              control={control}
              name="startTime"
              label="Starts"
              required
              type="time"
            />
            <TextField
              control={control}
              name="endTime"
              label="Ends"
              required
              type="time"
            />
          </div>
          <TextField
            control={control}
            name="location"
            label="Location"
            required
            placeholder="例如：國際大樓 1F 交流角"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Who is advising</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              control={control}
              name="advisorName"
              label="Advisor shown on the site"
              required
              placeholder="例如：林顧問"
            />
            <SelectField
              control={control}
              name="hostUserId"
              label="Host account"
              required
              options={hosts}
              description="The staff member responsible for the session."
            />
          </div>
          <StringListField
            control={control}
            name="topics"
            label="Topics"
            placeholder="例如：交換申請"
            description="What a student may ask about. Leave empty for general advising."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Booking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SwitchField
            control={control}
            name="bookingRequired"
            label="Booking required"
            description="Turn on only when students genuinely cannot walk in."
          />
          <TextField
            control={control}
            name="bookingUrl"
            label="Booking link"
            placeholder="https://…"
            description="Required when booking is on."
          />
          <SwitchField
            control={control}
            name="active"
            label="Show on the public schedule"
          />
        </CardContent>
      </Card>

      <FormActions
        submitting={formState.isSubmitting}
        onCancel={() => router.push(TCORNER_PATH)}
        submitLabel={isEdit ? "Save changes" : "Add slot"}
      />
    </form>
  );
}
