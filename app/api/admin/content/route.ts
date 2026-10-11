import { requireAdminApi } from "@/lib/admin/session";
import { createDocument, listDocuments } from "@/lib/sanity/write";
import { revalidateTag } from "next/cache";

const allowed = new Set(["project", "networkPartner", "course"]);

export async function GET(request: Request) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const type = new URL(request.url).searchParams.get("type") ?? "";
  if (!allowed.has(type)) {
    return Response.json({ error: "Tipo inválido" }, { status: 400 });
  }
  try {
    const items = await listDocuments(type);
    return Response.json({ items });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { error } = await requireAdminApi();
  if (error) return error;
  try {
    const body = (await request.json()) as { type?: string; data?: Record<string, unknown> };
    if (!body.type || !allowed.has(body.type) || !body.data) {
      return Response.json({ error: "Datos inválidos" }, { status: 400 });
    }
    const item = await createDocument(body.type, body.data);
    revalidateTag("landing", "max");
    return Response.json({ item });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}
