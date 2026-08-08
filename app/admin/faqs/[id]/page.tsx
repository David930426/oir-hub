import { redirect } from "next/navigation";

/**
 * The FAQ editor lives at `/admin/faqs/<id>/edit`, as every create/edit screen
 * in the console does. This route keeps older links working.
 */
export default async function AdminFaqRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/faqs/${id}/edit`);
}
