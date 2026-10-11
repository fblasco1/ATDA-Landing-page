import { snapshotBeforeChange } from "@/lib/admin/revisions";
import { requireAdminApi } from "@/lib/admin/session";
import { LANDING_SETTINGS_ID } from "@/lib/sanity/env";
import { defaultLandingSettings } from "@/lib/sanity/defaults";
import { fetchAdminSettings, upsertLandingSettings } from "@/lib/sanity/write";
import { expireLandingCache } from "@/lib/sanity/fetch";

export async function GET() {
  const { error } = await requireAdminApi();
  if (error) return error;
  try {
    const settings = (await fetchAdminSettings()) ?? defaultLandingSettings;
    return Response.json({ settings });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { session, error } = await requireAdminApi();
  if (error) return error;
  try {
    const body = (await request.json()) as Record<string, unknown>;
    await snapshotBeforeChange(LANDING_SETTINGS_ID, "update", session.user.email, { replace: body });
    const settings = await upsertLandingSettings(body);
    expireLandingCache();
    return Response.json({ settings });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}
