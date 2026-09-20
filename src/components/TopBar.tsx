import { FREE_SHIPPING_OVER } from "@/lib/kit";

type Props = {
  onHome: () => void;
  onCollection: () => void;
  onBuild: () => void;
  onHall: () => void;
  bagCount: number;
  subtotal: number;
  onBag: () => void;
};

/**
 * Announcement bar + header, in the shape every serious shop uses and this
 * site did not have: a black strip carrying the shipping threshold, then a
 * white header that stays put while you scroll.
 *
 * The header was previously absolutely positioned inside the hero, so it
 * scrolled away with the art and the bag went with it — on a long page the
 * only way back to checkout was to scroll to the top.
 */
export function TopBar({ onHome, onCollection, onBuild, onHall, bagCount, subtotal, onBag }: Props) {
  const remaining = Math.max(0, FREE_SHIPPING_OVER - subtotal);
  const shipping =
    remaining > 0
      ? `You are $${remaining.toFixed(2)} away from free shipping`
      : "Your order ships free";

  const notes = [shipping, "Made to order — printed when you order it", "The Champions · Release 01"];

  return (
    <div className="sticky top-0 z-40">
      <div className="overflow-hidden bg-[var(--fg)] py-2.5 text-[var(--on-dark)]">
        <div className="marquee">
          {/* Two copies so the loop has something to scroll into. */}
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0" aria-hidden={copy === 1}>
              {notes.map((n) => (
                <span
                  key={n}
                  className="whitespace-nowrap px-8 text-[0.62rem] font-semibold uppercase tracking-[0.22em]"
                >
                  {n}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <header className="border-b border-[var(--line)] bg-[var(--bg)]">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-6 py-4 sm:px-10">
          <nav className="hidden flex-1 gap-7 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)] md:flex">
            <button onClick={onCollection} className="transition-colors hover:text-[var(--fg)]">
              Collection
            </button>
            <button onClick={onBuild} className="transition-colors hover:text-[var(--fg)]">
              Build
            </button>
            <button onClick={onHall} className="transition-colors hover:text-[var(--fg)]">
              Hall of Fame
            </button>
          </nav>

          <button onClick={onHome} className="flex items-center md:flex-1 md:justify-center">
            <img
              src="/logo.webp"
              alt="No Parade F.C."
              width={480}
              height={42}
              className="h-5 w-auto sm:h-6"
            />
          </button>

          <div className="flex flex-1 items-center justify-end gap-4 sm:gap-5">
            <button
              onClick={onCollection}
              className="whitespace-nowrap text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)] transition-colors hover:text-[var(--fg)] md:hidden"
            >
              Shop
            </button>
            <button
              onClick={onBag}
              aria-label={`Open bag, ${bagCount} item${bagCount === 1 ? "" : "s"}`}
              className="whitespace-nowrap text-[0.68rem] font-semibold uppercase tracking-[0.16em] transition-colors hover:text-[var(--muted)]"
            >
              Bag ({bagCount})
            </button>
          </div>
        </div>
      </header>
    </div>
  );
}
