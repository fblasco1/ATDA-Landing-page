import { snapshotBeforeChange } from "@/lib/admin/revisions";
import { requireAdminApi } from "@/lib/admin/session";
import { normalizeCourseCopy } from "@/lib/courses/copy";
import { deleteDocument, patchDocument, ReferencedByEnrollmentsError } from "@/lib/sanity/write";
import { expireLandingCache } from "@/lib/sanity/fetch";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  const { session, error } = await requireAdminApi();
  if (error) return error;
  const { id } = await context.params;
  try {
    const data = (await request.json()) as Record<string, unknown>;
    const copyError = normalizeCourseCopy(data);
    if (copyError) return Response.json({ error: copyError }, { status: 400 });
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
  const cascade = new URL(_request.url).searchParams.get("cascade") === "enrollments";
  try {
    await snapshotBeforeChange(id, "delete", session.user.email);
    await deleteDocument(id, { cascadeEnrollments: cascade });
    expireLandingCache();
    return Response.json({ ok: true });
  } catch (err) {
    if (err instanceof ReferencedByEnrollmentsError) {
      return Response.json(
        { error: err.message, code: err.code, enrollments: err.count },
        { status: 409 },
      );
    }
    return Response.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}
