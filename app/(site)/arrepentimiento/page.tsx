import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/landing/footer";
import { WithdrawalForm } from "@/components/legal/withdrawal-form";
import { getSiteContent } from "@/lib/sanity/site-content";

export const metadata: Metadata = {
  title: "Botón de arrepentimiento | ATDA",
  description: "Revocá la contratación de un curso o actividad de ATDA dentro de los 10 días.",
};

export default async function WithdrawalPage() {
  const { settings } = await getSiteContent();
  return (
    <div className="min-h-screen bg-gray-950">
      <main id="contenido" tabIndex={-1} className="px-6 py-12 md:py-16">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-4xl font-extrabold leading-tight text-white md:text-5xl">Botón de arrepentimiento</h1>
          <div className="mt-6 space-y-4 text-lg leading-relaxed text-gray-300">
            <p>
              Si contrataste un curso o actividad paga, podés revocar la contratación dentro de los 10 días corridos
              desde la inscripción o desde que se acreditó el pago, sin costo y sin dar motivos.
            </p>
            <p>
              Completá el formulario: te damos un código de seguimiento en el momento y te lo enviamos por email. La
              devolución se hace por el mismo medio de pago. Más información en los{" "}
              <Link href="/terminos" className="text-teal-300 underline underline-offset-2 hover:text-teal-200">
                términos y condiciones
              </Link>
              .
            </p>
          </div>
          <div className="mt-10">
            <WithdrawalForm />
          </div>
        </div>
      </main>
      <Footer settings={settings} />
    </div>
  );
}
