import { createClient, type ClientConfig } from "@sanity/client";
import { getSanityEnv, isSanityConfigured } from "./env";

function baseConfig(): ClientConfig {
  const { projectId, dataset } = getSanityEnv();
  return {
    projectId,
    dataset,
    apiVersion: "2025-01-01",
    useCdn: false,
  };
}

/** `useCdn: false` para lecturas que ya cachea Next: el CDN de Sanity tarda unos segundos en reflejar cambios. */
export function getReadClient({ useCdn = true }: { useCdn?: boolean } = {}) {
  if (!isSanityConfigured()) return null;
  return createClient({
    ...baseConfig(),
    useCdn,
    token: process.env.SANITY_API_READ_TOKEN,
  });
}

export function getWriteClient() {
  if (!isSanityConfigured()) {
    throw new Error("Sanity no está configurado");
  }
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!token) {
    throw new Error("Falta SANITY_API_WRITE_TOKEN");
  }
  return createClient({
    ...baseConfig(),
    useCdn: false,
    token,
  });
}
