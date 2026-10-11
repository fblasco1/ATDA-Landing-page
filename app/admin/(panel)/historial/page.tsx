import { RevisionsList } from "@/components/admin/revisions-list";
import { REVISION_ACTION_LABEL, REVISION_TYPE_LABEL } from "@/lib/admin/revisions";
import { isDatabaseConfigured } from "@/lib/db";
import { listRevisions } from "@/lib/db/revisions";

export default async function AdminHistoryPage() {
  const dbReady = isDatabaseConfigured();
  const revisions = dbReady ? await listRevisions({ limit: 60 }).catch(() => []) : [];

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-white">Historial de cambios</h1>
      <p className="mb-6 max-w-3xl text-gray-400">
        Cada cambio en la landing, Novedades, Red o Propuestas queda registrado con lo que se modificó. Si algo no
        quedó bien, usá Volver a antes de este cambio: el sitio lo muestra en el momento. También sirve para recuperar
        algo borrado. Se guardan los últimos 20 cambios de cada contenido.
      </p>
      {!dbReady ? (
        <p className="text-amber-300">Falta configurar la base de datos para guardar el historial.</p>
      ) : (
        <RevisionsList
          items={revisions.map((revision) => ({
            id: revision.id,
            title: revision.title ?? revision.documentId,
            type: REVISION_TYPE_LABEL[revision.documentType] ?? revision.documentType,
            action: REVISION_ACTION_LABEL[revision.action] ?? revision.action,
            changes: revision.changes ?? [],
            createdBy: revision.createdBy,
            createdAt: revision.createdAt.toISOString(),
          }))}
        />
      )}
    </div>
  );
}
