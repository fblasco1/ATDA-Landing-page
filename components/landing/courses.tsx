import Link from "next/link";
import { isFreeCourse } from "@/lib/courses/pricing";
import { isModoCheckoutEnabled } from "@/lib/payments/flags";
import type { Course } from "@/lib/sanity/types";
import { CoursePrice } from "./course-price";
import { sectionBandClass, sectionCardClass, type SectionBand } from "./section-band";

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
      <p className="mt-2 flex-1 text-gray-400">{course.description}</p>
      <div className="mt-4">
        <CoursePrice course={course} />
      </div>
      {finished ? null : (
        <Link
          href={`/propuestas/${course.slug}`}
          className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-2 text-center font-semibold text-white hover:bg-blue-700"
        >
          {isFreeCourse(course) || isModoCheckoutEnabled() ? "Inscribirme" : "Ver curso"}
        </Link>
      )}
    </article>
  );
}
