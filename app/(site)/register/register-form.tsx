"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { registerAction } from "@/lib/actions/register.action";

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
import { RegisterInput, registerSchema } from "@/lib/validator/register.validator";

export function RegisterForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      studentId: "",
      major: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    const result = await registerAction(data);

    if (!result.success) {
      toast.error("Registration failed", { description: result.message });
      return;
    }

    toast.success("Account created", {
      description: `Welcome, ${data.name}!`,
    });
    router.push("/");
    router.refresh();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Sign up</CardTitle>
        <CardDescription>
          Student sign-up only. Staff accounts are created by the
          administrator — contact the OIR if you are staff.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup className="gap-5">
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="name">Full name</FieldLabel>
              <Input
                id="name"
                placeholder="e.g. Liu Yu-Chen"
                aria-invalid={!!errors.name}
                {...register("name")}
              />
              {errors.name && <FieldError>{errors.name.message}</FieldError>}
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field data-invalid={!!errors.studentId}>
                <FieldLabel htmlFor="studentId">Student ID</FieldLabel>
                <Input
                  id="studentId"
                  placeholder="s10712345"
                  aria-invalid={!!errors.studentId}
                  {...register("studentId")}
                />
                {errors.studentId && (
                  <FieldError>{errors.studentId.message}</FieldError>
                )}
              </Field>

              <Field data-invalid={!!errors.major}>
                <FieldLabel htmlFor="major">Major</FieldLabel>
                <Input
                  id="major"
                  placeholder="International Business"
                  aria-invalid={!!errors.major}
                  {...register("major")}
                />
                {errors.major && <FieldError>{errors.major.message}</FieldError>}
              </Field>
            </div>

            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email">School email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="s10712345@thu.edu.tw"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              <FieldDescription>
                We recommend your school email so we can verify your student status.
              </FieldDescription>
              {errors.email && <FieldError>{errors.email.message}</FieldError>}
            </Field>

            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              {errors.password && (
                <FieldError>{errors.password.message}</FieldError>
              )}
            </Field>

            <Field data-invalid={!!errors.confirmPassword}>
              <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repeat your password"
                aria-invalid={!!errors.confirmPassword}
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <FieldError>{errors.confirmPassword.message}</FieldError>
              )}
            </Field>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <UserPlus className="size-4" />
              )}
              Create account
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
