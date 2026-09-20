import { useEffect, useState } from "react";

type OrderSummary = {
  mode: "stripe" | "mock";
  paid: boolean;
  description: string;
  amountTotal: number | null;
  note?: string;
};

export function OrderComplete() {
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    fetch(`/api/order-summary?${params.toString()}`)
      .then((r) => r.json())
      .then(setOrder)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 text-center">
      <img src="/logo.webp" alt="No Parade F.C." width={480} height={42} className="h-5 w-auto" />
      <p className="mt-8 text-xs font-bold uppercase tracking-[0.28em] text-[var(--gold)]">Order confirmed</p>
      <h1 className="mt-4 text-3xl" style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
        Peace be with you.
      </h1>
      {loading ? (
        <p className="mt-6 text-sm text-[var(--muted)]">Loading your order…</p>
      ) : order ? (
        <div className="mt-8 w-full border border-[var(--line)] p-6 text-left text-sm">
          <p className="text-[var(--muted)]">{order.description}</p>
          {order.amountTotal != null ? (
            <p className="mt-2 font-bold">${(order.amountTotal / 100).toFixed(2)}</p>
          ) : null}
          {order.note ? <p className="mt-4 text-xs text-[var(--muted)]">{order.note}</p> : null}
        </div>
      ) : (
        <p className="mt-6 text-sm text-[var(--muted)]">We couldn&rsquo;t load your order details.</p>
      )}
      <a href="/" className="mt-8 text-xs font-bold uppercase tracking-[0.14em] text-[var(--gold)]">
        ← Back to No Parade F.C.
      </a>
    </main>
  );
}
