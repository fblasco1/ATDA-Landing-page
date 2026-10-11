"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState, type FormEvent } from "react";

export function MemberLoginForm({ callbackUrl = "/socio" }: { callbackUrl?: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const result = await signIn("member", {
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
      redirect: false,
      callbackUrl,
    });
    setBusy(false);
    if (result?.error) {
      setError("Email o contraseña incorrectos, o el acceso aún no está activado.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block text-sm text-gray-400">
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClass}
        />
      </label>
      <label className="block text-sm text-gray-400">
        Contraseña
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </label>
      {error ? (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {busy ? "Ingresando…" : "Ingresar"}
      </button>
      <p className="text-center text-sm text-gray-500">
        ¿Primera vez?{" "}
        <Link href="/socio/activar" className="text-teal-300 hover:text-teal-200">
          Activar acceso
        </Link>
        {" · "}
        <Link href="/socio/recuperar" className="text-teal-300 hover:text-teal-200">
          Recuperar
        </Link>
      </p>
    </form>
  );
}

const inputClass =
  "mt-1 w-full rounded-md border border-gray-700 bg-gray-950 p-3 text-white focus:border-blue-500 focus:outline-none";
