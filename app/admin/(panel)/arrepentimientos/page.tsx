import { WithdrawalsList } from "@/components/admin/withdrawals-list";
import { isDatabaseConfigured } from "@/lib/db";
import { listWithdrawalRequests } from "@/lib/db/withdrawals";

export default async function AdminWithdrawalsPage() {
  const dbReady = isDatabaseConfigured();
  const rows = dbReady ? await listWithdrawalRequests().catch(() => []) : [];

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-white">Arrepentimientos</h1>
      <p className="mb-6 max-w-3xl text-gray-400">
        Pedidos hechos desde el Botón de arrepentimiento del sitio. La persona ya recibió su código por email. Hay que
        devolver el importe por el mismo medio de pago y marcar el pedido como procesado.
      </p>
      {!dbReady ? (
        <p className="text-amber-300">Falta configurar la base de datos.</p>
      ) : (
        <WithdrawalsList
          items={rows.map((row) => ({
            id: row.id,
            code: row.code,
            fullName: row.fullName,
            email: row.email,
            dni: row.dni,
            purchase: row.purchase,
            details: row.details,
            status: row.status,
            createdAt: row.createdAt.toISOString(),
          }))}
        />
      )}
    </div>
  );
}
