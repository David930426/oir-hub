"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  PASSWORD_MIN_LENGTH,
  SECRET_TOAST_DURATION_MS,
  STAFF_ROLES,
} from "@/constant";
import { createStaffUserAction } from "@/lib/actions/user.action";
import { locales } from "@/lib/i18n";
import { userRoleMeta } from "@/lib/mock/labels";
import { generatePassword } from "@/lib/utils";
import {
  createStaffUserSchema,
  type CreateStaffUserInput,
} from "@/lib/validator/user.validator";
import { RoleLegend } from "../role-legend";

export function CreateUserForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateStaffUserInput>({
    resolver: zodResolver(createStaffUserSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "editor",
      locale: "zh-TW",
      password: "",
    },
  });

  const onSubmit = async (data: CreateStaffUserInput) => {
    const result = await createStaffUserAction(data);

    if (!result.success) {
      toast.error("Could not create the account", { description: result.message });
      return;
    }

    // The password is only ever shown here — it is stored hashed, so an admin
    // who loses it has to reset it rather than look it up.
    toast.success("Staff account created", {
      description: `${result.message} Password: ${data.password}`,
      duration: SECRET_TOAST_DURATION_MS,
    });
    router.push("/admin/users");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
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
                placeholder="e.g. Wang Chih-Hao 王志豪"
                aria-invalid={!!errors.name}
                {...register("name")}
              />
              {errors.name && <FieldError>{errors.name.message}</FieldError>}
            </Field>

            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email">School email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="name@thu.edu.tw"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              {errors.email ? (
                <FieldError>{errors.email.message}</FieldError>
              ) : (
                <FieldDescription>
                  This is what they log in with, and it cannot be changed later.
                </FieldDescription>
              )}
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor="role">Role</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
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
          <CardTitle className="text-base">First password</CardTitle>
        </CardHeader>
        <CardContent>
          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <div className="flex gap-2">
              <Input
                id="password"
                placeholder={`At least ${PASSWORD_MIN_LENGTH} characters`}
                autoComplete="off"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setValue("password", generatePassword(), { shouldValidate: true })
                }
              >
                Generate
              </Button>
            </div>
            {errors.password ? (
              <FieldError>{errors.password.message}</FieldError>
            ) : (
              <FieldDescription>
                Shown once more after saving, then stored hashed. Ask them to
                change it after their first login.
              </FieldDescription>
            )}
          </Field>
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
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <UserPlus className="size-4" />
          )}
          Create account
        </Button>
      </div>
    </form>
  );
}
