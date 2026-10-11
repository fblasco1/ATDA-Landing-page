import Link from "next/link";
import { formatDateShortES } from "@/lib/utils";
import type { Project } from "@/lib/sanity/types";

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function ActivityCard({ project }: { project: Project }) {
  const href = project.slug ? `/novedades/${project.slug}` : undefined;
  const dateLabel = formatDateShortES(project.publishedAt);

  const card = (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-700/80 bg-gray-900 shadow-lg transition duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-blue-500/10">
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-800">
        {project.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.imageUrl}
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-900/40 to-teal-900/30 text-sm text-gray-400">
            Sin portada
          </div>
        )}
        {project.category ? (
          <span className="absolute left-3 top-3 rounded-full bg-teal-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-gray-950 shadow">
            {project.category}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold leading-snug text-white group-hover:text-blue-300">{project.title}</h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-gray-400">{project.description}</p>
        {dateLabel ? (
          <p className="mt-4 flex items-center gap-2 text-sm text-gray-400">
            <CalendarIcon className="h-3.5 w-3.5" />
            {dateLabel}
          </p>
        ) : null}
      </div>
    </article>
  );

  if (!href) return card;
  return (
    <Link href={href} className="block h-full">
      {card}
    </Link>
  );
}
