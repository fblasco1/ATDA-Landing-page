import { CollectionManager } from "@/components/admin/collection-manager";
import { PRICE_MODE_OPTIONS } from "@/lib/courses/pricing";
import { listDocumentsSafe } from "@/lib/sanity/write";

export default async function AdminCoursesPage() {
  const items = (await listDocumentsSafe("course")) as Array<Record<string, unknown> & { _id: string }>;

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-white">Propuestas</h1>
      <p className="mb-6 text-gray-400">
        Cursos y actividades. Se muestran en la sección Propuestas de la landing y en /propuestas. Los inactivos quedan
        como historial: aparecen al final, en gris y sin inscripción. Las categorías se crean al vuelo y sirven para
        filtrar. El precio de socios se aplica a quien se inscribe con el email y DNI de un socio activo.
      </p>
      <CollectionManager
        type="course"
        items={items}
        createdMessage="Creada. Se ve en la sección Propuestas."
        fields={[
          { name: "title", label: "Título" },
          { name: "category", label: "Categoría", type: "creatable-select" },
          { name: "priceMode", label: "Arancel", type: "select", options: PRICE_MODE_OPTIONS },
          {
            name: "price",
            label: "Precio general (ARS)",
            type: "number",
            showWhen: { field: "priceMode", in: ["general"] },
          },
          {
            name: "memberPrice",
            label: "Precio socios (ARS)",
            type: "number",
            showWhen: { field: "priceMode", in: ["members"] },
          },
          {
            name: "nonMemberPrice",
            label: "Precio no socios (ARS)",
            type: "number",
            showWhen: { field: "priceMode", in: ["members"] },
          },
          { name: "quota", label: "Cupo (opcional)", type: "number" },
          { name: "imageUrl", label: "Imagen" },
          { name: "description", label: "Descripción", type: "textarea" },
          { name: "active", label: "Activo", type: "checkbox" },
        ]}
      />
    </div>
  );
}
