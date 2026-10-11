import { and, desc, eq, inArray, notInArray } from "drizzle-orm";
import { getDb } from "./index";
import { contentRevisions } from "./schema";

/** Versiones que se conservan por documento. */
const KEEP_PER_DOCUMENT = 20;

export type RevisionAction = "update" | "delete" | "restore";

export async function saveRevision(input: {
  documentId: string;
  documentType: string;
  title: string | null;
  action: RevisionAction;
  snapshot: Record<string, unknown>;
  createdBy: string | null;
}) {
  const db = getDb();
  await db.insert(contentRevisions).values(input);

  const keep = await db
    .select({ id: contentRevisions.id })
    .from(contentRevisions)
    .where(eq(contentRevisions.documentId, input.documentId))
    .orderBy(desc(contentRevisions.createdAt))
    .limit(KEEP_PER_DOCUMENT);
  if (keep.length < KEEP_PER_DOCUMENT) return;
  await db.delete(contentRevisions).where(
    and(
      eq(contentRevisions.documentId, input.documentId),
      notInArray(
        contentRevisions.id,
        keep.map((row) => row.id),
      ),
    ),
  );
}

export async function listRevisions({ types, limit = 50 }: { types?: string[]; limit?: number } = {}) {
  const db = getDb();
  return db
    .select({
      id: contentRevisions.id,
      documentId: contentRevisions.documentId,
      documentType: contentRevisions.documentType,
      title: contentRevisions.title,
      action: contentRevisions.action,
      createdBy: contentRevisions.createdBy,
      createdAt: contentRevisions.createdAt,
    })
    .from(contentRevisions)
    .where(types?.length ? inArray(contentRevisions.documentType, types) : undefined)
    .orderBy(desc(contentRevisions.createdAt))
    .limit(limit);
}

export async function getRevision(id: number) {
  const db = getDb();
  const [row] = await db.select().from(contentRevisions).where(eq(contentRevisions.id, id)).limit(1);
  return row ?? null;
}
