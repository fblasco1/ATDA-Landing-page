import { formatARS } from "@/lib/utils";
import type { Course, CoursePriceMode } from "@/lib/sanity/types";

export const PRICE_MODE_OPTIONS: Array<{ value: CoursePriceMode; label: string }> = [
  { value: "general", label: "Precio general" },
  { value: "members", label: "Precio socios / no socios" },
  { value: "free", label: "Actividad no arancelada" },
];

/** Cursos cargados antes de existir la modalidad tienen solo `price`. */
export function priceModeOf(course: Pick<Course, "priceMode">): CoursePriceMode {
  return course.priceMode ?? "general";
}

export function isFreeCourse(course: Pick<Course, "priceMode">) {
  return priceModeOf(course) === "free";
}

/** Importe a cobrar según si quien se inscribe es socio activo. */
export function coursePriceFor(course: Course, isMember: boolean): number {
  switch (priceModeOf(course)) {
    case "free":
      return 0;
    case "members":
      return (isMember ? course.memberPrice : course.nonMemberPrice) ?? course.price ?? 0;
    default:
      return course.price ?? 0;
  }
}

export type PriceLine = { label?: string; value: string };

export function coursePriceLines(course: Course): PriceLine[] {
  switch (priceModeOf(course)) {
    case "free":
      return [{ value: "Actividad no arancelada" }];
    case "members":
      return [
        { label: "Socios", value: formatARS(course.memberPrice ?? 0) },
        { label: "No socios", value: formatARS(course.nonMemberPrice ?? 0) },
      ];
    default:
      return [{ value: formatARS(course.price ?? 0) }];
  }
}
