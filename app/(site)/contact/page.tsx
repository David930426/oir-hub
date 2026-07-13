"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Clock, Mail, MapPin, Phone, Send, UserRound } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

const contactSchema = z.object({
  name: z.string().min(2, "Please enter your full name."),
  studentId: z
    .string()
    .regex(/^[a-zA-Z]?\d{7,9}$/, "Please enter a valid student ID (e.g. s10712345)."),
  major: z.string().min(2, "Please enter your major or department."),
  email: z.string().email("Please enter a valid email address."),
  question: z
    .string()
    .min(20, "Please describe your question in at least 20 characters."),
});

type ContactForm = z.infer<typeof contactSchema>;

const officeContacts = [
  {
    name: "Ms. Chen Yi-Ling",
    duty: "Exchange programs · U.S. & Europe partners",
    email: "ylchen@thu.edu.tw",
    ext: "ext. 22311",
  },
  {
    name: "Mr. Huang Wei-Ting",
    duty: "Scholarships · Japan & Korea partners",
    email: "wthuang@thu.edu.tw",
    ext: "ext. 22312",
  },
  {
    name: "Ms. Lin Hsiao-Mei",
    duty: "Housing, insurance & pre-departure",
    email: "hmlin@thu.edu.tw",
    ext: "ext. 22313",
  },
];

export default function ContactPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", studentId: "", major: "", email: "", question: "" },
  });

  // Static design only — submission is not wired to a backend yet.
  const onSubmit = (data: ContactForm) => {
    console.log("contact form (static demo):", data);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Contact the OIR</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Can&apos;t find the answer in the knowledge base? Send us your question
          and the staff in charge will reply to your email within 3 working days.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Form */}
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

        {/* Office info */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Visit or call us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="flex items-start gap-2.5 text-muted-foreground">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                International Building 3F, No. 1727, Sec. 4, Taiwan Blvd.,
                Xitun District, Taichung 407224
              </p>
              <p className="flex items-center gap-2.5 text-muted-foreground">
                <Phone className="size-4 shrink-0 text-primary" />
                (04) 2359-0121 ext. 22310
              </p>
              <p className="flex items-center gap-2.5 text-muted-foreground">
                <Mail className="size-4 shrink-0 text-primary" />
                oir@thu.edu.tw
              </p>
              <Separator />
              <div className="flex items-start gap-2.5 text-muted-foreground">
                <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Office hours</p>
                  <p>Mon–Fri 09:00–16:00</p>
                  <p>Closed 12:00–13:00 (lunch)</p>
                  <p className="mt-1 text-xs">
                    Summer schedule applies July–August.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Who to contact</CardTitle>
              <CardDescription>
                Staff in charge by topic — email them directly for urgent matters.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {officeContacts.map((c) => (
                <div key={c.name} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <UserRound className="size-4" />
                  </span>
                  <div className="text-sm">
                    <p className="font-medium">{c.name}</p>
                    <p className="text-muted-foreground">{c.duty}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.email} · {c.ext}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
