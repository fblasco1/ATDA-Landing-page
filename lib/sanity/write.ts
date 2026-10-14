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

export async function deleteDocument(id: string) {
  const client = getWriteClient();
  return client.delete(id);
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
