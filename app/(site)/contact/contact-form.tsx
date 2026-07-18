"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { ContactInput, contactSchema } from "@/lib/validator/contact.validator";

export function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", studentId: "", major: "", email: "", question: "" },
  });

  // Static design only — submission is not wired to a backend yet.
  const onSubmit = (data: ContactInput) => {
    toast.success("Question submitted", {
      description: `We'll reply to ${data.email} within 3 working days.`,
    });
  };

  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle>Send us a question</CardTitle>
        <CardDescription>
          Fields marked * are required. Please use your school email if you
          have one.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="name">Full name *</FieldLabel>
                <Input
                  id="name"
                  placeholder="e.g. Liu Yu-Chen"
                  aria-invalid={!!errors.name}
                  {...register("name")}
                />
                {errors.name && <FieldError>{errors.name.message}</FieldError>}
              </Field>

              <Field data-invalid={!!errors.studentId}>
                <FieldLabel htmlFor="studentId">Student ID *</FieldLabel>
                <Input
                  id="studentId"
                  placeholder="e.g. s10712345"
                  aria-invalid={!!errors.studentId}
                  {...register("studentId")}
                />
                {errors.studentId && (
                  <FieldError>{errors.studentId.message}</FieldError>
                )}
              </Field>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <Field data-invalid={!!errors.major}>
                <FieldLabel htmlFor="major">Major / Department *</FieldLabel>
                <Input
                  id="major"
                  placeholder="e.g. International Business"
                  aria-invalid={!!errors.major}
                  {...register("major")}
                />
                {errors.major && <FieldError>{errors.major.message}</FieldError>}
              </Field>

              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="email">Email *</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@thu.edu.tw"
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />
                {errors.email && <FieldError>{errors.email.message}</FieldError>}
              </Field>
            </div>

            <Field data-invalid={!!errors.question}>
              <FieldLabel htmlFor="question">Your question *</FieldLabel>
              <Textarea
                id="question"
                rows={6}
                placeholder="Describe your question — include the school or program you're asking about so we can route it to the right staff."
                aria-invalid={!!errors.question}
                {...register("question")}
              />
              <FieldDescription>
                Please don&apos;t include passwords or ID card numbers.
              </FieldDescription>
              {errors.question && (
                <FieldError>{errors.question.message}</FieldError>
              )}
            </Field>

            <Button type="submit" size="lg" className="w-full sm:w-auto">
              <Send className="size-4" />
              Submit question
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
