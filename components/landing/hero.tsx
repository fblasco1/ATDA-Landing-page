import Link from "next/link";
import type { LandingSettings } from "@/lib/sanity/types";
import { HeroBackground } from "./hero-background";
import { buttonClass } from "@/components/ui/button";

export function heroImages(settings: Pick<LandingSettings, "heroImageUrls" | "heroImageUrl">) {
  if (settings.heroImageUrls?.length) return settings.heroImageUrls;
  return settings.heroImageUrl ? [settings.heroImageUrl] : [];
}

export function Hero({ settings }: { settings: LandingSettings }) {
  return (
    <section
      id="home"
      className="relative -mt-[4.25rem] flex min-h-[100svh] items-center justify-center pt-[4.25rem] text-center text-white"
    >
      <HeroBackground images={heroImages(settings)} />
      <div className="absolute inset-0 bg-black opacity-60" />
      <div className="relative z-10 flex flex-col items-center p-6">
        <h1 className="mb-4 text-balance bg-gradient-to-r from-blue-400 to-teal-300 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl md:text-6xl lg:text-7xl">
          {settings.heroTitle}
        </h1>
        <p className="mb-8 max-w-3xl text-lg text-gray-300 md:text-xl">{settings.heroSubtitle}</p>
        <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
          <Link
            href="/asociacion"
            className={buttonClass({ size: "lg" })}
          >
            {settings.navJoinLabel}
          </Link>
          <a
            href="#about"
            className={buttonClass({ variant: "secondary", size: "lg" })}
          >
            Conocenos
          </a>
        </div>
      </div>
    </section>
  );
}
