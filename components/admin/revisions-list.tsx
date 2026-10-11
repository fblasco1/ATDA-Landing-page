"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type RevisionItem = {
  id: number;
  title: string;
  type: string;
  action: string;
  changes: { label: string; detail?: string }[];
  createdBy: string | null;
  createdAt: string;
};

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Argentina/Buenos_Aires",
});

export function RevisionsList({ items }: { items: RevisionItem[] }) {
  const router = useRouter();
  const [restoring, setRestoring] = useState<number | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const restore = async (item: RevisionItem) => {
    if (!confirm(`¿Volver "${item.title}" a como estaba antes del cambio del ${dateFormatter.format(new Date(item.createdAt))}?`)) {
      return;
    }
    setRestoring(item.id);
    setMessage(null);
    const response = await fetch(`/api/admin/revisions/${item.id}/restore`, { method: "POST" }).catch(() => null);
    const data = (await response?.json().catch(() => ({}))) as { error?: string } | undefined;
    setRestoring(null);
    if (response?.ok) {
      setMessage({ ok: true, text: `Listo: ${item.title} volvió a como estaba antes. Ya se ve en el sitio.` });
      router.refresh();
    } else {
      setMessage({ ok: false, text: data?.error ?? "No se pudo restaurar" });
    }
  };

  if (items.length === 0) {
    return <p className="text-gray-400">Todavía no hay cambios guardados.</p>;
  }

  return (
    <div className="space-y-4">
      {message ? (
        <p role="status" className={message.ok ? "text-teal-300" : "text-red-400"}>
          {message.text}
        </p>
      ) : null}
      <div className="overflow-x-auto rounded-lg border border-gray-800">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-900 text-gray-400">
            <tr>
              <th className="p-3">Fecha</th>
              <th className="p-3">Sección</th>
              <th className="p-3">Contenido</th>
              <th className="p-3">Qué cambió</th>
              <th className="p-3">Quién</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-gray-800 align-top text-gray-200">
                <td className="whitespace-nowrap p-3">{dateFormatter.format(new Date(item.createdAt))}</td>
                <td className="p-3">{item.type}</td>
                <td className="p-3 font-medium text-white">{item.title}</td>
                <td className="p-3 text-gray-300">
                  <p className="mb-1 text-xs uppercase tracking-wide text-gray-500">{item.action}</p>
                  {item.changes.length ? (
                    <ul className="space-y-0.5">
                      {item.changes.map((change, index) => (
                        <li key={index}>
                          <span className="font-medium text-gray-100">{change.label}</span>
                          {change.detail ? <span className="text-gray-400"> · {change.detail}</span> : null}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </td>
                <td className="p-3 text-gray-400">{item.createdBy ?? "—"}</td>
                <td className="p-3 text-right">
                  <button
                    type="button"
                    disabled={restoring !== null}
                    onClick={() => restore(item)}
                    className="whitespace-nowrap rounded-md border border-teal-700 px-3 py-1.5 text-teal-200 hover:bg-teal-900/40 disabled:opacity-50"
                  >
                    {restoring === item.id ? "Restaurando..." : "Volver a antes de este cambio"}
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
