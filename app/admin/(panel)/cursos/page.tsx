import { CollectionManager } from "@/components/admin/collection-manager";
import { PRICE_MODE_OPTIONS } from "@/lib/courses/pricing";
import { listDocumentsSafe } from "@/lib/sanity/write";

export default async function AdminCoursesPage() {
  const items = (await listDocumentsSafe("course")) as Array<Record<string, unknown> & { _id: string }>;

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-white">Propuestas</h1>
      <p className="mb-6 text-gray-400">
        Cursos y actividades. Se muestran en la sección Propuestas de la landing y en /propuestas. Cada una tiene una
        descripción corta (hasta 200 caracteres, en la tarjeta) y una larga (en la página de inscripción). Los inactivos
        quedan como historial: aparecen al final, en gris y sin inscripción. Las categorías se crean al vuelo y sirven
        para filtrar. El precio de socios se aplica a quien se inscribe con el email y DNI de un socio activo. Si una
        propuesta no se puede borrar, es porque tiene inscripciones: el panel te va a pedir confirmación para borrarlas
        junto con ella.
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
          {
            name: "eventWhen",
            label: "Fecha y horario",
            hint: "Opcional. Se muestra resaltada en la tarjeta y al abrir la propuesta. No la repitas en las descripciones.",
          },
          {
            name: "eventWhere",
            label: "Lugar",
            hint: "Opcional. Se muestra resaltado, aparte del texto.",
          },
          {
            name: "shortDescription",
            label: "Descripción corta",
            type: "textarea",
            rows: 3,
            maxLength: 200,
            required: true,
            hint: "Hasta 200 caracteres. Se muestra en la tarjeta de la landing.",
          },
          {
            name: "description",
            label: "Descripción larga",
            type: "textarea",
            rows: 8,
            required: true,
            hint: "Se muestra al abrir la propuesta. La fecha y el lugar van en los campos de arriba.",
          },
          { name: "active", label: "Activo", type: "checkbox" },
        ]}
      />
    </div>
  );
}
