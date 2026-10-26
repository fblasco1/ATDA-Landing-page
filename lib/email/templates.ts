function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Estructura común con estilos en línea: muchos clientes de correo ignoran <style>. */
function layout(body: string) {
  return `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#111827;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="background:linear-gradient(135deg,#1d4ed8,#0d9488);background-color:#1d4ed8;padding:20px 28px;color:#ffffff;font-size:18px;font-weight:bold;">
                ATDA · Asociación Tecnológica por el Desarrollo Argentino
              </td>
            </tr>
            <tr>
              <td style="padding:28px;font-size:15px;line-height:1.6;">
                ${body}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function button(href: string, label: string) {
  return `<p style="margin:28px 0;text-align:center;">
  <a href="${escapeHtml(href)}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:bold;padding:14px 28px;border-radius:8px;">${escapeHtml(label)}</a>
</p>`;
}

export function classroomWelcomeEmail(input: {
  fullName: string;
  courseTitle: string;
  classroomUrl: string;
}) {
  const firstName = input.fullName.trim().split(/\s+/)[0] || input.fullName;
  const subject = `Bienvenida a ${input.courseTitle}`;
  const html = layout(`
    <p style="margin:0 0 16px;">Hola ${escapeHtml(firstName)},</p>
    <p style="margin:0 0 16px;">¡Bienvenido/a a <strong>${escapeHtml(input.courseTitle)}</strong>!</p>
    <p style="margin:0 0 16px;">Ya tenés acceso al aula virtual. Entrá con este enlace:</p>
    ${button(input.classroomUrl, "Entrar al aula")}
    <p style="margin:0 0 16px;font-size:13px;color:#6b7280;">Si el botón no funciona, copiá este enlace en el navegador:<br /><a href="${escapeHtml(input.classroomUrl)}" style="color:#2563eb;word-break:break-all;">${escapeHtml(input.classroomUrl)}</a></p>
    <p style="margin:0;">Cualquier duda, respondé este mail y te ayudamos.</p>
  `);
  const text = [
    `Hola ${firstName},`,
    "",
    `¡Bienvenido/a a ${input.courseTitle}!`,
    "Ya tenés acceso al aula virtual. Entrá con este enlace:",
    input.classroomUrl,
    "",
    "Cualquier duda, respondé este mail y te ayudamos.",
  ].join("\n");
  return { subject, html, text };
}

export function memberActivationEmail(input: { fullName: string; email: string; baseUrl: string }) {
  const firstName = input.fullName.trim().split(/\s+/)[0] || input.fullName;
  const activateUrl = `${input.baseUrl}/socio/activar?email=${encodeURIComponent(input.email)}`;
  const subject = "Ya sos socio/a de ATDA: activá tu acceso";

  const html = layout(`
    <p style="margin:0 0 16px;">Hola ${escapeHtml(firstName)},</p>
    <p style="margin:0 0 16px;">¡Bienvenido/a a ATDA! Tu solicitud de asociación fue aprobada.</p>
    <p style="margin:0 0 16px;">Para entrar al espacio de socios, activá tu acceso y elegí una contraseña. Te vamos a pedir el <strong>DNI</strong> que cargaste en la solicitud.</p>
    ${button(activateUrl, "Activar mi acceso")}
    <p style="margin:0 0 16px;font-size:13px;color:#6b7280;">Si el botón no funciona, copiá este enlace en el navegador:<br /><a href="${escapeHtml(activateUrl)}" style="color:#2563eb;word-break:break-all;">${escapeHtml(activateUrl)}</a></p>
    <p style="margin:0;font-size:13px;color:#6b7280;">Si no pediste asociarte a ATDA, ignorá este mensaje.</p>
  `);

  const text = [
    `Hola ${firstName},`,
    "",
    "¡Bienvenido/a a ATDA! Tu solicitud de asociación fue aprobada.",
    "Para entrar al espacio de socios, activá tu acceso y elegí una contraseña. Te vamos a pedir el DNI que cargaste en la solicitud.",
    "",
    `Activar mi acceso: ${activateUrl}`,
    "",
    "Si no pediste asociarte a ATDA, ignorá este mensaje.",
  ].join("\n");

  return { subject, html, text };
}

export function withdrawalReceiptEmail(input: { fullName: string; code: string; purchase: string }) {
  const firstName = input.fullName.trim().split(/\s+/)[0] || input.fullName;
  const subject = `Recibimos tu pedido de arrepentimiento (código ${input.code})`;
  const html = layout(`
    <p style="margin:0 0 16px;">Hola ${escapeHtml(firstName)},</p>
    <p style="margin:0 0 16px;">Recibimos tu pedido para revocar la contratación de <strong>${escapeHtml(input.purchase)}</strong>.</p>
    <p style="margin:0 0 16px;">Tu código de seguimiento es:</p>
    <p style="margin:0 0 24px;font-size:24px;font-weight:bold;letter-spacing:2px;text-align:center;">${escapeHtml(input.code)}</p>
    <p style="margin:0 0 16px;">El equipo de ATDA va a procesar la devolución por el mismo medio de pago y te va a escribir a este email. Guardá este código por si necesitás consultarnos.</p>
  `);
  const text = [
    `Hola ${firstName},`,
    "",
    `Recibimos tu pedido para revocar la contratación de ${input.purchase}.`,
    `Tu código de seguimiento es: ${input.code}`,
    "",
    "El equipo de ATDA va a procesar la devolución por el mismo medio de pago y te va a escribir a este email.",
  ].join("\n");
  return { subject, html, text };
}

export function withdrawalNotifyEmail(input: {
  code: string;
  fullName: string;
  email: string;
  dni: string;
  purchase: string;
  details?: string;
  baseUrl: string;
}) {
  const subject = `Botón de arrepentimiento: ${input.fullName} (${input.code})`;
  const html = layout(`
    <p style="margin:0 0 16px;">Llegó un pedido de arrepentimiento. Hay que responderlo y gestionar la devolución.</p>
    <p style="margin:0 0 4px;"><strong>${escapeHtml(input.fullName)}</strong> · DNI ${escapeHtml(input.dni)}</p>
    <p style="margin:0 0 4px;">${escapeHtml(input.email)}</p>
    <p style="margin:0 0 4px;">Compra: ${escapeHtml(input.purchase)}</p>
    ${input.details ? `<p style="margin:0 0 16px;color:#4b5563;">${escapeHtml(input.details)}</p>` : ""}
    <p style="margin:0 0 16px;">Código: <strong>${escapeHtml(input.code)}</strong></p>
    ${button(`${input.baseUrl}/admin/arrepentimientos`, "Ver en el panel")}
  `);
  const text = [
    "Llegó un pedido de arrepentimiento.",
    `${input.fullName} · DNI ${input.dni}`,
    input.email,
    `Compra: ${input.purchase}`,
    input.details ?? "",
    `Código: ${input.code}`,
    `Panel: ${input.baseUrl}/admin/arrepentimientos`,
  ]
    .filter(Boolean)
    .join("\n");
  return { subject, html, text };
}

export function newMembershipRequestEmail(input: {
  fullName: string;
  email: string;
  profession: string;
  organization?: string;
  baseUrl: string;
}) {
  const panelUrl = `${input.baseUrl}/admin/socios`;
  const subject = `Nueva solicitud de asociación: ${input.fullName}`;
  const details = [input.profession, input.organization].filter(Boolean).join(" · ");

  const html = layout(`
    <p style="margin:0 0 16px;">Llegó una nueva solicitud de asociación.</p>
    <p style="margin:0 0 4px;"><strong>${escapeHtml(input.fullName)}</strong></p>
    <p style="margin:0 0 4px;">${escapeHtml(input.email)}</p>
    ${details ? `<p style="margin:0 0 16px;color:#4b5563;">${escapeHtml(details)}</p>` : ""}
    ${button(panelUrl, "Revisar en el panel")}
  `);

  const text = [
    "Llegó una nueva solicitud de asociación.",
    "",
    input.fullName,
    input.email,
    details,
    "",
    `Revisar en el panel: ${panelUrl}`,
  ]
    .filter((line, index, lines) => line !== "" || lines[index - 1] !== "")
    .join("\n");

  return { subject, html, text };
}
