import { listBulletins } from "@/lib/repositories/bulletin.repository";
import { listActivePrograms } from "@/lib/repositories/program.repository";
import { BulletinsView, type SiteBulletin } from "./bulletins-view";

/**
 * The public bulletin list.
 *
 * The page is a server component that reads through the repositories and hands
 * plain rows down; the filters are a client component, because a student
 * narrowing a list should not wait on a round trip.
 */
export default async function BulletinsPage() {
  const [records, programs] = await Promise.all([
    listBulletins(),
    listActivePrograms(),
  ]);

  const bulletins: SiteBulletin[] = records.map((record) => ({
    id: record.id,
    programId: record.programId,
    academicYear: record.academicYear,
    term: record.term,
    // The site works in `Localized` pairs, the database in `*Zh` / `*En`
    // columns; this is where the two meet.
    title: { zh: record.titleZh, en: record.titleEn },
    region: record.region,
    hasPdf: Boolean(record.pdfFileId),
    announcedAt: record.announcedAt,
    deadlineAt: record.deadlineAt,
    status: record.status,
  }));

  return (
    <BulletinsView
      bulletins={bulletins}
      programs={programs.map((program) => ({
        id: program.id,
        name: { zh: program.nameZh, en: program.nameEn },
      }))}
    />
  );
}