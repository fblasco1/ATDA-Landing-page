import { getEnrollments, getLandingContent } from "@/lib/sanity/fetch";
import { isSanityConfigured } from "@/lib/sanity/env";

export default async function AdminHomePage() {
  const sanityReady = isSanityConfigured();
  const [content, enrollments] = await Promise.all([
    getLandingContent(),
    sanityReady ? getEnrollments() : Promise.resolve([]),
  ]);
  const paidPendingClassroom = enrollments.filter(
    (item) => item.status === "paid" && item.classroomAccess !== "granted",
  );

  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Resumen</h1>
      {!sanityReady ? (
        <p className="mt-4 rounded-lg border border-amber-700 bg-amber-950/40 p-4 text-amber-200">
          Sanity todavía no está configurado. Completá NEXT_PUBLIC_SANITY_PROJECT_ID, dataset y tokens para
          administrar contenido.
        </p>
      ) : null}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Novedades publicadas" value={content.projects.length} />
        <Stat label="Propuestas activas" value={content.courses.filter((course) => course.active).length} />
        <Stat label="Aulas por asignar" value={paidPendingClassroom.length} />
      </div>
      <p className="mt-8 max-w-2xl text-gray-400">
        Las secciones de la landing (novedades, red y propuestas) solo se ven si hay datos cargados. El alta de
        usuarios del aula virtual se hace a mano. Cuando el pago está acreditado, cargá el enlace del aula: queda
        asignado y se le envía al inscripto un mail de bienvenida con ese enlace.
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
    </div>
  );
}
