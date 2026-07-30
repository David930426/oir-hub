import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { CreateUserForm } from "./create-user-form";

/**
 * Creating a staff account is a page rather than a dialog: it sets a role, a
 * console language and the first password, and the admin has to be able to read
 * the role legend while deciding.
 *
 * Admin-only access comes from app/admin/users/layout.tsx, which wraps this
 * route too.
 */
export default function AdminCreateUserPage() {
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
          title="Create staff account"
          description="The account is active straight away. No invitation email is sent yet, so give the colleague their password yourself."
        />
      </div>

      <CreateUserForm />
    </div>
  );
}
