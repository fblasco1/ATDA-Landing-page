import Link from "next/link";
import { notFound } from "next/navigation";
import { isQrImageData, qrImageSrc } from "@/lib/payments/modo";
import { getEnrollmentById } from "@/lib/sanity/fetch";
import { formatARS } from "@/lib/utils";

type Props = { params: Promise<{ enrollmentId: string }> };

export default async function ModoCheckoutPage({ params }: Props) {
  const { enrollmentId } = await params;
  const enrollment = await getEnrollmentById(enrollmentId);
  if (!enrollment) notFound();

  const deeplink = enrollment.modoDeeplink;
  const qr = enrollment.modoQr;
  const showQrImage = isQrImageData(qr);
  const qrFromDeeplink = deeplink
    ? `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(deeplink)}`
    : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 px-6 py-16">
      <div className="w-full max-w-lg rounded-xl bg-gray-800 p-8 text-center">
        <p className="text-sm uppercase tracking-wide text-teal-400">Pago con MODO</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Escaneá el QR o abrí la app</h1>
        <p className="mt-3 text-gray-300">
          Transferí o pagá con la app de tu banco / MODO el importe{" "}
          <span className="font-semibold text-white">{formatARS(enrollment.amount)}</span>.
        </p>

        <div className="mx-auto mt-8 flex h-72 w-72 items-center justify-center rounded-xl bg-white p-4">
          {showQrImage && qr ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrImageSrc(qr)} alt="QR MODO" className="h-full w-full object-contain" />
          ) : qrFromDeeplink ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrFromDeeplink} alt="QR MODO" className="h-full w-full object-contain" />
          ) : (
            <p className="text-sm text-gray-600">Generando QR…</p>
          )}
        </div>

        {deeplink ? (
          <a
            href={deeplink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Abrir MODO / app bancaria
          </a>
        ) : null}

        <dl className="mt-8 space-y-2 text-left text-sm text-gray-300">
          <div className="flex justify-between border-b border-gray-700 py-2">
            <dt className="text-gray-400">Estado</dt>
            <dd className="font-mono">{enrollment.status}</dd>
          </div>
          {enrollment.modoExpiresAt ? (
            <div className="flex justify-between border-b border-gray-700 py-2">
              <dt className="text-gray-400">Vence</dt>
              <dd className="font-mono text-xs">{enrollment.modoExpiresAt}</dd>
            </div>
          ) : null}
        </dl>

        <p className="mt-6 text-sm text-gray-400">
          Cuando se acredite, un administrador de ATDA te asignará el acceso al aula virtual a mano.
        </p>
        <Link href="/" className="mt-6 inline-block text-blue-400">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
