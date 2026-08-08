import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { hasRole, writerRoles } from "@/dal";
import { listTcornerSlots } from "@/lib/repositories/tcorner.repository";
import type { SlotRow } from "./slot-columns";
import { SlotsTable } from "./slots-table";

export default async function AdminTcornerPage() {
  const [canWrite, records] = await Promise.all([
    hasRole(writerRoles),
    listTcornerSlots(),
  ]);

  const slots: SlotRow[] = records.map((record) => ({
    id: record.id,
    weekday: record.weekday,
    startTime: record.startTime,
    endTime: record.endTime,
    location: record.location,
    advisorName: record.advisorName,
    hostName: record.hostName,
    topics: record.topics,
    bookingRequired: record.bookingRequired,
    active: record.active,
  }));

  const activeCount = slots.filter((slot) => slot.active).length;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="T-Corner slots"
        description={`Weekly walk-in advising hours shown on the public schedule. ${activeCount} of ${slots.length} slots are currently visible.`}
      >
        {canWrite && (
          <Button asChild>
            <Link href="/admin/t-corner/create">
              <Plus className="size-4" />
              New slot
            </Link>
          </Button>
        )}
      </PageHeader>

      <SlotsTable slots={slots} canWrite={canWrite} />
    </div>
  );
}
