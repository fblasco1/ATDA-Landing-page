import type { withdrawalRequests } from "@/lib/db/schema";
import { sendEmail, siteUrl } from "./send";
import { withdrawalNotifyEmail, withdrawalReceiptEmail } from "./templates";

type WithdrawalRow = typeof withdrawalRequests.$inferSelect;

export async function sendWithdrawalEmails(row: WithdrawalRow, fallbackNotify: string[], request?: Request) {
  const receipt = withdrawalReceiptEmail(row);
  const receiptResult = await sendEmail({
    to: row.email,
    ...receipt,
    idempotencyKey: `withdrawal-receipt-${row.code}`,
  });
  if (!receiptResult.ok) console.error("No se pudo enviar el comprobante de arrepentimiento", receiptResult.error);

  const configured = (process.env.MEMBERSHIP_NOTIFY_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const to = configured.length ? configured : fallbackNotify;
  if (to.length === 0) return;
  const notice = withdrawalNotifyEmail({
    ...row,
    details: row.details ?? undefined,
    baseUrl: siteUrl(request),
  });
  const noticeResult = await sendEmail({ to, ...notice, idempotencyKey: `withdrawal-notify-${row.code}` });
  if (!noticeResult.ok) console.error("No se pudo avisar el pedido de arrepentimiento", noticeResult.error);
}
