import type { LandingSettings } from "@/lib/sanity/types";

type LegalFields = Pick<
  LandingSettings,
  "legalName" | "legalCuit" | "legalRegistration" | "legalAddress" | "privacyEmail" | "contactEmail" | "privacyPolicy"
>;

export const PRIVACY_PLACEHOLDERS = [
  "{razonSocial}",
  "{cuit}",
  "{inscripcion}",
  "{domicilio}",
  "{emailPrivacidad}",
] as const;

export function privacyContactEmail(settings: Pick<LegalFields, "privacyEmail" | "contactEmail">) {
  return settings.privacyEmail.trim() || (settings.contactEmail ?? "").replace(/^mailto:/i, "").trim();
}

/** Razón social + CUIT + inscripción en una línea, salteando lo que no esté cargado. */
export function institutionalLine(settings: Pick<LegalFields, "legalName" | "legalCuit" | "legalRegistration">) {
  return [
    settings.legalName.trim(),
    settings.legalCuit.trim() ? `CUIT ${settings.legalCuit.trim()}` : "",
    settings.legalRegistration.trim(),
  ]
    .filter(Boolean)
    .join(" · ");
}

export const DEFAULT_PRIVACY_POLICY = `## Responsable de los datos
{razonSocial} ("ATDA"){cuitTexto}{domicilioTexto} es responsable de la base de datos en la que se guarda la información que nos enviás a través de este sitio.

## Qué datos recolectamos
- Solicitud de asociación: nombre y apellido, email, DNI, teléfono, profesión y, si los completás, organización, cargo y motivación.
- Formulario de contacto: nombre, email, teléfono (si lo completás) y el mensaje que nos envíes.
- Espacio de socios: los datos de tu ficha y el estado de tu cuota.
- Inscripción a propuestas: los datos necesarios para registrar la inscripción y, si corresponde, el pago.

## Para qué los usamos
- Evaluar tu solicitud de asociación y gestionar tu condición de socio o socia (altas, cuotas y comunicaciones institucionales).
- Responder tus consultas.
- Gestionar inscripciones a cursos y actividades.
No usamos tus datos con fines publicitarios ni los vendemos o cedemos a terceros.

## Con quién los compartimos
Para operar el sitio usamos proveedores que tratan los datos por cuenta de ATDA y solo para prestar su servicio: alojamiento del sitio (Vercel), base de datos (Neon, en servidores de Amazon Web Services en São Paulo, Brasil), envío de emails (Resend), recepción del formulario de contacto (Formspree) y gestión de contenidos (Sanity). Algunos de estos proveedores están fuera de la Argentina, por lo que tus datos pueden ser transferidos a otros países con las garantías que exige la Ley 25.326.

## Cuánto tiempo los guardamos
Conservamos los datos mientras dure tu vínculo con ATDA o el tiempo necesario para cumplir la finalidad para la que los diste y las obligaciones legales de la asociación. Podés pedir que los eliminemos en cualquier momento, salvo los que debamos conservar por ley.

## Tus derechos
Podés pedir acceso, rectificación, actualización o supresión de tus datos{emailTexto}. Respondemos los pedidos de acceso dentro de los 10 días corridos y los de rectificación o supresión dentro de los 5 días hábiles.
El titular de los datos personales tiene la facultad de ejercer el derecho de acceso a los mismos en forma gratuita a intervalos no inferiores a seis meses, salvo que se acredite un interés legítimo al efecto conforme lo establecido en el artículo 14, inciso 3 de la Ley N.º 25.326.
La Agencia de Acceso a la Información Pública, en su carácter de Órgano de Control de la Ley N.º 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes en materia de protección de datos personales.

## Cookies
Este sitio solo usa cookies estrictamente necesarias para funcionar: mantener la sesión iniciada en el espacio de socios y en el panel de administración. No usamos cookies de analítica ni de publicidad.

## Cambios en esta política
Si cambiamos esta política, publicaremos la nueva versión en esta página.`;

/** Reemplaza los marcadores del texto (base o editado en el panel) con los datos institucionales. */
export function resolvePrivacyPolicy(settings: LegalFields) {
  const email = privacyContactEmail(settings);
  const values: Record<string, string> = {
    "{razonSocial}": settings.legalName.trim(),
    "{cuit}": settings.legalCuit.trim(),
    "{inscripcion}": settings.legalRegistration.trim(),
    "{domicilio}": settings.legalAddress.trim(),
    "{emailPrivacidad}": email,
    "{cuitTexto}": settings.legalCuit.trim() ? `, CUIT ${settings.legalCuit.trim()},` : "",
    "{domicilioTexto}": settings.legalAddress.trim() ? ` con domicilio en ${settings.legalAddress.trim()},` : "",
    "{emailTexto}": email ? ` escribiendo a ${email}` : " a través del formulario de contacto",
  };
  const source = settings.privacyPolicy.trim() || DEFAULT_PRIVACY_POLICY;
  return source.replace(/\{[a-zA-Z]+\}/g, (token) => values[token] ?? token);
}

export type LegalBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

/** Formato simple: "## " títulos, "- " ítems de lista, el resto párrafos (una línea = un párrafo). */
export function parseLegalText(text: string): LegalBlock[] {
  const blocks: LegalBlock[] = [];
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("## ")) {
      blocks.push({ type: "heading", text: line.slice(3).trim() });
    } else if (line.startsWith("- ")) {
      const last = blocks.at(-1);
      if (last?.type === "list") last.items.push(line.slice(2).trim());
      else blocks.push({ type: "list", items: [line.slice(2).trim()] });
    } else {
      blocks.push({ type: "paragraph", text: line });
    }
  }
  return blocks;
}
