import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { requireWriter } from "@/dal";
import { listStaffUsers } from "@/lib/repositories/user.repository";
import { SlotForm } from "../slot-form";

export default async function AdminCreateSlotPage() {
  await requireWriter();

  // Only accounts that can still sign in are offered as hosts; the action
  // checks this again when the form is submitted.
  const hosts = (await listStaffUsers()).filter((staff) => staff.active);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link href="/admin/t-corner">
            <ArrowLeft className="size-4" />
            All slots
          </Link>
        </Button>
        <PageHeader
          title="New slot"
          description="A slot recurs every week, so the time is wall-clock rather than a date."
        />
      </div>

      <SlotForm
        hosts={hosts.map((host) => ({ value: host.id, label: host.name }))}
      />
    </div>
  );
}
