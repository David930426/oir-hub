"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { submitContactMessageAction } from "@/lib/actions/contact.action";
import { ContactInput, contactSchema } from "@/lib/validator/contact.validator";

/** Topics map to how the office routes an incoming message. */
const topics = [
  "Application process",
  "Partner schools",
  "Funding",
  "Credit transfer",
  "Visa",
  "Housing",
  "Parent enquiry",
  "New partnership",
  "Other",
];

export function ContactForm() {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", topic: "", body: "" },
  });

  /**
   * Files the message in the console's inbox.
   *
   * The action is deliberately open to anonymous visitors — a contact form that
   * needed an account would defeat its own purpose — so the validator's limits
   * are what stand in for a guard.
   */
  const onSubmit = async (data: ContactInput) => {
    const result = await submitContactMessageAction(data);

    if (!result.success) {
      toast.error("Could not send your message", { description: result.message });
      return;
    }

    toast.success("Message sent", { description: result.message });
    reset();
  };

  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle>Send us a message</CardTitle>
        <CardDescription>
          All fields are required. Use your school email if you have one — it
          helps us find your record faster.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="name">Your name</FieldLabel>
                <Input
                  id="name"
                  placeholder="e.g. Liu Yu-Chen"
                  aria-invalid={!!errors.name}
                  {...register("name")}
                />
                {errors.name && <FieldError>{errors.name.message}</FieldError>}
              </Field>

              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
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

            <Field data-invalid={!!errors.topic}>
              <FieldLabel htmlFor="topic">Topic</FieldLabel>
              <Controller
                control={control}
                name="topic"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="topic" className="w-full">
                      <SelectValue placeholder="What is this about?" />
                    </SelectTrigger>
                    <SelectContent>
                      {topics.map((topic) => (
                        <SelectItem key={topic} value={topic}>
                          {topic}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldDescription>
                The topic decides which staff member receives your message.
              </FieldDescription>
              {errors.topic && <FieldError>{errors.topic.message}</FieldError>}
            </Field>

            <Field data-invalid={!!errors.body}>
              <FieldLabel htmlFor="body">Your message</FieldLabel>
              <Textarea
                id="body"
                rows={7}
                placeholder="Include the school or program you're asking about, and the academic year if it matters."
                aria-invalid={!!errors.body}
                {...register("body")}
              />
              <FieldDescription>
                Please don&apos;t include passwords or ID card numbers.
              </FieldDescription>
              {errors.body && <FieldError>{errors.body.message}</FieldError>}
            </Field>

            <Button
              type="submit"
              size="lg"
              className="w-full sm:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              Send message
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
