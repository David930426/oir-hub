import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { requireWriter } from "@/dal";
import { findBulletinById } from "@/lib/repositories/bulletin.repository";
import { listReplaceableMediaFiles } from "@/lib/repositories/media.repository";
import { listActivePrograms } from "@/lib/repositories/program.repository";
import type { TermValue } from "@/lib/validator/bulletin.validator";
import { BulletinForm } from "../../bulletin-form";

export default async function AdminEditBulletinPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireWriter();

  const { id } = await params;
  const [bulletin, programs, files] = await Promise.all([
    findBulletinById(id),
    listActivePrograms(),
    listReplaceableMediaFiles(),
  ]);

  if (!bulletin) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link href="/admin/bulletins">
            <ArrowLeft className="size-4" />
            All bulletins
          </Link>
        </Button>
        <PageHeader
          title={bulletin.titleZh}
          description="Changing the deadline changes the countdown students see immediately."
        />
      </div>

      <BulletinForm
        bulletin={{
          id: bulletin.id,
          programId: bulletin.programId,
          academicYear: bulletin.academicYear,
          term: bulletin.term as TermValue,
          titleZh: bulletin.titleZh,
          titleEn: bulletin.titleEn ?? "",
          region: bulletin.region,
          pdfFileId: bulletin.pdfFileId ?? "",
          announcedAt: bulletin.announcedAt,
          deadlineAt: bulletin.deadlineAt,
          status: bulletin.status,
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
