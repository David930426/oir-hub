import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import type { Logger as DrizzleLogger } from "drizzle-orm/logger";
import * as schema from "./schema";
import { logger } from "@/lib/logger";

const dbLogger = logger.child({ module: "db" });

const queryLogger: DrizzleLogger = {
  logQuery(query, params) {
    dbLogger.debug({ query, params }, "query");
  },
};

export const db = drizzle({
  connection: process.env.DATABASE_URL!,
  schema,
  casing: "snake_case",
  logger: queryLogger,
});

export type DbOrTx = typeof db | Parameters<Parameters<(typeof db)["transaction"]>[0]>[0];
