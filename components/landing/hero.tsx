import type { LandingSettings } from "@/lib/sanity/types";
import { HeroBackground } from "./hero-background";

export function heroImages(settings: Pick<LandingSettings, "heroImageUrls" | "heroImageUrl">) {
  if (settings.heroImageUrls?.length) return settings.heroImageUrls;
  return settings.heroImageUrl ? [settings.heroImageUrl] : [];
}

export function Hero({ settings }: { settings: LandingSettings }) {
  return (
    <section id="home" className="relative flex h-screen items-center justify-center text-center text-white">
      <HeroBackground images={heroImages(settings)} />
      <div className="absolute inset-0 bg-black opacity-60" />
      <div className="relative z-10 flex flex-col items-center p-6">
        <h1 className="mb-4 bg-gradient-to-r from-blue-400 to-teal-300 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent md:text-6xl lg:text-7xl">
          {settings.heroTitle}
        </h1>
        <p className="mb-8 max-w-4xl text-lg text-gray-300 md:text-xl">{settings.heroSubtitle}</p>
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
          <a
            href="#about"
            className="rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-blue-700"
          >
            Conocenos
          </a>
          <a
            href="#contact"
            className="rounded-lg bg-gray-700 px-8 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-gray-600"
          >
            Contacto
          </a>
        </div>
      </div>
    </section>
  );
}
