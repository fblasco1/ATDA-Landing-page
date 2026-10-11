import { snapshotBeforeChange } from "@/lib/admin/revisions";
import { requireAdminApi } from "@/lib/admin/session";
import { deleteDocument, patchDocument } from "@/lib/sanity/write";
import { expireLandingCache } from "@/lib/sanity/fetch";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  const { session, error } = await requireAdminApi();
  if (error) return error;
  const { id } = await context.params;
  try {
    const data = (await request.json()) as Record<string, unknown>;
    await snapshotBeforeChange(id, "update", session.user.email, { patch: data });
    const item = await patchDocument(id, data);
    expireLandingCache();
    return Response.json({ item });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: Context) {
  const { session, error } = await requireAdminApi();
  if (error) return error;
  const { id } = await context.params;
  try {
    await snapshotBeforeChange(id, "delete", session.user.email);
    await deleteDocument(id);
    expireLandingCache();
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}
