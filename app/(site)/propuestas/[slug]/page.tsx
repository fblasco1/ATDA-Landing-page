import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { CourseLogistics } from "@/components/landing/course-logistics";
import { CoursePrice } from "@/components/landing/course-price";
import { LinkedText } from "@/components/ui/linked-text";
import { coursePageCopy } from "@/lib/courses/copy";
import { isModoCheckoutEnabled } from "@/lib/payments/flags";
import { getSiteContent, getSiteCourseBySlug } from "@/lib/sanity/site-content";

type Props = { params: Promise<{ slug: string }> };

export default async function CoursePage({ params }: Props) {
  const { slug } = await params;
  const [{ document: course, preview }, landing] = await Promise.all([
    getSiteCourseBySlug(slug),
    getSiteContent(),
  ]);
  if (!course) notFound();
  const copy = coursePageCopy(course);

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
            <CourseLogistics when={copy.when} where={copy.where} className="mt-5 flex flex-col gap-2" />
            {copy.body ? (
              <p className="mt-4 whitespace-pre-line text-lg text-gray-300">
                <LinkedText text={copy.body} />
              </p>
            ) : null}
            <div className="mt-6">
              <CoursePrice course={course} size="lg" />
            </div>
          </div>
          {preview ? (
            <div className="rounded-xl bg-gray-800 p-6 shadow-xl">
              <p className="text-lg font-semibold text-white">Inscripción</p>
              <p className="mt-2 text-gray-400">
                El formulario de inscripción aparece acá cuando guardes la propuesta.
              </p>
            </div>
          ) : (
            <CheckoutForm course={course} paymentEnabled={isModoCheckoutEnabled()} />
          )}
        </div>
      </div>
    </main>
  );
}
