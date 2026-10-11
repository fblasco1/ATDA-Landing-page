import type { Metadata } from "next";
import { Footer } from "@/components/landing/footer";
import { institutionalLine, parseLegalText, resolvePrivacyPolicy } from "@/lib/legal/privacy";
import { getSiteContent } from "@/lib/sanity/site-content";

export const metadata: Metadata = {
  title: "Política de privacidad | ATDA",
  description: "Cómo ATDA recolecta, usa y protege tus datos personales (Ley 25.326).",
};

export default async function PrivacyPage() {
  const { settings } = await getSiteContent();
  const blocks = parseLegalText(resolvePrivacyPolicy(settings));
  const institution = institutionalLine(settings);

  return (
    <div className="min-h-screen bg-gray-950">
      <main className="px-6 py-12 md:py-16">
        <article className="container mx-auto max-w-3xl">
          <h1 className="text-4xl font-extrabold leading-tight text-white md:text-5xl">Política de privacidad</h1>
          {institution ? <p className="mt-4 text-sm text-gray-400">{institution}</p> : null}
          <div className="mt-10 space-y-5 text-base leading-relaxed text-gray-300 md:text-lg">
            {blocks.map((block, index) => {
              if (block.type === "heading") {
                return (
                  <h2 key={index} className="pt-4 text-2xl font-bold text-white">
                    {block.text}
                  </h2>
                );
              }
              if (block.type === "list") {
                return (
                  <ul key={index} className="list-outside list-disc space-y-2 pl-6">
                    {block.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                );
              }
              return <p key={index}>{block.text}</p>;
            })}
          </div>
        </article>
      </main>
      <Footer settings={settings} />
    </div>
  );
}
