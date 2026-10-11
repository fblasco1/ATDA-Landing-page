import Link from "next/link";
import { MembershipRequestsPanel } from "@/components/admin/membership-requests-panel";
import { MembersAdminPanel } from "@/components/admin/members-admin-panel";
import {
  isDatabaseConfigured,
  listMembershipRequests,
  listMembersWithLatestFee,
} from "@/lib/db/members";

export default async function AdminSociosPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const tab = params.tab === "socios" ? "socios" : "solicitudes";
  const dbReady = isDatabaseConfigured();

  let requests: Awaited<ReturnType<typeof listMembershipRequests>> = [];
  let members: Awaited<ReturnType<typeof listMembersWithLatestFee>> = [];
  let loadError = "";

  if (dbReady) {
    try {
      if (tab === "solicitudes") {
        requests = await listMembershipRequests();
      } else {
        members = await listMembersWithLatestFee();
      }
    } catch (error) {
      loadError = error instanceof Error ? error.message : "No se pudieron cargar los datos";
    }
  }

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-white">Socios</h1>
      <p className="mb-6 text-gray-400">
        Solicitudes de asociación, altas/bajas y cuotas mensuales.
      </p>

      <div className="mb-6 flex gap-2 border-b border-gray-800 pb-3">
        <TabLink href="/admin/socios" active={tab === "solicitudes"}>
          Solicitudes
        </TabLink>
        <TabLink href="/admin/socios?tab=socios" active={tab === "socios"}>
          Socios
        </TabLink>
      </div>

      {loadError ? <p className="mb-4 text-red-400">{loadError}</p> : null}

      {tab === "solicitudes" ? (
        <MembershipRequestsPanel initialItems={requests} dbReady={dbReady} />
      ) : (
        <MembersAdminPanel initialItems={members} dbReady={dbReady} />
      )}
    </div>
  );
}

function TabLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-md px-3 py-2 text-sm ${
        active ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}
