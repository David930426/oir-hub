import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Bot,
  Building2,
  CalendarDays,
  FileText,
  GraduationCap,
  HeartPulse,
  Landmark,
  Megaphone,
  Plane,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { announcements, knowledgeCategories } from "@/lib/mock-data";
import { CategoryBadge } from "@/components/site/category-badge";

const categoryIcons = [Plane, Wallet, Building2, GraduationCap, FileText, HeartPulse];

export default function HomePage() {
  const latest = announcements.slice(0, 3);

  return (
    <>
      {/* Hero — Luce Memorial Chapel photo with the OIR logo navy (#1E3A4C) overlay */}
      <section className="relative overflow-hidden bg-[#1E3A4C] text-white">
        <Image
          src="/tunghai.jpg"
          alt="Luce Memorial Chapel, Tunghai University"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#132836]/95 via-[#1E3A4C]/85 to-[#1E3A4C]/40" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#132836]/60 to-transparent" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <div className="max-w-2xl space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
              <Landmark className="size-3.5" />
              Office of International Relations
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Your journey abroad starts with the right information
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
              OIR Hub gathers everything Taiwan students need to study overseas —
              verified guides on visas, scholarships, and exchange programs, plus
              official announcements so you never miss a deadline.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild size="lg" variant="secondary" className="font-semibold">
                <Link href="/knowledge">
                  <BookOpen className="size-4" />
                  Browse Knowledge Base
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/chat">
                  <Bot className="size-4" />
                  Ask the AI Assistant
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick links to categories */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Explore by category</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Verified information, organized the way you need it.
            </p>
          </div>
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/knowledge">
              View all
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {knowledgeCategories.map((cat, i) => {
            const Icon = categoryIcons[i % categoryIcons.length];
            return (
              <Link key={cat.slug} href="/knowledge" className="group">
                <Card className="h-full transition-all group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-md">
                  <CardHeader>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                        <Icon className="size-5" />
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {cat.count} articles
                      </span>
                    </div>
                    <CardTitle className="text-base">{cat.name}</CardTitle>
                    <CardDescription>{cat.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Latest announcements */}
      <section className="border-t bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                <Megaphone className="size-6 text-primary" />
                Latest announcements
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Official OIR news — deadlines, scholarships, and program updates.
              </p>
            </div>
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/announcements">
                View all
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {latest.map((a) => (
              <Link key={a.id} href={`/announcements/${a.id}`} className="group">
                <Card className="h-full transition-all group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-md">
                  <CardHeader>
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <CategoryBadge category={a.category} />
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarDays className="size-3.5" />
                        {a.publishedAt}
                      </span>
                    </div>
                    <CardTitle className="text-base leading-snug group-hover:text-primary">
                      {a.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-3">
                      {a.summary}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>

          <div className="mt-6 sm:hidden">
            <Button asChild variant="outline" className="w-full">
              <Link href="/announcements">View all announcements</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How it helps */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-8 text-center text-2xl font-bold tracking-tight">
          How OIR Hub helps you
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: BookOpen,
              title: "Correct information first",
              text: "Every guide is written and reviewed by OIR staff, filtered by school so you only see the requirements that apply to you.",
            },
            {
              icon: Megaphone,
              title: "Never miss a deadline",
              text: "Scholarship calls, application windows, and program news are published here first — with attachments you can download directly.",
            },
            {
              icon: Bot,
              title: "Answers any time",
              text: "The AI assistant answers from the official knowledge base 24/7, in English or Chinese — no appointment needed.",
            },
          ].map((f) => (
            <div key={f.title} className="text-center">
              <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <f.icon className="size-6" />
              </span>
              <h3 className="mb-2 font-semibold">{f.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
