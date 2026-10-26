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
          {
            name: "eventWhen",
            label: "Fecha y horario",
            hint: "Opcional. Se muestra resaltada una sola vez. No la repitas en el copete ni en el cuerpo.",
          },
          {
            name: "eventWhere",
            label: "Lugar",
            hint: "Opcional. Se muestra resaltado, aparte del texto.",
          },
          { name: "imageUrl", label: "Portada" },
          {
            name: "description",
            label: "Copete",
            type: "textarea",
            rows: 3,
            hint: "Resumen de la nota. Si la fecha y el lugar van en los campos de arriba, no los escribas acá.",
          },
          {
            name: "body",
            label: "Cuerpo de la nota",
            type: "textarea",
            rows: 12,
            hint: "Un enlace suelto (https://...) o con el formato [texto](https://...) se puede abrir desde la nota.",
          },
          { name: "published", label: "Publicado", type: "checkbox" },
        ]}
      />
    </div>
  );
}
