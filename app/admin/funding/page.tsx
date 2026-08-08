import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { hasRole, writerRoles } from "@/dal";
import { listFundings } from "@/lib/repositories/funding.repository";
import type { FundingRow } from "./funding-columns";
import { FundingTable } from "./funding-table";

export default async function AdminFundingPage() {
  const [canWrite, records] = await Promise.all([
    hasRole(writerRoles),
    listFundings(),
  ]);

  const fundings: FundingRow[] = records.map((record) => ({
    id: record.id,
    nameZh: record.nameZh,
    nameEn: record.nameEn,
    source: record.source,
    programName: record.programName,
    amountMax: record.amountMax,
    applyMonths: record.applyMonths,
    status: record.status,
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Funding"
        description="Grants and scholarships. A funding row without a program applies to any student — use that for external awards like Fulbright."
      >
        {canWrite && (
          <Button asChild>
            <Link href="/admin/funding/create">
              <Plus className="size-4" />
              New funding call
            </Link>
          </Button>
        )}
      </PageHeader>

      <FundingTable fundings={fundings} canWrite={canWrite} />
    </div>
  );
}
