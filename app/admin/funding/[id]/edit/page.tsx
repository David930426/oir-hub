import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { requireWriter } from "@/dal";
import { findFundingById } from "@/lib/repositories/funding.repository";
import { listReplaceableMediaFiles } from "@/lib/repositories/media.repository";
import { listActivePrograms } from "@/lib/repositories/program.repository";
import { FundingForm } from "../../funding-form";

export default async function AdminEditFundingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireWriter();

  const { id } = await params;
  const [funding, programs, files] = await Promise.all([
    findFundingById(id),
    listActivePrograms(),
    listReplaceableMediaFiles(),
  ]);

  if (!funding) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link href="/admin/funding">
            <ArrowLeft className="size-4" />
            All funding
          </Link>
        </Button>
        <PageHeader
          title={funding.nameZh}
          description="Amounts and eligibility are quoted by students in their applications, so check them against this year's call."
        />
      </div>

      <FundingForm
        funding={{
          id: funding.id,
          programId: funding.programId ?? "",
          nameZh: funding.nameZh,
          nameEn: funding.nameEn ?? "",
          source: funding.source,
          eligibilityZh: funding.eligibilityZh,
          eligibilityEn: funding.eligibilityEn ?? "",
          amountMax: funding.amountMax,
          applyMonths: funding.applyMonths,
          requiredDocs: funding.requiredDocs,
          notesZh: funding.notesZh ?? "",
          notesEn: funding.notesEn ?? "",
          contactName: funding.contactName ?? "",
          contactEmail: funding.contactEmail ?? "",
          formFileId: funding.formFileId ?? "",
          status: funding.status,
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
