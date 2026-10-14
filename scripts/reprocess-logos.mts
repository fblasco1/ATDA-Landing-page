// Uso: node --experimental-strip-types scripts/reprocess-logos.mts [--dry-run]
// Pasa por el procesamiento automático los logos de la Red cargados antes de que existiera
// (los que no tienen logoSurface): recorta márgenes, quita el fondo liso y elige la tarjeta.
import { createClient } from "@sanity/client";
import { config } from "dotenv";
import { processLogo } from "../lib/images/logo.ts";

config({ path: ".env.local" });

const dryRun = process.argv.includes("--dry-run");
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!token) {
  console.error("Falta SANITY_API_WRITE_TOKEN en .env.local");
  process.exit(1);
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "t61vrots",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2025-01-01",
  useCdn: false,
  token,
});

type Partner = { _id: string; name: string; logoUrl?: string };

const partners = await client.fetch<Partner[]>(
  `*[_type == "networkPartner" && !(_id in path("drafts.**")) && !defined(logoSurface)]{
    _id, name, "logoUrl": coalesce(logo.asset->url, logoUrl)
  }`,
);

if (partners.length === 0) console.log("No hay logos para reprocesar.");

for (const partner of partners) {
  if (!partner.logoUrl) {
    console.log(`${partner.name}: sin logo, se omite`);
    continue;
  }
  const response = await fetch(partner.logoUrl);
  const contentType = response.headers.get("content-type") ?? "image/jpeg";
  const input = Buffer.from(await response.arrayBuffer());
  const logo = await processLogo(input, contentType, partner.logoUrl.split("/").pop() ?? "logo");

  if (dryRun) {
    console.log(`${partner.name}: ${logo.contentType}, tarjeta ${logo.surface} (sin cambios, --dry-run)`);
    continue;
  }

  const asset = await client.assets.upload("image", logo.buffer, {
    filename: logo.filename,
    contentType: logo.contentType,
  });
  await client.patch(partner._id).set({ logoUrl: asset.url, logoSurface: logo.surface }).commit();
  console.log(`${partner.name}: listo (${logo.contentType}, tarjeta ${logo.surface})`);
}
