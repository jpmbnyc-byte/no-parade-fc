/**
 * A single editorial statement where the four-column benefit grid used to
 * be. "Choose your legend / Pick your print / Preview live" was shop
 * furniture — the Hall of Fame cards carry that story properly, and the
 * configurator explains itself. This keeps the brand line and the anchor
 * the nav points at, and nothing else.
 */
export function FeatureStrip() {
  return (
    <section className="border-b border-[var(--panel-line)]">
      <div className="mx-auto max-w-[1400px] px-6 py-24 sm:px-10 sm:py-32">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-[var(--gold)]">
          NPFC / PBWY
        </p>
        <p
          className="mt-8 max-w-4xl text-[clamp(1.6rem,4vw,3rem)] leading-[1.12] tracking-[-0.01em] text-[var(--cream)]"
          style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
        >
          This is not merch. This is authorship. Champions aren't defined by one thing — sometimes
          it's trophies, sometimes invention, sometimes the ability to make a generation see the
          game differently.
        </p>
        <p className="mt-10 text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
          Peace be with you
        </p>
      </div>
    </section>
  );
}
