"use client";

import { useMemo, useState } from "react";
import { formatARS } from "@/lib/utils";
import type { Enrollment } from "@/lib/sanity/types";

const PAYMENT_STATUS_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "pending", label: "Pendiente" },
  { value: "paid", label: "Pagado" },
  { value: "underpaid", label: "Pago parcial" },
  { value: "overpaid", label: "Pago en exceso" },
  { value: "expired", label: "Expirado" },
  { value: "failed", label: "Fallido" },
] as const;

function normalize(value: string | undefined | null) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function EnrollmentsTable({ items }: { items: Enrollment[] }) {
  const [rows, setRows] = useState(items);
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");

  const courses = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of rows) {
      if (row.course?._id) {
        map.set(row.course._id, row.course.title ?? row.course._id);
      }
    }
    return [...map.entries()]
      .map(([id, title]) => ({ id, title }))
      .sort((a, b) => a.title.localeCompare(b.title, "es"));
  }, [rows]);

  const visible = useMemo(() => {
    const q = normalize(query);
    return rows.filter((row) => {
      if (courseFilter !== "all" && row.course?._id !== courseFilter) return false;
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      if (!q) return true;
      const haystack = normalize(
        [row.buyer?.name, row.buyer?.email, row.buyer?.dni].filter(Boolean).join(" "),
      );
      return haystack.includes(q);
    });
  }, [rows, courseFilter, statusFilter, query]);

  const grantAccess = async (id: string) => {
    const notes = prompt("Notas del aula (usuario/enlace asignado a mano)") ?? "";
    const response = await fetch(`/api/admin/enrollments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classroomAccess: "granted", notes }),
    });
    if (!response.ok) {
      setMessage("No se pudo actualizar");
      return;
    }
    setRows((current) =>
      current.map((row) => (row._id === id ? { ...row, classroomAccess: "granted", notes } : row)),
    );
    setMessage("Aula marcada como asignada");
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <label className="text-sm text-gray-400">
          Curso
          <select
            value={courseFilter}
            onChange={(event) => setCourseFilter(event.target.value)}
            className="mt-1 w-full rounded-md border border-gray-700 bg-gray-900 p-2 text-white"
          >
            <option value="all">Todos</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-gray-400">
          Estado de pago
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="mt-1 w-full rounded-md border border-gray-700 bg-gray-900 p-2 text-white"
          >
            {PAYMENT_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-gray-400">
          Nombre / apellido / DNI
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nombre, apellido o DNI"
            className="mt-1 w-full rounded-md border border-gray-700 bg-gray-900 p-2 text-white"
          />
        </label>
      </div>
      {message ? <p className="text-teal-300">{message}</p> : null}
      <p className="text-sm text-gray-500">
        {visible.length} de {rows.length} inscripción{rows.length === 1 ? "" : "es"}
      </p>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-gray-300">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400">
              <th className="p-3">Curso</th>
              <th className="p-3">Comprador</th>
              <th className="p-3">Importe</th>
              <th className="p-3">Medio</th>
              <th className="p-3">Pago</th>
              <th className="p-3">Aula</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500">
                  No hay inscripciones con esos filtros.
                </td>
              </tr>
            ) : (
              visible.map((row) => (
                <tr key={row._id} className="border-b border-gray-800">
                  <td className="p-3">{row.course?.title ?? "—"}</td>
                  <td className="p-3">
                    <div>{row.buyer?.name}</div>
                    <div className="text-xs text-gray-500">{row.buyer?.email}</div>
                    <div className="text-xs text-gray-500">DNI {row.buyer?.dni}</div>
                    {row.buyer?.isMember ? <div className="text-xs text-teal-300">Socio/a</div> : null}
                  </td>
                  <td className="p-3">{row.provider === "free" ? "Sin cargo" : formatARS(row.amount)}</td>
                  <td className="p-3">{row.provider === "free" ? "—" : "MODO"}</td>
                  <td className="p-3">{row.status}</td>
                  <td className="p-3">
                    {row.classroomAccess === "granted" ? "Asignada" : "Pendiente"}
                    {row.notes ? <div className="text-xs text-gray-500">{row.notes}</div> : null}
                  </td>
                  <td className="p-3">
                    {row.status === "paid" && row.classroomAccess !== "granted" ? (
                      <button
                        type="button"
                        onClick={() => grantAccess(row._id)}
                        className="rounded-md bg-teal-700 px-3 py-1 text-white"
                      >
                        Marcar aula asignada
                      </button>
                    ) : null}
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
