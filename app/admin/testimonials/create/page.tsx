import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { requireWriter } from "@/dal";
import { listReplaceableMediaFiles } from "@/lib/repositories/media.repository";
import { listActivePartnerSchools } from "@/lib/repositories/school.repository";
import { TestimonialForm } from "../testimonial-form";

export default async function AdminCreateTestimonialPage() {
  await requireWriter();

  const [schools, files] = await Promise.all([
    listActivePartnerSchools(),
    listReplaceableMediaFiles(),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link href="/admin/testimonials">
            <ArrowLeft className="size-4" />
            All testimonials
          </Link>
        </Button>
        <PageHeader
          title="New report"
          description="Save it as a draft until the student has confirmed both the wording and their consent."
        />
      </div>

      <TestimonialForm
        schools={schools.map((school) => ({
          value: school.id,
          label: `${school.nameZh} · ${school.country}`,
        }))}
        files={files.map((file) => ({
          value: file.id,
          label: `${file.filename} (v${file.version})`,
        }))}
      />
    </div>
  );
}
