"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { STAFF_ROLES } from "@/constant";
import { updateStaffUserAction } from "@/lib/actions/user.action";
import { locales } from "@/lib/i18n";
import { userRoleMeta } from "@/lib/mock/labels";
import {
  updateStaffUserSchema,
  type UpdateStaffUserInput,
} from "@/lib/validator/user.validator";
import { RoleLegend } from "../../role-legend";

/**
 * The email is shown read-only: it is the login identity, so changing it is not
 * something to do while fixing a typo in a name. Role and status are locked on
 * your own account — the server refuses those edits anyway, and disabling the
 * controls explains why before someone tries.
 */
export function EditUserForm({
  user,
  isSelf,
}: {
  user: Omit<UpdateStaffUserInput, "name"> & { name: string; email: string };
  isSelf: boolean;
}) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateStaffUserInput>({
    resolver: zodResolver(updateStaffUserSchema),
    defaultValues: {
      id: user.id,
      name: user.name,
      role: user.role,
      locale: user.locale,
      active: user.active,
    },
  });

  const onSubmit = async (data: UpdateStaffUserInput) => {
    const result = await updateStaffUserAction(data);

    if (!result.success) {
      toast.error("Could not save the account", { description: result.message });
      return;
    }

    toast.success("Account updated", { description: result.message });
    router.push("/admin/users");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <input type="hidden" {...register("id")} />

      {isSelf && (
        <Alert>
          <AlertDescription>
            This is your own account. Your role and status are locked so you
            cannot lock yourself out of the console.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup className="gap-4">
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="name">Full name</FieldLabel>
              <Input
                id="name"
                aria-invalid={!!errors.name}
                {...register("name")}
              />
              {errors.name && <FieldError>{errors.name.message}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="email">School email</FieldLabel>
              <Input id="email" value={user.email} readOnly disabled />
              <FieldDescription>
                The login identity — it cannot be changed here.
              </FieldDescription>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor="role">Role</FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSelf}
                    >
                      <SelectTrigger id="role" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STAFF_ROLES.map((role) => (
                          <SelectItem key={role} value={role}>
                            {userRoleMeta[role].label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="locale"
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor="locale">Console language</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="locale" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {locales.map((locale) => (
                          <SelectItem key={locale.value} value={locale.value}>
                            {locale.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
            </div>

            <RoleLegend />
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Access</CardTitle>
        </CardHeader>
        <CardContent>
          <Controller
            control={control}
            name="active"
            render={({ field }) => (
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <FieldLabel htmlFor="active">Active</FieldLabel>
                  <FieldDescription>
                    Turning this off signs the account out everywhere and blocks
                    further logins. Their content and history stay in place.
                  </FieldDescription>
                </div>
                <Switch
                  id="active"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isSelf}
                />
              </div>
            )}
          />
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/users")}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Save changes
        </Button>
      </div>
    </form>
  );
}
