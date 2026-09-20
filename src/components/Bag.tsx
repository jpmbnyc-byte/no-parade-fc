import { useEffect, useState } from "react";
import { championById } from "@/lib/kit";
import { itemLabel, itemPrice, itemPrint, type CartItem } from "@/lib/cart";
import { startCheckout } from "@/lib/checkout";

type Props = {
  open: boolean;
  items: CartItem[];
  subtotal: number;
  onClose: () => void;
  onRemove: (key: string) => void;
};

/**
 * The bag. Checkout used to take exactly one shirt, so ordering two meant
 * paying twice and being charged shipping twice; Stripe now receives one
 * line item per build.
 */
export function Bag({ open, items, subtotal, onClose, onRemove }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    // Stop the page behind the panel from scrolling with it.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  async function checkout() {
    setBusy(true);
    setError(null);
    try {
      await startCheckout(items);
    } catch (e) {
      setBusy(false);
      setError(e instanceof Error ? e.message : "Checkout could not start.");
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <button
        tabIndex={open ? 0 : -1}
        aria-label="Close bag"
        onClick={onClose}
        className={`absolute inset-0 bg-black/70 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-label="Your bag"
        className={`absolute inset-y-0 right-0 flex w-full max-w-[26rem] flex-col border-l border-[var(--line)] bg-[var(--bg)] transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-[var(--line)] px-6 py-5">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-[var(--gold)]">
            Your bag
          </p>
          <button
            onClick={onClose}
            tabIndex={open ? 0 : -1}
            className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)] transition-colors hover:text-[var(--fg)]"
          >
            Close
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
            <p className="text-sm text-[var(--muted)]">Nothing in the bag yet.</p>
            <button
              onClick={onClose}
              tabIndex={open ? 0 : -1}
              className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--gold)] underline underline-offset-4"
            >
              Build a shirt
            </button>
          </div>
        ) : (
          <ul className="flex-1 divide-y divide-[var(--line)] overflow-y-auto">
            {items.map((item) => {
              const champion = championById(item.championId);
              const print = itemPrint(item);
              return (
                <li key={item.key} className="flex gap-4 px-6 py-5">
                  <img
                    src={champion.thumbSrc}
                    alt=""
                    width={400}
                    height={400}
                    className="size-16 shrink-0 rounded-[2px] bg-[var(--surface)] object-contain p-1"
                    loading="lazy"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--fg)]">
                      {itemLabel(item)}
                    </p>
                    {print && (
                      <p className="mt-1 text-[0.68rem] uppercase tracking-[0.14em] text-[var(--muted)]">
                        {print}
                      </p>
                    )}
                    <button
                      onClick={() => onRemove(item.key)}
                      tabIndex={open ? 0 : -1}
                      className="mt-2 text-[0.68rem] text-[var(--muted)] underline underline-offset-4 transition-colors hover:text-[var(--fg)]"
                    >
                      Remove
                    </button>
                  </div>
                  <span className="shrink-0 text-sm tabular-nums text-[var(--fg)]">
                    ${itemPrice(item)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        {items.length > 0 && (
          <footer className="border-t border-[var(--line)] px-6 py-5">
            <div className="flex items-baseline justify-between">
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                Subtotal
              </span>
              <span className="text-lg tabular-nums text-[var(--fg)]">${subtotal}</span>
            </div>
            <p className="mt-1 text-[0.65rem] text-[var(--muted)]">
              Shipping and any duties are calculated at checkout.
            </p>
            {error && (
              <p className="mt-3 text-sm text-red-400" role="alert">
                {error}
              </p>
            )}
            <button
              onClick={() => void checkout()}
              disabled={busy}
              tabIndex={open ? 0 : -1}
              className="liquid-btn mt-4 w-full bg-[var(--accent)] py-3.5 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--accent-fg)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy ? "Redirecting to checkout" : `Checkout · $${subtotal}`}
            </button>
          </footer>
        )}
      </aside>
    </div>
  );
}
