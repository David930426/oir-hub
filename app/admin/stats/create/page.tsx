import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { requireWriter } from "@/dal";
import { StatForm } from "../stat-form";

export default async function AdminCreateStatPage() {
  await requireWriter();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link href="/admin/stats">
            <ArrowLeft className="size-4" />
            All figures
          </Link>
        </Button>
        <PageHeader
          title="New figure"
          description="Reuse the same metric key across years — that is what lets the homepage compare them."
        />
      </div>

      <StatForm />
    </div>
  );
}
