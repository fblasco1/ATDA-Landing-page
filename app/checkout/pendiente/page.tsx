import { CheckoutStatus } from "@/components/checkout/status";

export default async function CheckoutPendingPage({
  searchParams,
}: {
  searchParams: Promise<{ enrollment?: string }>;
}) {
  const { enrollment } = await searchParams;
  return (
    <CheckoutStatus
      title="Pago pendiente"
      body="Estamos esperando la acreditación. Cuando se confirme, ATDA te va a contactar para el aula virtual."
      enrollment={enrollment}
    />
  );
}
