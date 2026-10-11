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
        El aula virtual se crea a mano. Cuando el pago está acreditado, marcá el acceso como asignado y dejá el
        usuario o enlace en las notas. Las inscripciones pagadas por fuera de la web se cargan con Nueva inscripción.
      </p>
      <EnrollmentsTable items={items} courses={courses} />
    </div>
  );
}
