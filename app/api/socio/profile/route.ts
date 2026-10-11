import { updateMember } from "@/lib/db/members";
import { requireMemberApi } from "@/lib/member/session";

const EDITABLE = ["phone", "profession", "organization", "roleTitle"] as const;
const MAX_LENGTH: Record<(typeof EDITABLE)[number], number> = {
  phone: 64,
  profession: 200,
  organization: 255,
  roleTitle: 255,
};

export async function PATCH(request: Request) {
  const { member, error } = await requireMemberApi();
  if (error) return error;

  try {
    const body = (await request.json()) as Partial<Record<(typeof EDITABLE)[number], unknown>>;
    const patch: Partial<Record<(typeof EDITABLE)[number], string | null>> = {};
    for (const field of EDITABLE) {
      if (body[field] === undefined) continue;
      const value = String(body[field] ?? "").trim();
      if (value.length > MAX_LENGTH[field]) {
        return Response.json({ error: "Uno de los datos es demasiado largo." }, { status: 400 });
      }
      patch[field] = value || null;
    }
    if (!patch.phone && body.phone !== undefined) {
      return Response.json({ error: "El teléfono es obligatorio." }, { status: 400 });
    }
    if (!patch.profession && body.profession !== undefined) {
      return Response.json({ error: "La profesión es obligatoria." }, { status: 400 });
    }

    const updated = await updateMember(member.id, patch);
    if (!updated) return Response.json({ error: "Socio no encontrado" }, { status: 404 });
    return Response.json({
      member: {
        phone: updated.phone,
        profession: updated.profession,
        organization: updated.organization,
        roleTitle: updated.roleTitle,
      },
    });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "No se pudo guardar" }, { status: 500 });
  }
}
