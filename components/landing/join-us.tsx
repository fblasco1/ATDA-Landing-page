import Link from "next/link";
import { CollaborationIcon } from "@/components/Icons";
import type { LandingSettings } from "@/lib/sanity/types";

export function JoinUs({ settings }: { settings: LandingSettings }) {
  return (
    <section id="join-us" className="bg-gradient-to-r from-blue-700 to-teal-600 py-20">
      <div className="container mx-auto px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold text-white md:text-4xl">{settings.joinTitle}</h2>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-blue-100">{settings.joinSubtitle}</p>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            <div>
              <h3 className="mb-4 text-2xl font-bold text-white">Beneficios para socios</h3>
              <ul className="list-inside list-disc space-y-3 text-blue-100">
                {settings.joinBenefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-2xl font-bold text-white">¿Quiénes pueden unirse?</h3>
              <div className="space-y-4">
                {settings.joinEligibility.map((item) => (
                  <div key={item.title}>
                    <p className="text-lg font-semibold text-white">{item.title}</p>
                    <p className="text-blue-200">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center rounded-xl border border-white/20 bg-black/20 p-8 text-center shadow-2xl backdrop-blur-lg">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
              <CollaborationIcon className="h-8 w-8 text-white" />
            </div>
            <p className="mb-6 text-blue-100">{settings.joinCtaText}</p>
            <Link
              href="/asociacion"
              className="w-full rounded-lg bg-white px-8 py-3 text-center font-bold text-blue-700 shadow-xl transition-all duration-300 hover:scale-105 hover:bg-gray-200"
            >
              {settings.joinCtaLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
