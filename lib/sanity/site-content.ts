import { cookies, draftMode } from "next/headers";
import { isDatabaseConfigured } from "@/lib/db";
import { getPreviewData } from "@/lib/db/previews";
import { mergeLandingSettings } from "./defaults";
import { getLandingContent } from "./fetch";

export const PREVIEW_COOKIE = "atda_preview";

/**
 * Contenido de la landing para el sitio público. Si un admin activó la vista previa desde el panel,
 * los textos e imágenes de la landing salen de lo que todavía no guardó.
 */
export async function getSiteContent() {
  const content = await getLandingContent();
  const { isEnabled } = await draftMode();
  if (!isEnabled || !isDatabaseConfigured()) return { ...content, preview: false };

  const token = (await cookies()).get(PREVIEW_COOKIE)?.value;
  const data = token ? await getPreviewData(token).catch(() => null) : null;
  if (!data) return { ...content, preview: false };
  return { ...content, settings: mergeLandingSettings(data), preview: true };
}
