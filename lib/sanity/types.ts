export type FocusIcon = string;
export type ValueIcon = string;
export type PaymentProvider = "modo";
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

export type Course = {
  _id: string;
  title: string;
  slug: string;
  description: string;
  category?: string;
  price: number;
  active: boolean;
  imageUrl?: string;
  quota?: number | null;
};

export type EnrollmentBuyer = {
  name: string;
  email: string;
  dni: string;
  phone: string;
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
