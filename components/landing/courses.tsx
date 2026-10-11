import Link from "next/link";
import { isModoCheckoutEnabled } from "@/lib/payments/flags";
import { formatARS } from "@/lib/utils";
import type { Course } from "@/lib/sanity/types";
import { sectionBandClass, sectionCardClass, type SectionBand } from "./section-band";

export function Courses({
  courses,
  band = "base",
  showHeading = true,
}: {
  courses: Course[];
  band?: SectionBand;
  showHeading?: boolean;
}) {
  if (courses.length === 0) return null;

  return (
    <section id="propuestas" className={`${sectionBandClass(band)} py-20`}>
      <div className="container mx-auto px-6">
        {showHeading ? (
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-extrabold text-white md:text-4xl">Propuestas</h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-400">
              {isModoCheckoutEnabled()
                ? "Formaciones de ATDA. Inscribite pagando con MODO (QR o app bancaria)."
                : "Formaciones de ATDA."}
            </p>
          </div>
        ) : null}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <article
              key={course._id}
              className={`flex flex-col rounded-xl ${sectionCardClass(band)} p-6 shadow-lg`}
            >
              {course.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={course.imageUrl} alt={course.title} className="mb-4 h-44 w-full rounded-lg object-cover" />
              ) : null}
              {course.category ? (
                <span className="mb-2 inline-block w-fit rounded-full bg-teal-500/20 px-3 py-1 text-xs font-semibold text-teal-300">
                  {course.category}
                </span>
              ) : null}
              <h3 className="text-xl font-bold text-white">{course.title}</h3>
              <p className="mt-2 flex-1 text-gray-400">{course.description}</p>
              <p className="mt-4 text-2xl font-extrabold text-teal-300">{formatARS(course.price)}</p>
              <Link
                href={`/propuestas/${course.slug}`}
                className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-2 text-center font-semibold text-white hover:bg-blue-700"
              >
                {isModoCheckoutEnabled() ? "Inscribirme" : "Ver curso"}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
