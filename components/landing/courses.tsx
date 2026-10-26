import Link from "next/link";
import { courseCardCopy } from "@/lib/courses/copy";
import { isModoCheckoutEnabled } from "@/lib/payments/flags";
import type { Course } from "@/lib/sanity/types";
import { CourseLogistics } from "./course-logistics";
import { CoursePrice } from "./course-price";
import { sectionBandClass, sectionCardClass, type SectionBand } from "./section-band";
import { buttonClass } from "@/components/ui/button";

export function Courses({
  courses,
  title,
  subtitle,
  band = "base",
  showHeading = true,
}: {
  courses: Course[];
  title?: string;
  subtitle?: string;
  band?: SectionBand;
  showHeading?: boolean;
}) {
  if (courses.length === 0) return null;

  return (
    <section id="propuestas" className={`${sectionBandClass(band)} py-20`}>
      <div className="container mx-auto px-6">
        {showHeading ? (
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-extrabold text-white md:text-4xl">{title}</h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-400">
              {subtitle}
              {isModoCheckoutEnabled() ? " Inscribite pagando con MODO (QR o app bancaria)." : null}
            </p>
          </div>
        ) : null}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} band={band} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CourseCard({ course, band }: { course: Course; band: SectionBand }) {
  const finished = !course.active;
  const copy = courseCardCopy(course);

  return (
    <article
      aria-disabled={finished || undefined}
      className={`flex flex-col rounded-xl ${sectionCardClass(band)} p-6 shadow-lg ${
        finished ? "select-none opacity-60 grayscale" : ""
      }`}
    >
      {course.imageUrl ? (
        <div className="mb-4 flex h-44 items-center justify-center overflow-hidden rounded-lg bg-gray-950/40 p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={course.imageUrl} alt={course.title} className="max-h-full max-w-full object-contain" />
        </div>
      ) : null}
      <div className="mb-2 flex flex-wrap gap-2">
        {course.category ? (
          <span className="inline-block w-fit rounded-full bg-teal-500/20 px-3 py-1 text-xs font-semibold text-teal-300">
            {course.category}
          </span>
        ) : null}
        {finished ? (
          <span className="inline-block w-fit rounded-full bg-gray-500/30 px-3 py-1 text-xs font-semibold text-gray-300">
            Finalizado
          </span>
        ) : null}
      </div>
      <h3 className="text-xl font-bold text-white">{course.title}</h3>
      <div className="mt-3 flex flex-1 flex-col gap-3">
        <CourseLogistics when={copy.when} where={copy.where} />
        {copy.summary ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-gray-400">{copy.summary}</p>
        ) : null}
      </div>
      <div className="mt-4">
        <CoursePrice course={course} />
      </div>
      {finished ? null : (
        <Link
          href={`/propuestas/${course.slug}`}
          className={buttonClass({ size: "sm", className: "mt-6 w-fit" })}
        >
          Inscribirme
        </Link>
      )}
    </article>
  );
}
