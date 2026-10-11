import { requireAdminApi } from "@/lib/admin/session";
import { setWithdrawalStatus } from "@/lib/db/withdrawals";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const id = Number((await params).id);
  const body = (await request.json().catch(() => ({}))) as { status?: string };
  if (!Number.isInteger(id) || (body.status !== "received" && body.status !== "processed")) {
    return Response.json({ error: "Pedido inválido" }, { status: 400 });
  }
  const row = await setWithdrawalStatus(id, body.status);
  if (!row) return Response.json({ error: "No existe el pedido" }, { status: 404 });
  return Response.json({ ok: true, status: row.status });
}
