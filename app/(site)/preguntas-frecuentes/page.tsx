import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/legal-document";
import { resolveFaq } from "@/lib/legal/faq";
import { getSiteContent } from "@/lib/sanity/site-content";

export const metadata: Metadata = {
  title: "Preguntas frecuentes | ATDA",
  description: "Cómo asociarte a ATDA, activar tu acceso al espacio de socios y aprovechar los beneficios.",
};

export default async function FaqPage() {
  const { settings } = await getSiteContent();
  return <LegalDocument title="Preguntas frecuentes" text={resolveFaq(settings)} settings={settings} />;
}
