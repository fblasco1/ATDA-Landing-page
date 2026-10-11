import { notFound } from "next/navigation";
import { isModoCheckoutEnabled } from "@/lib/payments/flags";

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  if (!isModoCheckoutEnabled()) notFound();
  return children;
}
