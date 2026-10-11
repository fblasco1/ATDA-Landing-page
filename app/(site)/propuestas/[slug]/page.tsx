import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { CoursePrice } from "@/components/landing/course-price";
import { isFreeCourse } from "@/lib/courses/pricing";
import { isModoCheckoutEnabled } from "@/lib/payments/flags";
import { getCourseBySlug } from "@/lib/sanity/fetch";
import { getSiteContent } from "@/lib/sanity/site-content";

type Props = { params: Promise<{ slug: string }> };

export default async function CoursePage({ params }: Props) {
  const { slug } = await params;
  const [course, landing] = await Promise.all([getCourseBySlug(slug), getSiteContent()]);
  if (!course) notFound();

  return (
    <main id="contenido" tabIndex={-1} className="min-h-screen bg-gray-900 px-6 py-16">
      <div className="container mx-auto max-w-5xl">
        <Link href="/propuestas" className="text-blue-400 hover:text-blue-300">
          ← Volver a {landing.settings.coursesTitle}
        </Link>
        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <div>
            <p className="text-sm uppercase tracking-wide text-teal-400">
              {landing.settings.aboutTitle ? "Curso ATDA" : "Curso"}
            </p>
            <h1 className="mt-2 text-4xl font-extrabold text-white">{course.title}</h1>
            <p className="mt-4 text-lg text-gray-300">{course.description}</p>
            <div className="mt-6">
              <CoursePrice course={course} size="lg" />
            </div>
          </div>
          {isFreeCourse(course) || isModoCheckoutEnabled() ? (
            <CheckoutForm course={course} />
          ) : (
            <div className="rounded-xl bg-gray-800 p-6 shadow-xl">
              <p className="text-lg font-semibold text-white">Inscripciones online próximamente</p>
              <p className="mt-2 text-gray-400">
                Mientras habilitamos el pago online, escribinos y te contamos cómo inscribirte.
              </p>
              <Link
                href="/#contact"
                className="mt-6 inline-block w-full rounded-lg bg-blue-600 px-6 py-3 text-center font-semibold text-white hover:bg-blue-700"
              >
                Consultar por este curso
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
