import { CollectionManager } from "@/components/admin/collection-manager";
import { listDocumentsSafe } from "@/lib/sanity/write";

export default async function AdminProjectsPage() {
  const items = (await listDocumentsSafe("project")) as Array<Record<string, unknown> & { _id: string }>;

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-white">Novedades</h1>
      <p className="mb-6 text-gray-400">
        Noticias y columnas. En la landing se ven las 3 más recientes; el resto en Ver todas, filtrable por categoría.
      </p>
      <CollectionManager
        type="project"
        items={items}
        createdMessage="Creada. Si está publicada, se ve en la sección Novedades."
        fields={[
          { name: "title", label: "Título" },
          { name: "category", label: "Categoría", type: "creatable-select" },
          { name: "imageUrl", label: "Portada" },
          { name: "description", label: "Copete", type: "textarea", rows: 3 },
          { name: "body", label: "Cuerpo de la nota", type: "textarea", rows: 12 },
          { name: "published", label: "Publicado", type: "checkbox" },
        ]}
      />
    </div>
  );
}
