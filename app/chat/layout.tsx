import { SiteHeader } from "@/components/site/site-header";
import { getSession, isStaffRole } from "@/dal";

export default async function ChatLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // The assistant itself is anonymous, but the header still offers staff a way
  // back into the console.
  const session = await getSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const staff = session && isStaffRole(role) ? { name: session.user.name } : null;

  return (
    <div className="flex h-screen flex-col">
      <SiteHeader staff={staff} />
      <main className="min-h-0 flex-1">{children}</main>
    </div>
  );
}
