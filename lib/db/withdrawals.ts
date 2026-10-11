import { randomInt } from "node:crypto";
import { desc, eq } from "drizzle-orm";
import { getDb } from "./index";
import { withdrawalRequests } from "./schema";

/** Sin 0/O ni 1/I para que el código se pueda dictar por teléfono sin confusiones. */
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function newCode() {
  let suffix = "";
  for (let index = 0; index < 6; index++) suffix += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return `ARR-${suffix}`;
}

export async function createWithdrawalRequest(input: {
  fullName: string;
  email: string;
  dni: string;
  purchase: string;
  details?: string;
}) {
  const db = getDb();
  for (let attempt = 0; attempt < 5; attempt++) {
    const [row] = await db
      .insert(withdrawalRequests)
      .values({
        code: newCode(),
        fullName: input.fullName,
        email: input.email.toLowerCase(),
        dni: input.dni,
        purchase: input.purchase,
        details: input.details || null,
      })
      .onConflictDoNothing({ target: withdrawalRequests.code })
      .returning();
    if (row) return row;
  }
  throw new Error("No se pudo generar el código de seguimiento");
}

export async function listWithdrawalRequests() {
  return getDb().select().from(withdrawalRequests).orderBy(desc(withdrawalRequests.createdAt));
}

export async function setWithdrawalStatus(id: number, status: "received" | "processed") {
  const [row] = await getDb()
    .update(withdrawalRequests)
    .set({ status })
    .where(eq(withdrawalRequests.id, id))
    .returning();
  return row ?? null;
}
