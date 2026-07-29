import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

export const db = drizzle({
  connection: process.env.DATABASE_URL!,
  schema,
  casing: "snake_case",
});

export type DbOrTx = typeof db | Parameters<Parameters<(typeof db)["transaction"]>[0]>[0];
