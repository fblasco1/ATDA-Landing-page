import { coursePriceLines } from "@/lib/courses/pricing";
import type { Course } from "@/lib/sanity/types";

export function CoursePrice({ course, size = "md" }: { course: Course; size?: "md" | "lg" }) {
  const lines = coursePriceLines(course);
  const valueClass = size === "lg" ? "text-3xl" : "text-2xl";

  if (lines.length === 1 && !lines[0].label) {
    return <p className={`${valueClass} font-extrabold text-teal-300`}>{lines[0].value}</p>;
  }

  return (
    <dl className="space-y-1">
      {lines.map((line) => (
        <div key={line.label} className="flex items-baseline gap-2">
          <dt className="text-sm font-semibold uppercase tracking-wide text-gray-400">{line.label}</dt>
          <dd className={`${valueClass} font-extrabold text-teal-300`}>{line.value}</dd>
        </div>
      ))}
    </dl>
  );
}
