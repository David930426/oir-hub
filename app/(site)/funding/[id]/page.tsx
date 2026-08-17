import { notFound } from "next/navigation";
import { findFundingById } from "@/lib/repositories/funding.repository";
import { formatDay } from "@/lib/utils";
import { FundingDetailView } from "./funding-detail-view";

export default async function FundingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const funding = await findFundingById(id);
  if (!funding) notFound();

  return (
    <FundingDetailView
      funding={{
        id: funding.id,
        name: { zh: funding.nameZh, en: funding.nameEn },
        source: funding.source,
        status: funding.status,
        eligibility: { zh: funding.eligibilityZh, en: funding.eligibilityEn },
        // `notes` is optional in the database but the page always renders it,
        // so an empty string stands in for "nothing to add".
        notes: { zh: funding.notesZh ?? "", en: funding.notesEn },
        amountMax: funding.amountMax,
        applyMonths: funding.applyMonths,
        requiredDocs: funding.requiredDocs,
        contactName: funding.contactName,
        contactEmail: funding.contactEmail,
      }}
      program={
        funding.program
          ? {
              slug: funding.program.slug,
              name: { zh: funding.program.nameZh, en: funding.program.nameEn },
            }
          : null
      }
      form={
        funding.formFile
          ? { ...funding.formFile, createdAt: formatDay(funding.formFile.createdAt) }
          : null
      }
    />
  );
}
