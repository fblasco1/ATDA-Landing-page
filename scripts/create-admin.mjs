// Uso: node scripts/create-admin.mjs <email> ["Nombre"]
// Crea (o resetea) un admin con contraseña temporal; debe cambiarla en el primer ingreso.
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });

const email = process.argv[2]?.trim().toLowerCase();
const name = process.argv[3]?.trim() || null;
if (!email || !email.includes("@")) {
  console.error('Uso: node scripts/create-admin.mjs <email> ["Nombre"]');
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error("Falta DATABASE_URL en .env.local");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const tempPassword = randomBytes(9).toString("base64url");
const passwordHash = await bcrypt.hash(tempPassword, 12);

await sql`
  insert into admin_users (email, name, password_hash, must_change_password)
  values (${email}, ${name}, ${passwordHash}, true)
  on conflict (email) do update
    set password_hash = excluded.password_hash,
        must_change_password = true,
        name = coalesce(excluded.name, admin_users.name),
        updated_at = now()
`;

console.log(`Admin listo: ${email}`);
console.log(`Contraseña temporal: ${tempPassword}`);
console.log("Debe cambiarla en el primer ingreso a /admin/login.");
