/**
 * Database entry point.
 *
 * - Table definitions live in ./schema (one file per domain).
 * - Hand-written queries go in ./query (import the tables from here).
 *
 * Usage:
 *   import { schema } from "@/db";            // all tables + relations
 *   import { user, documents } from "@/db";   // or individual tables
 *
 * When the backend is wired up, the drizzle client will be created here:
 *
 *   import { drizzle } from "drizzle-orm/node-postgres";
 *   export const db = drizzle(process.env.DATABASE_URL!, { schema });
 */

export * as schema from "./schema";
export * from "./schema";
