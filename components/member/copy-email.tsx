"use client";

import { useState } from "react";

export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="select-all rounded-md border border-gray-700 bg-gray-950 px-3 py-2 font-mono text-sm text-white">
        {email}
      </span>
      <button
        type="button"
        onClick={copy}
        className="rounded-md border border-gray-600 px-3 py-2 text-sm text-gray-200 hover:bg-gray-800"
      >
        {copied ? "¡Copiado!" : "Copiar"}
      </button>
    </div>
  );
}
