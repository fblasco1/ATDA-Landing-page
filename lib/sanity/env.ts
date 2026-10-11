export const LANDING_SETTINGS_ID = "landingSettings";

export function getSanityEnv() {
  return {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "t61vrots",
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  };
}

export function isSanityConfigured() {
  return Boolean(getSanityEnv().projectId);
}
