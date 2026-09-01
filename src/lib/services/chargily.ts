export interface ChargilyCheckoutParams {
  merchant_id: string;
  amount: number;
  currency?: string;
  description?: string;
  success_url?: string;
  failure_url?: string;
  webhook_endpoint?: string;
  metadata?: Record<string, string>;
}

export async function createChargilyCheckout(params: ChargilyCheckoutParams) {
  const apiKey = process.env.CHARGILY_API_KEY;
  if (!apiKey) throw new Error("CHARGILY_API_KEY غير مضبوط");

  const res = await fetch("https://pay.chargily.net/api/v2/checkouts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: params.amount,
      currency: params.currency ?? "dzd",
      description: params.description ?? "اشتراك منصة COD",
      success_url: params.success_url ?? `${process.env.NEXT_PUBLIC_BASE_DOMAIN}/dashboard/billing?success=true`,
      failure_url: params.failure_url ?? `${process.env.NEXT_PUBLIC_BASE_DOMAIN}/dashboard/billing?canceled=true`,
      webhook_endpoint: params.webhook_endpoint,
      metadata: params.metadata,
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Chargily error: ${txt}`);
  }
  return res.json();
}
