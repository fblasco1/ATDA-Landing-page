import { randomBytes } from "node:crypto";
import { eq, lt } from "drizzle-orm";
import { getDb } from "./index";
import { contentPreviews } from "./schema";

/** Una vista previa dura un día; después se borra al crear la siguiente. */
const PREVIEW_TTL_MS = 24 * 60 * 60 * 1000;

export async function createPreview(data: Record<string, unknown>, createdBy: string | null) {
  const db = getDb();
  const token = randomBytes(24).toString("base64url");
  await db.delete(contentPreviews).where(lt(contentPreviews.createdAt, new Date(Date.now() - PREVIEW_TTL_MS)));
  await db.insert(contentPreviews).values({ token, data, createdBy });
  return token;
}

export async function getPreviewData(token: string) {
  const db = getDb();
  const [row] = await db.select().from(contentPreviews).where(eq(contentPreviews.token, token)).limit(1);
  if (!row || Date.now() - row.createdAt.getTime() > PREVIEW_TTL_MS) return null;
  return row.data as Record<string, unknown>;
}
