/**
 * Drizzle schema barrel — import from here for the db client and drizzle-kit:
 *
 *   import * as schema from "@/schema";
 *   const db = drizzle(pool, { schema });
 */

export * from "./auth.schema";
export * from "./chat.schema";
export * from "./knowledge.schema";
export * from "./content.schema";
