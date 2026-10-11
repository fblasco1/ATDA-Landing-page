"use client";

import { useMemo, useState } from "react";
import type { Project } from "@/lib/sanity/types";
import { ActivityCard } from "./activity-card";

export function ActivityArchive({
  projects,
  categories,
}: {
  projects: Project[];
  categories: string[];
}) {
  const [active, setActive] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!active) return projects;
    return projects.filter((project) => project.category === active);
  }, [active, projects]);

  return (
    <div>
      {categories.length > 0 ? (
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          <Chip label="Todas" active={active === null} onClick={() => setActive(null)} />
          {categories.map((category) => (
            <Chip
              key={category}
              label={category}
              active={active === category}
              onClick={() => setActive(category)}
            />
          ))}
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <p className="text-center text-gray-400">No hay publicaciones en esta categoría.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <ActivityCard key={project._id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
        active
          ? "border-blue-500 bg-blue-600 text-white"
          : "border-gray-600 bg-transparent text-gray-300 hover:border-blue-400 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}
