import { KIT_PRICING, NATIONS, type BuildState } from "@/lib/kit";

type Props = {
  state: BuildState;
  onChange: (patch: Partial<BuildState>) => void;
};

export function StepKit({ state, onChange }: Props) {
  const nation = NATIONS.find((n) => n.id === state.nation)!;

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--gold)]">Step 1 of 5</p>
      <h2 className="mt-2 text-2xl" style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
        Choose Your Kit
      </h2>
      <p className="mt-2 text-sm text-[var(--muted)]">Select your base kit and start building your identity.</p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          onClick={() => onChange({ kitId: "clean" })}
          className={`border p-4 text-left transition-colors ${
            state.kitId === "clean" ? "border-[var(--gold)]" : "border-[var(--panel-line)] hover:border-[var(--muted)]"
          }`}
        >
          <p className="text-sm font-bold">Clean Kit</p>
          <p className="mt-1 text-xs text-[var(--muted)]">Classic No Parade F.C. edition. No personalization.</p>
          <p className="mt-3 text-sm text-[var(--gold)]">${KIT_PRICING.clean}</p>
        </button>
        <button
          onClick={() => onChange({ kitId: "crest" })}
          className={`border p-4 text-left transition-colors ${
            state.kitId === "crest" ? "border-[var(--gold)]" : "border-[var(--panel-line)] hover:border-[var(--muted)]"
          }`}
        >
          <p className="text-sm font-bold">Build Your Crest™ Kit</p>
          <p className="mt-1 text-xs text-[var(--muted)]">Add name, number, crest, and motto.</p>
          <p className="mt-3 text-sm text-[var(--gold)]">${KIT_PRICING.crest}</p>
        </button>
      </div>

      <div className="mt-8">
        <p className="text-sm font-bold">
          {nation.label} {nation.flagEmoji}
        </p>
        <p className="mt-1 text-xs text-[var(--muted)]">More nations unlocking soon.</p>
      </div>
    </div>
  );
}
