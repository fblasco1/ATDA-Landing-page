import { restoreRevision } from "@/lib/admin/revisions";
import { requireAdminApi } from "@/lib/admin/session";
import { isDatabaseConfigured } from "@/lib/db";
import { expireLandingCache } from "@/lib/sanity/fetch";

type Context = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: Context) {
  const { session, error } = await requireAdminApi();
  if (error) return error;
  if (!isDatabaseConfigured()) {
    return Response.json({ error: "Falta configurar la base de datos" }, { status: 503 });
  }
  const id = Number((await context.params).id);
  if (!Number.isInteger(id) || id <= 0) {
    return Response.json({ error: "Versión inválida" }, { status: 400 });
  }
  try {
    const revision = await restoreRevision(id, session.user.email);
    expireLandingCache();
    return Response.json({ ok: true, documentId: revision.documentId });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}
