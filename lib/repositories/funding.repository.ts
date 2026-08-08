import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { fundings, programs } from "@/db/schema/mobility.schema";
import type {
  FundingSourceValue,
  FundingStatusValue,
} from "@/lib/validator/funding.validator";

/**
 * Funding — the ERD's FUNDINGS.
 *
 * A null `programId` is meaningful: the grant is open to any program, which is
 * how most of the Ministry's schemes work.
 */

export type FundingRecord = {
  id: string;
  nameZh: string;
  nameEn: string | null;
  source: FundingSourceValue;
  programName: string | null;
  amountMax: number;
  applyMonths: number[];
  status: FundingStatusValue;
};

export async function listFundings(): Promise<FundingRecord[]> {
  return db
    .select({
      id: fundings.id,
      nameZh: fundings.nameZh,
      nameEn: fundings.nameEn,
      source: fundings.source,
      programName: programs.nameZh,
      amountMax: fundings.amountMax,
      applyMonths: fundings.applyMonths,
      status: fundings.status,
    })
    .from(fundings)
    .leftJoin(programs, eq(programs.id, fundings.programId))
    .orderBy(asc(fundings.nameZh));
}

/** Open calls for the public site. */
export async function listOpenFundings() {
  return db.query.fundings.findMany({
    where: eq(fundings.status, "open"),
    with: { program: true, formFile: true },
    orderBy: [asc(fundings.nameZh)],
  });
}

export async function findFundingById(id: string) {
  return db.query.fundings.findFirst({
    where: eq(fundings.id, id),
    with: { program: true, formFile: true },
  });
}

export type FundingWrite = {
  programId: string | null;
  nameZh: string;
  nameEn: string | null;
  source: FundingSourceValue;
  eligibilityZh: string;
  eligibilityEn: string | null;
  amountMax: number;
  applyMonths: number[];
  requiredDocs: string[];
  notesZh: string | null;
  notesEn: string | null;
  contactName: string | null;
  contactEmail: string | null;
  formFileId: string | null;
  status: FundingStatusValue;
};

export async function createFunding(input: FundingWrite): Promise<string> {
  const [row] = await db.insert(fundings).values(input).returning({ id: fundings.id });
  return row.id;
}

export async function updateFunding(input: FundingWrite & { id: string }) {
  const { id, ...row } = input;
  await db.update(fundings).set(row).where(eq(fundings.id, id));
}

export async function setFundingStatus(id: string, status: FundingStatusValue) {
  await db.update(fundings).set({ status }).where(eq(fundings.id, id));
}

export async function deleteFunding(id: string) {
  await db.delete(fundings).where(eq(fundings.id, id));
}
