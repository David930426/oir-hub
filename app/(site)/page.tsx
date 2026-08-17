import { listOpenBulletins } from "@/lib/repositories/bulletin.repository";
import { listOpenFundings } from "@/lib/repositories/funding.repository";
import { listPublishedPostsForSite } from "@/lib/repositories/post.repository";
import { listProgramsForSite } from "@/lib/repositories/program.repository";
import { listLatestSiteStats } from "@/lib/repositories/stats.repository";
import { listActiveTcornerSlots } from "@/lib/repositories/tcorner.repository";
import { listPublishedTestimonials } from "@/lib/repositories/testimonial.repository";
import { formatDay } from "@/lib/utils";
import { HomeView, type SiteStat } from "./home-view";

export default async function HomePage() {
  const [statRows, bulletins, posts, fundings, testimonials, programs, slots] =
    await Promise.all([
      listLatestSiteStats(),
      listOpenBulletins(),
      listPublishedPostsForSite(),
      listOpenFundings(),
      listPublishedTestimonials(),
      listProgramsForSite(),
      listActiveTcornerSlots(),
    ]);

  const stats: SiteStat[] = statRows.map((row) => ({
    id: row.id,
    metricKey: row.metricKey,
    label: { zh: row.labelZh, en: row.labelEn },
    value: row.value,
  }));

  return (
    <HomeView
      stats={stats}
      // Three of each: the homepage is a signpost, not a listing.
      calls={bulletins.slice(0, 3).map((bulletin) => ({
        id: bulletin.id,
        programId: bulletin.programId,
        academicYear: bulletin.academicYear,
        term: bulletin.term,
        title: { zh: bulletin.titleZh, en: bulletin.titleEn },
        region: bulletin.region,
        hasPdf: Boolean(bulletin.pdfFileId),
        announcedAt: bulletin.announcedAt,
        deadlineAt: bulletin.deadlineAt,
        status: bulletin.status,
        programName: bulletin.program
          ? { zh: bulletin.program.nameZh, en: bulletin.program.nameEn }
          : null,
      }))}
      latestPosts={posts.slice(0, 3).map((post) => ({
        id: post.id,
        slug: post.slug,
        type: post.type,
        categoryId: post.categoryId,
        categoryName: post.category
          ? { zh: post.category.nameZh, en: post.category.nameEn }
          : null,
        title: { zh: post.titleZh, en: post.titleEn },
        body: { zh: post.bodyZh, en: post.bodyEn },
        seoDescription: post.seoDescription,
        externalUrl: post.externalUrl,
        authorName: post.author?.name ?? null,
        publishedAt: post.publishedAt ? formatDay(post.publishedAt) : null,
        attachmentCount: post.attachments.length,
        tags: post.postTags.map((link) => ({
          id: link.tag.id,
          name: { zh: link.tag.nameZh, en: link.tag.nameEn },
        })),
      }))}
      openFunding={fundings.slice(0, 3).map((funding) => ({
        id: funding.id,
        programId: funding.programId,
        programName: funding.program
          ? { zh: funding.program.nameZh, en: funding.program.nameEn }
          : null,
        name: { zh: funding.nameZh, en: funding.nameEn },
        source: funding.source,
        status: funding.status,
        eligibility: { zh: funding.eligibilityZh, en: funding.eligibilityEn },
        amountMax: funding.amountMax,
        applyMonths: funding.applyMonths,
      }))}
      stories={testimonials.slice(0, 3).map((story) => ({
        id: story.id,
        displayName: story.displayName,
        deptYear: story.deptYear,
        country: story.country,
        termLabel: story.termLabel,
        highlights: story.highlights,
        schoolName: story.partnerSchool
          ? { zh: story.partnerSchool.nameZh, en: story.partnerSchool.nameEn }
          : null,
      }))}
      programs={programs.map((program) => ({
        id: program.id,
        slug: program.slug,
        type: program.type,
        name: { zh: program.nameZh, en: program.nameEn },
        overview: { zh: program.overviewZh, en: program.overviewEn },
        schoolCount: program.schoolCount,
        totalQuota: program.totalQuota,
        openBulletins: program.openBulletins,
        totalBulletins: program.totalBulletins,
        fundingCount: program.fundingCount,
      }))}
      slotCount={slots.length}
    />
  );
}
