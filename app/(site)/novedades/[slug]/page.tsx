import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/landing/footer";
import { getProjectBySlug } from "@/lib/sanity/fetch";
import { getSiteContent } from "@/lib/sanity/site-content";
import { formatDateES } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

function bodyParagraphs(body: string) {
  return body
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default async function ActivityArticlePage({ params }: Props) {
  const { slug } = await params;
  const [article, landing] = await Promise.all([getProjectBySlug(slug), getSiteContent()]);
  if (!article) notFound();

  const paragraphs = bodyParagraphs(article.body ?? "");
  const dateLabel = formatDateES(article.publishedAt);

  return (
    <div className="min-h-screen bg-gray-950">
      <main className="px-6 py-12 md:py-16">
        <article className="container mx-auto max-w-3xl">
          <Link
            href="/novedades"
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300"
          >
            <span aria-hidden>←</span> Volver a {landing.settings.newsTitle}
          </Link>

          {article.category ? (
            <span className="mt-8 inline-block rounded-full bg-teal-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-gray-950">
              {article.category}
            </span>
          ) : null}

          <h1 className="mt-4 text-4xl font-extrabold leading-tight text-white md:text-5xl">{article.title}</h1>

          {dateLabel ? (
            <p className="mt-4 flex items-center gap-2 text-sm text-gray-400">
              <CalendarIcon className="h-4 w-4" />
              {dateLabel}
            </p>
          ) : null}

          {article.description ? (
            <p className="mt-6 text-xl leading-relaxed text-gray-300">{article.description}</p>
          ) : null}

          {article.imageUrl ? (
            <div className="mt-10 overflow-hidden rounded-2xl border border-gray-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={article.imageUrl} alt={article.title} className="w-full object-cover" />
            </div>
          ) : null}

          <div className="mt-10 space-y-5 text-lg leading-relaxed text-gray-300">
            {paragraphs.map((paragraph, index) => (
              <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
            ))}
          </div>
        </article>
      </main>
      <Footer settings={landing.settings} />
    </div>
  );
}
