import { AdminCredentialsForm } from "@/components/admin/admin-credentials-form";
import { AdminGoogleSignInButton } from "@/components/admin/google-sign-in-button";
import { AdminSessionProvider } from "@/components/admin/session-provider";
import { isDatabaseConfigured } from "@/lib/db";

const ERROR_MESSAGES: Record<string, string> = {
  Configuration:
    "Falló la verificación OAuth (cookies/PKCE). Abrí el sitio siempre con el mismo dominio, borrá cookies e intentá de nuevo.",
  AccessDenied: "Tu cuenta de Google no está autorizada como administrador.",
  AccessDeniedCallback: "Tu cuenta de Google no está autorizada como administrador.",
  OAuthAccountNotLinked: "Esa cuenta no está vinculada.",
  OAuthCallback: "Google rechazó el callback. Revisá Client ID/Secret y la URI de redirección.",
  Callback: "Error en el callback de Google.",
  CredentialsSignin: "Email o contraseña incorrectos.",
  Default: "No tenés permiso o falló el inicio de sesión.",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const googleReady = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  const passwordReady = isDatabaseConfigured();
  const errorKey = params.error ?? "";
  const errorMessage = errorKey
    ? (ERROR_MESSAGES[errorKey] ?? `${ERROR_MESSAGES.Default} (${errorKey})`)
    : null;

  return (
    <AdminSessionProvider>
      <div className="flex min-h-screen items-center justify-center bg-gray-950 px-6">
        <div className="w-full max-w-md rounded-xl border border-gray-800 bg-gray-900 p-8 text-center">
          <h1 className="text-2xl font-bold text-white">Panel ATDA</h1>
          <p className="mt-3 text-gray-400">Ingresá con tu cuenta de administrador.</p>
          {errorMessage ? <p className="mt-4 text-red-400">{errorMessage}</p> : null}

          {passwordReady ? (
            <div className="mt-6">
              <AdminCredentialsForm />
            </div>
          ) : null}

          {passwordReady && googleReady ? (
            <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wide text-gray-600">
              <span className="h-px flex-1 bg-gray-800" />o<span className="h-px flex-1 bg-gray-800" />
            </div>
          ) : null}

          {googleReady ? <AdminGoogleSignInButton /> : null}

          {!passwordReady && !googleReady ? (
            <p className="mt-8 text-sm text-amber-300">
              Falta configurar DATABASE_URL o las credenciales de Google en el entorno.
            </p>
          ) : null}
        </div>
      </div>
    </AdminSessionProvider>
  );
}
