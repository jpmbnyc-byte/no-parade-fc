import { NAME_MAX, YEAR_LEN, sanitizeName, sanitizeNumber, sanitizeYear, type BuildState, type FieldIssue } from "@/lib/kit";

type Props = {
  state: BuildState;
  issues: FieldIssue[];
  onChange: (patch: Partial<BuildState>) => void;
};

function FieldRow({
  label,
  value,
  max,
  onChange,
  error,
  placeholder,
}: {
  label: string;
  value: string;
  max: number;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
}) {
  return (
    <div className="border-b border-[var(--panel-line)] py-3">
      <div className="flex items-center justify-between text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
        <span>{label}</span>
        <span className={error ? "text-red-400" : ""}>
          {value.length}/{max}
        </span>
      </div>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full bg-transparent text-lg outline-none placeholder:text-[var(--muted)]"
      />
      {error ? <p className="mt-1 text-xs text-red-400">{error}</p> : null}
    </div>
  );
}

export function StepNameNumber({ state, issues, onChange }: Props) {
  const nameError = issues.find((i) => i.field === "name")?.message;
  const numberError = issues.find((i) => i.field === "number")?.message;
  const yearError = issues.find((i) => i.field === "year")?.message;

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--gold)]">Step 2 of 5</p>
      <h2 className="mt-2 text-2xl" style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
        Mark the Back
      </h2>
      <p className="mt-2 text-sm text-[var(--muted)]">Add your name and number.</p>

      <div className="mt-6">
        <FieldRow
          label="Name on back"
          value={state.name}
          max={NAME_MAX}
          placeholder="YOUR NAME"
          onChange={(v) => onChange({ name: sanitizeName(v) })}
          error={nameError}
        />
        <FieldRow
          label="Kit number"
          value={state.number}
          max={2}
          placeholder="07"
          onChange={(v) => onChange({ number: sanitizeNumber(v) })}
          error={numberError}
        />
        <FieldRow
          label="Year (optional)"
          value={state.year}
          max={YEAR_LEN}
          placeholder="2025"
          onChange={(v) => onChange({ year: sanitizeYear(v) })}
          error={yearError}
        />
      </div>
      <p className="mt-3 text-xs text-[var(--muted)]">This will appear on the lower back.</p>
    </div>
  );
}
