import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { getSession, isStaffRole } from "@/dal";

export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Anonymous visitors are the norm here, so this reads the session without
  // redirecting — it only decides whether the header offers "Staff login" or
  // a shortcut into the console.
  const session = await getSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const staff = session && isStaffRole(role) ? { name: session.user.name } : null;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader staff={staff} />
      <main className="flex-1">{children}</main>
      <SiteFooter staff={staff} />
    </div>
  );
}
