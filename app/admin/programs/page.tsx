import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { hasRole, writerRoles } from "@/dal";
import { listPrograms } from "@/lib/repositories/program.repository";
import type { ProgramRow } from "./program-columns";
import { ProgramsTable } from "./programs-table";

/**
 * Programs, read from the database.
 *
 * Viewers may open this screen but not change it, so the create button and row
 * menus are hidden for them — `requireWriter()` in the actions is what actually
 * enforces that.
 */
export default async function AdminProgramsPage() {
  const [canWrite, records] = await Promise.all([
    hasRole(writerRoles),
    listPrograms(),
  ]);

  const programs: ProgramRow[] = records.map((record) => ({
    id: record.id,
    slug: record.slug,
    type: record.type,
    nameZh: record.nameZh,
    nameEn: record.nameEn,
    active: record.active,
    sortOrder: record.sortOrder,
    usage: record.bulletinCount + record.schoolCount,
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Programs"
        description="The top-level offering every bulletin, partner school, and funding row hangs off. Deactivating a program hides it from the site without deleting its history."
      >
        {canWrite && (
          <Button asChild>
            <Link href="/admin/programs/create">
              <Plus className="size-4" />
              New program
            </Link>
          </Button>
        )}
      </PageHeader>

      <ProgramsTable programs={programs} canWrite={canWrite} />
    </div>
  );
}
