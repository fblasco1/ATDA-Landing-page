"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export function AdminGoogleSignInButton() {
  const [busy, setBusy] = useState(false);

  const onClick = async () => {
    if (typeof window !== "undefined" && window.location.hostname === "127.0.0.1") {
      window.location.replace(
        `http://localhost:${window.location.port || "3000"}/admin/login`,
      );
      return;
    }
    setBusy(true);
    await signIn("google", { callbackUrl: "/admin" });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="inline-block w-full rounded-lg border border-gray-700 px-4 py-3 font-semibold text-gray-200 hover:bg-gray-800 disabled:opacity-60"
    >
      {busy ? "Redirigiendo a Google…" : "Continuar con Google"}
    </button>
  );
}
