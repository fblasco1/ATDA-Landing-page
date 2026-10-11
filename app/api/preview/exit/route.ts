import { cookies, draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { PREVIEW_COOKIE } from "@/lib/sanity/site-content";

export async function GET() {
  (await draftMode()).disable();
  (await cookies()).delete(PREVIEW_COOKIE);
  redirect("/");
}
