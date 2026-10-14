import { cookies, draftMode } from "next/headers";
import { cache } from "react";
import { isDatabaseConfigured } from "@/lib/db";
import { getPreviewData } from "@/lib/db/previews";
import { mergeLandingSettings } from "./defaults";
import { getCourseBySlug, getLandingContent, getProjectBySlug } from "./fetch";
import type { Course, LandingContent, NetworkPartner, Project } from "./types";

export const PREVIEW_COOKIE = "atda_preview";

export const PREVIEW_DOCUMENT_TYPES = ["project", "networkPartner", "course"] as const;
export type PreviewDocumentType = (typeof PREVIEW_DOCUMENT_TYPES)[number];

/** Vista previa de un alta o edición desde las vistas de contenido del panel. */
export type DocumentPreview = {
  kind: "document";
  docType: PreviewDocumentType;
  /** Vacío si es un contenido nuevo. */
  id?: string;
  data: Record<string, unknown>;
};

const NEW_DOCUMENT_ID = "vista-previa";

/** La página del sitio donde se ve el contenido de la vista previa. */
export function previewUrl(preview: DocumentPreview) {
  const slug = slugOf(preview.data);
  if (preview.docType === "networkPartner") return "/#network";
  if (preview.docType === "project") return slug ? `/novedades/${slug}` : "/novedades";
  return slug ? `/propuestas/${slug}` : "/propuestas";
}

function slugOf(data: Record<string, unknown>) {
  const slug = data.slug;
  if (typeof slug === "string") return slug;
  if (slug && typeof slug === "object" && "current" in slug) return String((slug as { current?: unknown }).current ?? "");
  return "";
}

function isDocumentPreview(data: Record<string, unknown>): data is DocumentPreview {
  return (
    data.kind === "document" &&
    PREVIEW_DOCUMENT_TYPES.includes(data.docType as PreviewDocumentType) &&
    typeof data.data === "object" &&
    data.data !== null
  );
}

/** Datos de la vista previa activa, si un admin la abrió desde el panel. Una sola lectura por request. */
const getActivePreview = cache(async () => {
  const { isEnabled } = await draftMode();
  if (!isEnabled || !isDatabaseConfigured()) return null;
  const token = (await cookies()).get(PREVIEW_COOKIE)?.value;
  return token ? await getPreviewData(token).catch(() => null) : null;
});

function previewDocument<T extends { _id: string }>(preview: DocumentPreview, existing?: T): T {
  const fields = { ...preview.data, slug: slugOf(preview.data) || undefined };
  return {
    ...(existing ?? { publishedAt: new Date().toISOString() }),
    ...fields,
    _id: preview.id || NEW_DOCUMENT_ID,
  } as unknown as T;
}

function withPreview<T extends { _id: string }>(list: T[], preview: DocumentPreview): T[] {
  const id = preview.id || NEW_DOCUMENT_ID;
  const existing = list.find((item) => item._id === id);
  const document = previewDocument(preview, existing);
  return existing ? list.map((item) => (item._id === id ? document : item)) : [document, ...list];
}

function applyDocumentPreview(content: LandingContent, preview: DocumentPreview): LandingContent {
  switch (preview.docType) {
    case "networkPartner":
      return {
        ...content,
        partners: withPreview<NetworkPartner>(content.partners, preview).sort((a, b) =>
          a.name.localeCompare(b.name, "es"),
        ),
      };
    case "project":
      return { ...content, projects: withPreview<Project>(content.projects, preview) };
    case "course":
      return { ...content, courses: withPreview<Course>(content.courses, preview) };
  }
}

/**
 * Contenido de la landing para el sitio público. Si un admin activó la vista previa desde el panel,
 * se ve lo que todavía no guardó: los textos de la landing o un aliado, novedad o propuesta.
 */
export async function getSiteContent() {
  const content = await getLandingContent();
  const data = await getActivePreview();
  if (!data) return { ...content, preview: false };
  if (isDocumentPreview(data)) return { ...applyDocumentPreview(content, data), preview: true };
  return { ...content, settings: mergeLandingSettings(data), preview: true };
}

/** El documento en vista previa si es del tipo y slug pedidos. */
async function previewForSlug<T extends { _id: string }>(
  docType: PreviewDocumentType,
  slug: string,
  load: () => Promise<T | null>,
) {
  const data = await getActivePreview();
  if (data && isDocumentPreview(data) && data.docType === docType && slugOf(data.data) === slug) {
    const existing = data.id ? await load().catch(() => null) : null;
    return { document: previewDocument<T>(data, existing ?? undefined), preview: true };
  }
  return { document: await load(), preview: false };
}

export function getSiteProjectBySlug(slug: string) {
  return previewForSlug<Project>("project", slug, () => getProjectBySlug(slug));
}

export function getSiteCourseBySlug(slug: string) {
  return previewForSlug<Course>("course", slug, () => getCourseBySlug(slug));
}
