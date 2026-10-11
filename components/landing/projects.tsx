import Link from "next/link";
import type { Project } from "@/lib/sanity/types";
import { ActivityCard } from "./activity-card";
import { sectionBandClass, type SectionBand } from "./section-band";

export function Projects({
  projects,
  title,
  subtitle,
  band = "base",
}: {
  projects: Project[];
  title: string;
  subtitle: string;
  band?: SectionBand;
}) {
  if (projects.length === 0) return null;

  return (
    <section id="novedades" className={`${sectionBandClass(band)} py-20`}>
      <div className="container mx-auto px-6">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-teal-400">Actualidad</p>
          <h2 className="text-3xl font-extrabold text-white md:text-4xl">{title}</h2>
          {subtitle ? <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-400">{subtitle}</p> : null}
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ActivityCard key={project._id} project={project} />
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link
            href="/novedades"
            className="inline-block rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-blue-700"
          >
            Ver todas las publicaciones
          </Link>
        </div>
      </div>
    </section>
  );
}
