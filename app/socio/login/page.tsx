import { MemberLoginForm } from "@/components/member/member-login-form";
import { MemberShell } from "@/components/member/member-shell";
import { isDatabaseConfigured } from "@/lib/db";

export default async function SocioLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const dbReady = isDatabaseConfigured();

  return (
    <MemberShell
      title="Ingreso de socios"
      subtitle="Consultá tus datos y el estado de la cuota mensual."
    >
      {!dbReady ? (
        <p className="text-amber-200">La base de socios aún no está configurada.</p>
      ) : (
        <MemberLoginForm callbackUrl={params.callbackUrl || "/socio"} />
      )}
    </MemberShell>
  );
}
