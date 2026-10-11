"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";

export function MemberSignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/socio/login" })}
      className="rounded-md border border-gray-700 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800"
    >
      Salir
    </button>
  );
}

export function MemberNav() {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 pb-4">
      <div>
        <p className="text-sm uppercase tracking-wide text-teal-400">ATDA · Portal socio</p>
        <Link href="/socio" className="text-lg font-semibold text-white hover:text-teal-200">
          Mi cuenta
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <Link href="/" className="text-sm text-gray-400 hover:text-white">
          Sitio
        </Link>
        <MemberSignOutButton />
      </div>
    </div>
  );
}
