import { after } from "next/server";
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
  update: "Antes de editar",
  delete: "Antes de borrar",
  restore: "Antes de restaurar",
};

function documentTitle(document: Record<string, unknown>) {
  for (const key of ["title", "name"]) {
    const value = document[key];
    if (typeof value === "string" && value.trim()) return value.trim().slice(0, 255);
  }
  return REVISION_TYPE_LABEL[String(document._type)] ?? null;
}

/**
 * Lee cómo está el documento antes de cambiarlo y, una vez enviada la respuesta, lo guarda en el
 * historial. Si algo falla no frena el guardado: perder una versión es mejor que no poder editar.
 */
export async function snapshotBeforeChange(documentId: string, action: RevisionAction, createdBy?: string | null) {
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
      await saveRevision({
        documentId,
        documentType: String(snapshot._type),
        title: documentTitle(snapshot),
        action,
        snapshot,
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
  await snapshotBeforeChange(revision.documentId, "restore", createdBy);
  await replaceDocument(revision.snapshot as Record<string, unknown>);
  return revision;
}
