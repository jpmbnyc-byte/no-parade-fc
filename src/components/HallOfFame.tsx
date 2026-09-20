import { forwardRef } from "react";
import { CHAMPIONS, type ChampionId } from "@/lib/kit";

type Props = {
  /** Selects that colorway in the configurator and scrolls to it. */
  onSelect: (id: ChampionId) => void;
};

/**
 * The Hall of Fame campaign cards. These are finished editorial art —
 * each already carries its own headline, kit shot, back detail and crest
 * — so they're presented whole rather than broken apart and re-laid-out.
 * A card is a way into the product, not a download: clicking one selects
 * that colorway in the configurator and scrolls you there.
 */
export const HallOfFame = forwardRef<HTMLDivElement, Props>(function HallOfFame({ onSelect }, ref) {
  return (
    <section ref={ref} className="border-t border-[var(--line)]">
      <div className="mx-auto max-w-[1400px] px-6 py-16 sm:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-[var(--gold)]">Hall of Fame</p>
        <h2 className="mt-2 text-3xl" style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
          Icon. Legend. Peace.
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--muted)]">
          One card per champion — the kit, the back detail, the crest at actual size, and the
          player who made the number mean something. Pick one to build it.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {CHAMPIONS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              aria-label={`Build the ${c.colorLabel} colorway — ${c.legendName} ${c.legendNumber}`}
              className="group relative block w-full overflow-hidden rounded-sm border border-[var(--line)] bg-[var(--surface)] text-left transition-colors hover:border-[var(--gold)]"
            >
              <img
                src={c.cardSrc}
                alt={`No Parade F.C. Hall of Fame card — ${c.legendName} ${c.legendNumber}, ${c.colorLabel}`}
                loading="lazy"
                decoding="async"
                width={1400}
                height={933}
                className="block w-full transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              />
              <div className="liquid-sheen opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden />
              <div className="flex items-baseline justify-between gap-4 border-t border-[var(--line)] px-5 py-3">
                <span className="text-xs font-semibold uppercase tracking-[0.14em]">
                  {c.legendName} {c.legendNumber} — {c.colorLabel}
                </span>
                <span className="text-[0.65rem] uppercase tracking-[0.14em] text-[var(--muted)] transition-colors group-hover:text-[var(--gold)]">
                  <span className="group-hover:hidden">{c.country}</span>
                  <span className="hidden group-hover:inline">Build this kit →</span>
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
});
