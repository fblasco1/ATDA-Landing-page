import { EnrollmentsTable } from "@/components/admin/enrollments-table";
import { getEnrollments } from "@/lib/sanity/fetch";
import { isSanityConfigured } from "@/lib/sanity/env";
import type { Course } from "@/lib/sanity/types";
import { listDocumentsSafe } from "@/lib/sanity/write";

export default async function AdminEnrollmentsPage() {
  const sanityReady = isSanityConfigured();
  const [items, courses] = await Promise.all([
    sanityReady ? getEnrollments() : Promise.resolve([]),
    listDocumentsSafe("course") as Promise<Course[]>,
  ]);

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-white">Inscripciones</h1>
      <p className="mb-6 text-gray-400">
        Cuando el pago está acreditado, cargá el enlace del aula. Se marca como asignada y se envía solo un mail al
        inscripto con la bienvenida y ese enlace. Las inscripciones pagadas por fuera de la web se cargan con Nueva
        inscripción. Las de cursos arancelados que llegan por el formulario quedan en pendiente hasta que marques el
        pago.
      </p>
      <EnrollmentsTable items={items} courses={courses} />
    </div>
  );
}
