"use client";

import { useState, type FormEvent } from "react";
import { coursePriceFor } from "@/lib/courses/pricing";
import type { Course, Enrollment } from "@/lib/sanity/types";

export function NewEnrollmentForm({
  courses,
  onCreated,
}: {
  courses: Course[];
  onCreated: (enrollment: Enrollment) => void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [courseId, setCourseId] = useState("");
  const [amount, setAmount] = useState("");

  const selectCourse = (id: string) => {
    setCourseId(id);
    const course = courses.find((item) => item._id === id);
    setAmount(course ? String(coursePriceFor(course, false)) : "");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch("/api/admin/enrollments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, amount: Number(amount || 0) }),
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string; enrollment?: Enrollment };
    setBusy(false);
    if (!response.ok || !data.enrollment) {
      setError(data.error ?? "No se pudo crear la inscripción");
      return;
    }
    onCreated(data.enrollment);
    setCourseId("");
    setAmount("");
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={courses.length === 0}
        title={courses.length === 0 ? "Primero cargá una propuesta" : undefined}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        + Nueva inscripción
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-800 bg-gray-900/50 p-4">
      <h3 className="font-semibold text-white">Nueva inscripción</h3>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm text-gray-400 md:col-span-2">
          Propuesta <span className="text-teal-400">*</span>
          <select
            name="courseId"
            required
            value={courseId}
            onChange={(event) => selectCourse(event.target.value)}
            className="mt-1 w-full rounded-md border border-gray-700 bg-gray-950 p-2 text-white"
          >
            <option value="" disabled>
              Elegí una propuesta
            </option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.title}
                {course.active ? "" : " (inactiva)"}
              </option>
            ))}
          </select>
        </label>
        <Input name="name" label="Nombre y apellido" required />
        <Input name="email" label="Email" type="email" required />
        <Input name="dni" label="DNI" inputMode="numeric" required />
        <Input name="phone" label="Teléfono" type="tel" inputMode="tel" required />
        <label className="text-sm text-gray-400">
          Importe (ARS)
          <input
            type="number"
            min={0}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="mt-1 w-full rounded-md border border-gray-700 bg-gray-950 p-2 text-white"
          />
        </label>
        <label className="text-sm text-gray-400">
          Estado de pago
          <select
            name="status"
            defaultValue="paid"
            className="mt-1 w-full rounded-md border border-gray-700 bg-gray-950 p-2 text-white"
          >
            <option value="paid">Pagado</option>
            <option value="pending">Pendiente</option>
          </select>
        </label>
        <label className="text-sm text-gray-400 md:col-span-2">
          Notas
          <textarea
            name="notes"
            rows={2}
            placeholder="Ej.: pagó por transferencia el 10/10"
            className="mt-1 w-full rounded-md border border-gray-700 bg-gray-950 p-2 text-white"
          />
        </label>
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {busy ? "Creando…" : "Crear inscripción"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

function Input({
  name,
  label,
  type = "text",
  inputMode,
  required,
}: {
  name: string;
  label: string;
  type?: string;
  inputMode?: "numeric" | "tel" | "email" | "text";
  required?: boolean;
}) {
  return (
    <label className="text-sm text-gray-400">
      {label}
      {required ? <span className="text-teal-400"> *</span> : null}
      <input
        name={name}
        type={type}
        inputMode={inputMode}
        required={required}
        autoComplete="off"
        className="mt-1 w-full rounded-md border border-gray-700 bg-gray-950 p-2 text-white"
      />
    </label>
  );
}
