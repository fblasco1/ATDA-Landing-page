import { MemberDetailPanel } from "@/components/admin/member-detail-panel";
import { getMemberById, isDatabaseConfigured, listFeesForMember } from "@/lib/db/members";
import { notFound } from "next/navigation";

export default async function AdminSocioDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isDatabaseConfigured()) {
    return <p className="text-amber-200">DATABASE_URL no configurada.</p>;
  }
  const memberId = Number(id);
  if (!Number.isFinite(memberId)) notFound();

  const member = await getMemberById(memberId);
  if (!member) notFound();
  const fees = await listFeesForMember(member.id);
  const { passwordHash, ...safeMember } = member;

  return (
    <MemberDetailPanel
      member={{ ...safeMember, passwordHash: passwordHash ? "set" : null }}
      fees={fees}
    />
  );
}
