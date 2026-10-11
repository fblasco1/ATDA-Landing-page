import { MemberAccessForm } from "@/components/member/member-access-form";
import { MemberShell } from "@/components/member/member-shell";

export default function SocioRecuperarPage() {
  return (
    <MemberShell
      title="Recuperar acceso"
      subtitle="Verificamos tu identidad con email y DNI para definir una nueva contraseña."
    >
      <MemberAccessForm mode="recover" />
    </MemberShell>
  );
}
