import { config } from "dotenv";
import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);
const email = "socio.prueba@atda.org.ar";
const dni = "30111222";
const password = "atda-prueba-123";
const passwordHash = await bcrypt.hash(password, 12);
const period = new Date().toISOString().slice(0, 7);

await sql`delete from membership_fees where member_id in (select id from members where email = ${email})`;
await sql`delete from members where email = ${email}`;

const [member] = await sql`
  insert into members (email, full_name, dni, phone, organization, role_title, status, password_hash, notes)
  values (
    ${email},
    ${"Socio de Prueba"},
    ${dni},
    ${"+54 11 5555-0100"},
    ${"ATDA QA"},
    ${"Tester"},
    ${"active"},
    ${passwordHash},
    ${"Cuenta de prueba local"}
  )
  returning id, email, full_name, dni
`;

await sql`
  insert into membership_fees (member_id, period, amount_cents, currency, status, notes)
  values (
    ${member.id},
    ${period},
    ${1500000},
    ${"ARS"},
    ${"pending"},
    ${"Cuota de prueba"}
  )
`;

console.log(
  JSON.stringify(
    {
      ok: true,
      login: "http://localhost:3000/socio/login",
      email,
      password,
      dni,
      member,
      period,
      fee: "ARS 15.000 (pending)",
    },
    null,
    2,
  ),
);
