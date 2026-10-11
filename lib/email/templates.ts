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
