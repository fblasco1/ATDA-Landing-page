import { ActivityArchive } from "@/components/landing/activity-archive";
import { Footer } from "@/components/landing/footer";
import { getProjectCategories, getPublishedProjects } from "@/lib/sanity/fetch";
import { getSiteContent } from "@/lib/sanity/site-content";

function NewspaperIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 5.5A1.5 1.5 0 0 1 5.5 4h11A1.5 1.5 0 0 1 18 5.5V19a1 1 0 0 1-1 1H5.5A1.5 1.5 0 0 1 4 18.5v-13Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path d="M8 8h6M8 11h6M8 14h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M18 8h2.5A1.5 1.5 0 0 1 22 9.5v8A1.5 1.5 0 0 1 20.5 19H18" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

export default async function ActivityIndexPage() {
  const [projects, categories, landing] = await Promise.all([
    getPublishedProjects(),
    getProjectCategories(),
    getSiteContent(),
  ]);

  return (
    <div className="min-h-screen bg-gray-950">
      <main id="contenido" tabIndex={-1}>
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-teal-700 px-6 py-16 text-center text-white">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/30">
          <NewspaperIcon className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">{landing.settings.newsTitle}</h1>
        {landing.settings.newsSubtitle ? (
          <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-50">{landing.settings.newsSubtitle}</p>
        ) : null}
      </section>
      <div className="px-6 py-12">
        <div className="container mx-auto max-w-6xl">
          <ActivityArchive projects={projects} categories={categories} />
        </div>
      </div>
      </main>
      <Footer settings={landing.settings} />
    </div>
  );
}
