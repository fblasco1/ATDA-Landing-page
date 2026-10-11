import { About } from "@/components/landing/about";
import { Contact } from "@/components/landing/contact";
import { Courses } from "@/components/landing/courses";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { JoinUs } from "@/components/landing/join-us";
import { Network } from "@/components/landing/network";
import { Projects } from "@/components/landing/projects";
import { createBandAllocator } from "@/components/landing/section-band";
import { getSiteContent } from "@/lib/sanity/site-content";

export default async function HomePage() {
  const content = await getSiteContent();
  const { settings } = content;
  const nextBand = createBandAllocator();

  const aboutBand = nextBand();
  const projectsBand = content.projects.length ? nextBand() : undefined;
  const networkBand = content.partners.length ? nextBand() : undefined;
  const coursesBand = content.courses.length ? nextBand() : undefined;
  const contactBand = nextBand();

  return (
    <div className="min-h-screen bg-gray-900">
      <main id="contenido" tabIndex={-1}>
        <Hero settings={content.settings} />
        <About settings={content.settings} band={aboutBand} />
        {projectsBand ? (
          <Projects
            projects={content.projects}
            title={settings.newsTitle}
            subtitle={settings.newsSubtitle}
            band={projectsBand}
          />
        ) : null}
        {networkBand ? (
          <Network
            partners={content.partners}
            title={settings.networkTitle}
            subtitle={settings.networkSubtitle}
            band={networkBand}
          />
        ) : null}
        {coursesBand ? (
          <Courses
            courses={content.courses}
            title={settings.coursesTitle}
            subtitle={settings.coursesSubtitle}
            band={coursesBand}
          />
        ) : null}
        <JoinUs settings={content.settings} />
        <Contact settings={content.settings} band={contactBand} />
      </main>
      <Footer settings={content.settings} />
    </div>
  );
}
