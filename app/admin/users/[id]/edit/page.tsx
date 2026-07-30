import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/dal";
import { findUserById } from "@/lib/repositories/user.repository";
import { formatDay } from "@/lib/utils";
import { EditUserForm } from "./edit-user-form";

/**
 * Edits one staff account. Admin-only access comes from
 * app/admin/users/layout.tsx, which wraps this route too; the session is read
 * again here because an admin editing their own row gets extra guard rails.
 */
export default async function AdminEditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireAdmin();
  const user = await findUserById(id);

  if (!user) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link href="/admin/users">
            <ArrowLeft className="size-4" />
            All users
          </Link>
        </Button>
        <PageHeader
          title="Edit staff account"
          description={`${user.email} · created ${formatDay(user.createdAt)}`}
        />
      </div>

      <EditUserForm
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          locale: user.locale === "en" ? "en" : "zh-TW",
          active: user.active,
        }}
        isSelf={user.id === session.user.id}
      />
    </div>
  );
}
