import type { CartItem } from "@/lib/cart";

export async function startCheckout(items: CartItem[]): Promise<void> {
  const res = await fetch("/api/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: items.map(({ championId, mode, size, name, number }) => ({
        championId,
        mode,
        size,
        name,
        number,
      })),
    }),
  });
  if (!res.ok) {
    throw new Error("Checkout could not start. Try again in a moment.");
  }
  const { url } = (await res.json()) as { url: string };
  window.location.href = url;
}
