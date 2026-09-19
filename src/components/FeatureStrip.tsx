const FEATURES = [
  { title: "Choose your legend", detail: "Pelé, Robben, Henry, or Ballack — four fixed colorways." },
  { title: "Pick your print", detail: "Tribute (their name), Blank (no name), or Custom (yours)." },
  { title: "Preview live", detail: "See the colorway and, in Custom, your own name and number." },
  { title: "Wear the number", detail: "Carry the story. One release, four legends." },
];

export function FeatureStrip() {
  return (
    <section className="border-b border-[var(--panel-line)]">
      <div className="mx-auto max-w-[1400px] px-6 py-16 sm:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-[var(--gold)]">
          This is not merch. This is authorship.
        </p>
        <p className="mt-5 max-w-md text-sm leading-relaxed text-[var(--muted)]">
          A collection built around the idea that champions aren't defined by one thing.
          Sometimes it's trophies. Sometimes it's invention. Sometimes it's the ability to make
          an entire generation see the game differently.
        </p>

        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title}>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--gold)]">{f.title}</p>
              <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">{f.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
