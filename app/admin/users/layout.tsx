import { requireAdmin } from "@/dal";

/**
 * User management is the one console area editors and viewers may not open.
 * The sidebar already hides the link; this layout is what actually enforces it.
 */
export default async function AdminUsersLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireAdmin();
  return <>{children}</>;
}
