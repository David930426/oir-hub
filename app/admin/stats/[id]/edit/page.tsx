import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { requireWriter } from "@/dal";
import { findSiteStatById } from "@/lib/repositories/stats.repository";
import { StatForm } from "../../stat-form";

export default async function AdminEditStatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireWriter();

  const { id } = await params;
  const stat = await findSiteStatById(id);
  if (!stat) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link href="/admin/stats">
            <ArrowLeft className="size-4" />
            All figures
          </Link>
        </Button>
        <PageHeader
          title={stat.labelZh}
          description="This number appears on the homepage, so correct it as soon as the annual report changes."
        />
      </div>

      <StatForm
        stat={{
          id: stat.id,
          academicYear: stat.academicYear,
          metricKey: stat.metricKey,
          labelZh: stat.labelZh,
          labelEn: stat.labelEn ?? "",
          value: stat.value,
          unitZh: stat.unitZh ?? "",
          unitEn: stat.unitEn ?? "",
        }}
      />
    </div>
  );
}
