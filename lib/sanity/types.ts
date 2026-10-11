export type FocusIcon = string;
export type ValueIcon = string;
export type PaymentProvider = "modo" | "free" | "manual";
export type PaymentStatus = "pending" | "paid" | "failed" | "expired" | "underpaid" | "overpaid";
export type ClassroomAccess = "pending" | "granted";

export type AboutValue = {
  _key?: string;
  title: string;
  description: string;
  icon: ValueIcon;
};

export type EligibilityItem = {
  title: string;
  description: string;
};

export type LandingSettings = {
  _id: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl?: string;
  /** Imágenes del carrusel del Hero, en orden. Si está vacío se usa `heroImageUrl`. */
  heroImageUrls: string[];
  navAboutLabel: string;
  navNewsLabel: string;
  navNetworkLabel: string;
  navCoursesLabel: string;
  navContactLabel: string;
  navJoinLabel: string;
  newsTitle: string;
  newsSubtitle: string;
  networkTitle: string;
  networkSubtitle: string;
  coursesTitle: string;
  coursesSubtitle: string;
  membershipTitle: string;
  membershipSubtitle: string;
  aboutTitle: string;
  aboutBody: string;
  aboutValues: AboutValue[];
  joinTitle: string;
  joinSubtitle: string;
  joinBenefits: string[];
  joinEligibility: EligibilityItem[];
  joinCtaText: string;
  joinCtaLabel: string;
  contactTitle: string;
  contactSubtitle: string;
  formspreeEndpoint: string;
  footerText: string;
  socialTwitter?: string;
  socialInstagram?: string;
  socialLinkedin?: string;
  contactEmail?: string;
  statuteUrl?: string;
  /** Razón social exacta según el estatuto / IGJ. */
  legalName: string;
  legalCuit: string;
  /** Datos de inscripción, p. ej. "IGJ Resolución N.º 123/2024". */
  legalRegistration: string;
  legalAddress: string;
  /** Email para consultas y derechos sobre datos personales. */
  privacyEmail: string;
  /** Texto de /privacidad. Vacío = texto base generado con los datos institucionales. */
  privacyPolicy: string;
};

export type Project = {
  _id: string;
  title: string;
  slug?: string;
  description: string;
  body?: string;
  category?: string;
  imageUrl?: string;
  published: boolean;
  publishedAt?: string;
};

export type NetworkPartner = {
  _id: string;
  name: string;
  url?: string;
  logoUrl?: string;
  logoBackground?: "white" | "dark" | "none";
};

export type CoursePriceMode = "general" | "members" | "free";

export type Course = {
  _id: string;
  title: string;
  slug: string;
  description: string;
  category?: string;
  priceMode?: CoursePriceMode;
  /** Precio general (modalidad "general"). */
  price?: number | null;
  memberPrice?: number | null;
  nonMemberPrice?: number | null;
  active: boolean;
  imageUrl?: string;
  quota?: number | null;
};

export type EnrollmentBuyer = {
  name: string;
  email: string;
  dni: string;
  phone: string;
  isMember?: boolean;
};

export type Enrollment = {
  _id: string;
  course?: { _id: string; title: string; slug?: string } | null;
  buyer: EnrollmentBuyer;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  providerPaymentId?: string;
  status: PaymentStatus;
  classroomAccess: ClassroomAccess;
  notes?: string;
  modoQr?: string;
  modoDeeplink?: string;
  modoExpiresAt?: string;
  createdAt?: string;
};

export type LandingContent = {
  settings: LandingSettings;
  projects: Project[];
  partners: NetworkPartner[];
  courses: Course[];
};

export type NavLink = {
  name: string;
  href: string;
};
