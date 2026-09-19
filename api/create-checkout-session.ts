import Stripe from "stripe";
import { championById, isSize, priceFor, type ChampionId, type Mode, type Size } from "../src/lib/kit";

export const config = { runtime: "edge" };

type Body = {
  championId: ChampionId;
  mode: Mode;
  size: Size;
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

  // Without a size the order cannot be fulfilled, so refuse it here as well
  // as in the UI — this endpoint is reachable independently of the form.
  if (!isSize(body.size)) {
    return new Response("A garment size is required.", { status: 400 });
  }

  const champion = championById(body.championId);
  const unitAmount = priceFor(body.mode) * 100;

  const printedName = body.mode === "tribute" ? champion.legendName : body.mode === "custom" ? body.name : "";
  const printedNumber =
    body.mode === "tribute" ? champion.legendNumber : body.mode === "custom" ? body.number : "";

  const description = [
    `${champion.legendName} colorway — ${champion.colorLabel}`,
    `Size ${body.size}`,
    printedName && `Name: ${printedName}`,
    printedNumber && `# ${printedNumber}`,
  ]
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
            name: `No Parade F.C. — The Champions — ${champion.colorLabel} ${body.size} (${body.mode})`,
            description,
          },
        },
      },
    ],
    metadata: {
      champion: body.championId,
      mode: body.mode,
      size: body.size,
      name: printedName,
      number: printedNumber,
    },
    success_url: `${origin}/order/complete?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/order/cancel`,
  });

  if (!session.url) {
    return new Response("Stripe did not return a checkout URL.", { status: 502 });
  }
  return Response.json({ url: session.url, mode: "stripe" });
}
