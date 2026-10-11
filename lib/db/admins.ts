import { eq } from "drizzle-orm";
import { getDb } from "./index";
import { adminUsers } from "./schema";

export async function getAdminUserByEmail(email: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, email.trim().toLowerCase()))
    .limit(1);
  return row ?? null;
}

export async function getAdminUserById(id: number) {
  const db = getDb();
  const [row] = await db.select().from(adminUsers).where(eq(adminUsers.id, id)).limit(1);
  return row ?? null;
}

export async function setAdminPassword(id: number, passwordHash: string) {
  const db = getDb();
  await db
    .update(adminUsers)
    .set({ passwordHash, mustChangePassword: false, updatedAt: new Date() })
    .where(eq(adminUsers.id, id));
}

export async function touchAdminLogin(id: number) {
  const db = getDb();
  await db.update(adminUsers).set({ lastLoginAt: new Date() }).where(eq(adminUsers.id, id));
}
