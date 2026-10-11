import { LANDING_SETTINGS_ID } from "./env";

export const landingSettingsQuery = `*[_id == "${LANDING_SETTINGS_ID}"][0]{
  _id,
  heroTitle,
  heroSubtitle,
  "heroImageUrl": coalesce(heroImage.asset->url, heroImageUrl),
  aboutTitle,
  aboutBody,
  aboutValues,
  joinTitle,
  joinSubtitle,
  joinBenefits,
  joinEligibility,
  joinCtaText,
  joinCtaLabel,
  contactTitle,
  contactSubtitle,
  formspreeEndpoint,
  footerText,
  socialTwitter,
  socialInstagram,
  socialLinkedin,
  contactEmail,
  statuteUrl
}`;

export const projectsQuery = `*[_type == "project" && published == true] | order(_createdAt desc)[0...3]{
  _id,
  title,
  "slug": slug.current,
  description,
  body,
  category,
  "imageUrl": coalesce(image.asset->url, imageUrl),
  published,
  "publishedAt": _createdAt
}`;

export const publishedProjectsQuery = `*[_type == "project" && published == true] | order(_createdAt desc){
  _id,
  title,
  "slug": slug.current,
  description,
  body,
  category,
  "imageUrl": coalesce(image.asset->url, imageUrl),
  published,
  "publishedAt": _createdAt
}`;

export const allProjectsQuery = `*[_type == "project"] | order(_createdAt desc){
  _id,
  title,
  "slug": slug.current,
  description,
  body,
  category,
  "imageUrl": coalesce(image.asset->url, imageUrl),
  published,
  "publishedAt": _createdAt
}`;

export const projectBySlugQuery = `*[_type == "project" && slug.current == $slug && published == true][0]{
  _id,
  title,
  "slug": slug.current,
  description,
  body,
  category,
  "imageUrl": coalesce(image.asset->url, imageUrl),
  published,
  "publishedAt": _createdAt
}`;

export const projectCategoriesQuery = `array::unique(*[_type == "project" && published == true && defined(category) && category != ""].category) | order(@ asc)`;

export const partnersQuery = `*[_type == "networkPartner"] | order(name asc){
  _id,
  name,
  url,
  "logoUrl": coalesce(logo.asset->url, logoUrl),
  logoBackground
}`;

export const coursesQuery = `*[_type == "course" && defined(price)] | order(_createdAt desc){
  _id,
  title,
  "slug": slug.current,
  description,
  category,
  price,
  active,
  "imageUrl": coalesce(image.asset->url, imageUrl),
  quota
}`;

export const allCoursesQuery = `*[_type == "course"] | order(_createdAt desc){
  _id,
  title,
  "slug": slug.current,
  description,
  category,
  price,
  active,
  "imageUrl": coalesce(image.asset->url, imageUrl),
  quota
}`;

export const courseBySlugQuery = `*[_type == "course" && slug.current == $slug && active == true][0]{
  _id,
  title,
  "slug": slug.current,
  description,
  category,
  price,
  active,
  "imageUrl": coalesce(image.asset->url, imageUrl),
  quota
}`;

export const courseByIdQuery = `*[_type == "course" && _id == $id][0]{
  _id,
  title,
  "slug": slug.current,
  description,
  category,
  price,
  active,
  "imageUrl": coalesce(image.asset->url, imageUrl),
  quota
}`;

export const courseCategoriesQuery = `array::unique(*[_type == "course" && defined(price) && defined(category) && category != ""].category) | order(@ asc)`;

export const enrollmentsQuery = `*[_type == "enrollment"] | order(_createdAt desc){
  _id,
  "course": course->{ _id, title, "slug": slug.current },
  buyer,
  amount,
  currency,
  provider,
  providerPaymentId,
  status,
  classroomAccess,
  notes,
  modoQr,
  modoDeeplink,
  modoExpiresAt,
  "createdAt": _createdAt
}`;

export const enrollmentByIdQuery = `*[_type == "enrollment" && _id == $id][0]{
  _id,
  "course": course->{ _id, title, "slug": slug.current },
  buyer,
  amount,
  currency,
  provider,
  providerPaymentId,
  status,
  classroomAccess,
  notes,
  modoQr,
  modoDeeplink,
  modoExpiresAt,
  "createdAt": _createdAt
}`;
