export function certificateSubject(curso: string) {
  return `${curso.trim()} Certificado de Participación`;
}

export const LOGO_CONTENT_ID = "logo_cabecera";

export const DEFAULT_CERTIFICATE_HTML = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Tu certificado de asistencia</title>
</head>
<body style="margin:0;padding:0;background:#f2f4f7;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f4f7;">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#ffffff;border-radius:6px;font-family:Arial,Helvetica,sans-serif;color:#222222;">

<tr><td align="center" style="padding:20px 28px 16px 28px;border-radius:6px 6px 0 0;">
<img src="cid:${LOGO_CONTENT_ID}" alt="ATDA – Asociación Tecnológica para el Desarrollo Argentino | UTN – Universidad Tecnológica Nacional" width="520" style="display:block;width:520px;max-width:100%;height:auto;border:0;">
</td></tr>

<tr><td style="background:#1F3864;padding:22px 28px;">
<div style="font-size:12px;color:#c9d3e6;letter-spacing:1px;">UNIVERSIDAD TECNOLÓGICA NACIONAL</div>
<div style="font-size:20px;font-weight:bold;color:#ffffff;padding-top:6px;line-height:1.3;">{{Curso}}</div>
</td></tr>

<tr><td style="padding:26px 28px 6px 28px;font-size:15px;line-height:1.55;">
<p style="margin:0 0 14px 0;">Estimado/a {{Nombre}}:</p>
<p style="margin:0 0 14px 0;">Te agradecemos por haber participado de la charla realizada el <strong>{{Fecha}}</strong>. Te hacemos llegar, <strong>adjunto a este correo</strong>, tu certificado de asistencia en formato PDF.</p>
</td></tr>

<tr><td style="padding:6px 28px 6px 28px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eaf1fb;border-left:5px solid #1F3864;">
<tr><td style="padding:12px 16px;font-size:15px;line-height:1.5;color:#1F3864;">
<strong>Certificado de asistencia.</strong> Si detectás algún error en tus datos, respondé este correo y te lo reenviaremos corregido.
</td></tr></table>
</td></tr>

<tr><td style="padding:20px 28px 26px 28px;font-size:15px;line-height:1.55;">
<p style="margin:0 0 14px 0;">¡Gracias por acompañarnos!</p>
<p style="margin:0;">Secretaría de Cultura y Extensión Universitaria<br>
Universidad Tecnológica Nacional</p>
</td></tr>

<tr><td align="center" style="padding:16px 28px 22px 28px;border-top:1px solid #e3e7ee;font-size:13px;line-height:1.6;color:#555555;">
<div style="font-weight:bold;color:#1F3864;padding-bottom:4px;">Seguí a ATDA</div>
<a href="https://www.instagram.com/ATDA_ARG" style="color:#1F3864;text-decoration:none;">Instagram @ATDA_ARG</a> &nbsp;|&nbsp;
<a href="https://www.atda.org.ar" style="color:#1F3864;text-decoration:none;">www.atda.org.ar</a>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function compileCertificateHtml(
  template: string,
  values: { nombre: string; curso: string; fecha: string },
) {
  const fecha = values.fecha.trim() || "la fecha indicada";
  return template
    .replace(/\{\{\s*Nombre\s*\}\}/gi, escapeHtml(values.nombre.trim()))
    .replace(/\{\{\s*Curso\s*\}\}/gi, escapeHtml(values.curso.trim()))
    .replace(/\{\{\s*Fecha\s*\}\}/gi, escapeHtml(fecha));
}

export function certificatePlainText(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+\n/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
