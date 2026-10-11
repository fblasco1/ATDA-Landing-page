import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });
const sql = neon(process.env.DATABASE_URL);

await sql`delete from membership_fees`;
await sql`delete from course_enrollments`;
await sql`delete from members`;
await sql`delete from membership_requests`;

const counts = {
  members: (await sql`select count(*)::int as n from members`)[0].n,
  requests: (await sql`select count(*)::int as n from membership_requests`)[0].n,
  fees: (await sql`select count(*)::int as n from membership_fees`)[0].n,
  enrollments: (await sql`select count(*)::int as n from course_enrollments`)[0].n,
};
console.log("cleaned", counts);
