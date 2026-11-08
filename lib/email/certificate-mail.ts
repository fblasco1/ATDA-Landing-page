import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { renderCertificatePdf } from "@/lib/certificates/pdf";
import {
  certificatePlainText,
  certificateSubject,
  compileCertificateHtml,
  DEFAULT_CERTIFICATE_HTML,
  LOGO_CONTENT_ID,
} from "@/lib/email/certificate-template";
import { isEmailConfigured, sendEmail } from "@/lib/email/send";

const LOGO_PATH = path.join(process.cwd(), "assets", "certificates", "LOGOS.png");

export type CertificateSendInput = {
  nombre: string;
  correo: string;
  curso: string;
  dni?: string;
  fecha?: string;
  fechaCharla?: string;
  lugar?: string;
  resolucion?: string;
  horas?: string;
  reenviar?: boolean;
};

export type CertificateSendResult = { success: true } | { success: false; error: string; status: number };

function singleLine(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function certificateFilename(nombre: string) {
  const base = nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w]+/g, "-")
    .replace(/^-|-$/g, "");
  return `Certificado-${base || "participante"}.pdf`;
}

export function certificateFieldsFromBody(body: Record<string, unknown>): CertificateSendInput {
  const text = (key: string) => (typeof body[key] === "string" ? body[key] : undefined);
  return {
    nombre: String(body.nombre ?? ""),
    correo: String(body.correo ?? ""),
    curso: String(body.curso ?? ""),
    dni: text("dni"),
    fecha: text("fecha"),
    fechaCharla: text("fechaCharla"),
    lugar: text("lugar"),
    resolucion: text("resolucion"),
    horas: text("horas"),
    reenviar: body.reenviar === true,
  };
}

export async function buildCertificate(input: CertificateSendInput) {
  const nombre = singleLine(input.nombre);
  const correo = singleLine(input.correo).toLowerCase();
  const curso = singleLine(input.curso);
  const dni = singleLine(input.dni ?? "");
  const fecha = singleLine(input.fecha ?? "");
  const fechaCharla = singleLine(input.fechaCharla ?? "") || fecha;
  const lugar = singleLine(input.lugar ?? "");
  const resolucion = singleLine(input.resolucion ?? "");
  const horas = singleLine(input.horas ?? "");

  if (!nombre) return { ok: false as const, status: 400, error: "Falta el nombre del destinatario." };
  if (!isEmail(correo)) return { ok: false as const, status: 400, error: "El correo del destinatario no es válido." };
  if (!curso) return { ok: false as const, status: 400, error: "Falta el nombre de la charla o el curso." };

  const html = compileCertificateHtml(DEFAULT_CERTIFICATE_HTML, { nombre, curso, fecha: fechaCharla });
  const pdf = await renderCertificatePdf({ nombre, curso, dni, fecha, lugar, resolucion, horas });
  const logo = await readFile(LOGO_PATH);
  return {
    ok: true as const,
    nombre,
    correo,
    curso,
    subject: certificateSubject(curso).slice(0, 180),
    html,
    text: certificatePlainText(html),
    pdf,
    logo,
    filename: certificateFilename(nombre),
  };
}

export async function sendCertificateEmail(input: CertificateSendInput): Promise<CertificateSendResult> {
  if (!isEmailConfigured()) {
    return {
      success: false,
      status: 503,
      error: "El envío de mails no está configurado (RESEND_API_KEY / EMAIL_FROM).",
    };
  }

  try {
    const built = await buildCertificate(input);
    if (!built.ok) return { success: false, status: built.status, error: built.error };

    const idempotencyKey = input.reenviar
      ? undefined
      : `certificado-${createHash("sha256").update(`${built.curso}\n${built.correo}`).digest("hex")}`;

    const result = await sendEmail({
      to: built.correo,
      subject: built.subject,
      html: built.html,
      text: built.text,
      attachments: [
        {
          filename: "LOGOS.png",
          content: built.logo,
          contentType: "image/png",
          contentId: LOGO_CONTENT_ID,
        },
        { filename: built.filename, content: built.pdf, contentType: "application/pdf" },
      ],
      idempotencyKey,
    });
    if (!result.ok) return { success: false, status: 502, error: result.error };
    return { success: true };
  } catch (err) {
    return {
      success: false,
      status: 500,
      error: err instanceof Error ? err.message : "No se pudo generar o enviar el certificado.",
    };
  }
}
