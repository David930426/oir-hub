import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { hasRole, writerRoles } from "@/dal";
import { listBulletins } from "@/lib/repositories/bulletin.repository";
import type { BulletinRow } from "./bulletin-columns";
import { BulletinsTable } from "./bulletins-table";

export default async function AdminBulletinsPage() {
  const [canWrite, records] = await Promise.all([
    hasRole(writerRoles),
    listBulletins(),
  ]);

  // `announcedAt` and `deadlineAt` are Postgres `date` columns, which Drizzle
  // reads as `YYYY-MM-DD` strings — already the form the table shows.
  const bulletins: BulletinRow[] = records.map((record) => ({
    id: record.id,
    titleZh: record.titleZh,
    titleEn: record.titleEn,
    programName: record.programName,
    academicYear: record.academicYear,
    term: record.term,
    region: record.region,
    hasPdf: Boolean(record.pdfFileId),
    pdfFilename: record.pdfFilename,
    announcedAt: record.announcedAt,
    deadlineAt: record.deadlineAt,
    status: record.status,
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Bulletins"
        description="Selection calls (簡章). Each one belongs to a program and a term, and carries the PDF that is legally binding for that round."
      >
        {canWrite && (
          <Button asChild>
            <Link href="/admin/bulletins/create">
              <Plus className="size-4" />
              New bulletin
            </Link>
          </Button>
        )}
      </PageHeader>

      <BulletinsTable bulletins={bulletins} canWrite={canWrite} />
    </div>
  );
}
