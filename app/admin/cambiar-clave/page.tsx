import { redirect } from "next/navigation";
import { ChangePasswordForm } from "@/components/admin/change-password-form";
import { AdminSessionProvider } from "@/components/admin/session-provider";
import { getAdminSession } from "@/lib/admin/session";

export default async function AdminChangePasswordPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (!session.user.adminUserId) redirect("/admin");

  const forced = Boolean(session.user.mustChangePassword);

  return (
    <AdminSessionProvider>
      <div className="flex min-h-screen items-center justify-center bg-gray-950 px-6">
        <div className="w-full max-w-md rounded-xl border border-gray-800 bg-gray-900 p-8 text-center">
          <h1 className="text-2xl font-bold text-white">
            {forced ? "Elegí tu contraseña" : "Cambiar contraseña"}
          </h1>
          <p className="mt-3 text-gray-400">
            {forced
              ? "Es tu primer ingreso: reemplazá la contraseña temporal para continuar."
              : session.user.email}
          </p>
          <div className="mt-6">
            <ChangePasswordForm forced={forced} />
          </div>
        </div>
      </div>
    </AdminSessionProvider>
  );
}
