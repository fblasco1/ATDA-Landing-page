import { CheckoutStatus } from "@/components/checkout/status";

export default async function CheckoutErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ enrollment?: string }>;
}) {
  const { enrollment } = await searchParams;
  return (
    <CheckoutStatus
      title="No se completó el pago"
      body="Podés intentarlo de nuevo desde la ficha del curso. Si el cargo se debitó, escribinos por el formulario de contacto."
      enrollment={enrollment}
    />
  );
}
