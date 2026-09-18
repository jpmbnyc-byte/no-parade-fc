type Props = {
  onHome: () => void;
  onAbout: () => void;
  onBuild: () => void;
};

export function Hero({ onHome, onAbout, onBuild }: Props) {
  return (
    <section className="border-b border-[var(--panel-line)]">
      <nav className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 sm:px-10">
        <button onClick={onHome} className="flex items-center">
          <img src="/logo-white.png" alt="No Parade F.C." className="h-6 w-auto sm:h-7" />
        </button>
        <div className="hidden gap-8 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)] sm:flex">
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
          <button onClick={onBuild} className="transition-colors hover:text-[var(--cream)]">
            Collections
          </button>
        </div>
      </nav>

      <div className="mx-auto grid max-w-[1400px] gap-10 px-6 py-16 sm:px-10 sm:py-20 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[var(--gold)]">
            The Champions — Release 01
          </p>
          <h1
            className="mt-5 text-[clamp(2rem,4.6vw,3.4rem)] leading-[1.08]"
            style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
          >
            Four legends. Four colors.
            <br />
            One shirt.
          </h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-[var(--muted)]">
            Built for the players who made the number mean something. Pelé 10 in Garnet, Robben
            11 in Orange, Henry 12 in Powder Blue, Reyna 13 in Black — each a Tribute print, a
            Blank shirt, or your own name and number in Custom.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <button
              onClick={onBuild}
              className="bg-[var(--gold)] px-7 py-3.5 text-xs font-bold uppercase tracking-[0.14em] text-[var(--ink)] transition-opacity hover:opacity-90"
            >
              Shop The Champions →
            </button>
            <button
              onClick={onAbout}
              className="border border-[var(--panel-line)] px-7 py-3.5 text-xs font-bold uppercase tracking-[0.14em] transition-colors hover:border-[var(--gold)]"
            >
              Explore NPFC
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-sm bg-[var(--panel)]">
          <img
            src="/champions-hero.jpg"
            alt="Four No Parade F.C. Champions jerseys — Pelé 10 Garnet, Robben 11 Orange, Henry 12 Powder Blue, Reyna 13 Black"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
