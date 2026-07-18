import { eq } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema/auth.schema";

export async function findUserByEmail(email: string) {
  return db.query.user.findFirst({
    where: eq(user.email, email),
  });
}

export async function findUserByStudentId(studentId: string) {
  return db.query.user.findFirst({
    where: eq(user.studentId, studentId),
  });
}
