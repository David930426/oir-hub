import { redirect } from "next/navigation";

/**
 * The post editor lives at `/admin/posts/<id>/edit`, as every create/edit
 * screen in the console does. This route only exists so links written before
 * that convention — and anything a colleague has bookmarked — still land in the
 * right place.
 */
export default async function AdminPostRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/posts/${id}/edit`);
}
