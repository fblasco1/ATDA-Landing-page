import { MemberAccessForm } from "@/components/member/member-access-form";
import { MemberShell } from "@/components/member/member-shell";

export default function SocioActivarPage() {
  return (
    <MemberShell
      title="Activar acceso"
      subtitle="Usá el email y DNI de tu solicitud de asociación para crear tu contraseña."
    >
      <MemberAccessForm mode="activate" />
    </MemberShell>
  );
}
