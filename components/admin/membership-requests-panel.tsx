"use client";

import { useMemo, useState } from "react";
import type { MembershipRequest } from "@/lib/db/schema";

const STATUS_LABEL: Record<MembershipRequest["status"], string> = {
  received: "Recibida",
  reviewing: "En revisión",
  approved: "Aprobada",
  rejected: "Rechazada",
};

export function MembershipRequestsPanel({
  initialItems,
  dbReady,
}: {
  initialItems: MembershipRequest[];
  dbReady: boolean;
}) {
  const [items, setItems] = useState(initialItems);
  const [filter, setFilter] = useState<"all" | MembershipRequest["status"]>("all");
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const visible = useMemo(
    () => (filter === "all" ? items : items.filter((item) => item.status === filter)),
    [items, filter],
  );

  const act = async (id: number, status: MembershipRequest["status"]) => {
    const adminNotes =
      status === "rejected"
        ? (prompt("Motivo / notas (opcional)") ?? undefined)
        : status === "approved"
          ? (prompt("Notas al aprobar (opcional)") ?? undefined)
          : undefined;
    setBusyId(id);
    setMessage("");
    const response = await fetch("/api/admin/membership", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, adminNotes }),
    });
    const data = (await response.json()) as {
      error?: string;
      request?: MembershipRequest;
      emailSent?: boolean;
      emailError?: string;
    };
    setBusyId(null);
    if (!response.ok) {
      setMessage(data.error ?? "No se pudo actualizar");
      return;
    }
    if (data.request) {
      setItems((current) => current.map((row) => (row.id === id ? data.request! : row)));
    }
    setMessage(
      status !== "approved"
        ? `Estado actualizado: ${STATUS_LABEL[status]}`
        : data.emailSent
          ? "Solicitud aprobada. Le enviamos el mail para activar su acceso."
          : data.emailError
            ? `Solicitud aprobada, pero no se pudo enviar el mail (${data.emailError}). Podés reenviarlo desde la ficha del socio.`
            : "Solicitud aprobada. El socio ya tenía el acceso activado.",
    );
  };

  if (!dbReady) {
    return (
      <div className="rounded-lg border border-amber-700/50 bg-amber-950/30 p-4 text-amber-100">
        Configurá `DATABASE_URL` (Neon) para gestionar solicitudes de asociación.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-gray-400">
          Estado
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value as typeof filter)}
            className="ml-2 rounded-md border border-gray-700 bg-gray-900 p-2 text-white"
          >
            <option value="all">Todas</option>
            <option value="received">Recibidas</option>
            <option value="reviewing">En revisión</option>
            <option value="approved">Aprobadas</option>
            <option value="rejected">Rechazadas</option>
          </select>
        </label>
        {message ? <p className="text-teal-300">{message}</p> : null}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-gray-300">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400">
              <th className="p-3">Fecha</th>
              <th className="p-3">Solicitante</th>
              <th className="p-3">Motivación</th>
              <th className="p-3">Estado</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  No hay solicitudes.
                </td>
              </tr>
            ) : (
              visible.map((row) => (
                <tr key={row.id} className="border-b border-gray-800 align-top">
                  <td className="p-3 whitespace-nowrap text-xs text-gray-500">
                    {new Date(row.createdAt).toLocaleString("es-AR")}
                  </td>
                  <td className="p-3">
                    <div className="font-medium text-white">{row.fullName}</div>
                    <div className="text-xs text-gray-500">{row.email}</div>
                    <div className="text-xs text-gray-500">
                      DNI {row.dni} · {row.phone}
                    </div>
                    {row.profession ? <div className="text-xs text-gray-400">{row.profession}</div> : null}
                    {row.organization ? (
                      <div className="text-xs text-gray-500">
                        {row.organization}
                        {row.roleTitle ? ` — ${row.roleTitle}` : ""}
                      </div>
                    ) : null}
                  </td>
                  <td className="max-w-xs p-3 text-gray-400">
                    <p className="line-clamp-4">{row.motivation || "—"}</p>
                    {row.adminNotes ? (
                      <p className="mt-2 text-xs text-amber-200/80">Notas: {row.adminNotes}</p>
                    ) : null}
                  </td>
                  <td className="p-3">{STATUS_LABEL[row.status]}</td>
                  <td className="p-3">
                    <div className="flex flex-col gap-2">
                      {row.status === "received" || row.status === "reviewing" ? (
                        <>
                          {row.status === "received" ? (
                            <button
                              type="button"
                              disabled={busyId === row.id}
                              onClick={() => act(row.id, "reviewing")}
                              className="rounded-md border border-gray-600 px-2 py-1 text-xs hover:bg-gray-800"
                            >
                              Pasar a revisión
                            </button>
                          ) : null}
                          <button
                            type="button"
                            disabled={busyId === row.id}
                            onClick={() => act(row.id, "approved")}
                            className="rounded-md bg-teal-700 px-2 py-1 text-xs text-white hover:bg-teal-600"
                          >
                            Aprobar
                          </button>
                          <button
                            type="button"
                            disabled={busyId === row.id}
                            onClick={() => act(row.id, "rejected")}
                            className="rounded-md bg-red-800/80 px-2 py-1 text-xs text-white hover:bg-red-700"
                          >
                            Rechazar
                          </button>
                        </>
                      ) : null}
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
