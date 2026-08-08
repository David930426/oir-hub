import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { requireWriter } from "@/dal";
import { listReplaceableMediaFiles } from "@/lib/repositories/media.repository";
import { listActivePrograms } from "@/lib/repositories/program.repository";
import { BulletinForm } from "../bulletin-form";

export default async function AdminCreateBulletinPage() {
  await requireWriter();

  const [programs, files] = await Promise.all([
    listActivePrograms(),
    listReplaceableMediaFiles(),
  ]);

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
          title="New bulletin"
          description="The deadline you enter here is what the site counts down to, so check it against the PDF before publishing."
        />
      </div>

      <BulletinForm
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
