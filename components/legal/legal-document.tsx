import { Footer } from "@/components/landing/footer";
import { institutionalLine, parseLegalText } from "@/lib/legal/privacy";
import type { LandingSettings } from "@/lib/sanity/types";

const URL_PATTERN = /(https?:\/\/[^\s)]*[^\s).,;:])/g;

/** Convierte las URLs del texto en enlaces. */
function withLinks(text: string) {
  return text.split(URL_PATTERN).map((part, index) =>
    index % 2 === 1 ? (
      <a
        key={index}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="break-words text-teal-300 underline underline-offset-2 hover:text-teal-200"
      >
        {part}
      </a>
    ) : (
      part
    ),
  );
}

export function LegalDocument({
  title,
  text,
  settings,
}: {
  title: string;
  text: string;
  settings: LandingSettings;
}) {
  const institution = institutionalLine(settings);
  return (
    <div className="min-h-screen bg-gray-950">
      <main id="contenido" tabIndex={-1} className="px-6 py-12 md:py-16">
        <article className="container mx-auto max-w-3xl">
          <h1 className="text-4xl font-extrabold leading-tight text-white md:text-5xl">{title}</h1>
          {institution ? <p className="mt-4 text-sm text-gray-400">{institution}</p> : null}
          <div className="mt-10 space-y-5 text-base leading-relaxed text-gray-300 md:text-lg">
            {parseLegalText(text).map((block, index) => {
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
                      <li key={item}>{withLinks(item)}</li>
                    ))}
                  </ul>
                );
              }
              return <p key={index}>{withLinks(block.text)}</p>;
            })}
          </div>
        </article>
      </main>
      <Footer settings={settings} />
    </div>
  );
}
