import type { SanityDocument } from "@sanity/client";
import { processLogo } from "@/lib/images/logo";
import { getWriteClient } from "./client";
import { isSanityConfigured, LANDING_SETTINGS_ID } from "./env";
import {
  allCoursesQuery,
  allProjectsQuery,
  enrollmentsQuery,
  landingSettingsQuery,
  partnersQuery,
} from "./queries";
import type { LandingSettings } from "./types";

export async function upsertLandingSettings(data: Partial<LandingSettings>) {
  const client = getWriteClient();
  const { _id: _ignored, ...fields } = data;
  return client.createOrReplace({
    _id: LANDING_SETTINGS_ID,
    _type: "landingSettings",
    ...fields,
  });
}

export async function getRawDocument(id: string) {
  const client = getWriteClient();
  return (await client.getDocument(id)) ?? null;
}

/** Vuelve a dejar un documento como estaba en la copia (lo recrea si había sido borrado). */
export async function replaceDocument(snapshot: Record<string, unknown>) {
  const client = getWriteClient();
  const { _rev, _createdAt, _updatedAt, ...document } = snapshot as SanityDocument;
  void _rev;
  void _createdAt;
  void _updatedAt;
  return client.createOrReplace(document);
}

export async function fetchAdminSettings() {
  const client = getWriteClient();
  return client.fetch<LandingSettings | null>(landingSettingsQuery);
}

export async function listDocuments(type: string) {
  const client = getWriteClient();
  const queries: Record<string, string> = {
    project: allProjectsQuery,
    networkPartner: partnersQuery,
    course: allCoursesQuery,
    enrollment: enrollmentsQuery,
  };
  const query = queries[type];
  if (!query) {
    throw new Error(`Tipo no soportado: ${type}`);
  }
  return client.fetch(query);
}

export async function listDocumentsSafe(type: string) {
  if (!isSanityConfigured()) return [];
  try {
    return await listDocuments(type);
  } catch {
    return [];
  }
}

export async function createDocument(type: string, data: Record<string, unknown>) {
  const client = getWriteClient();
  return client.create({
    _type: type,
    ...data,
  });
}

export async function patchDocument(id: string, data: Record<string, unknown>) {
  const client = getWriteClient();
  return client.patch(id).set(data).commit();
}

export class ReferencedByEnrollmentsError extends Error {
  readonly code = "has-enrollments";

  constructor(readonly count: number) {
    super(
      count === 1
        ? "No se puede eliminar: tiene 1 inscripción asociada."
        : `No se puede eliminar: tiene ${count} inscripciones asociadas.`,
    );
    this.name = "ReferencedByEnrollmentsError";
  }
}

export async function deleteDocument(id: string, options?: { cascadeEnrollments?: boolean }) {
  const client = getWriteClient();
  const [refs, draft] = await Promise.all([
    client.fetch<Array<{ _id: string; _type: string }>>(
      `*[references($id)]{ _id, _type }`,
      { id },
      { perspective: "raw" },
    ),
    client.getDocument(`drafts.${id}`).catch(() => null),
  ]);
  const enrollments = refs.filter((ref) => ref._type === "enrollment");
  const others = refs.filter((ref) => ref._type !== "enrollment");
  if (others.length > 0) {
    throw new Error("No se puede eliminar porque otros contenidos lo referencian.");
  }
  if (enrollments.length > 0 && !options?.cascadeEnrollments) {
    throw new ReferencedByEnrollmentsError(enrollments.length);
  }

  const draftId = `drafts.${id}`;
  const mutations: Array<{ delete: { id: string } }> = [
    ...enrollments.map((ref) => ({ delete: { id: ref._id } })),
    { delete: { id } },
  ];
  if (draft) mutations.push({ delete: { id: draftId } });
  return client.mutate(mutations, { returnDocuments: false });
}

export async function uploadImage(file: File, options: { logo?: boolean } = {}) {
  const client = getWriteClient();
  const buffer = Buffer.from(await file.arrayBuffer());
  if (options.logo) {
    const logo = await processLogo(buffer, file.type, file.name);
    const asset = await client.assets.upload("image", logo.buffer, {
      filename: logo.filename,
      contentType: logo.contentType,
    });
    return { _id: asset._id, url: asset.url };
  }
  const asset = await client.assets.upload("image", buffer, {
    filename: file.name,
    contentType: file.type,
  });
  return { _id: asset._id, url: asset.url };
}

export async function createEnrollment(data: Record<string, unknown>) {
  const client = getWriteClient();
  return client.create({
    _type: "enrollment",
    classroomAccess: "pending",
    status: "pending",
    currency: "ARS",
    ...data,
  }) as Promise<SanityDocument>;
}
