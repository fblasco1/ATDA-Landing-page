import { MemberAccessForm } from "@/components/member/member-access-form";
import { MemberShell } from "@/components/member/member-shell";

export default async function SocioActivarPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string | string[] }>;
}) {
  const { email } = await searchParams;
  const defaultEmail = typeof email === "string" ? email.trim().slice(0, 255) : undefined;

  return (
    <MemberShell
      title="Activar acceso"
      subtitle="Usá el email y DNI de tu solicitud de asociación para crear tu contraseña."
    >
      <MemberAccessForm mode="activate" defaultEmail={defaultEmail} />
    </MemberShell>
  );
}
