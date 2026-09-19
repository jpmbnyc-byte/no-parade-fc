type Props = {
  onHome: () => void;
  onAbout: () => void;
  onBuild: () => void;
  onHall: () => void;
};

/**
 * Cinematic hero. The campaign art already carries its own NOPARADE /
 * CHAMPIONS lockup, so on wide screens the art is shown whole at its
 * native aspect and the HTML headline is screen-reader only — printing
 * it twice would be worse than either alone. Below `md` the frame goes
 * portrait and crops to the players (the baked lockup crops away with
 * the right edge), and the HTML lockup becomes visible so the headline
 * is still legible on a phone.
 */
export function Hero({ onHome, onAbout, onBuild, onHall }: Props) {
  return (
    <section className="relative border-b border-[var(--panel-line)]">
      <nav className="absolute inset-x-0 top-0 z-20 mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 sm:px-10">
        <button onClick={onHome} className="flex items-center">
          <img src="/logo-white.png" alt="No Parade F.C." className="h-6 w-auto sm:h-7" />
        </button>
        <div className="hidden gap-8 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--cream)]/80 sm:flex">
          <button onClick={onHome} className="transition-colors hover:text-[var(--cream)]">
            Home
          </button>
          <button onClick={onAbout} className="transition-colors hover:text-[var(--cream)]">
            NPFC
          </button>
          <button onClick={onBuild} className="text-[var(--gold)] transition-colors hover:text-[var(--cream)]">
            The Champions
          </button>
          <button onClick={onAbout} className="transition-colors hover:text-[var(--cream)]">
            PBWY
          </button>
          <button onClick={onHall} className="transition-colors hover:text-[var(--cream)]">
            Hall of Fame
          </button>
        </div>
      </nav>

      <div className="relative aspect-[4/5] w-full overflow-hidden bg-black sm:aspect-[16/9] md:aspect-[1672/941]">
        <img
          src="/champions-hero.jpg"
          alt="The Champions by No Parade F.C. — Pelé 10, Robben 11, Henry 12 and Ballack 13 in the four Release 01 colorways"
          className="absolute inset-0 h-full w-full object-cover object-[30%_center] md:object-contain md:object-center"
        />

        <div className="liquid-field" aria-hidden />
        <div className="liquid-sheen" aria-hidden />

        {/* Heavier on small screens, where the lockup lands on top of the kits. */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-[var(--ink)] via-[var(--ink)]/60 to-transparent md:via-transparent"
          aria-hidden
        />

        {/* Visible only where the art's own lockup is cropped away. */}
        <div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-8 md:hidden">
          <div className="rise">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.42em] text-[var(--cream)]/85">
              Noparade
            </p>
            <div className="mt-3 h-px w-12 bg-[var(--cream)]/50" />
            <h1
              className="mt-3 text-[clamp(2.4rem,13vw,4rem)] leading-[0.95] tracking-[0.02em]"
              style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
            >
              Champions
            </h1>
            <p className="mt-3 text-[0.66rem] font-semibold uppercase tracking-[0.3em] text-[var(--cream)]/75">
              Legends. Jerseys. Forever.
            </p>
          </div>
        </div>
      </div>

      {/* The art carries this on md+; keep it in the document either way. */}
      <h1 className="sr-only hidden md:block">No Parade F.C. — Champions. Legends. Jerseys. Forever.</h1>

      <div className="relative z-10 mx-auto -mt-px max-w-[1400px] px-6 sm:px-10">
        <div className="liquid-glass rise flex flex-col gap-5 rounded-sm px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="max-w-lg text-sm leading-relaxed text-[var(--cream)]/80">
            Release 01 — four legends, four colors, one shirt. Pelé 10 in Garnet, Robben 11 in
            Orange, Henry 12 in Powder Blue, Ballack 13 in Black. Take the Tribute print, a Blank
            shirt, or your own name and number.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={onBuild}
              className="liquid-btn bg-[var(--gold)] px-7 py-3.5 text-xs font-bold uppercase tracking-[0.14em] text-[var(--ink)] transition-opacity hover:opacity-95"
            >
              Shop The Champions →
            </button>
            <button
              onClick={onAbout}
              className="border border-[var(--cream)]/25 px-7 py-3.5 text-xs font-bold uppercase tracking-[0.14em] transition-colors hover:border-[var(--gold)]"
            >
              Explore NPFC
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
