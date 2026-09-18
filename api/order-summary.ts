import Stripe from "stripe";

export const config = { runtime: "edge" };

function stripeClient() {
  const key = process.env["STRIPE_SECRET_KEY"]?.trim();
  if (!key) return null;
  return new Stripe(key);
}

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("session_id");
  const mock = url.searchParams.get("mock");

  if (mock === "1") {
    return Response.json({
      mode: "mock",
      paid: false,
      description: url.searchParams.get("description") ?? "",
      amountTotal: Number(url.searchParams.get("amount") ?? 0),
      note: "Local fallback — add STRIPE_SECRET_KEY to enable hosted Stripe Checkout.",
    });
  }

  if (!sessionId) {
    return Response.json(null);
  }

  const stripe = stripeClient();
  if (!stripe) return Response.json(null);

  const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["line_items"] });
  const meta = session.metadata ?? {};

  return Response.json({
    mode: "stripe",
    paid: session.payment_status === "paid",
    email: session.customer_details?.email ?? session.customer_email ?? null,
    productName: session.line_items?.data[0]?.description ?? "No Parade F.C.",
    description: [meta["name"], meta["number"] && `# ${meta["number"]}`, meta["champion"]]
      .filter(Boolean)
      .join(" · "),
    amountTotal: session.amount_total,
  });
}
