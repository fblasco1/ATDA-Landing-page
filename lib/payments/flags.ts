/** Checkout MODO apagado salvo que MODO_CHECKOUT_ENABLED=true (hasta tener credenciales, issue #1). */
export function isModoCheckoutEnabled() {
  return process.env.MODO_CHECKOUT_ENABLED === "true";
}
