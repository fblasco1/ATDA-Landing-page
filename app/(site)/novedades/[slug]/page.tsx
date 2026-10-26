import Link from "next/link";
import { notFound } from "next/navigation";
import { CourseLogistics } from "@/components/landing/course-logistics";
import { Footer } from "@/components/landing/footer";
import { LinkedText } from "@/components/ui/linked-text";
import { presentArticle } from "@/lib/content/event-facts";
import { getSiteContent, getSiteProjectBySlug } from "@/lib/sanity/site-content";
import { formatDateES } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

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
  const [{ document: article }, landing] = await Promise.all([getSiteProjectBySlug(slug), getSiteContent()]);
  if (!article) notFound();

  const articleCopy = presentArticle(article);
  const dateLabel = formatDateES(article.publishedAt);

  return (
    <div className="min-h-screen bg-gray-950">
      <main id="contenido" tabIndex={-1} className="py-12 md:py-16">
        <article className="container mx-auto px-6">
          <div className="flex flex-col items-start gap-8">
            <Link
              href="/novedades"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300"
            >
              <span aria-hidden>←</span> Volver a {landing.settings.newsTitle}
            </Link>

            {article.category ? (
              <span className="inline-flex rounded-full bg-teal-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-gray-950">
                {article.category}
              </span>
            ) : null}
          </div>

          <h1 className="mt-8 text-4xl font-extrabold leading-tight text-white md:text-5xl">{article.title}</h1>

          {dateLabel ? (
            <p className="mt-4 flex items-center gap-2 text-sm text-gray-400">
              <CalendarIcon className="h-4 w-4" />
              {dateLabel}
            </p>
          ) : null}

          <CourseLogistics
            when={articleCopy.when}
            where={articleCopy.where}
            className="mt-6 flex max-w-xl flex-col gap-2"
          />

          {articleCopy.description ? (
            <p className="mt-6 text-xl leading-relaxed text-gray-300">
              <LinkedText text={articleCopy.description} />
            </p>
          ) : null}

          <div
            className={`mt-8 items-start gap-8 ${
              article.imageUrl ? "lg:grid lg:grid-cols-[minmax(14rem,18rem)_minmax(0,1fr)] lg:gap-12" : ""
            }`}
          >
            {article.imageUrl ? (
              <figure className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 lg:sticky lg:top-24">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="mx-auto max-h-56 w-full object-contain object-top sm:max-h-64 lg:max-h-[30rem]"
                />
              </figure>
            ) : null}

            <div className={`space-y-5 text-lg leading-relaxed text-gray-300 ${article.imageUrl ? "mt-8 lg:mt-0" : ""}`}>
              {articleCopy.paragraphs.map((paragraph, index) => (
                <p key={`${index}-${paragraph.slice(0, 24)}`} className="whitespace-pre-line">
                  <LinkedText text={paragraph} />
                </p>
              ))}
            </div>
          </div>
        </article>
      </main>
      <Footer settings={landing.settings} />
    </div>
  );
}
