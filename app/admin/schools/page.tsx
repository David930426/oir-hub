import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { hasRole, writerRoles } from "@/dal";
import { listPartnerSchools } from "@/lib/repositories/school.repository";
import type { PartnerSchoolRow } from "./school-columns";
import { SchoolsTable } from "./schools-table";

export default async function AdminSchoolsPage() {
  const [canWrite, records] = await Promise.all([
    hasRole(writerRoles),
    listPartnerSchools(),
  ]);

  const schools: PartnerSchoolRow[] = records.map((record) => ({
    id: record.id,
    nameZh: record.nameZh,
    nameEn: record.nameEn,
    country: record.country,
    region: record.region,
    programName: record.programName,
    quota: record.quota,
    gpaMin: record.gpaMin,
    englishTaught: record.englishTaught,
    housingProvided: record.housingProvided,
    active: record.active,
    usage: record.testimonialCount,
  }));

  // Only the live agreements are places a student can actually be sent to.
  const totalQuota = schools
    .filter((school) => school.active)
    .reduce((sum, school) => sum + school.quota, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Partner schools"
        description={`${schools.length} agreements on file · ${totalQuota} places per term across active schools. Quota, GPA, and language thresholds are what students filter by on the site.`}
      >
        {canWrite && (
          <Button asChild>
            <Link href="/admin/schools/create">
              <Plus className="size-4" />
              New partner school
            </Link>
          </Button>
        )}
      </PageHeader>

      <SchoolsTable schools={schools} canWrite={canWrite} />
    </div>
  );
}
