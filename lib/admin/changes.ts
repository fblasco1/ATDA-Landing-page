import { PRICE_MODE_OPTIONS } from "@/lib/courses/pricing";

export type ContentChange = { label: string; detail?: string };

const FIELD_LABELS: Record<string, Record<string, string>> = {
  landingSettings: {
    heroTitle: "Hero: título",
    heroSubtitle: "Hero: subtítulo",
    heroImageUrls: "Hero: imágenes",
    navAboutLabel: "Menú: Sobre nosotros",
    navNewsLabel: "Menú: Novedades",
    navNetworkLabel: "Menú: Red",
    navCoursesLabel: "Menú: Propuestas",
    navContactLabel: "Menú: Contacto",
    navJoinLabel: "Botón Quiero ser parte",
    newsTitle: "Novedades: título",
    newsSubtitle: "Novedades: bajada",
    networkTitle: "Red: título",
    networkSubtitle: "Red: bajada",
    coursesTitle: "Propuestas: título",
    coursesSubtitle: "Propuestas: bajada",
    membershipTitle: "Asociación: título",
    membershipSubtitle: "Asociación: bajada",
    aboutTitle: "Quiénes somos: título",
    aboutBody: "Quiénes somos: texto",
    aboutValues: "Quiénes somos: valores",
    joinTitle: "Sumate: título",
    joinSubtitle: "Sumate: subtítulo",
    joinBenefits: "Sumate: beneficios",
    joinEligibility: "Sumate: quiénes pueden sumarse",
    joinCtaText: "Sumate: texto del llamado",
    joinCtaLabel: "Sumate: botón",
    contactTitle: "Contacto: título",
    contactSubtitle: "Contacto: subtítulo",
    formspreeEndpoint: "Contacto: endpoint del formulario",
    footerText: "Footer: texto",
    socialTwitter: "Redes: X / Twitter",
    socialInstagram: "Redes: Instagram",
    socialLinkedin: "Redes: LinkedIn",
    contactEmail: "Email de contacto",
    statuteUrl: "Estatuto",
    legalName: "Datos institucionales: razón social",
    legalCuit: "Datos institucionales: CUIT",
    legalRegistration: "Datos institucionales: inscripción",
    legalAddress: "Datos institucionales: domicilio",
    privacyEmail: "Datos institucionales: email de privacidad",
    privacyPolicy: "Política de privacidad",
    termsText: "Términos y condiciones",
  },
  project: {
    title: "Título",
    category: "Categoría",
    imageUrl: "Portada",
    description: "Copete",
    body: "Cuerpo de la nota",
    published: "Publicado",
  },
  networkPartner: {
    name: "Nombre",
    url: "Sitio web",
    logoBackground: "Fondo del logo",
    logoUrl: "Logo",
  },
  course: {
    title: "Título",
    category: "Categoría",
    priceMode: "Arancel",
    price: "Precio general",
    memberPrice: "Precio socios",
    nonMemberPrice: "Precio no socios",
    quota: "Cupo",
    imageUrl: "Imagen",
    description: "Descripción",
    active: "Activo",
  },
};

const VALUE_LABELS: Record<string, Record<string, string>> = {
  priceMode: Object.fromEntries(PRICE_MODE_OPTIONS.map((option) => [option.value, option.label])),
  logoBackground: { white: "Blanco", dark: "Oscuro", none: "Sin fondo" },
};

const IMAGE_FIELDS = new Set(["imageUrl", "logoUrl"]);

const LIST_NOUNS: Record<string, [string, string]> = {
  heroImageUrls: ["imagen", "imágenes"],
  joinBenefits: ["beneficio", "beneficios"],
};

const SHORT_TEXT = 60;

function isEmpty(value: unknown) {
  return value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0);
}

/** Quita `_key` y demás campos internos de Sanity para comparar solo el contenido. */
function clean(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(clean);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([key]) => !key.startsWith("_"))
        .map(([key, item]) => [key, clean(item)]),
    );
  }
  return value;
}

function same(a: unknown, b: unknown) {
  if (isEmpty(a) && isEmpty(b)) return true;
  return JSON.stringify(clean(a)) === JSON.stringify(clean(b));
}

function quote(value: unknown, field: string) {
  if (isEmpty(value)) return "(vacío)";
  if (typeof value === "boolean") return value ? "Sí" : "No";
  const text = String(value);
  return `“${VALUE_LABELS[field]?.[text] ?? text}”`;
}

function plural(count: number, [one, many]: [string, string]) {
  return `${count} ${count === 1 ? one : many}`;
}

function describeStringList(field: string, before: string[], after: string[]) {
  const noun = LIST_NOUNS[field] ?? ["elemento", "elementos"];
  const added = after.filter((item) => !before.includes(item)).length;
  const removed = before.filter((item) => !after.includes(item)).length;
  const parts: string[] = [];
  if (added) parts.push(`se ${added === 1 ? "agregó" : "agregaron"} ${plural(added, noun)}`);
  if (removed) parts.push(`se ${removed === 1 ? "quitó" : "quitaron"} ${plural(removed, noun)}`);
  if (!parts.length) parts.push("se cambió el orden");
  return parts.join(", ");
}

function itemName(item: unknown, index: number) {
  const title = item && typeof item === "object" ? (item as Record<string, unknown>).title : null;
  return typeof title === "string" && title.trim() ? title.trim() : `#${index + 1}`;
}

function describeObjectList(before: unknown[], after: unknown[]) {
  const edited: string[] = [];
  const length = Math.max(before.length, after.length);
  for (let index = 0; index < length; index += 1) {
    if (!same(before[index], after[index])) edited.push(itemName(after[index] ?? before[index], index));
  }
  return `cambios en ${edited.join(", ")}`;
}

function describe(field: string, before: unknown, after: unknown) {
  if (IMAGE_FIELDS.has(field)) {
    if (isEmpty(before)) return "se agregó la imagen";
    if (isEmpty(after)) return "se quitó la imagen";
    return "se cambió la imagen";
  }
  if (Array.isArray(before) || Array.isArray(after)) {
    const a = Array.isArray(before) ? before : [];
    const b = Array.isArray(after) ? after : [];
    const strings = [...a, ...b].every((item) => typeof item === "string");
    return strings ? describeStringList(field, a as string[], b as string[]) : describeObjectList(a, b);
  }
  const long = [before, after].some((value) => typeof value === "string" && value.length > SHORT_TEXT);
  if (long) return "se editó el texto";
  return `${quote(before, field)} → ${quote(after, field)}`;
}

/**
 * Resume qué cambió entre dos versiones de un documento, con los nombres de campo que ve el admin.
 * Con `onlyKeys` se comparan solo esos campos (una edición parcial no toca el resto).
 */
export function diffDocuments(
  documentType: string,
  before: Record<string, unknown>,
  after: Record<string, unknown>,
  onlyKeys?: string[],
): ContentChange[] {
  const labels = FIELD_LABELS[documentType] ?? {};
  const keys = onlyKeys ?? [...new Set([...Object.keys(before), ...Object.keys(after)])];
  const changes: ContentChange[] = [];
  for (const key of Object.keys(labels)) {
    if (!keys.includes(key)) continue;
    if (same(before[key], after[key])) continue;
    changes.push({ label: labels[key], detail: describe(key, before[key], after[key]) });
  }
  return changes;
}
