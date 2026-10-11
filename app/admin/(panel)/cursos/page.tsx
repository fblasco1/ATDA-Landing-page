import { CollectionManager } from "@/components/admin/collection-manager";
import { listDocumentsSafe } from "@/lib/sanity/write";

export default async function AdminCoursesPage() {
  const items = (await listDocumentsSafe("course")) as Array<Record<string, unknown> & { _id: string }>;

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-white">Propuestas</h1>
      <p className="mb-6 text-gray-400">
        Cursos y actividades. Se muestran en la sección Propuestas de la landing y en /propuestas si están activos y
        tienen precio. Las categorías se crean al vuelo y sirven para filtrar.
      </p>
      <CollectionManager
        type="course"
        items={items}
        createdMessage="Creada. Se ve en la sección Propuestas."
        fields={[
          { name: "title", label: "Título" },
          { name: "category", label: "Categoría", type: "creatable-select" },
          { name: "price", label: "Precio ARS", type: "number" },
          { name: "quota", label: "Cupo (opcional)", type: "number" },
          { name: "imageUrl", label: "Imagen" },
          { name: "description", label: "Descripción", type: "textarea" },
          { name: "active", label: "Activo", type: "checkbox" },
        ]}
      />
    </div>
  );
}
