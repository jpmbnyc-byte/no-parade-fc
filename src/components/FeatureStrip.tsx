const FEATURES = [
  { title: "Choose your nation", detail: "Start with a country-coded No Parade F.C. kit." },
  { title: "Add your name & number", detail: "Classic football personalization, refined." },
  { title: "Select your crest language", detail: "Faith, family, peace, heritage, or personal code." },
  { title: "Add your motto", detail: "A short phrase that lives with the piece." },
  { title: "Preview your kit", detail: "See the identity before it enters production." },
];

export function FeatureStrip() {
  return (
    <section className="border-b border-[var(--panel-line)]">
      <div className="mx-auto max-w-[1400px] px-6 py-16 sm:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-[var(--gold)]">
          This is not merch. This is authorship.
        </p>
        <p className="mt-5 max-w-md text-sm leading-relaxed text-[var(--muted)]">
          A jersey can carry a country. A crest can carry a story. A
          number can carry memory. A motto can carry faith. Build Your
          Crest™ turns every No Parade F.C. kit into a personal artifact.
        </p>

        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-5">
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
