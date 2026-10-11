"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Member, MembershipFee } from "@/lib/db/schema";
import { formatARS, formatDateShortES } from "@/lib/utils";

const STATUS_LABEL: Record<Member["status"], string> = {
  active: "Activo",
  suspended: "Suspendido",
  inactive: "Inactivo",
};

const FEE_LABEL: Record<MembershipFee["status"], string> = {
  pending: "Pendiente",
  paid: "Pagada",
  overdue: "Vencida",
  waived: "Eximida",
};

export function MemberDetailPanel({
  member: initialMember,
  fees: initialFees,
}: {
  member: Member;
  fees: MembershipFee[];
}) {
  const router = useRouter();
  const [member, setMember] = useState(initialMember);
  const [fees, setFees] = useState(initialFees);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7));
  const [amountPesos, setAmountPesos] = useState("0");

  const patch = async (body: Record<string, unknown>) => {
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/admin/members", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await response.json()) as {
      error?: string;
      member?: Member;
      fee?: MembershipFee;
    };
    setBusy(false);
    if (!response.ok) {
      setMessage(data.error ?? "Error");
      return;
    }
    if (data.member) setMember(data.member);
    if (data.fee) {
      setFees((current) => {
        const exists = current.find((f) => f.id === data.fee!.id);
        if (exists) {
          return current.map((f) => (f.id === data.fee!.id ? data.fee! : f));
        }
        return [data.fee!, ...current].sort((a, b) => b.period.localeCompare(a.period));
      });
    }
    setMessage("Guardado");
    router.refresh();
  };

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/socios?tab=socios" className="text-sm text-gray-400 hover:text-white">
          ← Volver a socios
        </Link>
        <h1 className="mt-3 text-3xl font-bold text-white">{member.fullName}</h1>
        <p className="text-gray-400">
          {member.email} · DNI {member.dni} · {STATUS_LABEL[member.status]}
        </p>
        <p className="text-sm text-gray-500">
          {[member.profession, member.phone, member.organization, member.roleTitle].filter(Boolean).join(" · ")}
        </p>
        {message ? <p className="mt-2 text-sm text-teal-300">{message}</p> : null}
      </div>

      <section className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Membresía</h2>
        <div className="flex flex-wrap gap-2">
          {(["active", "suspended", "inactive"] as const).map((status) => (
            <button
              key={status}
              type="button"
              disabled={busy || member.status === status}
              onClick={() => patch({ memberId: member.id, status })}
              className={`rounded-md px-3 py-2 text-sm ${
                member.status === status
                  ? "bg-blue-600 text-white"
                  : "border border-gray-700 text-gray-300 hover:bg-gray-800"
              }`}
            >
              {STATUS_LABEL[status]}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-gray-500">
          Portal: {member.passwordHash ? "acceso activado" : "pendiente de activar (/socio/activar)"}
        </p>
      </section>

      <section className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Nueva cuota</h2>
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-sm text-gray-400">
            Período (YYYY-MM)
            <input
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="mt-1 block rounded-md border border-gray-700 bg-gray-950 px-3 py-2 text-white"
            />
          </label>
          <label className="text-sm text-gray-400">
            Monto (ARS)
            <input
              value={amountPesos}
              onChange={(e) => setAmountPesos(e.target.value)}
              type="number"
              min={0}
              className="mt-1 block rounded-md border border-gray-700 bg-gray-950 px-3 py-2 text-white"
            />
          </label>
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              patch({
                memberId: member.id,
                createFee: {
                  period,
                  amountCents: Math.round(Number(amountPesos || 0) * 100),
                },
              })
            }
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Crear cuota
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Historial de cuotas</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-gray-300">
            <thead>
              <tr className="border-b border-gray-800 text-gray-500">
                <th className="py-2 pr-4">Período</th>
                <th className="py-2 pr-4">Monto</th>
                <th className="py-2 pr-4">Estado</th>
                <th className="py-2 pr-4">Pagado</th>
                <th className="py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((fee) => (
                <tr key={fee.id} className="border-b border-gray-800/80">
                  <td className="py-3 pr-4">{fee.period}</td>
                  <td className="py-3 pr-4">
                    {fee.amountCents > 0 ? formatARS(fee.amountCents / 100) : "A definir"}
                  </td>
                  <td className="py-3 pr-4">{FEE_LABEL[fee.status]}</td>
                  <td className="py-3 pr-4">{fee.paidAt ? formatDateShortES(fee.paidAt) : "—"}</td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-2">
                      {fee.status !== "paid" ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => patch({ feeId: fee.id, feeStatus: "paid" })}
                          className="text-xs text-teal-300 hover:text-teal-200"
                        >
                          Pagar
                        </button>
                      ) : null}
                      {fee.status !== "waived" ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => patch({ feeId: fee.id, feeStatus: "waived" })}
                          className="text-xs text-gray-400 hover:text-white"
                        >
                          Eximir
                        </button>
                      ) : null}
                      {fee.status !== "overdue" && fee.status !== "paid" ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => patch({ feeId: fee.id, feeStatus: "overdue" })}
                          className="text-xs text-amber-300 hover:text-amber-200"
                        >
                          Vencida
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
