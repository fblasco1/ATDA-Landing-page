import { requireAdminApi } from "@/lib/admin/session";
import { uploadImage } from "@/lib/sanity/write";

export async function POST(request: Request) {
  const { error } = await requireAdminApi();
  if (error) return error;
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return Response.json({ error: "Archivo requerido" }, { status: 400 });
    }
    const asset = await uploadImage(file);
    return Response.json(asset);
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}
