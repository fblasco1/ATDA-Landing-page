import type { LandingSettings } from "./types";
import { LANDING_SETTINGS_ID } from "./env";

export const defaultLandingSettings: LandingSettings = {
  _id: LANDING_SETTINGS_ID,
  heroTitle: "Conectar saberes. Impulsar desarrollo. Construir soberanía.",
  heroSubtitle:
    "Promovemos debates estratégicos con la convicción de que la transformación productiva y tecnológica es esencial para alcanzar el desarrollo inclusivo y sostenible de la Argentina.",
  heroImageUrls: [],
  navAboutLabel: "Sobre Nosotros",
  navNewsLabel: "Novedades",
  navNetworkLabel: "Red",
  navCoursesLabel: "Propuestas",
  navContactLabel: "Contacto",
  navJoinLabel: "Quiero ser parte",
  newsTitle: "Novedades",
  newsSubtitle: "Las últimas publicaciones sobre tecnología, industria y desarrollo en Argentina.",
  networkTitle: "Nuestra Red",
  networkSubtitle:
    "Construimos alianzas con un ecosistema de instituciones, empresas y organizaciones que potencian el desarrollo tecnológico nacional.",
  coursesTitle: "Propuestas",
  coursesSubtitle: "Formaciones de ATDA.",
  membershipTitle: "Solicitud de asociación",
  membershipSubtitle:
    "Completá el formulario para pedir ser socio de ATDA. Revisamos cada solicitud y te contactamos.",
  aboutTitle: "Quiénes somos",
  aboutBody:
    "ATDA nace del compromiso de integrantes de la Universidad Tecnológica Nacional que, a partir de sus trayectorias en el sector público y privado, decidieron formar un grupo interdisciplinario de profesionales de la ingeniería, la ciencia, la técnica y la tecnología, con el propósito de generar un espacio de participación activa para la promoción del desarrollo industrial y tecnológico de Argentina.",
  aboutValues: [
    {
      icon: "collaboration",
      title: "Vinculación Tecnológica",
      description:
        "Promovemos la conexión y colaboración entre instituciones, profesionales y empresas para potenciar el sistema tecnológico nacional.",
    },
    {
      icon: "debate",
      title: "Debate y Perspectiva",
      description:
        "Aportamos una mirada técnica sobre los grandes temas del país, propiciando un espacio de debate constructivo y federal.",
    },
    {
      icon: "development",
      title: "Desarrollo Nacional",
      description:
        "Aportamos e impulsamos el análisis de la enseñanza, la investigación, el ejercicio profesional y la planificación de obras públicas y privadas.",
    },
    {
      icon: "knowledge",
      title: "Democratización del conocimiento",
      description:
        "Difundimos saberes especializados de forma comprensible, ofreciendo herramientas para entender la realidad tecnológica y económica del país.",
    },
  ],
  joinTitle: "Involucrate y sé protagonista",
  joinSubtitle:
    "Tu talento y visión son esenciales para impulsar el desarrollo tecnológico argentino. Descubrí cómo podés formar parte.",
  joinBenefits: [
    "Conectá con una red interdisciplinaria de profesionales, instituciones y empresas del sector.",
    "Participá en debates y análisis sobre los grandes temas tecnológicos que definen el futuro del país.",
    "Accedé y contribuí a la difusión de conocimiento especializado y al perfeccionamiento de la tecnología argentina.",
    "Impulsá iniciativas concretas que fortalezcan la soberanía y el desarrollo industrial nacional.",
  ],
  joinEligibility: [
    {
      title: "Profesionales",
      description:
        "Especialistas de diversas disciplinas, duras o blandas, comprometidos con el desarrollo nacional.",
    },
    { title: "Estudiantes", description: "Personas con ganas de aprender y aportar." },
    {
      title: "Empresas",
      description:
        "Organizaciones nacionales que apuestan por la innovación, la vinculación y el fortalecimiento del tejido industrial.",
    },
  ],
  joinCtaText:
    "Completá la solicitud de asociación y empezá a colaborar en la construcción de un futuro industrial soberano.",
  joinCtaLabel: "Quiero ser parte",
  contactTitle: "Contactanos",
  contactSubtitle: "¿Tenés una idea, un proyecto o querés unirte a nosotros? Nos encantaría saber de vos.",
  formspreeEndpoint: "https://formspree.io/f/xjgwjpaj",
  footerText:
    "Sitio oficial de la Asociación Civil Tecnológica por el Desarrollo Argentino (ATDA) - Dominio: atda.org.ar",
  socialTwitter: "https://x.com/atda_arg",
  socialInstagram: "https://www.instagram.com/atda_arg",
  socialLinkedin: "https://www.linkedin.com/company/atda-arg/",
  contactEmail: "mailto:mlopezbisio@gmail.com",
  statuteUrl: "https://drive.google.com/file/d/11EHh-8C7vRb_8dNqpscjGbAU0VpYUWs8/view?usp=drive_link",
  legalName: "Asociación Civil Tecnológica por el Desarrollo Argentino",
  legalCuit: "",
  legalRegistration: "",
  legalAddress: "",
  privacyEmail: "",
  privacyPolicy: "",
  termsText: "",
};

/** Nombres de secciones y menú: si quedan vacíos se usa el texto por defecto para no dejar huecos. */
const NON_EMPTY_FIELDS = new Set<keyof LandingSettings>([
  "navAboutLabel",
  "navNewsLabel",
  "navNetworkLabel",
  "navCoursesLabel",
  "navContactLabel",
  "navJoinLabel",
  "newsTitle",
  "networkTitle",
  "coursesTitle",
  "membershipTitle",
  "legalName",
]);

const NON_EMPTY_LISTS = ["aboutValues", "joinBenefits", "joinEligibility"] as const;

export function mergeLandingSettings(stored: Partial<LandingSettings> | null | undefined): LandingSettings {
  const merged: Record<string, unknown> = { ...defaultLandingSettings };
  for (const [key, value] of Object.entries(stored ?? {})) {
    if (value === null || value === undefined) continue;
    if (NON_EMPTY_FIELDS.has(key as keyof LandingSettings) && typeof value === "string" && !value.trim()) continue;
    merged[key] = value;
  }
  for (const key of NON_EMPTY_LISTS) {
    if (!stored?.[key]?.length) merged[key] = defaultLandingSettings[key];
  }
  return merged as LandingSettings;
}
