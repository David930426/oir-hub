import { PageHeader } from "@/components/admin/page-header";
import { hasRole, isAdmin, writerRoles } from "@/dal";
import { listContactMessages } from "@/lib/repositories/contact.repository";
import { formatMinute, pluralize } from "@/lib/utils";
import type { ContactRow } from "./contact-columns";
import { ContactTable } from "./contact-table";

export default async function AdminContactPage() {
  const [canWrite, canDelete, records] = await Promise.all([
    hasRole(writerRoles),
    // Deleting an enquiry someone wrote by hand is an admin's call.
    isAdmin(),
    listContactMessages(),
  ]);

  const messages: ContactRow[] = records.map((record) => ({
    id: record.id,
    name: record.name,
    email: record.email,
    topic: record.topic,
    body: record.body,
    fromSessionId: record.fromSessionId,
    resolved: record.resolved,
    createdAt: formatMinute(record.createdAt),
  }));

  const unresolved = messages.filter((message) => !message.resolved).length;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Contact inbox"
        description={`Questions students and parents have sent the office. ${pluralize(
          unresolved,
          "message",
        )} still waiting for a reply.`}
      />

      <ContactTable
        messages={messages}
        canWrite={canWrite}
        canDelete={canDelete}
      />
    </div>
  );
}
