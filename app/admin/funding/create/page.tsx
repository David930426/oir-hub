import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { requireWriter } from "@/dal";
import { listReplaceableMediaFiles } from "@/lib/repositories/media.repository";
import { listActivePrograms } from "@/lib/repositories/program.repository";
import { FundingForm } from "../funding-form";

export default async function AdminCreateFundingPage() {
  await requireWriter();

  const [programs, files] = await Promise.all([
    listActivePrograms(),
    listReplaceableMediaFiles(),
  ]);

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
          title="New funding call"
          description="Leave the program open unless the award is tied to one — most Ministry schemes are not."
        />
      </div>

      <FundingForm
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
