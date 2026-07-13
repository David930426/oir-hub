"use client";

import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
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

const registerSchema = z
  .object({
    name: z.string().min(2, "Please enter your full name."),
    studentId: z
      .string()
      .regex(/^[a-zA-Z]?\d{7,9}$/, "Please enter a valid student ID (e.g. s10712345)."),
    major: z.string().min(2, "Please enter your major or department."),
    email: z.string().email("Please enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
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

  // Static design only — registration is not wired yet.
  const onSubmit = (data: RegisterForm) => {
    console.log("register (static demo):", data.email);
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Image
            src="/logo.png"
            alt="Tunghai University seal"
            width={71}
            height={74}
            className="mx-auto mb-4 h-14 w-auto"
          />
          <h1 className="text-2xl font-bold tracking-tight">Create a student account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Keep your chat history and get a faster contact experience.
          </p>
        </div>

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

                <Button type="submit" className="w-full">
                  <UserPlus className="size-4" />
                  Create account
                </Button>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>

        <Alert>
          <AlertDescription className="text-xs">
            By signing up you agree that your questions to the AI assistant may
            be reviewed by OIR staff to improve answer quality.
          </AlertDescription>
        </Alert>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary underline-offset-2 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
