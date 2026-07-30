import Link from "next/link";
import { ShieldAlert, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/dal";
import { listStaffUsers } from "@/lib/repositories/user.repository";
import { formatDay, formatMinute } from "@/lib/utils";
import type { StaffUserRow } from "./columns";
import { UsersTable } from "./users-table";

export default async function AdminUsersPage() {
  // The layout already gates this route; the session is read again here because
  // the table needs to know which row is the signed-in admin.
  const session = await requireAdmin();
  const records = await listStaffUsers();

  // Dates are formatted server-side so the markup the browser receives matches
  // what it renders (see formatDay in lib/utils.ts).
  const users: StaffUserRow[] = records.map((record) => ({
    id: record.id,
    name: record.name,
    email: record.email,
    role: record.role,
    locale: record.locale,
    active: record.active,
    createdAt: formatDay(record.createdAt),
    lastLoginAt: record.lastLoginAt ? formatMinute(record.lastLoginAt) : null,
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Users"
        description="Accounts exist for OIR staff only. Students use the site and the assistant anonymously — there is no public sign-up."
      >
        <Button asChild>
          <Link href="/admin/users/create">
            <UserPlus className="size-4" />
            Create staff account
          </Link>
        </Button>
      </PageHeader>

      <Alert>
        <ShieldAlert className="size-4" />
        <AlertDescription>
          This page is visible to the admin role only. Editors and viewers cannot
          manage accounts.
        </AlertDescription>
      </Alert>

      <UsersTable users={users} currentUserId={session.user.id} />
    </div>
  );
}
