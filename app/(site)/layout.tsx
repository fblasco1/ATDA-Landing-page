import { Header } from "@/components/landing/header";
import { getSiteContent } from "@/lib/sanity/site-content";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const content = await getSiteContent();
  const { settings } = content;

  return (
    <>
      <Header
        labels={{
          about: settings.navAboutLabel,
          news: settings.navNewsLabel,
          network: settings.navNetworkLabel,
          courses: settings.navCoursesLabel,
          contact: settings.navContactLabel,
          join: settings.navJoinLabel,
        }}
        showNetwork={content.partners.length > 0}
        showCourses={content.courses.length > 0}
      />
      {children}
      {content.preview ? (
        <div
          role="status"
          className="fixed inset-x-0 bottom-0 z-[60] flex flex-wrap items-center justify-center gap-x-4 gap-y-2 bg-amber-400 px-4 py-3 text-center text-sm font-medium text-gray-950 shadow-2xl"
        >
          <span>Vista previa: estos cambios todavía no están guardados y solo los ves vos.</span>
          {/* Enlace común (no Link): un prefetch podría salir de la vista previa sin querer. */}
          <a href="/api/preview/exit" className="rounded-md bg-gray-950 px-3 py-1.5 text-white hover:bg-gray-800">
            Salir de la vista previa
          </a>
        </div>
      ) : null}
    </>
  );
}
