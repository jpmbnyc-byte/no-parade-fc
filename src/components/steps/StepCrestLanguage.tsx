import { CRESTS, type BuildState } from "@/lib/kit";
import { CrestBadge } from "@/components/CrestBadge";

type Props = {
  state: BuildState;
  onChange: (patch: Partial<BuildState>) => void;
};

export function StepCrestLanguage({ state, onChange }: Props) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--gold)]">Step 3 of 5</p>
      <h2 className="mt-2 text-2xl" style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
        Choose Your Crest Language
      </h2>
      <p className="mt-2 text-sm text-[var(--muted)]">Select the identity that speaks to you.</p>

      <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-5">
        {CRESTS.map((crest) => {
          const selected = state.crestId === crest.id;
          return (
            <button
              key={crest.id}
              onClick={() => onChange({ crestId: crest.id })}
              className={`flex flex-col items-center gap-2 border p-3 text-center transition-colors ${
                selected ? "border-[var(--gold)]" : "border-[var(--panel-line)] hover:border-[var(--muted)]"
              }`}
            >
              <CrestBadge id={crest.id} className="h-10 w-10 text-[var(--gold)]" />
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.06em]">{crest.label}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-[var(--muted)]">Each crest is built from a controlled NPFC template for club-grade quality.</p>
    </div>
  );
}
