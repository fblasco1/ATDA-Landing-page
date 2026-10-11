import { CheckoutStatus } from "@/components/checkout/status";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ enrollment?: string }>;
}) {
  const { enrollment } = await searchParams;
  return (
    <CheckoutStatus
      title="Pago recibido"
      body="Si MODO acreditó el pago, un administrador de ATDA te va a asignar el acceso al aula virtual. No hace falta crear un usuario ahora."
      enrollment={enrollment}
    />
  );
}
