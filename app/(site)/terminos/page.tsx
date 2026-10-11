import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/legal-document";
import { resolveTerms } from "@/lib/legal/terms";
import { getSiteContent } from "@/lib/sanity/site-content";

export const metadata: Metadata = {
  title: "Términos y condiciones | ATDA",
  description: "Condiciones de uso del sitio, del espacio de socios y de inscripción a cursos y actividades de ATDA.",
};

export default async function TermsPage() {
  const { settings } = await getSiteContent();
  return <LegalDocument title="Términos y condiciones" text={resolveTerms(settings)} settings={settings} />;
}
