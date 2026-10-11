import { revalidatePath, revalidateTag } from "next/cache";

export async function POST(request: Request) {
  const secret = process.env.SANITY_WEBHOOK_SECRET;
  if (secret) {
    const header = request.headers.get("authorization") ?? request.headers.get("x-sanity-secret");
    const querySecret = new URL(request.url).searchParams.get("secret");
    const provided = header?.replace(/^Bearer\s+/i, "") ?? querySecret;
    if (provided !== secret) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }
  }

  revalidateTag("landing", "max");
  revalidatePath("/");
  revalidatePath("/novedades");
  revalidatePath("/propuestas");
  return Response.json({ ok: true });
}
