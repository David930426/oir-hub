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
import type { Localized } from "@/lib/i18n";
import { programTypeMeta } from "@/lib/mock/labels";
import type { ProgramTypeValue } from "@/lib/validator/program.validator";

/** One program as the public list shows it, counts included. */
export type SiteProgram = {
  id: string;
  slug: string;
  type: ProgramTypeValue;
  name: Localized;
  overview: Localized;
  schoolCount: number;
  totalQuota: number;
  openBulletins: number;
  totalBulletins: number;
  fundingCount: number;
};

export function ProgramsView({ programs }: { programs: SiteProgram[] }) {
  const { t } = useLocale();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Programs</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Every way to study or work abroad through Tunghai. Each program has its
          own selection bulletins, partner schools, and eligible funding — start
          here, then follow the links into the details.
        </p>
      </div>

      <div className="space-y-4">
        {programs.map((program) => (
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
                    {program.schoolCount}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Total quota / term</dt>
                  <dd className="mt-1 font-semibold tabular-nums">
                    {program.totalQuota || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1.5 text-muted-foreground">
                    <FileStack className="size-3.5" />
                    Open bulletins
                  </dt>
                  <dd className="mt-1 font-semibold tabular-nums">
                    {program.openBulletins}
                    {program.totalBulletins > program.openBulletins && (
                      <span className="ml-1 text-xs font-normal text-muted-foreground">
                        of {program.totalBulletins}
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
                    {program.fundingCount || "—"}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        ))}
      </div>

      {programs.length === 0 && (
        <div className="rounded-lg border border-dashed py-16 text-center text-muted-foreground">
          <p className="font-medium">No programs are open at the moment.</p>
          <p className="mt-1 text-sm">
            Contact the office if you are looking for something specific.
          </p>
        </div>
      )}
    </div>
  );
}
