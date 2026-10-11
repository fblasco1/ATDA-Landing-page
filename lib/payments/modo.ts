import { getSiteUrl } from "@/lib/utils";

type ModoEnv = "sandbox" | "production";

export type ModoPaymentRequest = {
  id: string;
  qr?: string;
  deeplink?: string;
  created_at?: string;
  expiration_at?: number;
  expiration_date?: string;
  status?: string;
};

function getModoBaseUrl() {
  if (process.env.MODO_API_BASE_URL) {
    return process.env.MODO_API_BASE_URL.replace(/\/$/, "");
  }
  const env = (process.env.MODO_ENV ?? "sandbox") as ModoEnv;
  return env === "production"
    ? "https://ecommerce.modo.com.ar"
    : "https://ecommerce.preprod.modo.com.ar";
}

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta ${name}`);
  }
  return value;
}

let cachedToken: { value: string; expiresAt: number } | null = null;

/**
 * Autenticación contra la API merchants de MODO (Username + Password del onboarding).
 * El Store ID identifica la config Decidir Plus / cuotas asociada al comercio.
 */
async function getAccessToken() {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 30_000) {
    return cachedToken.value;
  }

  const username = requireEnv("MODO_USERNAME");
  const password = requireEnv("MODO_PASSWORD");
  const basic = Buffer.from(`${username}:${password}`).toString("base64");

  const tokenPaths = [
    "/merchants/middleman/token",
    "/oauth/token",
    "/token",
  ];

  let lastError = "No se pudo autenticar con MODO";

  for (const path of tokenPaths) {
    const response = await fetch(`${getModoBaseUrl()}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: username,
        client_secret: password,
      }),
    });

    if (!response.ok) {
      lastError = `MODO auth ${path}: ${await response.text()}`;
      continue;
    }

    const data = (await response.json()) as {
      access_token?: string;
      token?: string;
      expires_in?: number;
    };
    const token = data.access_token ?? data.token;
    if (!token) {
      lastError = `MODO auth ${path}: respuesta sin token`;
      continue;
    }

    cachedToken = {
      value: token,
      expiresAt: now + (data.expires_in ?? 3500) * 1000,
    };
    return token;
  }

  // Fallback: algunos ambientes aceptan Basic directo en payment-requests
  return `basic:${basic}`;
}

function authHeaders(token: string) {
  const storeId = requireEnv("MODO_STORE_ID");
  if (token.startsWith("basic:")) {
    return {
      Authorization: `Basic ${token.slice("basic:".length)}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      storeId,
      "X-Store-Id": storeId,
    };
  }
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
    storeId,
    "X-Store-Id": storeId,
  };
}

export async function createModoPaymentRequest(input: {
  enrollmentId: string;
  amount: number;
  description: string;
  customer: {
    full_name: string;
    email: string;
    identification: string;
    phone: string;
  };
}) {
  const token = await getAccessToken();
  const siteUrl = getSiteUrl();
  const ccCode = process.env.MODO_CC_CODE ?? "1CSI";
  const processorCode = requireEnv("MODO_PROCESSOR_CODE");

  const body = {
    description: input.description,
    amount: Number(input.amount.toFixed(2)),
    currency: "ARS",
    cc_code: ccCode,
    processor_code: processorCode,
    external_intention_id: input.enrollmentId,
    webhook_notification: `${siteUrl}/api/webhooks/modo`,
    message: input.enrollmentId,
    customer: {
      full_name: input.customer.full_name,
      email: input.customer.email,
      identification: input.customer.identification,
      phone: input.customer.phone,
      id: input.enrollmentId,
    },
    items: [
      {
        description: input.description,
        quantity: 1,
        unit_price: Number(input.amount.toFixed(2)),
        sku: input.enrollmentId,
        category_name: "Cursos",
      },
    ],
  };

  const response = await fetch(`${getModoBaseUrl()}/v2/payment-requests/`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`MODO no pudo crear el payment request: ${text}`);
  }

  const payment = (await response.json()) as ModoPaymentRequest;
  return {
    id: payment.id,
    qr: payment.qr,
    deeplink: payment.deeplink,
    expirationDate: payment.expiration_date,
  };
}

export async function getModoPaymentRequest(paymentRequestId: string) {
  const token = await getAccessToken();
  const response = await fetch(
    `${getModoBaseUrl()}/v2/payment-requests/${paymentRequestId}`,
    { headers: authHeaders(token) },
  );
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`No se pudo consultar MODO: ${text}`);
  }
  return (await response.json()) as ModoPaymentRequest & {
    status?: string;
    payment_status?: string;
    state?: string;
  };
}

export function mapModoStatus(status: string | undefined | null) {
  const normalized = (status ?? "").toUpperCase();
  if (
    normalized.includes("APPROV") ||
    normalized.includes("PAID") ||
    normalized === "ACCREDIT" ||
    normalized === "SUCCESS" ||
    normalized === "COMPLETED"
  ) {
    return "paid" as const;
  }
  if (normalized.includes("REJECT") || normalized.includes("FAIL") || normalized.includes("DENIED")) {
    return "failed" as const;
  }
  if (
    normalized.includes("EXPIRE") ||
    normalized.includes("ABANDON") ||
    normalized.includes("CANCEL")
  ) {
    return "expired" as const;
  }
  if (normalized.includes("PARTIAL") && normalized.includes("REFUND")) {
    return "underpaid" as const;
  }
  return "pending" as const;
}

export function isQrImageData(qr: string | undefined) {
  if (!qr) return false;
  return qr.startsWith("data:image") || qr.startsWith("iVBOR") || qr.startsWith("/9j/");
}

export function qrImageSrc(qr: string) {
  if (qr.startsWith("data:image")) return qr;
  if (qr.startsWith("iVBOR")) return `data:image/png;base64,${qr}`;
  if (qr.startsWith("/9j/")) return `data:image/jpeg;base64,${qr}`;
  return qr;
}
