import Stripe from "stripe";
import { PERSONALIZED_PRICE, PRICE } from "../src/lib/kit";

export const config = { runtime: "edge" };

type Body = {
  nation: string;
  name: string;
  number: string;
};

function stripeClient() {
  const key = process.env["STRIPE_SECRET_KEY"]?.trim();
  if (!key) return null;
  return new Stripe(key);
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const body = (await req.json()) as Body;
  const personalized = Boolean(body.name && body.number);
  const unitAmount = (personalized ? PERSONALIZED_PRICE : PRICE) * 100;

  const description = [body.nation, body.name && `Name: ${body.name}`, body.number && `# ${body.number}`]
    .filter(Boolean)
    .join(" · ");

  const origin = req.headers.get("origin") ?? "http://localhost:5173";

  const stripe = stripeClient();
  if (!stripe) {
    const q = new URLSearchParams({ mock: "1", amount: String(unitAmount), description });
    return Response.json({ url: `${origin}/order/complete?${q.toString()}`, mode: "mock" });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_creation: "if_required",
    billing_address_collection: "auto",
    shipping_address_collection: { allowed_countries: ["US", "CA", "GB", "IE", "AU", "NZ", "FR", "HT", "JM"] },
    custom_text: {
      submit: { message: "Made-to-order pieces cannot be changed or returned after checkout." },
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: unitAmount,
          product_data: {
            name: `No Parade F.C. — ${personalized ? "Personalized Jersey" : "Clean Jersey"}`,
            description,
          },
        },
      },
    ],
    metadata: {
      nation: body.nation,
      name: body.name,
      number: body.number,
    },
    success_url: `${origin}/order/complete?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/order/cancel`,
  });

  if (!session.url) {
    return new Response("Stripe did not return a checkout URL.", { status: 502 });
  }
  return Response.json({ url: session.url, mode: "stripe" });
}
