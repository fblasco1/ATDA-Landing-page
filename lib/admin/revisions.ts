import { after } from "next/server";
import { diffDocuments, type ContentChange } from "@/lib/admin/changes";
import { isDatabaseConfigured } from "@/lib/db";
import { getRevision, saveRevision, type RevisionAction } from "@/lib/db/revisions";
import { getRawDocument, replaceDocument } from "@/lib/sanity/write";

export const REVISION_TYPE_LABEL: Record<string, string> = {
  landingSettings: "Contenido de la landing",
  project: "Novedad",
  networkPartner: "Red",
  course: "Propuesta",
};

export const REVISION_ACTION_LABEL: Record<string, string> = {
  update: "Edición",
  delete: "Borrado",
  restore: "Restauración",
};

function documentTitle(document: Record<string, unknown>) {
  for (const key of ["title", "name"]) {
    const value = document[key];
    if (typeof value === "string" && value.trim()) return value.trim().slice(0, 255);
  }
  return REVISION_TYPE_LABEL[String(document._type)] ?? null;
}

type NextVersion =
  /** Edición parcial: solo cambian los campos enviados. */
  | { patch: Record<string, unknown> }
  /** Reemplazo completo del documento. */
  | { replace: Record<string, unknown> };

function summarize(
  action: RevisionAction,
  current: Record<string, unknown>,
  next: NextVersion | undefined,
): ContentChange[] {
  if (action === "delete") return [{ label: "Se borró" }];
  if (!next) return [];
  const type = String(current._type);
  if ("patch" in next) {
    return diffDocuments(type, current, { ...current, ...next.patch }, Object.keys(next.patch));
  }
  return diffDocuments(type, withHeroImages(current), withHeroImages(next.replace));
}

/** Antes del carrusel el Hero tenía una sola imagen en `heroImageUrl`. */
function withHeroImages(document: Record<string, unknown>) {
  if (document._type !== undefined && document._type !== "landingSettings") return document;
  const list = document.heroImageUrls;
  if (Array.isArray(list) && list.length) return document;
  const single = document.heroImageUrl;
  return { ...document, heroImageUrls: typeof single === "string" && single ? [single] : [] };
}

/**
 * Lee cómo está el documento antes de cambiarlo y, una vez enviada la respuesta, lo guarda en el
 * historial con un resumen de qué cambia. Una edición que no cambia nada no se registra.
 * Si algo falla no frena el guardado: perder una versión es mejor que no poder editar.
 */
export async function snapshotBeforeChange(
  documentId: string,
  action: RevisionAction,
  createdBy?: string | null,
  next?: NextVersion,
) {
  if (!isDatabaseConfigured()) return;
  let document: Record<string, unknown> | null = null;
  try {
    document = await getRawDocument(documentId);
  } catch (error) {
    console.error("No se pudo leer la versión anterior", error);
  }
  if (!document) return;
  const snapshot = document;
  after(async () => {
    try {
      const changes = summarize(action, snapshot, next);
      if (action === "update" && changes.length === 0) return;
      await saveRevision({
        documentId,
        documentType: String(snapshot._type),
        title: documentTitle(snapshot),
        action,
        snapshot,
        changes,
        createdBy: createdBy ?? null,
      });
    } catch (error) {
      console.error("No se pudo guardar la versión anterior", error);
    }
  });
}

export async function restoreRevision(revisionId: number, createdBy?: string | null) {
  const revision = await getRevision(revisionId);
  if (!revision) throw new Error("Versión no encontrada");
  const snapshot = revision.snapshot as Record<string, unknown>;
  await snapshotBeforeChange(revision.documentId, "restore", createdBy, { replace: snapshot });
  await replaceDocument(snapshot);
  return revision;
}
