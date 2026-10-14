import { CollectionManager } from "@/components/admin/collection-manager";
import { listDocumentsSafe } from "@/lib/sanity/write";

export default async function AdminNetworkPage() {
  const items = (await listDocumentsSafe("networkPartner")) as Array<Record<string, unknown> & { _id: string }>;

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-white">Red</h1>
      <p className="mb-6 text-gray-400">
        La sección Nuestra Red solo se ve si hay aliados cargados. Subí el logo como lo tengas (JPG, PNG o SVG): el
        sitio recorta los márgenes y quita el fondo liso. Todos los logos se muestran en blanco y toman su color al
        pasar el mouse.
      </p>
      <CollectionManager
        type="networkPartner"
        items={items}
        titleField="name"
        fields={[
          { name: "name", label: "Nombre" },
          { name: "url", label: "Sitio web" },
          { name: "logoUrl", label: "Logo", type: "logo" },
        ]}
      />
    </div>
  );
}
