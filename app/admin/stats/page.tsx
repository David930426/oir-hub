import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { hasRole, writerRoles } from "@/dal";
import { listSiteStats } from "@/lib/repositories/stats.repository";
import { formatMinute } from "@/lib/utils";
import type { StatRow } from "./stat-columns";
import { StatsTable } from "./stats-table";

export default async function AdminStatsPage() {
  const [canWrite, records] = await Promise.all([
    hasRole(writerRoles),
    listSiteStats(),
  ]);

  const stats: StatRow[] = records.map((record) => ({
    id: record.id,
    academicYear: record.academicYear,
    metricKey: record.metricKey,
    labelZh: record.labelZh,
    labelEn: record.labelEn,
    value: record.value,
    unitZh: record.unitZh,
    updatedBy: record.updatedBy,
    updatedAt: formatMinute(record.updatedAt),
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Site stats"
        description="The numbers shown on the public homepage. They are entered by hand each year rather than computed, so update them when the annual report is finalised."
      >
        {canWrite && (
          <Button asChild>
            <Link href="/admin/stats/create">
              <Plus className="size-4" />
              New figure
            </Link>
          </Button>
        )}
      </PageHeader>

      <StatsTable stats={stats} canWrite={canWrite} />
    </div>
  );
}
