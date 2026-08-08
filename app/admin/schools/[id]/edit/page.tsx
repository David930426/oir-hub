import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { requireWriter } from "@/dal";
import { listReplaceableMediaFiles } from "@/lib/repositories/media.repository";
import { listActivePrograms } from "@/lib/repositories/program.repository";
import { findPartnerSchoolById } from "@/lib/repositories/school.repository";
import { SchoolForm } from "../../school-form";

export default async function AdminEditSchoolPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireWriter();

  const { id } = await params;
  const [school, programs, files] = await Promise.all([
    findPartnerSchoolById(id),
    listActivePrograms(),
    listReplaceableMediaFiles(),
  ]);

  if (!school) notFound();

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
          title={school.nameZh}
          description="Changes are live on the public directory as soon as they are saved."
        />
      </div>

      <SchoolForm
        school={{
          id: school.id,
          programId: school.programId,
          nameZh: school.nameZh,
          nameEn: school.nameEn ?? "",
          country: school.country,
          region: school.region,
          quota: school.quota,
          gpaMin: school.gpaMin,
          languageReq: school.languageReq,
          eligibleColleges: school.eligibleColleges,
          englishTaught: school.englishTaught,
          housingProvided: school.housingProvided,
          websiteUrl: school.websiteUrl ?? "",
          briefFileId: school.briefFileId ?? "",
          active: school.active,
        }}
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
