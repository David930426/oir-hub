import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { requireWriter } from "@/dal";
import { findTcornerSlotById } from "@/lib/repositories/tcorner.repository";
import { listStaffUsers } from "@/lib/repositories/user.repository";
import { weekdayMeta } from "@/lib/mock/labels";
import { SlotForm } from "../../slot-form";

export default async function AdminEditSlotPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireWriter();

  const { id } = await params;
  const [slot, staff] = await Promise.all([
    findTcornerSlotById(id),
    listStaffUsers(),
  ]);

  if (!slot) notFound();

  // The current host stays in the list even if their account has since been
  // deactivated, so the form can be saved without silently reassigning it.
  const hosts = staff.filter(
    (member) => member.active || member.id === slot.hostUserId,
  );

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
          title={`${weekdayMeta[slot.weekday].label} ${slot.startTime}`}
          description="Changes appear on the public schedule immediately."
        />
      </div>

      <SlotForm
        slot={{
          id: slot.id,
          weekday: slot.weekday,
          startTime: slot.startTime,
          endTime: slot.endTime,
          location: slot.location,
          advisorName: slot.advisorName,
          hostUserId: slot.hostUserId,
          topics: slot.topics,
          bookingRequired: slot.bookingRequired,
          bookingUrl: slot.bookingUrl ?? "",
          active: slot.active,
        }}
        hosts={hosts.map((host) => ({ value: host.id, label: host.name }))}
      />
    </div>
  );
}
