import { forwardRef } from "react";
import { CHAMPIONS, PRICE, type ChampionId } from "@/lib/kit";

type Props = {
  selected: ChampionId;
  onSelect: (id: ChampionId) => void;
};

/**
 * The collection grid, built as product cards rather than an editorial index.
 *
 * The plates are knocked-out garments on transparency, which on a light tile
 * would otherwise read as stickers. Two things fix that: a soft radial sweep
 * on the tile so the ground has depth, and a drop-shadow that follows the
 * image's alpha silhouette instead of its bounding box, so the garment casts
 * a shadow shaped like itself. Hovering swaps to the back, which is where
 * the print is and the reason anyone is looking.
 *
 * Each card loads the 400px plate, not the 1254px one: these tiles render at
 * roughly 300px and the full plates were ~150KB apiece.
 */
export const Collection = forwardRef<HTMLDivElement, Props>(function Collection(
  { selected, onSelect },
  ref,
) {
  return (
    <section ref={ref} className="border-b border-[var(--line)] bg-[var(--bg)]">
      <div className="mx-auto max-w-[1400px] px-6 py-16 sm:px-10 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.28em] text-[var(--gold)]">
              The Champions — Release 01
            </p>
            <h2
              className="mt-3 text-[clamp(1.8rem,4vw,2.9rem)] leading-[1.04] tracking-[-0.015em]"
              style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
            >
              Four legends. Four colors. One shirt.
            </h2>
          </div>
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
            4 products
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 lg:grid-cols-4">
          {CHAMPIONS.map((c) => {
            const on = c.id === selected;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelect(c.id)}
                aria-pressed={on}
                aria-label={`${c.legendName} ${c.legendNumber} — ${c.colorLabel}`}
                className="group text-left"
              >
                <div
                  className={`product-tile relative aspect-square overflow-hidden rounded-[2px] border transition-colors duration-300 ${
                    on ? "border-[var(--fg)]" : "border-[var(--line)] group-hover:border-[var(--muted)]"
                  }`}
                >
                  <span className="absolute left-3 top-3 z-10 bg-[var(--fg)] px-2 py-1 text-[0.55rem] font-bold uppercase tracking-[0.16em] text-[var(--on-dark)]">
                    Release 01
                  </span>

                  <img
                    src={c.thumbSrc}
                    alt={`${c.legendName} ${c.legendNumber} — ${c.colorLabel} kit, front`}
                    loading="lazy"
                    decoding="async"
                    width={400}
                    height={400}
                    className="product-shadow absolute inset-0 size-full scale-[0.88] object-contain transition-opacity duration-500 ease-out group-hover:opacity-0"
                  />
                  <img
                    src={c.thumbBackSrc}
                    alt=""
                    aria-hidden
                    loading="lazy"
                    decoding="async"
                    width={400}
                    height={400}
                    className="product-shadow absolute inset-0 size-full scale-[0.88] object-contain opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
                  />
                </div>

                <div className="mt-3.5 flex items-baseline justify-between gap-3">
                  <h3 className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-[var(--fg)]">
                    {c.legendName} {c.legendNumber}
                  </h3>
                  <span className="shrink-0 text-[0.72rem] tabular-nums text-[var(--muted)]">
                    From ${PRICE}
                  </span>
                </div>
                <p className="mt-1 text-[0.62rem] uppercase tracking-[0.16em] text-[var(--muted)]">
                  {c.colorLabel}
                </p>

                <span
                  className={`mt-2.5 block text-[0.6rem] font-semibold uppercase tracking-[0.16em] transition-opacity ${
                    on ? "text-[var(--fg)] opacity-100" : "text-[var(--muted)] opacity-0 group-hover:opacity-100"
                  }`}
                >
                  {on ? "Selected" : "Build this kit"}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
});
