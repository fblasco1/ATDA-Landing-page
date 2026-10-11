import Link from "next/link";

export function CheckoutStatus({
  title,
  body,
  enrollment,
}: {
  title: string;
  body: string;
  enrollment?: string;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 px-6 text-center">
      <div className="max-w-lg rounded-xl bg-gray-800 p-8">
        <h1 className="text-3xl font-bold text-white">{title}</h1>
        <p className="mt-4 text-gray-300">{body}</p>
        {enrollment ? <p className="mt-3 text-xs text-gray-500">Referencia: {enrollment}</p> : null}
        <Link href="/" className="mt-8 inline-block text-blue-400">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
