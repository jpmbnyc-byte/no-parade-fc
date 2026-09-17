import { forwardRef, useState, type HTMLAttributes } from "react";
import {
  INITIAL_BUILD,
  NAME_MAX,
  NATIONS,
  NUMBER_MAX,
  NUMBER_MIN,
  PERSONALIZED_PRICE,
  PRICE,
  sanitizeName,
  sanitizeNumber,
  validateBuild,
  type NationId,
} from "@/lib/kit";
import { JerseyCanvas, type CanvasView } from "@/components/JerseyCanvas";
import { startCheckout } from "@/lib/checkout";

type GalleryMode = "gallery" | "customize";

/**
 * Single-panel personalization flow — the exact working mechanic from
 * Bayonne Athletics' product page (ba-athletics.com/team): a Gallery vs.
 * "Put your name on it" toggle, live front/back preview, a name+number
 * field pair, and a dynamic clean-vs-personalized price. No crest step,
 * no wizard — same standard name/number setup as its working
 * counterpart, not the retired Build Your Crest flow.
 */
export const Configurator = forwardRef<HTMLDivElement>(function Configurator(_props, ref) {
  const [nation, setNation] = useState<NationId>(INITIAL_BUILD.nation);
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [view, setView] = useState<CanvasView>("front");
  const [mode, setMode] = useState<GalleryMode>("gallery");
  const [confirmed, setConfirmed] = useState(false);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const issues = validateBuild({ name, number });
  const nameError = issues.find((i) => i.field === "name")?.message;
  const numberError = issues.find((i) => i.field === "number")?.message;

  const hasPersonalization = Boolean(name || number);
  const numberValue = Number(number);
  const numberValid =
    number !== "" && Number.isFinite(numberValue) && numberValue >= NUMBER_MIN && numberValue <= NUMBER_MAX;
  const personalizationComplete = !hasPersonalization || Boolean(name && numberValid);
  const price = hasPersonalization && personalizationComplete ? PERSONALIZED_PRICE : PRICE;
  const checkoutReady = personalizationComplete && confirmed;

  const nextLabel = (() => {
    if (checkoutBusy) return "Redirecting to checkout";
    if (hasPersonalization && !personalizationComplete) return "Complete name + number";
    if (!confirmed) return "Confirm selection";
    return `Checkout · $${price}`;
  })();

  async function goNext() {
    if (hasPersonalization && !personalizationComplete) {
      document.getElementById("field-personalize")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (!confirmed) {
      document.getElementById("field-confirm")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (!checkoutReady) return;

    setCheckoutBusy(true);
    setCheckoutError(null);
    try {
      await startCheckout({
        nation,
        name: hasPersonalization ? name : "",
        number: hasPersonalization ? number : "",
      });
    } catch (e) {
      setCheckoutBusy(false);
      setCheckoutError(e instanceof Error ? e.message : "Checkout could not start.");
    }
  }

  return (
    <section ref={ref} className="mx-auto max-w-[1400px] px-6 py-16 sm:px-10">
      <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <div className="lg:sticky lg:top-10">
          <div className="mb-4 flex flex-wrap gap-2">
            {NATIONS.map((n) => (
              <button
                key={n.id}
                type="button"
                disabled={!n.unlocked}
                onClick={() => n.unlocked && setNation(n.id)}
                className={`border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] transition-colors ${
                  nation === n.id
                    ? "border-[var(--gold)] text-[var(--gold)]"
                    : "border-[var(--panel-line)] text-[var(--muted)] hover:border-[var(--muted)]"
                } ${!n.unlocked ? "cursor-not-allowed opacity-40" : ""}`}
              >
                {n.flagEmoji} {n.label}
                {!n.unlocked ? " · Soon" : ""}
              </button>
            ))}
          </div>

          <div className="mb-3 flex gap-2">
            <button
              type="button"
              onClick={() => setMode("gallery")}
              className={`border px-4 py-2 text-sm transition-colors ${
                mode !== "customize" ? "border-[var(--gold)] bg-[var(--gold)] text-[var(--ink)]" : "border-[var(--panel-line)] text-[var(--muted)]"
              }`}
            >
              Gallery
            </button>
            <button
              type="button"
              onClick={() => {
                setView("front");
                setMode("customize");
              }}
              className={`border px-4 py-2 text-sm transition-colors ${
                mode === "customize" ? "border-[var(--gold)] bg-[var(--gold)] text-[var(--ink)]" : "border-[var(--panel-line)] text-[var(--muted)]"
              }`}
            >
              Put your name on it
            </button>
          </div>

          {mode === "customize" ? (
            <div>
              <JerseyCanvas
                view={view}
                frontSrc="/france-front-placeholder.jpg"
                backSrc="/france-back.jpg"
                name={name}
                number={number}
              />
              <div className="mt-3 flex items-baseline justify-between gap-3">
                <div className="flex items-baseline gap-4">
                  <button
                    type="button"
                    onClick={() => setView("front")}
                    aria-pressed={view === "front"}
                    className={`text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${
                      view === "front" ? "text-[var(--gold)]" : "text-[var(--muted)]"
                    }`}
                  >
                    Front
                  </button>
                  <button
                    type="button"
                    onClick={() => setView("back")}
                    aria-pressed={view === "back"}
                    className={`text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${
                      view === "back" ? "text-[var(--gold)]" : "text-[var(--muted)]"
                    }`}
                  >
                    Back
                  </button>
                </div>
                <p className="text-xs text-[var(--muted)]">
                  {view === "front" ? "Live number" : "Live name and number"}
                </p>
              </div>
            </div>
          ) : (
            <figure className="relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-[var(--panel)]">
              <img
                src="/france-front-placeholder.jpg"
                alt="No Parade F.C. France Edition jersey"
                className="absolute inset-0 h-full w-full object-contain object-center"
              />
            </figure>
          )}
        </div>

        <div>
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-2xl" style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
              Put your name on it.
            </h2>
            <span className="text-sm font-semibold tabular-nums text-[var(--gold)]">
              {hasPersonalization ? `$${price}` : `+$${PERSONALIZED_PRICE - PRICE}`}
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
            Number on the front and back. Name across the back. Same digits, same font. Letters,
            spaces, hyphens and apostrophes. Leave both blank for the ${PRICE} clean jersey.
          </p>

          <div id="field-personalize" className="mt-5 grid grid-cols-[7rem_1fr] gap-3">
            <OutlinedField
              id="field-number"
              label="00"
              value={number}
              maxLength={2}
              inputMode="numeric"
              placeholder="07"
              onChange={(v) => {
                setNumber(sanitizeNumber(v));
                setView("front");
                setMode("customize");
              }}
              counter={`${number.length} / 2`}
              error={numberError}
            />
            <OutlinedField
              id="field-name"
              label="Name"
              value={name}
              maxLength={NAME_MAX}
              placeholder="YOUR NAME"
              onChange={(v) => {
                setName(sanitizeName(v));
                setMode("customize");
              }}
              counter={`${name.length} / ${NAME_MAX}`}
              error={nameError}
            />
          </div>

          {hasPersonalization && !personalizationComplete && (
            <p className="mt-3 text-sm text-[var(--gold)]">
              Add both a name and a valid number, or clear both fields.
            </p>
          )}

          <button
            type="button"
            onClick={() => {
              setName("");
              setNumber("");
            }}
            disabled={!hasPersonalization}
            className="mt-3 text-sm text-[var(--muted)] underline underline-offset-4 disabled:opacity-40"
          >
            Clear personalization
          </button>

          <section id="field-confirm" className="mt-8 border-t border-[var(--panel-line)] pt-6">
            <label className="flex items-start gap-3 text-sm leading-snug text-[var(--muted)]">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-0.5 size-4 shrink-0 accent-[var(--gold)]"
              />
              <span>
                {hasPersonalization
                  ? "I've checked the spelling, number, and edition. Personalized pieces cannot be changed after checkout."
                  : "I've checked the edition selection."}
              </span>
            </label>
            {checkoutError && (
              <p className="mt-4 text-sm text-red-400" role="alert">
                {checkoutError}
              </p>
            )}
          </section>

          <button
            type="button"
            disabled={checkoutBusy}
            onClick={() => void goNext()}
            className="mt-6 w-full bg-[var(--gold)] py-3.5 text-xs font-bold uppercase tracking-[0.14em] text-[var(--ink)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {nextLabel}
          </button>
          <p className="mt-3 text-center text-xs leading-snug text-[var(--muted)]">
            Clean ${PRICE} · personalized ${PERSONALIZED_PRICE} · Stripe checkout
          </p>
        </div>
      </div>
    </section>
  );
});

function OutlinedField({
  id,
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  counter,
  inputMode,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength: number;
  counter: string;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  error?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="relative flex min-h-[4.5rem] flex-col border border-[var(--panel-line)] bg-transparent px-3 pb-2 pt-3 focus-within:border-[var(--gold)]"
      >
        <span className="absolute -top-2 left-2 bg-[var(--ink)] px-1 text-xs font-medium text-[var(--muted)]">
          {label}
        </span>
        <input
          id={id}
          value={value}
          maxLength={maxLength}
          inputMode={inputMode}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-w-0 flex-1 bg-transparent text-2xl font-semibold uppercase tracking-wide text-[var(--cream)] outline-none placeholder:text-[var(--muted)]"
          autoComplete="off"
          spellCheck={false}
          aria-describedby={`${id}-counter`}
        />
        <span id={`${id}-counter`} className="self-end text-[0.7rem] tabular-nums text-[var(--muted)]">
          {counter}
        </span>
      </label>
      {error ? <p className="mt-1 text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
