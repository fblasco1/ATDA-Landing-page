import { LANDING_SETTINGS_ID } from "./env";

export const landingSettingsQuery = `*[_id == "${LANDING_SETTINGS_ID}"][0]{
  _id,
  heroTitle,
  heroSubtitle,
  "heroImageUrl": coalesce(heroImage.asset->url, heroImageUrl),
  heroImageUrls,
  navAboutLabel,
  navNewsLabel,
  navNetworkLabel,
  navCoursesLabel,
  navContactLabel,
  navJoinLabel,
  newsTitle,
  newsSubtitle,
  networkTitle,
  networkSubtitle,
  coursesTitle,
  coursesSubtitle,
  membershipTitle,
  membershipSubtitle,
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
  statuteUrl,
  legalName,
  legalCuit,
  legalRegistration,
  legalAddress,
  privacyEmail,
  privacyPolicy,
  termsText,
  faqText
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

const courseProjection = `{
  _id,
  title,
  "slug": slug.current,
  description,
  category,
  priceMode,
  price,
  memberPrice,
  nonMemberPrice,
  active,
  "imageUrl": coalesce(image.asset->url, imageUrl),
  quota
}`;

/** Un curso se publica si tiene precio cargado según su modalidad. */
const coursePriced = `(priceMode == "free" || (priceMode == "members" && defined(memberPrice) && defined(nonMemberPrice)) || ((!defined(priceMode) || priceMode == "general") && defined(price)))`;

export const coursesQuery = `*[_type == "course" && ${coursePriced}] | order(_createdAt desc)${courseProjection}`;

export const allCoursesQuery = `*[_type == "course"] | order(_createdAt desc)${courseProjection}`;

export const courseBySlugQuery = `*[_type == "course" && slug.current == $slug && active == true][0]${courseProjection}`;

export const courseByIdQuery = `*[_type == "course" && _id == $id][0]${courseProjection}`;

export const courseCategoriesQuery = `array::unique(*[_type == "course" && ${coursePriced} && defined(category) && category != ""].category) | order(@ asc)`;

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
