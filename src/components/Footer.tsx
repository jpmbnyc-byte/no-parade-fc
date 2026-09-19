import { SHIPS_TO } from "@/lib/kit";

type Props = {
  onHome: () => void;
  onCollection: () => void;
  onBuild: () => void;
  onHall: () => void;
};

export function Footer({ onHome, onCollection, onBuild, onHall }: Props) {
  return (
    <footer className="border-t border-[var(--panel-line)]">
      {/* Shipping and returns. Everything stated here is what the checkout
          actually does: made-to-order, the nine countries the Stripe session
          accepts an address for, and the no-changes-after-checkout rule the
          confirm step already makes you tick. The delivery and return windows
          are the two numbers that are not enforced anywhere in code — set
          them to the real fulfilment terms. */}
      <div className="mx-auto max-w-[1400px] px-6 py-14 sm:px-10">
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.24em] text-[var(--gold)]">
              Made to order
            </p>
            <p className="mt-3 text-xs leading-relaxed text-[var(--muted)]">
              Every shirt is printed when you order it. Tribute and Blank ship in 5–7 business days.
              Custom shirts are printed by hand and ship in 7–10.
            </p>
          </div>
          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.24em] text-[var(--gold)]">
              Shipping
            </p>
            <p className="mt-3 text-xs leading-relaxed text-[var(--muted)]">
              Tracked worldwide to {SHIPS_TO.slice(0, -1).join(", ")} and {SHIPS_TO.at(-1)}. Free over
              $250. Duties outside the US are the buyer's.
            </p>
          </div>
          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.24em] text-[var(--gold)]">
              Returns
            </p>
            <p className="mt-3 text-xs leading-relaxed text-[var(--muted)]">
              Unworn Tribute and Blank shirts can be returned within 14 days of delivery. Custom
              shirts carry your name and cannot be resold, so they are final sale — check the
              spelling before you confirm.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1400px] flex-col gap-8 border-t border-[var(--panel-line)] px-6 py-14 sm:flex-row sm:items-start sm:justify-between sm:px-10">
        <div>
          <img src="/logo-white.png" alt="No Parade F.C." className="h-6 w-auto" />
          <p className="mt-4 max-w-xs text-xs leading-relaxed text-[var(--muted)]">
            Four legends. Four colors. One shirt. Peace be with you.
          </p>
        </div>

        <div className="flex gap-16 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
          <div className="flex flex-col gap-3">
            <span className="text-[var(--cream)]">Site</span>
            <button onClick={onHome} className="text-left transition-colors hover:text-[var(--cream)]">
              Home
            </button>
            <button onClick={onCollection} className="text-left transition-colors hover:text-[var(--cream)]">
              Collection
            </button>
            <button onClick={onBuild} className="text-left transition-colors hover:text-[var(--cream)]">
              The Champions
            </button>
            <button onClick={onHall} className="text-left transition-colors hover:text-[var(--cream)]">
              Hall of Fame
            </button>
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--panel-line)] px-6 py-5 text-center text-[0.65rem] uppercase tracking-[0.12em] text-[var(--muted)] sm:px-10">
        No Parade F.C. — Peace Be With You
      </div>
    </footer>
  );
}
