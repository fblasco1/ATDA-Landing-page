import { MemberNav } from "@/components/member/member-nav";
import { MemberSessionProvider } from "@/components/member/session-provider";
import { getMemberById, listFeesForMember } from "@/lib/db/members";
import { getMemberSession } from "@/lib/member/session";
import { formatARS, formatDateShortES } from "@/lib/utils";
import { redirect } from "next/navigation";

const FEE_LABEL: Record<string, string> = {
  pending: "Pendiente",
  paid: "Pagada",
  overdue: "Vencida",
  waived: "Eximida",
};

const STATUS_LABEL: Record<string, string> = {
  active: "Activo",
  suspended: "Suspendido",
  inactive: "Inactivo",
};

export default async function SocioDashboardPage() {
  const session = await getMemberSession();
  if (!session?.user.memberId) redirect("/socio/login");

  const member = await getMemberById(session.user.memberId);
  if (!member) redirect("/socio/login");

  const fees = await listFeesForMember(member.id);
  const latest = fees[0];

  return (
    <MemberSessionProvider>
    <div className="min-h-screen bg-gray-950 px-6 py-10 text-gray-100">
      <div className="container mx-auto max-w-3xl">
        <MemberNav />

        <h1 className="mb-2 text-3xl font-bold text-white">Hola, {member.fullName.split(" ")[0]}</h1>
        <p className="mb-8 text-gray-400">Datos personales y estado de tu cuota de socio.</p>

        <section className="mb-8 rounded-xl border border-gray-800 bg-gray-900/60 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Datos personales</h2>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <Item label="Nombre" value={member.fullName} />
            <Item label="Email" value={member.email} />
            <Item label="DNI" value={member.dni} />
            <Item label="Teléfono" value={member.phone || "—"} />
            <Item label="Profesión" value={member.profession || "—"} />
            <Item label="Organización" value={member.organization || "—"} />
            <Item label="Estado" value={STATUS_LABEL[member.status] ?? member.status} />
          </dl>
        </section>

        <section className="rounded-xl border border-gray-800 bg-gray-900/60 p-6">
          <h2 className="mb-2 text-lg font-semibold text-white">Cuota mensual</h2>
          {latest ? (
            <p className="mb-6 text-sm text-gray-400">
              Último período <span className="text-white">{latest.period}</span>:{" "}
              <span className="text-teal-300">{FEE_LABEL[latest.status] ?? latest.status}</span>
              {latest.amountCents > 0 ? ` · ${formatARS(latest.amountCents / 100)}` : null}
            </p>
          ) : (
            <p className="mb-6 text-sm text-gray-400">Todavía no hay cuotas registradas.</p>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-gray-300">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500">
                  <th className="py-2 pr-4">Período</th>
                  <th className="py-2 pr-4">Monto</th>
                  <th className="py-2 pr-4">Estado</th>
                  <th className="py-2">Pagado</th>
                </tr>
              </thead>
              <tbody>
                {fees.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-600">
                      Sin movimientos
                    </td>
                  </tr>
                ) : (
                  fees.map((fee) => (
                    <tr key={fee.id} className="border-b border-gray-800/80">
                      <td className="py-3 pr-4">{fee.period}</td>
                      <td className="py-3 pr-4">
                        {fee.amountCents > 0 ? formatARS(fee.amountCents / 100) : "A definir"}
                      </td>
                      <td className="py-3 pr-4">{FEE_LABEL[fee.status] ?? fee.status}</td>
                      <td className="py-3">{fee.paidAt ? formatDateShortES(fee.paidAt) : "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
    </MemberSessionProvider>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-white">{value}</dd>
    </div>
  );
}
