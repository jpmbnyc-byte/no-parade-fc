import { forwardRef } from "react";
import { CHAMPIONS } from "@/lib/kit";

/**
 * The Hall of Fame campaign cards. These are finished editorial art —
 * each already carries its own headline, kit shot, back detail and crest
 * — so they're presented whole rather than broken apart and re-laid-out.
 * Each links to the full-size file, since the cards carry fine print
 * that a scaled-down card on a phone can't hold.
 */
export const HallOfFame = forwardRef<HTMLDivElement>(function HallOfFame(_props, ref) {
  return (
    <section ref={ref} className="border-t border-[var(--panel-line)]">
      <div className="mx-auto max-w-[1400px] px-6 py-16 sm:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-[var(--gold)]">Hall of Fame</p>
        <h2 className="mt-2 text-3xl" style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
          Icon. Legend. Peace.
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--muted)]">
          One card per champion — the kit, the back detail, the crest at actual size, and the
          player who made the number mean something.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {CHAMPIONS.map((c) => (
            <a
              key={c.id}
              href={c.cardSrc}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block overflow-hidden rounded-sm border border-[var(--panel-line)] bg-[var(--panel)] transition-colors hover:border-[var(--gold)]"
            >
              <img
                src={c.cardSrc}
                alt={`No Parade F.C. Hall of Fame card — ${c.legendName} ${c.legendNumber}, ${c.colorLabel}`}
                loading="lazy"
                className="block w-full transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              />
              <div className="liquid-sheen opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden />
              <div className="flex items-baseline justify-between gap-4 border-t border-[var(--panel-line)] px-5 py-3">
                <span className="text-xs font-semibold uppercase tracking-[0.14em]">
                  {c.legendName} {c.legendNumber} — {c.colorLabel}
                </span>
                <span className="text-[0.65rem] uppercase tracking-[0.14em] text-[var(--muted)]">
                  {c.country}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
});
