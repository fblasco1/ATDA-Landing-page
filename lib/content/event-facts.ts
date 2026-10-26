const WEEKDAY = "(?:lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo)";
const NUMERIC_DATE = "\\d{1,2}\\s*/\\s*\\d{1,2}(?:\\s*/\\s*\\d{2,4})?";
const CLOCK = "\\d{1,2}(?::\\d{2})?\\s*(?:hs?\\.?|horas)";

const DATE_LINE = new RegExp(
  `^(?:${WEEKDAY}(?:\\s+${NUMERIC_DATE})?|${NUMERIC_DATE})(?:\\s+a\\s+las\\s+${CLOCK})?\\.?$`,
  "i",
);
const TIME_LINE = new RegExp(`^(?:${CLOCK}|\\d{1,2}:\\d{2}|a\\s+las\\s+\\d{1,2}(?::\\d{2})?)\\.?$`, "i");
const PLACE_HINT = /\b(?:caba|bs\.?\s*as\.?|buenos aires|av\.|avenida|calle|piso|sede|sal[oó]n)\b|\b\d{2,5}\b/i;

export type EventFacts = { when?: string; where?: string };

function clean(value: string) {
  return value.replace(/[.\s]+$/g, "").trim();
}

function looksLikeWhen(value: string) {
  const line = value.trim();
  return DATE_LINE.test(line) || TIME_LINE.test(line);
}

function looksLikeWhere(value: string) {
  const line = value.trim();
  return line.length > 0 && line.length <= 90 && PLACE_HINT.test(line) && !DATE_LINE.test(line) && !TIME_LINE.test(line);
}

/** Una línea o un bloque que es solo fecha, horario y/o lugar. Si hay texto de la nota, devuelve null. */
export function logisticsFromText(text: string): EventFacts | null {
  const lines = text
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0 || lines.length > 6) return null;

  const when: string[] = [];
  const where: string[] = [];

  for (const line of lines) {
    if (line.length > 90) return null;
    const embedded = line.match(/^(.+?)\s+en\s+(.+)$/i);
    if (embedded && looksLikeWhen(embedded[1]) && looksLikeWhere(embedded[2])) {
      when.push(clean(embedded[1]));
      where.push(clean(embedded[2]));
      continue;
    }
    if (DATE_LINE.test(line) || TIME_LINE.test(line)) {
      when.push(clean(line));
      continue;
    }
    if (looksLikeWhere(line)) {
      where.push(clean(line));
      continue;
    }
    return null;
  }

  if (when.length === 0) return null;

  return {
    when: when.join(" · ") || undefined,
    where: where.join(" · ") || undefined,
  };
}

export function presentArticle(input: {
  description?: string;
  body?: string;
  eventWhen?: string;
  eventWhere?: string;
}) {
  const description = input.description?.trim() ?? "";
  const descriptionFacts = description ? logisticsFromText(description) : null;
  const paragraphs: string[] = [];
  let lifted: EventFacts | null = null;

  for (const paragraph of (input.body ?? "").split(/\n\s*\n/)) {
    const trimmed = paragraph.trim();
    if (!trimmed) continue;
    const facts = logisticsFromText(trimmed);
    if (facts) {
      lifted ??= facts;
      continue;
    }
    paragraphs.push(trimmed);
  }

  const fieldWhen = input.eventWhen?.trim() || undefined;
  const fieldWhere = input.eventWhere?.trim() || undefined;

  return {
    when: fieldWhen || lifted?.when || descriptionFacts?.when,
    where: fieldWhere || lifted?.where || descriptionFacts?.where,
    description: descriptionFacts ? "" : description,
    paragraphs,
  };
}
