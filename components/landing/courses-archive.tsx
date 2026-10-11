"use client";

import { useMemo, useState } from "react";
import type { Course } from "@/lib/sanity/types";
import { Courses } from "./courses";

export function CoursesArchive({
  courses,
  categories,
}: {
  courses: Course[];
  categories: string[];
}) {
  const [active, setActive] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!active) return courses;
    return courses.filter((course) => course.category === active);
  }, [active, courses]);

  return (
    <div>
      {categories.length > 0 ? (
        <div className="mb-4 flex flex-wrap justify-center gap-2 px-6 pt-10">
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
        <p className="px-6 py-20 text-center text-gray-400">No hay propuestas en esta categoría.</p>
      ) : (
        <Courses courses={filtered} band="base" showHeading={false} />
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
