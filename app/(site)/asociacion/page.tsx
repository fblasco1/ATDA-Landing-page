import { AffiliationForm } from "@/components/membership/affiliation-form";
import { Footer } from "@/components/landing/footer";
import { getLandingContent } from "@/lib/sanity/fetch";
import { isDatabaseConfigured } from "@/lib/db";

export default async function AffiliationPage() {
  const landing = await getLandingContent();
  const dbReady = isDatabaseConfigured();

  return (
    <div className="min-h-screen bg-gray-950">
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-teal-600 px-6 py-16 text-center text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-100">Sumate</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight md:text-5xl">{landing.settings.membershipTitle}</h1>
        {landing.settings.membershipSubtitle ? (
          <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-50/90">{landing.settings.membershipSubtitle}</p>
        ) : null}
      </section>
      <main className="px-6 py-12">
        <div className="container mx-auto max-w-3xl">
          {!dbReady ? (
            <div className="rounded-xl border border-amber-700/50 bg-amber-950/40 p-6 text-amber-100">
              <p className="font-semibold">Base de datos pendiente de configuración</p>
              <p className="mt-2 text-sm text-amber-200/90">
                El formulario está listo en código, pero falta `DATABASE_URL` (Neon) en el entorno. Mientras tanto
                podés escribirnos por la sección de contacto.
              </p>
            </div>
          ) : (
            <AffiliationForm />
          )}
        </div>
      </main>
      <Footer settings={landing.settings} />
    </div>
  );
}
