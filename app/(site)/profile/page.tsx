"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { KeyRound, Save } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

const profileSchema = z.object({
  name: z.string().min(2, "Please enter your full name."),
  studentId: z.string(),
  major: z.string().min(2, "Please enter your major or department."),
  email: z.string().email("Please enter a valid email address."),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "Liu Yu-Chen",
      studentId: "s10712345",
      major: "International Business",
      email: "s10712345@thu.edu.tw",
    },
  });

  // Static design only — saving is not wired yet.
  const onSubmit = (data: ProfileForm) => {
    console.log("profile (static demo):", data);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center gap-4">
        <Avatar className="size-16">
          <AvatarFallback className="bg-primary text-lg font-semibold text-primary-foreground">
            LY
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Liu Yu-Chen</h1>
            <Badge variant="secondary">Student</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Member since February 2026 · Last login today 09:15
          </p>
        </div>
      </div>

      <div className="space-y-6">
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

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="email-notify" className="text-sm">
                  Email me new announcements
                </Label>
                <p className="text-xs text-muted-foreground">
                  Get an email when the OIR publishes a new announcement.
                </p>
              </div>
              <Switch id="email-notify" defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="save-history" className="text-sm">
                  Save my chat history
                </Label>
                <p className="text-xs text-muted-foreground">
                  Keep AI assistant conversations linked to your account.
                </p>
              </div>
              <Switch id="save-history" defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Security</CardTitle>
            <CardDescription>
              Change your password regularly to keep your account safe.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">
              <KeyRound className="size-4" />
              Change password
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
