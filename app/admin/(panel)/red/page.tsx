import { CollectionManager } from "@/components/admin/collection-manager";
import { listDocumentsSafe } from "@/lib/sanity/write";

export default async function AdminNetworkPage() {
  const items = (await listDocumentsSafe("networkPartner")) as Array<Record<string, unknown> & { _id: string }>;

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-white">Red</h1>
      <p className="mb-6 text-gray-400">
        La sección Nuestra Red solo se ve si hay aliados cargados. El logo se ajusta y centra solo; elegí el fondo que
        mejor le quede: blanco para logos oscuros, oscuro o sin fondo para logos claros o con transparencia.
      </p>
      <CollectionManager
        type="networkPartner"
        items={items}
        titleField="name"
        fields={[
          { name: "name", label: "Nombre" },
          { name: "url", label: "Sitio web" },
          {
            name: "logoBackground",
            label: "Fondo del logo",
            type: "select",
            options: [
              { value: "white", label: "Blanco" },
              { value: "dark", label: "Oscuro" },
              { value: "none", label: "Sin fondo" },
            ],
          },
          { name: "logoUrl", label: "Logo" },
        ]}
      />
    </div>
  );
}
