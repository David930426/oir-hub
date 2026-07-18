"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { ProfileInput, profileSchema } from "@/lib/validator/profile.validator";

export function ProfileForm({ profile }: { profile: ProfileInput }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: profile,
  });

  // Static design only — saving is not wired yet.
  const onSubmit = (data: ProfileInput) => {
    toast.success("Profile saved", {
      description: `Changes for ${data.name} have been saved.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Personal information</CardTitle>
        <CardDescription>
          This information is used when you submit questions through the
          contact form.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup className="gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="name">Full name</FieldLabel>
                <Input id="name" aria-invalid={!!errors.name} {...register("name")} />
                {errors.name && <FieldError>{errors.name.message}</FieldError>}
              </Field>

              <Field>
                <FieldLabel htmlFor="studentId">Student ID</FieldLabel>
                <Input id="studentId" disabled {...register("studentId")} />
                <FieldDescription>
                  Student ID cannot be changed.
                </FieldDescription>
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field data-invalid={!!errors.major}>
                <FieldLabel htmlFor="major">Major / Department</FieldLabel>
                <Input id="major" aria-invalid={!!errors.major} {...register("major")} />
                {errors.major && <FieldError>{errors.major.message}</FieldError>}
              </Field>

              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />
                {errors.email && <FieldError>{errors.email.message}</FieldError>}
              </Field>
            </div>

            <div>
              <Button type="submit">
                <Save className="size-4" />
                Save changes
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
