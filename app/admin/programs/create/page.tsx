import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { requireWriter } from "@/dal";
import { ProgramForm } from "../program-form";

export default async function AdminCreateProgramPage() {
  // /admin is gated for staff; creating content is a writer's job.
  await requireWriter();

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
          title="New program"
          description="Bulletins, partner schools and funding calls all hang off a program, so this is the row to create first."
        />
      </div>

      <ProgramForm />
    </div>
  );
}
