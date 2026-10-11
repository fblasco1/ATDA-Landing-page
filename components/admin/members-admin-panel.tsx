"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Member, MembershipFee } from "@/lib/db/schema";
import { formatARS } from "@/lib/utils";
import { NewMemberForm } from "./new-member-form";

type Row = {
  member: Member;
  latestFee: MembershipFee | null;
  feesCount: number;
};

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

export function MembersAdminPanel({
  initialItems,
  dbReady,
}: {
  initialItems: Row[];
  dbReady: boolean;
}) {
  const [items, setItems] = useState(initialItems);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | Member["status"]>("all");
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const visible = useMemo(() => {
    return items.filter(({ member, latestFee }) => {
      if (status !== "all" && member.status !== status) return false;
      if (q.trim()) {
        const needle = q.trim().toLowerCase();
        const hay = `${member.fullName} ${member.email} ${member.dni}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [items, q, status]);

  const patch = async (body: Record<string, unknown>, memberId?: number) => {
    setBusyId(memberId ?? null);
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
    setBusyId(null);
    if (!response.ok) {
      setMessage(data.error ?? "Error al actualizar");
      return;
    }
    if (data.member) {
      setItems((current) =>
        current.map((row) =>
          row.member.id === data.member!.id ? { ...row, member: data.member! } : row,
        ),
      );
    }
    if (data.fee) {
      setItems((current) =>
        current.map((row) =>
          row.member.id === data.fee!.memberId
            ? {
                ...row,
                latestFee:
                  !row.latestFee || data.fee!.period >= row.latestFee.period
                    ? data.fee!
                    : row.latestFee,
                feesCount: body.createFee ? row.feesCount + 1 : row.feesCount,
              }
            : row,
        ),
      );
    }
    setMessage("Actualizado");
  };

  if (!dbReady) {
    return (
      <div className="rounded-lg border border-amber-700/50 bg-amber-950/30 p-4 text-amber-100">
        Configurá `DATABASE_URL` (Neon) para gestionar socios.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <NewMemberForm
        onCreated={(member) => {
          setItems((current) => [{ member, latestFee: null, feesCount: 0 }, ...current]);
          setMessage(`Socio ${member.fullName} creado`);
        }}
      />
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar nombre, email o DNI"
          className="rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
          className="rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="suspended">Suspendidos</option>
          <option value="inactive">Inactivos</option>
        </select>
        {message ? <p className="text-sm text-teal-300">{message}</p> : null}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-gray-300">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400">
              <th className="p-3">Socio</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Última cuota</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-500">
                  No hay socios.
                </td>
              </tr>
            ) : (
              visible.map(({ member, latestFee, feesCount }) => (
                <tr key={member.id} className="border-b border-gray-800 align-top">
                  <td className="p-3">
                    <Link
                      href={`/admin/socios/${member.id}`}
                      className="font-medium text-white hover:text-teal-300"
                    >
                      {member.fullName}
                    </Link>
                    <div className="text-xs text-gray-500">{member.email}</div>
                    <div className="text-xs text-gray-500">DNI {member.dni}</div>
                    <div className="text-xs text-gray-600">{feesCount} cuota(s)</div>
                  </td>
                  <td className="p-3">{STATUS_LABEL[member.status]}</td>
                  <td className="p-3">
                    {latestFee ? (
                      <>
                        <div>
                          {latestFee.period} · {FEE_LABEL[latestFee.status]}
                        </div>
                        <div className="text-xs text-gray-500">
                          {latestFee.amountCents > 0
                            ? formatARS(latestFee.amountCents / 100)
                            : "Monto a definir"}
                        </div>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col gap-2">
                      {latestFee && latestFee.status !== "paid" ? (
                        <button
                          type="button"
                          disabled={busyId === member.id}
                          onClick={() =>
                            patch({ feeId: latestFee.id, feeStatus: "paid" }, member.id)
                          }
                          className="rounded-md bg-teal-700 px-2 py-1 text-xs text-white hover:bg-teal-600"
                        >
                          Marcar cuota paga
                        </button>
                      ) : null}
                      {member.status === "active" ? (
                        <button
                          type="button"
                          disabled={busyId === member.id}
                          onClick={() =>
                            patch({ memberId: member.id, status: "suspended" }, member.id)
                          }
                          className="rounded-md border border-amber-700/60 px-2 py-1 text-xs text-amber-200 hover:bg-amber-950/40"
                        >
                          Suspender
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={busyId === member.id}
                          onClick={() =>
                            patch({ memberId: member.id, status: "active" }, member.id)
                          }
                          className="rounded-md border border-teal-700/60 px-2 py-1 text-xs text-teal-200 hover:bg-teal-950/40"
                        >
                          Reactivar
                        </button>
                      )}
                      <Link
                        href={`/admin/socios/${member.id}`}
                        className="text-xs text-blue-300 hover:text-blue-200"
                      >
                        Ver detalle
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
