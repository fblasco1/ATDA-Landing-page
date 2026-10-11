import { requireAdminApi } from "@/lib/admin/session";
import { patchDocument } from "@/lib/sanity/write";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const { id } = await context.params;
  try {
    const data = (await request.json()) as Record<string, unknown>;
    const item = await patchDocument(id, {
      classroomAccess: data.classroomAccess,
      notes: data.notes,
    });
    return Response.json({ item });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}
