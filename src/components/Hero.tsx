type Props = {
  onHome: () => void;
  onCollection: () => void;
  onBuild: () => void;
  onHall: () => void;
};

/**
 * Cinematic hero. The campaign plate was shot on a light studio seamless;
 * `tools/hero-background.js` converts that seamless to a textured matte
 * black and extends the frame to 16:9, which leaves the right third as
 * clean negative space. The lockup is HTML and lives in that space, so
 * unlike the previous hero (whose lockup was baked into the art and got
 * cropped off on narrow screens) it reflows instead of disappearing.
 */
export function Hero({ onHome, onCollection, onBuild, onHall }: Props) {
  return (
    <section className="relative border-b border-[var(--panel-line)]">
      <nav className="absolute inset-x-0 top-0 z-30 mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 sm:px-10">
        <button onClick={onHome} className="flex items-center">
          <img src="/logo-white.png" alt="No Parade F.C." className="h-6 w-auto sm:h-7" />
        </button>
        <div className="hidden gap-8 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--cream)]/80 sm:flex">
          <button onClick={onHome} className="transition-colors hover:text-[var(--cream)]">
            Home
          </button>
          <button onClick={onCollection} className="transition-colors hover:text-[var(--cream)]">
            Collection
          </button>
          <button onClick={onBuild} className="text-[var(--gold)] transition-colors hover:text-[var(--cream)]">
            The Champions
          </button>
          <button onClick={onHall} className="transition-colors hover:text-[var(--cream)]">
            Hall of Fame
          </button>
        </div>
      </nav>

      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[var(--ink)] sm:aspect-[3/2] md:aspect-[16/9]">
        <picture>
          <source srcSet="/champions-hero.webp" type="image/webp" />
          <img
            src="/champions-hero.jpg"
            alt="The Champions by No Parade F.C. — Pelé 10 in Garnet, Robben 11 in Orange, Henry 12 in Powder Blue and Ballack 13 in Black"
            className="absolute inset-0 h-full w-full object-cover object-[13%_center] md:object-center"
          />
        </picture>

        <div className="liquid-field" aria-hidden />
        <div className="liquid-sheen" aria-hidden />

        {/* Carries the lockup on phones, where it sits over the group. */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-[var(--ink)] via-[var(--ink)]/55 to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-[var(--ink)]/45"
          aria-hidden
        />

        <div className="absolute inset-x-0 bottom-0 z-20 px-6 pb-9 sm:px-10 md:inset-y-0 md:left-auto md:right-0 md:flex md:w-[42%] md:flex-col md:justify-center md:pb-0 md:pr-12 lg:pr-16">
          <div className="rise">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.42em] text-[var(--cream)]/85">
              Noparade
            </p>
            <div className="mt-4 h-px w-12 bg-[var(--cream)]/45" />
            <h1
              className="mt-4 text-[clamp(2.4rem,12vw,5.5rem)] leading-[0.92] tracking-[0.01em] md:text-[clamp(3rem,6vw,5.5rem)]"
              style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
            >
              Champions
            </h1>
            <p className="mt-4 text-[0.66rem] font-semibold uppercase tracking-[0.3em] text-[var(--cream)]/70">
              Legends. Jerseys. Forever.
            </p>
          </div>
        </div>
      </div>

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
              onClick={onCollection}
              className="border border-[var(--cream)]/25 px-7 py-3.5 text-xs font-bold uppercase tracking-[0.14em] transition-colors hover:border-[var(--gold)]"
            >
              View the collection
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
