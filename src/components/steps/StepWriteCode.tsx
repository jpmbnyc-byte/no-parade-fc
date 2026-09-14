import { CREST_INITIALS_MAX, HERITAGE_MAX, MOTTO_MAX, sanitizeFreeText, type BuildState } from "@/lib/kit";
import { CrestBadge } from "@/components/CrestBadge";

type Props = {
  state: BuildState;
  onChange: (patch: Partial<BuildState>) => void;
};

function CodeField({
  label,
  value,
  max,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  max: number;
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="border-b border-[var(--panel-line)] py-3">
      <div className="flex items-center justify-between text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
        <span>{label}</span>
        <span>
          {value.length}/{max}
        </span>
      </div>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(sanitizeFreeText(e.target.value, max))}
        className="mt-2 w-full bg-transparent text-base outline-none placeholder:text-[var(--muted)]"
      />
    </div>
  );
}

export function StepWriteCode({ state, onChange }: Props) {
  return (
    <div className="grid gap-8 sm:grid-cols-[1fr_auto]">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--gold)]">Step 4 of 5</p>
        <h2 className="mt-2 text-2xl" style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
          Write Your Code
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">Add the details that make this kit yours.</p>

        <div className="mt-6 grid gap-x-8 sm:grid-cols-2">
          <CodeField
            label="Crest initials (optional)"
            value={state.crestInitials}
            max={CREST_INITIALS_MAX}
            placeholder="NP"
            onChange={(v) => onChange({ crestInitials: v.toUpperCase() })}
          />
          <CodeField
            label="Personal motto (optional)"
            value={state.motto}
            max={MOTTO_MAX}
            placeholder="Peace Be With You"
            onChange={(v) => onChange({ motto: v })}
          />
          <CodeField
            label="Country / heritage line (optional)"
            value={state.heritage}
            max={HERITAGE_MAX}
            placeholder="Haiti / USA"
            onChange={(v) => onChange({ heritage: v })}
          />
        </div>
        <p className="mt-3 text-xs text-[var(--muted)]">Appears on lower back.</p>
      </div>

      <div className="flex flex-col items-center justify-center gap-3 border border-[var(--panel-line)] px-8 py-6 text-center">
        {state.crestId ? <CrestBadge id={state.crestId} className="h-14 w-14 text-[var(--gold)]" /> : null}
        <p className="text-sm font-bold" style={{ fontFamily: "var(--font-display)" }}>
          {state.crestInitials || "NP"}
        </p>
        <p className="text-xs text-[var(--muted)]">{state.motto || "Peace Be With You"}</p>
        <p className="text-xs text-[var(--muted)]">{state.heritage || "Haiti / USA"}</p>
      </div>
    </div>
  );
}
