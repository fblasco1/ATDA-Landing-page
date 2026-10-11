import type { LandingSettings } from "@/lib/sanity/types";
import { ValueIconView } from "./icon-map";
import { sectionBandClass, sectionCardClass, type SectionBand } from "./section-band";

export function About({
  settings,
  band = "base",
}: {
  settings: LandingSettings;
  band?: SectionBand;
}) {
  return (
    <section id="about" className={`${sectionBandClass(band)} py-20`}>
      <div className="container mx-auto px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold text-white md:text-4xl">{settings.aboutTitle}</h2>
          <p className="mx-auto mt-4 max-w-4xl text-lg text-gray-400">{settings.aboutBody}</p>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {settings.aboutValues.map((value) => (
            <div
              key={value._key ?? value.title}
              className={`rounded-xl ${sectionCardClass(band)} p-6 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-blue-500/20`}
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600/20">
                <ValueIconView name={value.icon} className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="mb-2 text-center text-xl font-bold text-white">{value.title}</h3>
              <p className="text-center text-gray-400">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
