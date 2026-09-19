import { forwardRef } from "react";
import { CHAMPIONS, type ChampionId } from "@/lib/kit";

type Props = {
  selected: ChampionId;
  onSelect: (id: ChampionId) => void;
};

/**
 * The collection index, shown as the garments themselves rather than as a
 * row of text buttons. This sits between the campaign art and the
 * configurator: the hero shows the kits worn, this shows the four of them
 * as objects, then you configure one. Picking a shirt here selects it in
 * the configurator, so the text pills down there are a redundant control
 * rather than the only way in.
 */
export const Collection = forwardRef<HTMLDivElement, Props>(function Collection(
  { selected, onSelect },
  ref,
) {
  return (
    <section ref={ref} className="border-b border-[var(--panel-line)]">
      <div className="mx-auto max-w-[1400px] px-6 py-20 sm:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-[var(--gold)]">
              The Champions — Release 01
            </p>
            <h2
              className="mt-3 text-[clamp(1.9rem,4.4vw,3.25rem)] leading-[1.02] tracking-[-0.01em]"
              style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
            >
              Four legends. Four colors. One shirt.
            </h2>
          </div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
            Select a colorway
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {CHAMPIONS.map((c) => {
            const on = c.id === selected;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelect(c.id)}
                aria-pressed={on}
                className="group text-left"
              >
                {/* The garments are knocked out, so the two dark colorways
                    (Garnet, Black) disappear against the near-black ground.
                    This plinth lifts the tile just enough to give every
                    shirt an edge without reading as a card. */}
                <div
                  className={`relative overflow-hidden rounded-sm bg-gradient-to-b transition-colors duration-500 ${
                    on
                      ? "from-white/[0.085] to-transparent"
                      : "from-white/[0.045] to-transparent group-hover:from-white/[0.075]"
                  }`}
                >
                  <img
                    src={c.frontSrc}
                    alt={`${c.legendName} ${c.legendNumber} — ${c.colorLabel} kit, front`}
                    loading="lazy"
                    className={`block w-full transition-transform duration-700 ease-out group-hover:scale-[1.04] ${
                      on ? "scale-[1.02]" : ""
                    }`}
                  />
                </div>
                <div
                  className={`mt-4 h-px w-full transition-colors duration-300 ${
                    on ? "bg-[var(--gold)]" : "bg-[var(--panel-line)] group-hover:bg-[var(--muted)]"
                  }`}
                />
                <h3
                  className={`mt-4 text-[clamp(1.35rem,2.2vw,1.9rem)] leading-none transition-colors ${
                    on ? "text-[var(--gold)]" : "text-[var(--cream)]"
                  }`}
                  style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
                >
                  {c.legendName}
                </h3>
                <p className="mt-2 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                  No. {c.legendNumber} · {c.colorLabel}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
});
