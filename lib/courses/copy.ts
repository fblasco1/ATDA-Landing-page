import { logisticsFromText } from "@/lib/content/event-facts";
import type { Course } from "@/lib/sanity/types";

export const SHORT_DESCRIPTION_MAX = 200;

const WEEKDAY = /^(?:lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo)\b/i;
const DATE = /\b\d{1,2}\s*\/\s*\d{1,2}\b/;
const TIME = /^(?:\d{1,2}(?::\d{2})?\s*(?:hs?\.?|horas)|a las\s+\d)/i;
const PLACE = /\b(?:caba|bs\.?\s*as\.?|buenos aires|av\.|avenida|calle|piso|sede|sal[oó]n)\b|\b\d{2,5}\b/i;

export type CourseFacts = {
  when?: string;
  where?: string;
  /** Texto que queda después de sacar fecha, horario y lugar. */
  summary: string;
};

function isDatePart(value: string) {
  return WEEKDAY.test(value) || DATE.test(value);
}

function isTimePart(value: string) {
  return TIME.test(value);
}

function isPlacePart(value: string) {
  return PLACE.test(value);
}

/**
 * Si el texto empieza con `fecha | horario | lugar | resto`, separa los datos
 * prácticos del relato. Si no sigue ese formato, devuelve el texto entero.
 */
export function splitCourseFacts(text: string): CourseFacts {
  const trimmed = text.trim();
  if (!trimmed) return { summary: "" };

  const parts = trimmed
    .split(/\s*\|\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length < 2 || !isDatePart(parts[0])) return { summary: trimmed };

  const when: string[] = [];
  const where: string[] = [];
  let index = 0;

  for (; index < parts.length; index += 1) {
    const part = parts[index];
    if (part.length > 80) break;
    if (index === 0 || isTimePart(part)) {
      when.push(part);
      continue;
    }
    if (where.length === 0 && isPlacePart(part)) {
      where.push(part);
      continue;
    }
    break;
  }

  if (index < 2) return { summary: trimmed };

  return {
    when: when.join(" · ") || undefined,
    where: where[0],
    summary: parts.slice(index).join(" | ").trim(),
  };
}

function clip(text: string, max: number) {
  const value = text.replace(/\s+/g, " ").trim();
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trimEnd()}…`;
}

function storyText(text: string) {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph && !logisticsFromText(paragraph))
    .join("\n\n")
    .trim();
}

export function courseCardCopy(
  course: Pick<Course, "shortDescription" | "description" | "eventWhen" | "eventWhere">,
) {
  const short = course.shortDescription?.trim() ?? "";
  const long = course.description?.trim() ?? "";
  const fromShort = splitCourseFacts(short);
  const fromLong = splitCourseFacts(long);
  const summarySource = storyText(short ? fromShort.summary : fromLong.summary);

  return {
    when: course.eventWhen?.trim() || fromShort.when || fromLong.when,
    where: course.eventWhere?.trim() || fromShort.where || fromLong.where,
    summary: clip(summarySource, 140),
  };
}

export function courseCardDescription(
  course: Pick<Course, "shortDescription" | "description" | "eventWhen" | "eventWhere">,
) {
  return courseCardCopy(course).summary;
}

export function coursePageCopy(
  course: Pick<Course, "shortDescription" | "description" | "eventWhen" | "eventWhere">,
) {
  const short = course.shortDescription?.trim() ?? "";
  const long = course.description?.trim() ?? "";
  const fromLong = splitCourseFacts(long);
  const fromShort = splitCourseFacts(short);
  const body = storyText(long ? fromLong.summary : fromShort.summary);

  return {
    when: course.eventWhen?.trim() || fromLong.when || fromShort.when,
    where: course.eventWhere?.trim() || fromLong.where || fromShort.where,
    body,
  };
}

export function coursePageDescription(
  course: Pick<Course, "shortDescription" | "description" | "eventWhen" | "eventWhere">,
) {
  return coursePageCopy(course).body;
}

/** Normaliza las dos descripciones de una propuesta. Devuelve el error, o null si están bien. */
export function normalizeCourseCopy(data: Record<string, unknown>) {
  if (!("priceMode" in data) && !("shortDescription" in data)) return null;
  const short = String(data.shortDescription ?? "").trim();
  const long = String(data.description ?? "").trim();
  if (!short) return "La descripción corta es obligatoria.";
  if (short.length > SHORT_DESCRIPTION_MAX) {
    return `La descripción corta puede tener hasta ${SHORT_DESCRIPTION_MAX} caracteres.`;
  }
  if (!long) return "La descripción larga es obligatoria.";
  data.shortDescription = short;
  data.description = long;
  return null;
}
