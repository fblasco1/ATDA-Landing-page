import { CoursesArchive } from "@/components/landing/courses-archive";
import { Footer } from "@/components/landing/footer";
import { isModoCheckoutEnabled } from "@/lib/payments/flags";
import { getCourseCategories } from "@/lib/sanity/fetch";
import { getSiteContent } from "@/lib/sanity/site-content";

export default async function CoursesPage() {
  const [content, categories] = await Promise.all([getSiteContent(), getCourseCategories()]);

  return (
    <div className="min-h-screen bg-gray-900">
      <main id="contenido" tabIndex={-1}>
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-teal-700 px-6 py-16 text-center text-white">
        <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">{content.settings.coursesTitle}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-50">
          {content.settings.coursesSubtitle}
          {isModoCheckoutEnabled() ? " Inscribite pagando con MODO." : null}
        </p>
      </section>
      {content.courses.length === 0 ? (
        <p className="px-6 py-20 text-center text-gray-400">Todavía no hay propuestas publicadas.</p>
      ) : (
        <CoursesArchive courses={content.courses} categories={categories} />
      )}
      </main>
      <Footer settings={content.settings} />
    </div>
  );
}
