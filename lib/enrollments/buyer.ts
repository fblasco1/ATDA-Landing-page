export type BuyerFields = {
  name: string;
  email: string;
  dni: string;
  phone: string;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** DNI argentino: solo dígitos, 7 u 8. */
export function dniError(value: string) {
  if (!/^\d{7,8}$/.test(value.trim())) {
    return "El DNI tiene que ser un número de 7 u 8 dígitos.";
  }
  return null;
}

/**
 * Teléfono: solo números. Se permiten +, espacios, paréntesis y guiones para escribirlo,
 * pero el valor guardado queda en dígitos (con + si lo tenía).
 */
export function normalizePhone(value: string) {
  const compact = value.trim().replace(/[\s().-]/g, "");
  if (!/^\+?\d{8,15}$/.test(compact)) return null;
  return compact;
}

export function phoneError(value: string) {
  if (!normalizePhone(value)) {
    return "El teléfono tiene que ser un número, sin letras.";
  }
  return null;
}

export function parseBuyer(input: {
  name?: string;
  email?: string;
  dni?: string;
  phone?: string;
}): { ok: true; buyer: BuyerFields } | { ok: false; error: string } {
  const name = input.name?.trim() ?? "";
  const email = input.email?.trim().toLowerCase() ?? "";
  const dni = input.dni?.trim() ?? "";
  const phone = normalizePhone(input.phone ?? "");
  if (!name || !email || !dni || !input.phone?.trim()) {
    return { ok: false, error: "Completá todos los datos." };
  }
  if (!EMAIL.test(email)) return { ok: false, error: "Email inválido." };
  const dniMessage = dniError(dni);
  if (dniMessage) return { ok: false, error: dniMessage };
  if (!phone) return { ok: false, error: phoneError(input.phone ?? "") ?? "El teléfono tiene que ser un número." };
  return { ok: true, buyer: { name, email, dni, phone } };
}
