import { Header } from "@/components/landing/header";
import { getLandingContent } from "@/lib/sanity/fetch";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const content = await getLandingContent();
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
    </>
  );
}
