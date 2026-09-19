import Stripe from "stripe";
import { championById, isSize, priceFor, type ChampionId, type Mode, type Size } from "../src/lib/kit";

export const config = { runtime: "edge" };

type Item = {
  championId: ChampionId;
  mode: Mode;
  size: Size;
  name: string;
  number: string;
};

type Body = { items: Item[] };

function stripeClient() {
  const key = process.env["STRIPE_SECRET_KEY"]?.trim();
  if (!key) return null;
  return new Stripe(key);
}

function describe(item: Item) {
  const champion = championById(item.championId);
  const printedName =
    item.mode === "tribute" ? champion.legendName : item.mode === "custom" ? item.name : "";
  const printedNumber =
    item.mode === "tribute" ? champion.legendNumber : item.mode === "custom" ? item.number : "";

  const description = [
    `${champion.legendName} colorway — ${champion.colorLabel}`,
    `Size ${item.size}`,
    printedName && `Name: ${printedName}`,
    printedNumber && `# ${printedNumber}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    champion,
    printedName,
    printedNumber,
    description,
    name: `No Parade F.C. — The Champions — ${champion.colorLabel} ${item.size} (${item.mode})`,
  };
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const body = (await req.json()) as Body;
  const items = Array.isArray(body.items) ? body.items : [];

  if (items.length === 0) {
    return new Response("The bag is empty.", { status: 400 });
  }
  // Without a size the order cannot be fulfilled, so refuse it here as well as
  // in the UI — this endpoint is reachable independently of the form.
  if (items.some((i) => !isSize(i.size))) {
    return new Response("A garment size is required on every item.", { status: 400 });
  }

  const origin = req.headers.get("origin") ?? "http://localhost:5173";
  const described = items.map(describe);
  const total = items.reduce((sum, i) => sum + priceFor(i.mode) * 100, 0);

  const stripe = stripeClient();
  if (!stripe) {
    const q = new URLSearchParams({
      mock: "1",
      amount: String(total),
      description: described.map((d) => d.description).join(" | "),
    });
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
    line_items: items.map((item, i) => ({
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: priceFor(item.mode) * 100,
        product_data: {
          name: described[i].name,
          description: described[i].description,
        },
      },
    })),
    // Stripe caps a metadata value at 500 characters, so the per-item detail
    // is summarised here and lives in full on the line items above.
    metadata: {
      items: String(items.length),
      summary: described.map((d) => d.description).join(" | ").slice(0, 490),
    },
    success_url: `${origin}/order/complete?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/order/cancel`,
  });

  if (!session.url) {
    return new Response("Stripe did not return a checkout URL.", { status: 502 });
  }
  return Response.json({ url: session.url, mode: "stripe" });
}
