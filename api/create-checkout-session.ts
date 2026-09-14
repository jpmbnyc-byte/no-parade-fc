import Stripe from "stripe";
import {
  CREST_INITIALS_MAX,
  HERITAGE_MAX,
  KIT_LABEL,
  KIT_PRICING,
  MOTTO_MAX,
  type KitId,
} from "../src/lib/kit";

export const config = { runtime: "edge" };

type Body = {
  kitId: KitId;
  nation: string;
  name: string;
  number: string;
  year: string;
  crestId: string | null;
  crestInitials: string;
  motto: string;
  heritage: string;
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
  const kitId: KitId = body.kitId === "clean" ? "clean" : "crest";
  const unitAmount = KIT_PRICING[kitId] * 100;

  const description = [
    body.nation,
    body.name && `Name: ${body.name}`,
    body.number && `# ${body.number}`,
    body.year,
    kitId === "crest" && body.crestId && `Crest: ${body.crestId}`,
    kitId === "crest" && body.crestInitials && body.crestInitials.slice(0, CREST_INITIALS_MAX),
    kitId === "crest" && body.motto && body.motto.slice(0, MOTTO_MAX),
    kitId === "crest" && body.heritage && body.heritage.slice(0, HERITAGE_MAX),
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
            name: `No Parade F.C. — ${KIT_LABEL[kitId]}`,
            description,
          },
        },
      },
    ],
    metadata: {
      kit: kitId,
      nation: body.nation,
      name: body.name,
      number: body.number,
      year: body.year,
      crest: body.crestId ?? "",
      crest_initials: body.crestInitials,
      motto: body.motto,
      heritage: body.heritage,
    },
    success_url: `${origin}/order/complete?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/order/cancel`,
  });

  if (!session.url) {
    return new Response("Stripe did not return a checkout URL.", { status: 502 });
  }
  return Response.json({ url: session.url, mode: "stripe" });
}
