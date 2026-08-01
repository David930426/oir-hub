import { asc, count, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, postTags, posts, tags } from "@/db/schema/cms.schema";
import { faqs } from "@/db/schema/knowledge.schema";
import type {
  CategoryKindValue,
  CreateCategoryInput,
  CreateTagInput,
  UpdateCategoryInput,
  UpdateTagInput,
} from "@/lib/validator/taxonomy.validator";

/**
 * Categories and tags.
 *
 * "In use" is what decides whether a row can be deleted or have its kind
 * changed, so it is counted in the database rather than inferred in the UI.
 */

export type CategoryRecord = {
  id: string;
  slug: string;
  kind: CategoryKindValue;
  nameZh: string;
  nameEn: string | null;
  sortOrder: number;
  /** Posts or FAQs pointing at this category — `kind` decides which. */
  usage: number;
};

export type TagRecord = {
  id: string;
  slug: string;
  nameZh: string;
  nameEn: string | null;
  /** Posts carrying this tag. */
  usage: number;
};

// ---------- Categories ----------

/**
 * Every category, grouped by kind then by the sort order the site filters use.
 *
 * A category's kind scopes it to posts or to FAQs, so only one of the two
 * counts can ever be non-zero — adding them keeps the query to a single pass.
 */
export async function listCategories(): Promise<CategoryRecord[]> {
  // The two counts must carry different aliases: Drizzle renders a column
  // referenced inside a `sql` template by its alias alone, so two subqueries
  // both calling theirs "total" produce an ambiguous reference.
  const postUsage = db
    .select({ categoryId: posts.categoryId, total: count().as("post_total") })
    .from(posts)
    .groupBy(posts.categoryId)
    .as("post_usage");

  const faqUsage = db
    .select({ categoryId: faqs.categoryId, total: count().as("faq_total") })
    .from(faqs)
    .groupBy(faqs.categoryId)
    .as("faq_usage");

  return db
    .select({
      id: categories.id,
      slug: categories.slug,
      kind: categories.kind,
      nameZh: categories.nameZh,
      nameEn: categories.nameEn,
      sortOrder: categories.sortOrder,
      usage: sql<number>`coalesce(${postUsage.total}, 0) + coalesce(${faqUsage.total}, 0)`
        .mapWith(Number)
        .as("usage"),
    })
    .from(categories)
    .leftJoin(postUsage, eq(postUsage.categoryId, categories.id))
    .leftJoin(faqUsage, eq(faqUsage.categoryId, categories.id))
    .orderBy(asc(categories.kind), asc(categories.sortOrder), asc(categories.nameZh));
}

export async function findCategoryById(id: string) {
  return db.query.categories.findFirst({ where: eq(categories.id, id) });
}

/** Posts or FAQs pointing at this category, whichever its kind allows. */
export async function countCategoryUsage(
  id: string,
  kind: CategoryKindValue,
): Promise<number> {
  const [row] =
    kind === "post"
      ? await db.select({ total: count() }).from(posts).where(eq(posts.categoryId, id))
      : await db.select({ total: count() }).from(faqs).where(eq(faqs.categoryId, id));

  return row?.total ?? 0;
}

export async function createCategory(input: CreateCategoryInput): Promise<string> {
  const [row] = await db
    .insert(categories)
    .values({
      slug: input.slug,
      kind: input.kind,
      nameZh: input.nameZh,
      nameEn: input.nameEn || null,
      sortOrder: input.sortOrder,
    })
    .returning({ id: categories.id });

  return row.id;
}

export async function updateCategory(input: UpdateCategoryInput) {
  await db
    .update(categories)
    .set({
      slug: input.slug,
      kind: input.kind,
      nameZh: input.nameZh,
      nameEn: input.nameEn || null,
      sortOrder: input.sortOrder,
    })
    .where(eq(categories.id, input.id));
}

export async function deleteCategory(id: string) {
  await db.delete(categories).where(eq(categories.id, id));
}

// ---------- Tags ----------

/** Every tag with the number of posts carrying it, by slug. */
export async function listTags(): Promise<TagRecord[]> {
  return db
    .select({
      id: tags.id,
      slug: tags.slug,
      nameZh: tags.nameZh,
      nameEn: tags.nameEn,
      usage: count(postTags.tagId),
    })
    .from(tags)
    .leftJoin(postTags, eq(postTags.tagId, tags.id))
    .groupBy(tags.id)
    .orderBy(asc(tags.slug));
}

export async function findTagById(id: string) {
  return db.query.tags.findFirst({ where: eq(tags.id, id) });
}

export async function countTagUsage(id: string): Promise<number> {
  const [row] = await db
    .select({ total: count() })
    .from(postTags)
    .where(eq(postTags.tagId, id));

  return row?.total ?? 0;
}

export async function createTag(input: CreateTagInput): Promise<string> {
  const [row] = await db
    .insert(tags)
    .values({
      slug: input.slug,
      nameZh: input.nameZh,
      nameEn: input.nameEn || null,
    })
    .returning({ id: tags.id });

  return row.id;
}

export async function updateTag(input: UpdateTagInput) {
  await db
    .update(tags)
    .set({
      slug: input.slug,
      nameZh: input.nameZh,
      nameEn: input.nameEn || null,
    })
    .where(eq(tags.id, input.id));
}

export async function deleteTag(id: string) {
  await db.delete(tags).where(eq(tags.id, id));
}
