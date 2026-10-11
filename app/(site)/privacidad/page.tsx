import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/legal-document";
import { resolvePrivacyPolicy } from "@/lib/legal/privacy";
import { getSiteContent } from "@/lib/sanity/site-content";

export const metadata: Metadata = {
  title: "Política de privacidad | ATDA",
  description: "Cómo ATDA recolecta, usa y protege tus datos personales (Ley 25.326).",
};

export default async function PrivacyPage() {
  const { settings } = await getSiteContent();
  return <LegalDocument title="Política de privacidad" text={resolvePrivacyPolicy(settings)} settings={settings} />;
}
