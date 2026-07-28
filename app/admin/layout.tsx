import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { requireStaff } from "@/dal";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Gate the whole console here: anonymous visitors are redirected to the staff
  // login and never reach any page nested under /admin.
  const session = await requireStaff();
  const role = (session.user as { role?: string }).role ?? "viewer";

  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSidebar user={{ name: session.user.name, role }} />
      <main className="min-w-0 flex-1 px-6 py-8 lg:px-10">{children}</main>
    </div>
  );
}
