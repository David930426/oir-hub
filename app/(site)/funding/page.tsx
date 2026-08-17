import { listFundingsForSite } from "@/lib/repositories/funding.repository";
import { listActivePrograms } from "@/lib/repositories/program.repository";
import { FundingView, type SiteFunding } from "./funding-view";

export default async function FundingPage() {
  const [records, programs] = await Promise.all([
    listFundingsForSite(),
    listActivePrograms(),
  ]);

  const fundings: SiteFunding[] = records.map((record) => ({
    id: record.id,
    programId: record.programId,
    // Null means the grant is open to any program, which the card says in
    // words rather than leaving blank.
    programName: record.program
      ? { zh: record.program.nameZh, en: record.program.nameEn }
      : null,
    name: { zh: record.nameZh, en: record.nameEn },
    source: record.source,
    status: record.status,
    eligibility: { zh: record.eligibilityZh, en: record.eligibilityEn },
    amountMax: record.amountMax,
    applyMonths: record.applyMonths,
  }));

  return (
    <FundingView
      fundings={fundings}
      programs={programs.map((program) => ({
        id: program.id,
        name: { zh: program.nameZh, en: program.nameEn },
      }))}
    />
  );
}
