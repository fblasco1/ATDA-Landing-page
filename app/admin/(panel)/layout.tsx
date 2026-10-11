import { AdminNav } from "@/components/admin/admin-nav";
import { AdminSessionProvider } from "@/components/admin/session-provider";
import { getAdminSession } from "@/lib/admin/session";
import { redirect } from "next/navigation";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  if (session.user.mustChangePassword) {
    redirect("/admin/cambiar-clave");
  }

  return (
    <AdminSessionProvider>
      <div className="flex min-h-screen flex-col bg-gray-950 text-gray-100 md:flex-row">
        <AdminNav email={session.user?.email} canChangePassword={Boolean(session.user.adminUserId)} />
        <main className="flex-1 p-6 md:p-10">{children}</main>
      </div>
    </AdminSessionProvider>
  );
}
