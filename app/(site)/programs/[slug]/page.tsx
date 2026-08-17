import { notFound } from "next/navigation";
import { listBulletinsForProgram } from "@/lib/repositories/bulletin.repository";
import { listFundingsForProgram } from "@/lib/repositories/funding.repository";
import { findProgramBySlug } from "@/lib/repositories/program.repository";
import { listActivePartnerSchools } from "@/lib/repositories/school.repository";
import {
  ProgramDetailView,
  type SiteProgramBulletin,
  type SiteProgramFunding,
  type SiteProgramSchool,
} from "./program-detail-view";

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const program = await findProgramBySlug(slug);
  if (!program) notFound();

  const [schools, calls, funding] = await Promise.all([
    listActivePartnerSchools(),
    listBulletinsForProgram(program.id),
    listFundingsForProgram(program.id),
  ]);

  const programSchools: SiteProgramSchool[] = schools
    .filter((school) => school.programId === program.id)
    .map((school) => ({
      id: school.id,
      name: { zh: school.nameZh, en: school.nameEn },
      country: school.country,
      quota: school.quota,
      gpaMin: school.gpaMin,
      languageReq: school.languageReq,
      englishTaught: school.englishTaught,
      housingProvided: school.housingProvided,
    }));

  const programCalls: SiteProgramBulletin[] = calls.map((bulletin) => ({
    id: bulletin.id,
    academicYear: bulletin.academicYear,
    term: bulletin.term,
    title: { zh: bulletin.titleZh, en: bulletin.titleEn },
    region: bulletin.region,
    announcedAt: bulletin.announcedAt,
    deadlineAt: bulletin.deadlineAt,
    status: bulletin.status,
  }));

  const programFunding: SiteProgramFunding[] = funding.map((entry) => ({
    id: entry.id,
    name: { zh: entry.nameZh, en: entry.nameEn },
    source: entry.source,
    eligibility: { zh: entry.eligibilityZh, en: entry.eligibilityEn },
    amountMax: entry.amountMax,
  }));

  return (
    <ProgramDetailView
      program={{
        id: program.id,
        type: program.type,
        name: { zh: program.nameZh, en: program.nameEn },
        overview: { zh: program.overviewZh, en: program.overviewEn },
      }}
      schools={programSchools}
      calls={programCalls}
      funding={programFunding}
    />
  );
}
