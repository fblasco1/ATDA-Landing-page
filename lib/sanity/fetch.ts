import { revalidateTag, unstable_cache } from "next/cache";
import { getReadClient } from "./client";
import { defaultLandingSettings, mergeLandingSettings } from "./defaults";
import { isSanityConfigured } from "./env";
import {
  courseByIdQuery,
  courseBySlugQuery,
  courseCategoriesQuery,
  coursesQuery,
  enrollmentByIdQuery,
  enrollmentsQuery,
  landingSettingsQuery,
  partnersQuery,
  projectBySlugQuery,
  projectCategoriesQuery,
  projectsQuery,
  publishedProjectsQuery,
} from "./queries";
import type {
  Course,
  Enrollment,
  LandingContent,
  LandingSettings,
  NetworkPartner,
  Project,
} from "./types";

const emptyLanding = (): LandingContent => ({
  settings: defaultLandingSettings,
  projects: [],
  partners: [],
  courses: [],
});

/** Los cursos inactivos se muestran como historial, siempre después de los activos. */
function activeFirst(courses: Course[]) {
  return [...courses.filter((course) => course.active), ...courses.filter((course) => !course.active)];
}

async function loadLandingContent(): Promise<LandingContent> {
  const client = getReadClient({ useCdn: false });
  if (!client) return emptyLanding();

  try {
    const [settings, projects, partners, courses] = await Promise.all([
      client.fetch<LandingSettings | null>(landingSettingsQuery),
      client.fetch<Project[]>(projectsQuery),
      client.fetch<NetworkPartner[]>(partnersQuery),
      client.fetch<Course[]>(coursesQuery),
    ]);

    return {
      settings: mergeLandingSettings(settings),
      projects: projects ?? [],
      partners: partners ?? [],
      courses: activeFirst(courses ?? []),
    };
  } catch (error) {
    console.error("Error al leer Sanity", error);
    return emptyLanding();
  }
}

const getCachedLandingContent = unstable_cache(loadLandingContent, ["landing-content"], {
  tags: ["landing"],
  revalidate: 60,
});

/** El cache puede venir de un deploy anterior sin los campos nuevos: los defaults se completan al leer. */
export async function getLandingContent(): Promise<LandingContent> {
  const content = await getCachedLandingContent();
  return { ...content, settings: mergeLandingSettings(content.settings) };
}

/** Tras guardar desde el panel, la próxima visita al sitio tiene que ver el cambio, no la versión anterior. */
export function expireLandingCache() {
  revalidateTag("landing", { expire: 0 });
}

export async function getCourseBySlug(slug: string) {
  const client = getReadClient();
  if (!client) return null;
  return client.fetch<Course | null>(courseBySlugQuery, { slug });
}

export async function getProjectBySlug(slug: string) {
  const client = getReadClient();
  if (!client) return null;
  return client.fetch<Project | null>(projectBySlugQuery, { slug });
}

export async function getPublishedProjects() {
  const client = getReadClient();
  if (!client) return [] as Project[];
  return client.fetch<Project[]>(publishedProjectsQuery);
}

export async function getProjectCategories() {
  const client = getReadClient();
  if (!client) return [] as string[];
  return client.fetch<string[]>(projectCategoriesQuery);
}

export async function getCourseCategories() {
  const client = getReadClient();
  if (!client) return [] as string[];
  return client.fetch<string[]>(courseCategoriesQuery);
}

export async function getCourseById(id: string) {
  const client = getReadClient();
  if (!client) return null;
  return client.fetch<Course | null>(courseByIdQuery, { id });
}

export async function getEnrollmentById(id: string) {
  const client = getReadClient();
  if (!client) return null;
  return client.fetch<Enrollment | null>(enrollmentByIdQuery, { id });
}

export async function getEnrollmentByIdFresh(id: string) {
  try {
    const { getWriteClient } = await import("./client");
    return getWriteClient().fetch<Enrollment | null>(enrollmentByIdQuery, { id });
  } catch {
    return getEnrollmentById(id);
  }
}

export async function getEnrollments() {
  const client = getReadClient();
  if (!client) return [] as Enrollment[];
  return client.fetch<Enrollment[]>(enrollmentsQuery);
}

export function isSanityReady() {
  return isSanityConfigured();
}
