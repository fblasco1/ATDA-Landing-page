import { cookies, draftMode } from "next/headers";
import { requireAdminApi } from "@/lib/admin/session";
import { isDatabaseConfigured } from "@/lib/db";
import { createPreview } from "@/lib/db/previews";
import { PREVIEW_COOKIE } from "@/lib/sanity/site-content";

export async function POST(request: Request) {
  const { session, error } = await requireAdminApi();
  if (error) return error;
  if (!isDatabaseConfigured()) {
    return Response.json({ error: "Falta configurar la base de datos" }, { status: 503 });
  }
  try {
    const data = (await request.json()) as Record<string, unknown>;
    const token = await createPreview(data, session.user.email ?? null);
    (await draftMode()).enable();
    (await cookies()).set(PREVIEW_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    return Response.json({ url: "/" });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}
