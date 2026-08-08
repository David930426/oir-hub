import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { requireWriter } from "@/dal";
import { listReplaceableMediaFiles } from "@/lib/repositories/media.repository";
import { listActivePrograms } from "@/lib/repositories/program.repository";
import { SchoolForm } from "../school-form";

export default async function AdminCreateSchoolPage() {
  await requireWriter();

  const [programs, files] = await Promise.all([
    listActivePrograms(),
    listReplaceableMediaFiles(),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link href="/admin/schools">
            <ArrowLeft className="size-4" />
            All partner schools
          </Link>
        </Button>
        <PageHeader
          title="New partner school"
          description="The thresholds you set here are what students filter by, so enter them exactly as the agreement states them."
        />
      </div>

      <SchoolForm
        programs={programs.map((program) => ({
          value: program.id,
          label: program.nameZh,
        }))}
        files={files.map((file) => ({
          value: file.id,
          label: `${file.filename} (v${file.version})`,
        }))}
      />
    </div>
  );
}
