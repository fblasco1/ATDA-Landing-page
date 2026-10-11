import { CoursesArchive } from "@/components/landing/courses-archive";
import { Footer } from "@/components/landing/footer";
import { isModoCheckoutEnabled } from "@/lib/payments/flags";
import { getCourseCategories, getLandingContent } from "@/lib/sanity/fetch";

export default async function CoursesPage() {
  const [content, categories] = await Promise.all([getLandingContent(), getCourseCategories()]);

  return (
    <div className="min-h-screen bg-gray-900">
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-teal-600 px-6 py-16 text-center text-white">
        <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">{content.settings.coursesTitle}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-50/90">
          {content.settings.coursesSubtitle}
          {isModoCheckoutEnabled() ? " Inscribite pagando con MODO." : null}
        </p>
      </section>
      {content.courses.length === 0 ? (
        <p className="px-6 py-20 text-center text-gray-400">Todavía no hay propuestas publicadas.</p>
      ) : (
        <CoursesArchive courses={content.courses} categories={categories} />
      )}
      <Footer settings={content.settings} />
    </div>
  );
}
