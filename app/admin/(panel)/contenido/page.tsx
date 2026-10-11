import Link from "next/link";
import { SettingsForm } from "@/components/admin/settings-form";
import { defaultLandingSettings, mergeLandingSettings } from "@/lib/sanity/defaults";
import { fetchAdminSettings } from "@/lib/sanity/write";
import { isSanityConfigured } from "@/lib/sanity/env";

export default async function AdminContentPage() {
  let settings = defaultLandingSettings;
  if (isSanityConfigured()) {
    try {
      settings = mergeLandingSettings(await fetchAdminSettings());
    } catch {
      settings = defaultLandingSettings;
    }
  }

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-white">Contenido de la landing</h1>
      <p className="mb-6 text-sm text-gray-400">
        ¿Algo no quedó bien? En{" "}
        <Link href="/admin/historial" className="text-teal-300 underline hover:text-teal-200">
          Historial
        </Link>{" "}
        podés volver a una versión anterior.
      </p>
      <SettingsForm initial={settings} />
    </div>
  );
}
