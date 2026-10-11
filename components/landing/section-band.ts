export type SectionBand = "base" | "alt";

/** Fondos alternados de la landing (base oscuro / alt un tono más claro). */
export function sectionBandClass(band: SectionBand = "base") {
  return band === "alt" ? "bg-gray-800" : "bg-gray-900";
}

/** Superficie de cards según el fondo de la sección. */
export function sectionCardClass(band: SectionBand = "base") {
  return band === "alt" ? "bg-gray-900" : "bg-gray-800";
}

export function createBandAllocator() {
  let index = 0;
  return (): SectionBand => (index++ % 2 === 0 ? "base" : "alt");
}
