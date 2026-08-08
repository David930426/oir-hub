import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { requireWriter } from "@/dal";
import { findProgramById } from "@/lib/repositories/program.repository";
import { ProgramForm } from "../../program-form";

export default async function AdminEditProgramPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireWriter();

  const { id } = await params;
  const program = await findProgramById(id);
  if (!program) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link href="/admin/programs">
            <ArrowLeft className="size-4" />
            All programs
          </Link>
        </Button>
        <PageHeader
          title={program.nameZh}
          description="Changes appear on the public program page as soon as they are saved."
        />
      </div>

      <ProgramForm
        program={{
          id: program.id,
          slug: program.slug,
          type: program.type,
          nameZh: program.nameZh,
          // The columns are nullable; the form works in empty strings and the
          // action turns them back into NULL.
          nameEn: program.nameEn ?? "",
          overviewZh: program.overviewZh,
          overviewEn: program.overviewEn ?? "",
          active: program.active,
          sortOrder: program.sortOrder,
        }}
      />
    </div>
  );
}
