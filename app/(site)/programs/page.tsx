import { listProgramsForSite } from "@/lib/repositories/program.repository";
import { ProgramsView, type SiteProgram } from "./programs-view";

export default async function ProgramsPage() {
  const records = await listProgramsForSite();

  const programs: SiteProgram[] = records.map((record) => ({
    id: record.id,
    slug: record.slug,
    type: record.type,
    name: { zh: record.nameZh, en: record.nameEn },
    overview: { zh: record.overviewZh, en: record.overviewEn },
    schoolCount: record.schoolCount,
    totalQuota: record.totalQuota,
    openBulletins: record.openBulletins,
    totalBulletins: record.totalBulletins,
    fundingCount: record.fundingCount,
  }));

  return <ProgramsView programs={programs} />;
}
