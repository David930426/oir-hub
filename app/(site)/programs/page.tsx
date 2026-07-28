"use client";

import Link from "next/link";
import { ArrowRight, Coins, FileStack, School } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EnumBadge } from "@/components/shared/enum-badge";
import { useLocale } from "@/components/site/locale-provider";
import {
  bulletinsForProgram,
  fundingsForProgram,
  programTypeMeta,
  programs,
  schoolsForProgram,
} from "@/lib/mock";

export default function ProgramsPage() {
  const { t } = useLocale();
  const active = programs
    .filter((p) => p.active)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Programs</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Every way to study or work abroad through Tunghai. Each program has
          its own selection bulletins, partner schools, and eligible funding —
          start here, then follow the links into the details.
        </p>
      </div>

      <div className="space-y-4">
        {active.map((program) => {
          const schools = schoolsForProgram(program.id).filter((s) => s.active);
          const calls = bulletinsForProgram(program.id);
          const open = calls.filter((c) => c.status === "open");
          const funding = fundingsForProgram(program.id);
          const totalQuota = schools.reduce((sum, s) => sum + s.quota, 0);

          return (
            <Card key={program.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="mb-2">
                      <EnumBadge value={program.type} meta={programTypeMeta} />
                    </div>
                    <CardTitle className="text-xl">{t(program.name)}</CardTitle>
                    <CardDescription className="mt-2 max-w-3xl leading-relaxed">
                      {t(program.overview)}
                    </CardDescription>
                  </div>
                  <Button asChild variant="outline" className="shrink-0">
                    <Link href={`/programs/${program.slug}`}>
                      Details
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-4 border-t pt-4 text-sm sm:grid-cols-4">
                  <div>
                    <dt className="flex items-center gap-1.5 text-muted-foreground">
                      <School className="size-3.5" />
                      Partner schools
                    </dt>
                    <dd className="mt-1 font-semibold tabular-nums">
                      {schools.length}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Total quota / term</dt>
                    <dd className="mt-1 font-semibold tabular-nums">
                      {totalQuota || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-1.5 text-muted-foreground">
                      <FileStack className="size-3.5" />
                      Open bulletins
                    </dt>
                    <dd className="mt-1 font-semibold tabular-nums">
                      {open.length}
                      {calls.length > open.length && (
                        <span className="ml-1 text-xs font-normal text-muted-foreground">
                          of {calls.length}
                        </span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-1.5 text-muted-foreground">
                      <Coins className="size-3.5" />
                      Linked funding
                    </dt>
                    <dd className="mt-1 font-semibold tabular-nums">
                      {funding.length || "—"}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
