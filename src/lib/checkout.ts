import type { ChampionId, Mode } from "@/lib/kit";

export type CheckoutPayload = {
  championId: ChampionId;
  mode: Mode;
  name: string;
  number: string;
};

export async function startCheckout(payload: CheckoutPayload): Promise<void> {
  const res = await fetch("/api/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Checkout could not start. Try again in a moment.");
  }
  const { url } = (await res.json()) as { url: string };
  window.location.href = url;
}
