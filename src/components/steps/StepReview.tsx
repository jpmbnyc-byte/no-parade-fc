import { useState } from "react";
import { CRESTS, KIT_LABEL, KIT_PRICING, NATIONS, type BuildState } from "@/lib/kit";
import { startCheckout } from "@/lib/checkout";

type Props = {
  state: BuildState;
};

function Row({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between border-b border-[var(--panel-line)] py-2.5 text-sm">
      <span className="text-[var(--muted)]">{label}</span>
      <span>{value}</span>
    </div>
  );
}

export function StepReview({ state }: Props) {
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nation = NATIONS.find((n) => n.id === state.nation)!;
  const crest = CRESTS.find((c) => c.id === state.crestId);
  const price = KIT_PRICING[state.kitId];

  async function handleCheckout() {
    setError(null);
    setLoading(true);
    try {
      await startCheckout(state);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--gold)]">Step 5 of 5</p>
      <h2 className="mt-2 text-2xl" style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
        Review
      </h2>
      <p className="mt-2 text-sm text-[var(--muted)]">Confirm your identity before it enters production.</p>

      <div className="mt-6">
        <Row label="Kit" value={`${KIT_LABEL[state.kitId]} — $${price}`} />
        <Row label="Nation" value={nation.label} />
        <Row label="Name" value={state.name} />
        <Row label="Number" value={state.number} />
        <Row label="Year" value={state.year} />
        {state.kitId === "crest" ? (
          <>
            <Row label="Crest" value={crest?.label ?? ""} />
            <Row label="Crest initials" value={state.crestInitials} />
            <Row label="Motto" value={state.motto} />
            <Row label="Heritage line" value={state.heritage} />
          </>
        ) : null}
      </div>

      <label className="mt-6 flex items-start gap-3 text-xs text-[var(--muted)]">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-0.5"
        />
        I confirm my crest, name, and number are correct. I understand made-to-order pieces can&rsquo;t be changed after checkout.
      </label>

      {error ? <p className="mt-3 text-xs text-red-400">{error}</p> : null}

      <button
        disabled={!confirmed || loading}
        onClick={handleCheckout}
        className="mt-6 w-full bg-[var(--gold)] py-3.5 text-xs font-bold uppercase tracking-[0.14em] text-[var(--ink)] transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? "Starting checkout…" : `Add Custom Kit to Cart — $${price}`}
      </button>
    </div>
  );
}
