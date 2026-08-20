import { PageBanner } from "@/components/site/page-banner";
import { listActivePrograms } from "@/lib/repositories/program.repository";
import { listActivePartnerSchools } from "@/lib/repositories/school.repository";
import { SchoolsView, type SiteSchool } from "./schools-view";

export default async function PartnerSchoolsPage() {
  const [records, programs] = await Promise.all([
    listActivePartnerSchools(),
    listActivePrograms(),
  ]);

  const partnerSchools: SiteSchool[] = records.map((record) => ({
    id: record.id,
    programId: record.programId,
    programType: record.program?.type ?? null,
    name: { zh: record.nameZh, en: record.nameEn },
    country: record.country,
    region: record.region,
    quota: record.quota,
    gpaMin: record.gpaMin,
    languageReq: record.languageReq,
    englishTaught: record.englishTaught,
    housingProvided: record.housingProvided,
  }));

  return (
    <>
      <PageBanner eyebrow="Where you can go" title="Partner schools">
        Filter by the GPA you actually have and see only the schools you can
        realistically be nominated to. Quotas are per term and reset with each
        bulletin.
      </PageBanner>
      <SchoolsView
        partnerSchools={partnerSchools}
        programs={programs.map((program) => ({
          id: program.id,
          name: { zh: program.nameZh, en: program.nameEn },
        }))}
      />
    </>
  );
}
