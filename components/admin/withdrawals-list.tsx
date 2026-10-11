"use client";

import { useState } from "react";

export type WithdrawalItem = {
  id: number;
  code: string;
  fullName: string;
  email: string;
  dni: string;
  purchase: string;
  details: string | null;
  status: string;
  createdAt: string;
};

const dateFormat = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Argentina/Buenos_Aires",
});

export function WithdrawalsList({ items: initialItems }: { items: WithdrawalItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const toggle = async (item: WithdrawalItem) => {
    const status = item.status === "processed" ? "received" : "processed";
    setBusyId(item.id);
    setError("");
    const response = await fetch(`/api/admin/withdrawals/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }).catch(() => null);
    setBusyId(null);
    if (!response?.ok) {
      setError("No se pudo actualizar el pedido");
      return;
    }
    setItems((current) => current.map((row) => (row.id === item.id ? { ...row, status } : row)));
  };

  if (items.length === 0) {
    return <p className="text-gray-400">Todavía no hay pedidos de arrepentimiento.</p>;
  }

  return (
    <div className="space-y-3">
      {error ? <p className="text-red-400">{error}</p> : null}
      <div className="overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-gray-900 text-gray-400">
            <tr>
              <th className="px-4 py-3 font-medium">Código</th>
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium">Persona</th>
              <th className="px-4 py-3 font-medium">Compra</th>
              <th className="px-4 py-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {items.map((item) => (
              <tr key={item.id} className="align-top text-gray-200">
                <td className="px-4 py-3 font-mono font-semibold">{item.code}</td>
                <td className="px-4 py-3 whitespace-nowrap">{dateFormat.format(new Date(item.createdAt))}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-white">{item.fullName}</p>
                  <p className="text-gray-400">{item.email}</p>
                  <p className="text-gray-400">DNI {item.dni}</p>
                </td>
                <td className="px-4 py-3">
                  <p>{item.purchase}</p>
                  {item.details ? <p className="mt-1 text-gray-400">{item.details}</p> : null}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                      item.status === "processed" ? "bg-teal-500/20 text-teal-300" : "bg-amber-500/20 text-amber-300"
                    }`}
                  >
                    {item.status === "processed" ? "Procesado" : "Pendiente"}
                  </span>
                  <button
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() => toggle(item)}
                    className="mt-2 block text-xs text-gray-300 underline hover:text-white disabled:opacity-60"
                  >
                    {busyId === item.id
                      ? "Guardando…"
                      : item.status === "processed"
                        ? "Volver a pendiente"
                        : "Marcar como procesado"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
