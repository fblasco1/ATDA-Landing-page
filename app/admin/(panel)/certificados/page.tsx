import { CertificatesPanel } from "@/components/admin/certificates-panel";
import { isEmailConfigured } from "@/lib/email/send";
import { getEnrollments } from "@/lib/sanity/fetch";
import { isSanityConfigured } from "@/lib/sanity/env";
import type { Course, Enrollment } from "@/lib/sanity/types";
import { listDocumentsSafe } from "@/lib/sanity/write";

export default async function AdminCertificatesPage() {
  const sanityReady = isSanityConfigured();
  const [enrollments, courses] = await Promise.all([
    sanityReady ? getEnrollments() : Promise.resolve([] as Enrollment[]),
    listDocumentsSafe("course") as Promise<Course[]>,
  ]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Certificados</h1>
      <p className="mt-2 max-w-3xl text-gray-400">
        Cargá un Excel o traé los inscriptos de una capacitación. El certificado usa el modelo oficial y se
        genera solo para quien marques como asistente. El mail lleva los logos y el PDF adjunto.
      </p>
      <CertificatesPanel
        courses={courses}
        enrollments={enrollments}
        emailConfigured={isEmailConfigured()}
        emailFrom={process.env.EMAIL_FROM?.trim() || null}
      />
    </div>
  );
}
