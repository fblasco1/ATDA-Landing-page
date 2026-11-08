"use client";

import { buttonClass } from "@/components/ui/button";
import {
  downloadUpdatedWorkbook,
  isMarkedYes,
  isValidEmail,
  parseCertificateWorkbook,
  type CertificateRecipient,
} from "@/lib/certificates/workbook";
import { certificateSubject } from "@/lib/email/certificate-template";
import type { Course, Enrollment, PaymentStatus } from "@/lib/sanity/types";
import { CircleAlert, CircleCheck, Download, Eye, FileSpreadsheet, GraduationCap, LoaderCircle, Search, Send } from "lucide-react";
import { useMemo, useRef, useState } from "react";

type SessionStatus = "idle" | "sending" | "sent" | "error";

type RowState = CertificateRecipient & {
  pago?: PaymentStatus;
  sessionStatus: SessionStatus;
  sessionError?: string;
};

type Filter = "all" | "attended" | "pending" | "sent" | "error";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "attended", label: "Asistieron" },
  { id: "pending", label: "Sin asistencia" },
  { id: "sent", label: "Enviados" },
  { id: "error", label: "Errores" },
];

const PAYMENT_LABEL: Record<PaymentStatus, string> = {
  pending: "Pago pendiente",
  paid: "Pagado",
  failed: "Pago fallido",
  expired: "Expirado",
  underpaid: "Pago parcial",
  overpaid: "Pago en exceso",
};

function sameId(left?: string | null, right?: string | null) {
  if (!left || !right) return false;
  return left.replace(/^drafts\./, "") === right.replace(/^drafts\./, "");
}

function courseOf(row: Pick<RowState, "curso">, curso: string) {
  return row.curso.trim() || curso.trim();
}

function canSend(row: RowState, curso: string, resendSent: boolean) {
  if (!row.asistio || !isValidEmail(row.correo) || !courseOf(row, curso)) return false;
  if (resendSent) return row.sessionStatus !== "sending";
  return row.sessionStatus !== "sent" && row.sessionStatus !== "sending" && !isMarkedYes(row.enviado);
}

export function CertificatesPanel({
  courses,
  enrollments,
  emailConfigured,
  emailFrom,
}: {
  courses: Course[];
  enrollments: Enrollment[];
  emailConfigured: boolean;
  emailFrom: string | null;
}) {
  const [courseId, setCourseId] = useState("");
  const [curso, setCurso] = useState(
    "Operación de Terminales Marítimas Petroleras y proyectos energéticos en desarrollo en Argentina",
  );
  const [fecha, setFecha] = useState("Octubre 2026");
  const [fechaCharla, setFechaCharla] = useState("martes 27 de octubre de 2026");
  const [lugar, setLugar] = useState("CABA");
  const [resolucion, setResolucion] = useState("1376/26 - Anexo I");
  const [horas, setHoras] = useState("2");
  const [rows, setRows] = useState<RowState[]>([]);
  const [sourceLabel, setSourceLabel] = useState("");
  const [sheetError, setSheetError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [resendSent, setResendSent] = useState(false);
  const [running, setRunning] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [batch, setBatch] = useState<{ done: number; total: number; failed: number } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const orderedCourses = useMemo(
    () => [...courses].filter((course) => course.title).sort((a, b) => a.title.localeCompare(b.title, "es")),
    [courses],
  );

  const selectedCourse = orderedCourses.find((course) => sameId(course._id, courseId));
  const courseEnrollments = useMemo(
    () => (selectedCourse ? enrollments.filter((item) => sameId(item.course?._id, selectedCourse._id)) : []),
    [enrollments, selectedCourse],
  );

  const subject = curso.trim() ? certificateSubject(curso) : "Elegí el nombre de la charla o el curso";

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (q && !`${row.nombre} ${row.correo} ${row.dni} ${courseOf(row, curso)}`.toLowerCase().includes(q)) return false;
      const sent = row.sessionStatus === "sent" || isMarkedYes(row.enviado);
      if (filter === "attended") return row.asistio;
      if (filter === "pending") return !row.asistio;
      if (filter === "sent") return sent;
      if (filter === "error") return row.sessionStatus === "error";
      return true;
    });
  }, [curso, filter, query, rows]);

  const counts = useMemo(() => {
    let attended = 0;
    let ready = 0;
    let sent = 0;
    let failed = 0;
    for (const row of rows) {
      const already = row.sessionStatus === "sent" || isMarkedYes(row.enviado);
      if (row.sessionStatus === "error") failed += 1;
      if (already) sent += 1;
      if (!row.asistio) continue;
      attended += 1;
      if (canSend(row, curso, resendSent)) ready += 1;
    }
    return { total: rows.length, attended, ready, sent, failed };
  }, [curso, resendSent, rows]);

  function replaceRows(next: RowState[], label: string) {
    if (rows.length && !window.confirm("Esto reemplaza el listado actual.")) return false;
    setRows(next);
    setSourceLabel(label);
    setSheetError("");
    setNotice("");
    setBatch(null);
    return true;
  }

  function loadCourse() {
    if (!selectedCourse) {
      setNotice("Elegí una capacitación.");
      return;
    }
    const next = courseEnrollments.map((item) => ({
      key: item._id,
      nombre: item.buyer?.name?.trim() || "",
      correo: item.buyer?.email?.trim() || "",
      dni: item.buyer?.dni?.trim() || "",
      asistio: false,
      enviado: "",
      fecha: "",
      curso: "",
      pago: item.status,
      sessionStatus: "idle" as const,
    }));
    const ok = replaceRows(next, `${next.length} inscriptos de ${selectedCourse.title}`);
    if (!ok) return;
    setCurso(selectedCourse.title);
    if (!next.length) setNotice("Esa capacitación no tiene inscripciones cargadas.");
  }

  async function onWorkbook(file: File | undefined) {
    if (!file) return;
    setSheetError("");
    const parsed = await parseCertificateWorkbook(file);
    if (!parsed.ok) {
      setSheetError(parsed.error);
      return;
    }
    const next = parsed.sheet.rows.map((row) => ({ ...row, sessionStatus: "idle" as const }));
    const ok = replaceRows(next, `${next.length} filas de ${file.name}`);
    if (!ok) return;
    const fromSheet = next.find((row) => row.curso)?.curso;
    if (fromSheet && !curso.trim()) setCurso(fromSheet);
    const fromDate = next.find((row) => row.fecha)?.fecha;
    if (fromDate) setFecha(fromDate);
  }

  function toggleAttendance(key: string) {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, asistio: !row.asistio } : row)));
  }

  function markVisible(attended: boolean) {
    const keys = new Set(visible.map((row) => row.key));
    setRows((current) => current.map((row) => (keys.has(row.key) ? { ...row, asistio: attended } : row)));
  }

  function certificateBody(extra: {
    nombre: string;
    correo?: string;
    dni?: string;
    fecha?: string;
    curso?: string;
    reenviar?: boolean;
  }) {
    return {
      curso: extra.curso || curso,
      fecha: extra.fecha || fecha,
      fechaCharla,
      lugar,
      resolucion,
      horas,
      nombre: extra.nombre,
      correo: extra.correo,
      dni: extra.dni ?? "",
      reenviar: extra.reenviar,
    };
  }

  async function preview() {
    if (!curso.trim()) {
      setNotice("Completá el nombre de la charla o el curso para ver el certificado.");
      return;
    }
    setPreviewing(true);
    setNotice("");
    try {
      const sample = rows.find((row) => row.nombre.trim());
      const response = await fetch("/api/admin/certificados/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          certificateBody({
            nombre: sample?.nombre || "Cuassolo Canalis, Leandro",
            dni: sample ? sample.dni : "36.849.233",
            fecha: sample?.fecha || fecha,
          }),
        ),
      });
      if (!response.ok || !response.headers.get("content-type")?.includes("pdf")) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setNotice(data.error || "No se pudo generar la vista previa.");
        return;
      }
      const url = URL.createObjectURL(await response.blob());
      window.open(url, "_blank", "noopener");
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      setNotice("No se pudo generar la vista previa.");
    } finally {
      setPreviewing(false);
    }
  }

  async function sendRows(targets: RowState[]) {
    if (running) return;
    if (!emailConfigured) {
      setNotice("Falta RESEND_API_KEY o EMAIL_FROM para enviar.");
      return;
    }
    const ready = targets.filter((row) => canSend(row, curso, resendSent));
    if (!ready.length) {
      setNotice("Marcá como asistentes a las personas con correo válido.");
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setRunning(true);
    setNotice("");
    setBatch({ done: 0, total: ready.length, failed: 0 });
    let failed = 0;

    for (const [index, target] of ready.entries()) {
      if (controller.signal.aborted) break;
      setRows((current) =>
        current.map((row) =>
          row.key === target.key ? { ...row, sessionStatus: "sending", sessionError: undefined } : row,
        ),
      );
      try {
        const response = await fetch("/api/admin/certificados/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify(
            certificateBody({
              nombre: target.nombre,
              correo: target.correo,
              dni: target.dni,
              curso: courseOf(target, curso),
              fecha: target.fecha || fecha,
              reenviar: resendSent,
            }),
          ),
        });
        const data = (await response.json().catch(() => ({ error: "Respuesta inválida del servidor" }))) as {
          success?: boolean;
          error?: string;
        };
        if (response.status === 401 || response.status === 403 || response.status === 503) {
          const message = data.error || "El servidor rechazó el envío.";
          setNotice(message);
          setRows((current) =>
            current.map((row) => (row.key === target.key ? { ...row, sessionStatus: "error", sessionError: message } : row)),
          );
          failed += 1;
          setBatch({ done: index + 1, total: ready.length, failed });
          break;
        }
        if (!response.ok || data.success !== true) throw new Error(data.error || "No se pudo enviar el certificado.");
        setRows((current) =>
          current.map((row) =>
            row.key === target.key ? { ...row, enviado: "Sí", sessionStatus: "sent", sessionError: undefined } : row,
          ),
        );
      } catch (err) {
        if (controller.signal.aborted) {
          setRows((current) =>
            current.map((row) => (row.sessionStatus === "sending" ? { ...row, sessionStatus: "idle" } : row)),
          );
          break;
        }
        failed += 1;
        const message = err instanceof Error ? err.message : "Error al enviar.";
        setRows((current) =>
          current.map((row) => (row.key === target.key ? { ...row, sessionStatus: "error", sessionError: message } : row)),
        );
      }
      setBatch({ done: index + 1, total: ready.length, failed });
    }

    setRunning(false);
    abortRef.current = null;
    if (controller.signal.aborted) setNotice("Envío detenido. Los que ya salieron quedaron marcados como enviados.");
  }

  async function downloadSheet() {
    if (!rows.length) return;
    const matrix = [
      ["Nombre y apellido", "Correo", "DNI", "Capacitación", "Asistió", "Enviado"],
      ...rows.map((row) => [
        row.nombre,
        row.correo,
        row.dni,
        courseOf(row, curso),
        row.asistio ? "Sí" : "No",
        row.enviado,
      ]),
    ];
    await downloadUpdatedWorkbook({
      matrix,
      sheetName: "Certificados",
      filename: "certificados-enviados.xlsx",
    });
  }

  const progress = batch && batch.total > 0 ? Math.round((batch.done / batch.total) * 100) : 0;

  return (
    <div className="mt-8 space-y-6">
      {emailConfigured ? (
        <p className="rounded-xl border border-teal-900 bg-teal-950/40 px-4 py-3 text-sm text-teal-100">
          Los certificados se envían con Resend{emailFrom ? ` desde ${emailFrom}` : ""}.
        </p>
      ) : (
        <p className="rounded-xl border border-amber-800 bg-amber-950/40 px-4 py-3 text-sm text-amber-100">
          Falta RESEND_API_KEY o EMAIL_FROM. Sin eso se puede armar el listado y ver el certificado, pero no enviarlo.
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-gray-800 bg-gray-900 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <GraduationCap className="h-5 w-5 text-teal-300" />
            Inscripciones de una capacitación
          </div>
          <p className="mt-2 text-sm text-gray-400">
            Trae las personas anotadas en el sitio. Después marcá quién asistió o participó.
          </p>
          <label className="mt-4 block text-sm text-gray-300">
            Capacitación
            <select
              value={courseId}
              onChange={(event) => setCourseId(event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-700 bg-gray-950 px-3 py-2 text-white outline-none focus:border-blue-500"
            >
              <option value="">Elegí una capacitación</option>
              {orderedCourses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                  {course.active ? "" : " (inactiva)"}
                </option>
              ))}
            </select>
          </label>
          <button type="button" onClick={loadCourse} className={`${buttonClass({ size: "sm" })} mt-4`} disabled={!courseId}>
            Cargar {courseEnrollments.length} inscriptos
          </button>
        </section>

        <section
          className="rounded-xl border border-gray-800 bg-gray-900 p-4"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            const file = Array.from(event.dataTransfer.files).find((item) => /\.xlsx?$/i.test(item.name));
            void onWorkbook(file);
          }}
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <FileSpreadsheet className="h-5 w-5 text-teal-300" />
            Listado Excel
          </div>
          <p className="mt-2 text-sm text-gray-400">
            Columnas Nombre y apellido y Correo. Si están, también usa DNI, Asistió, Participó, Capacitación, Fecha y Enviado.
          </p>
          <label className={`${buttonClass({ variant: "secondary", size: "sm", className: "mt-4 cursor-pointer" })}`}>
            Elegir Excel
            <input
              type="file"
              accept=".xlsx,.xls"
              className="sr-only"
              onChange={(event) => {
                void onWorkbook(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
          </label>
        </section>
      </div>

      {sourceLabel ? <p className="text-sm text-gray-400">{sourceLabel}</p> : null}
      {sheetError ? <p className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-200">{sheetError}</p> : null}
      {notice ? <p className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-gray-200">{notice}</p> : null}

      <div className="grid gap-4 rounded-xl border border-gray-800 bg-gray-900 p-4 md:grid-cols-2">
        <label className="block text-sm text-gray-300">
          Nombre de la charla o curso
          <input
            value={curso}
            onChange={(event) => setCurso(event.target.value)}
            className="mt-1 w-full rounded-md border border-gray-700 bg-gray-950 px-3 py-2 text-white outline-none focus:border-blue-500"
          />
        </label>
        <label className="block text-sm text-gray-300">
          Fecha del certificado
          <input
            value={fecha}
            onChange={(event) => setFecha(event.target.value)}
            className="mt-1 w-full rounded-md border border-gray-700 bg-gray-950 px-3 py-2 text-white outline-none focus:border-blue-500"
          />
        </label>
        <label className="block text-sm text-gray-300">
          Lugar
          <input
            value={lugar}
            onChange={(event) => setLugar(event.target.value)}
            className="mt-1 w-full rounded-md border border-gray-700 bg-gray-950 px-3 py-2 text-white outline-none focus:border-blue-500"
          />
        </label>
        <label className="block text-sm text-gray-300">
          Resolución
          <input
            value={resolucion}
            onChange={(event) => setResolucion(event.target.value)}
            className="mt-1 w-full rounded-md border border-gray-700 bg-gray-950 px-3 py-2 text-white outline-none focus:border-blue-500"
          />
        </label>
        <label className="block text-sm text-gray-300">
          Carga horaria
          <input
            value={horas}
            onChange={(event) => setHoras(event.target.value)}
            className="mt-1 w-full rounded-md border border-gray-700 bg-gray-950 px-3 py-2 text-white outline-none focus:border-blue-500"
          />
        </label>
        <label className="block text-sm text-gray-300 md:col-span-2">
          Fecha de la charla en el mail
          <input
            value={fechaCharla}
            onChange={(event) => setFechaCharla(event.target.value)}
            className="mt-1 w-full rounded-md border border-gray-700 bg-gray-950 px-3 py-2 text-white outline-none focus:border-blue-500"
          />
        </label>
        <p className="md:col-span-2 text-sm text-gray-400">
          Asunto: <span className="text-white">{subject}</span>
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Stat label="Personas" value={counts.total} />
        <Stat label="Asistieron" value={counts.attended} />
        <Stat label="Listos para enviar" value={counts.ready} />
        <Stat label="Enviados" value={counts.sent} />
        <Stat label="Errores de esta sesión" value={counts.failed} />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="relative block min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre, correo o capacitación"
            className="w-full rounded-md border border-gray-700 bg-gray-950 py-2 pl-9 pr-3 text-sm text-white outline-none focus:border-blue-500"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`rounded-full px-3 py-1 text-xs ${filter === item.id ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {batch ? (
        <div>
          <div className="mb-2 flex justify-between text-xs text-gray-400">
            <span>
              {batch.done} de {batch.total}
              {batch.failed ? ` · ${batch.failed} con error` : ""}
            </span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-800">
            <div className="h-full bg-teal-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={running || counts.ready === 0} onClick={() => void sendRows(rows)} className={buttonClass({ size: "sm" })}>
          {running ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          Enviar a quienes asistieron
        </button>
        <button type="button" onClick={() => markVisible(true)} disabled={!visible.length} className={buttonClass({ variant: "secondary", size: "sm" })}>
          Marcar visibles como asistentes
        </button>
        <button type="button" onClick={() => markVisible(false)} disabled={!visible.length} className={buttonClass({ variant: "secondary", size: "sm" })}>
          Quitar asistencia
        </button>
        <button type="button" onClick={() => void preview()} disabled={previewing} className={buttonClass({ variant: "secondary", size: "sm" })}>
          <Eye className="mr-2 h-4 w-4" />
          {previewing ? "Generando…" : "Ver modelo"}
        </button>
        {running ? (
          <button type="button" onClick={() => abortRef.current?.abort()} className={buttonClass({ variant: "secondary", size: "sm" })}>
            Detener
          </button>
        ) : null}
        <button type="button" disabled={!rows.length} onClick={() => void downloadSheet()} className={buttonClass({ variant: "secondary", size: "sm" })}>
          <Download className="mr-2 h-4 w-4" />
          Descargar Excel
        </button>
        <label className="flex items-center gap-2 text-sm text-gray-300">
          <input type="checkbox" checked={resendSent} onChange={(event) => setResendSent(event.target.checked)} />
          Incluir ya enviados
        </label>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-800">
        <div className="max-h-[640px] overflow-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="sticky top-0 bg-gray-900 text-xs uppercase tracking-wide text-gray-400">
              <tr>
                <th className="px-3 py-3 font-medium">Asistió</th>
                <th className="px-3 py-3 font-medium">Nombre</th>
                <th className="px-3 py-3 font-medium">Correo</th>
                <th className="px-3 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-gray-500">
                    {rows.length ? "Nada coincide con el filtro." : "Cargá un Excel o los inscriptos de una capacitación."}
                  </td>
                </tr>
              ) : (
                visible.map((row) => (
                  <tr key={row.key} className="border-t border-gray-800 align-top">
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={row.asistio}
                        onChange={() => toggleAttendance(row.key)}
                        aria-label={`Asistió ${row.nombre || row.correo}`}
                      />
                    </td>
                    <td className="px-3 py-3 text-white">
                      {row.nombre || "—"}
                      {row.dni ? <span className="mt-1 block text-xs text-gray-500">DNI {row.dni}</span> : null}
                      {row.curso && row.curso !== curso.trim() ? (
                        <span className="mt-1 block text-xs text-gray-500">{row.curso}</span>
                      ) : null}
                      {row.pago ? <span className="mt-1 block text-xs text-gray-500">{PAYMENT_LABEL[row.pago]}</span> : null}
                    </td>
                    <td className="px-3 py-3 text-gray-300">{row.correo || "—"}</td>
                    <td className="px-3 py-3">
                      <RowStatus row={row} curso={curso} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 px-4 py-3">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function RowStatus({ row, curso }: { row: RowState; curso: string }) {
  if (row.sessionStatus === "sending") {
    return (
      <span className="inline-flex items-center gap-1 text-blue-300">
        <LoaderCircle className="h-4 w-4 animate-spin" /> Enviando
      </span>
    );
  }
  if (row.sessionStatus === "error") {
    return (
      <span className="inline-flex items-start gap-1 text-red-300">
        <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
        {row.sessionError || "Error"}
      </span>
    );
  }
  if (row.sessionStatus === "sent" || isMarkedYes(row.enviado)) {
    return (
      <span className="inline-flex items-center gap-1 text-teal-300">
        <CircleCheck className="h-4 w-4" /> Enviado
      </span>
    );
  }
  const issues: string[] = [];
  if (!row.asistio) issues.push("Sin asistencia");
  if (!row.nombre.trim()) issues.push("Falta el nombre");
  if (!isValidEmail(row.correo)) issues.push("Correo inválido");
  if (!courseOf(row, curso)) issues.push("Falta la capacitación");
  if (issues.length) return <span className="text-amber-200">{issues.join(" · ")}</span>;
  return <span className="text-gray-300">Listo</span>;
}
