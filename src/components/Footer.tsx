type Props = {
  onHome: () => void;
  onAbout: () => void;
  onBuild: () => void;
};

export function Footer({ onHome, onAbout, onBuild }: Props) {
  return (
    <footer className="border-t border-[var(--panel-line)]">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-8 px-6 py-14 sm:flex-row sm:items-start sm:justify-between sm:px-10">
        <div>
          <img src="/logo-white.png" alt="No Parade F.C." className="h-6 w-auto" />
          <p className="mt-4 max-w-xs text-xs leading-relaxed text-[var(--muted)]">
            A jersey can carry a country. A name can carry a story. Peace
            be with you.
          </p>
        </div>

        <div className="flex gap-16 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
          <div className="flex flex-col gap-3">
            <span className="text-[var(--cream)]">Site</span>
            <button onClick={onHome} className="text-left transition-colors hover:text-[var(--cream)]">
              Home
            </button>
            <button onClick={onAbout} className="text-left transition-colors hover:text-[var(--cream)]">
              NPFC / PBWY
            </button>
            <button onClick={onBuild} className="text-left transition-colors hover:text-[var(--cream)]">
              Put Your Name On It
            </button>
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--panel-line)] px-6 py-5 text-center text-[0.65rem] uppercase tracking-[0.12em] text-[var(--muted)] sm:px-10">
        No Parade F.C. — Peace Be With You
      </div>
    </footer>
  );
}
