type Props = {
  onBuild: () => void;
  onCollection: () => void;
};

/**
 * The campaign art, now sitting under a white header rather than carrying
 * the navigation itself. That is the whole contrast idea: the interface is
 * white and quiet, and the only dark thing on the page is the photography.
 *
 * The lockup stays HTML in the art's own negative space (the plate is
 * extended to 16:9 by tools/hero-background.cjs), so it reflows instead of
 * cropping off the way a baked-in lockup did.
 */
export function Hero({ onBuild, onCollection }: Props) {
  return (
    <section className="bg-[var(--bg)]">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#0c0a09] sm:aspect-[3/2] md:aspect-[16/9]">
        <picture>
          {/* A phone was downloading the full 2160px plate (235KB) to paint a
              390px-wide frame. */}
          <source
            type="image/webp"
            srcSet="/champions-hero-1100.webp 1100w, /champions-hero-1600.webp 1600w, /champions-hero.webp 2160w"
            sizes="100vw"
          />
          <img
            src="/champions-hero.jpg"
            alt="The Champions by No Parade F.C. — Pelé 10 in Garnet, Robben 11 in Orange, Henry 12 in Powder Blue and Ballack 13 in Black"
            width={2160}
            height={1215}
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover object-[13%_center] md:object-center"
          />
        </picture>

        <div className="liquid-field" aria-hidden />
        <div className="liquid-sheen" aria-hidden />

        <div
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-black/45"
          aria-hidden
        />

        <div className="absolute inset-x-0 bottom-0 z-20 px-6 pb-9 sm:px-10 md:inset-y-0 md:left-auto md:right-0 md:flex md:w-[42%] md:flex-col md:justify-center md:pb-0 md:pr-12 lg:pr-16">
          <div className="rise text-[var(--on-dark)]">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.4em] text-[var(--on-dark-muted)]">
              Noparade
            </p>
            <div className="mt-4 h-px w-12 bg-white/45" />
            <h1
              className="mt-4 text-[clamp(2.4rem,12vw,5.5rem)] leading-[0.92] tracking-[0.01em] md:text-[clamp(3rem,6vw,5.5rem)]"
              style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
            >
              Champions
            </h1>
            <p className="mt-4 text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-[var(--on-dark-muted)]">
              Legends. Jerseys. Forever.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={onBuild}
                className="bg-white px-7 py-3.5 text-[0.66rem] font-bold uppercase tracking-[0.16em] text-[var(--fg)] transition-opacity hover:opacity-90"
              >
                Shop The Champions
              </button>
              <button
                onClick={onCollection}
                className="border border-white/40 px-7 py-3.5 text-[0.66rem] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:border-white"
              >
                View the collection
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Replaces the frosted bar that used to overlap the art. On a white
          page a glass panel has nothing to frost, so this is a plain
          three-up strip — the facts a shop states before you scroll. */}
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
        <div className="grid divide-y divide-[var(--line)] border-b border-[var(--line)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            ["Release 01", "Four legends, four colors, one shirt."],
            ["Three ways", "Tribute print, Blank, or your own name and number."],
            ["Made to order", "Printed when you order it. Free shipping over $250."],
          ].map(([title, body]) => (
            <div key={title} className="px-1 py-6 sm:px-6">
              <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-[var(--fg)]">
                {title}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
