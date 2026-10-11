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
      <h1 className="mb-6 text-3xl font-bold text-white">Contenido de la landing</h1>
      <SettingsForm initial={settings} />
    </div>
  );
}
