import { requireAdminApi } from "@/lib/admin/session";
import { deleteDocument, patchDocument } from "@/lib/sanity/write";
import { expireLandingCache } from "@/lib/sanity/fetch";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const { id } = await context.params;
  try {
    const data = (await request.json()) as Record<string, unknown>;
    const item = await patchDocument(id, data);
    expireLandingCache();
    return Response.json({ item });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: Context) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const { id } = await context.params;
  try {
    await deleteDocument(id);
    expireLandingCache();
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}
