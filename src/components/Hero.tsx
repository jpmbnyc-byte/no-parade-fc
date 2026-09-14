type Props = {
  onStart: () => void;
};

export function Hero({ onStart }: Props) {
  return (
    <section className="border-b border-[var(--panel-line)]">
      <nav className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 sm:px-10">
        <span className="font-serif text-lg font-bold tracking-[0.08em]" style={{ fontFamily: "var(--font-display)" }}>
          NP+FC
        </span>
        <div className="hidden gap-8 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)] sm:flex">
          <span>Home</span>
          <span>NPFC</span>
          <span className="text-[var(--gold)]">Build Your Crest™</span>
          <span>PBWY</span>
          <span>Collections</span>
        </div>
      </nav>

      <div className="mx-auto grid max-w-[1400px] gap-10 px-6 py-16 sm:px-10 sm:py-20 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[var(--gold)]">Build Your Crest™</p>
          <h1
            className="mt-5 text-[clamp(2rem,4.6vw,3.4rem)] leading-[1.08]"
            style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
          >
            Every kit needs a name.
            <br />
            Every name needs a crest.
          </h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-[var(--muted)]">
            Create your own No Parade F.C. identity — name, number, crest
            language, motto, and heritage line — built into a
            country-coded jersey made for sport, street, faith, and
            memory.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <button
              onClick={onStart}
              className="bg-[var(--gold)] px-7 py-3.5 text-xs font-bold uppercase tracking-[0.14em] text-[var(--ink)] transition-opacity hover:opacity-90"
            >
              Start with France Edition →
            </button>
            <button className="border border-[var(--panel-line)] px-7 py-3.5 text-xs font-bold uppercase tracking-[0.14em] transition-colors hover:border-[var(--gold)]">
              Explore NPFC
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-sm bg-[var(--panel)]">
          <img
            src="/france-front-placeholder.jpg"
            alt="No Parade F.C. France Edition jersey"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
