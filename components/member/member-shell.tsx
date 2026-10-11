import Link from "next/link";

export function MemberShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-6 py-16">
      <div className="w-full max-w-md rounded-xl border border-gray-800 bg-gray-900 p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-400">Portal socio</p>
        <h1 className="mt-2 text-2xl font-bold text-white">{title}</h1>
        {subtitle ? <p className="mt-2 text-sm text-gray-400">{subtitle}</p> : null}
        <div className="mt-6">{children}</div>
        <p className="mt-6 text-center text-xs text-gray-600">
          <Link href="/" className="hover:text-gray-400">
            Volver al sitio
          </Link>
        </p>
      </div>
    </div>
  );
}
