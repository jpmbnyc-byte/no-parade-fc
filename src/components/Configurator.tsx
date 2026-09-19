import { forwardRef, useState, type HTMLAttributes } from "react";
import {
  CHAMPIONS,
  NAME_MAX,
  NUMBER_MAX,
  NUMBER_MIN,
  championById,
  priceFor,
  sanitizeName,
  sanitizeNumber,
  validateBuild,
  type ChampionId,
  type Mode,
} from "@/lib/kit";
import { JerseyCanvas, type CanvasView } from "@/components/JerseyCanvas";
import { startCheckout } from "@/lib/checkout";

const MODES: Mode[] = ["tribute", "blank", "custom"];

/**
 * The Champions — Release 01. Four fixed colorways (Pelé/Garnet,
 * Robben/Orange, Henry/Powder Blue, Ballack/Black), each sold three ways:
 * Tribute (the legend's exact print, not editable), Blank (no name or
 * number), or Custom (your own name + number — the same personalization
 * engine ported from Bayonne Athletics' product page). Replaces the
 * retired nation-edition architecture entirely.
 */
export const Configurator = forwardRef<HTMLDivElement>(function Configurator(_props, ref) {
  const [championId, setChampionId] = useState<ChampionId>("pele");
  const [mode, setMode] = useState<Mode>("tribute");
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [view, setView] = useState<CanvasView>("front");
  const [confirmed, setConfirmed] = useState(false);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const champion = championById(championId);
  const price = priceFor(mode);

  const effectiveName = mode === "tribute" ? champion.legendName : mode === "custom" ? name : "";
  const effectiveNumber = mode === "tribute" ? champion.legendNumber : mode === "custom" ? number : "";

  const issues = mode === "custom" ? validateBuild({ name, number }) : [];
  const nameError = issues.find((i) => i.field === "name")?.message;
  const numberError = issues.find((i) => i.field === "number")?.message;

  const numberValue = Number(number);
  const numberValid =
    number !== "" && Number.isFinite(numberValue) && numberValue >= NUMBER_MIN && numberValue <= NUMBER_MAX;
  const customComplete = mode !== "custom" || Boolean(name && numberValid && issues.length === 0);
  const checkoutReady = customComplete && confirmed;

  const nextLabel = (() => {
    if (checkoutBusy) return "Redirecting to checkout";
    if (mode === "custom" && !customComplete) return "Complete name + number";
    if (!confirmed) return "Confirm selection";
    return `Checkout · $${price}`;
  })();

  async function goNext() {
    if (mode === "custom" && !customComplete) {
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
        championId,
        mode,
        name: mode === "custom" ? name : "",
        number: mode === "custom" ? number : "",
      });
    } catch (e) {
      setCheckoutBusy(false);
      setCheckoutError(e instanceof Error ? e.message : "Checkout could not start.");
    }
  }

  return (
    <section ref={ref} className="mx-auto max-w-[1400px] px-6 py-16 sm:px-10">
      <p className="text-xs font-bold uppercase tracking-[0.28em] text-[var(--gold)]">
        The Champions — Release 01
      </p>
      <h2 className="mt-2 text-3xl" style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
        Four legends. Four colors. One shirt.
      </h2>

      <div className="mt-4 flex flex-wrap gap-2">
        {CHAMPIONS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => {
              setChampionId(c.id);
              setView("front");
            }}
            className={`flex items-center gap-2 border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] transition-colors ${
              championId === c.id
                ? "border-[var(--gold)] text-[var(--gold)]"
                : "border-[var(--panel-line)] text-[var(--muted)] hover:border-[var(--muted)]"
            }`}
          >
            <span
              className="size-2.5 rounded-full border border-black/30"
              style={{ background: c.swatch }}
              aria-hidden
            />
            {c.legendName} {c.legendNumber} — {c.colorLabel}
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <div className="lg:sticky lg:top-10">
          <div className="mb-3 flex gap-2">
            {MODES.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`border px-4 py-2 text-sm transition-colors ${
                  mode === m
                    ? "border-[var(--gold)] bg-[var(--gold)] text-[var(--ink)]"
                    : "border-[var(--panel-line)] text-[var(--muted)]"
                }`}
              >
                {m === "tribute" ? "Tribute" : m === "blank" ? "Blank" : "Custom"}
              </button>
            ))}
          </div>

          <JerseyCanvas
            view={view}
            frontSrc={champion.frontSrc}
            backSrc={mode === "tribute" ? champion.backSrc : champion.blankBackSrc}
            name={effectiveName}
            number={effectiveNumber}
            showOverlay={mode !== "tribute"}
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
              {mode === "tribute"
                ? "Real print — not editable"
                : view === "front"
                  ? "Front carries no name or number"
                  : mode === "blank"
                    ? "No name or number"
                    : "Live name and number"}
            </p>
          </div>
        </div>

        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-[var(--muted)]">
            Legend / Icon / Champion
          </p>
          {/* The name is the image here — set large, with the metadata and the
              price kept deliberately quiet underneath it. */}
          <h3
            className="mt-3 text-[clamp(2.75rem,6.5vw,4.75rem)] leading-[0.86] tracking-[-0.015em]"
            style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
          >
            {champion.legendName}
          </h3>
          <div className="mt-4 flex flex-wrap items-baseline gap-x-5 gap-y-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
            <span className="text-[var(--gold)]">No. {champion.legendNumber}</span>
            <span>{champion.colorLabel}</span>
            <span>{champion.country}</span>
          </div>
          <p
            className="mt-5 text-[1.35rem] italic leading-snug text-[var(--cream)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {champion.tagline}
          </p>

          {mode === "tribute" ? (
            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                Why he is a Champion
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{champion.bio}</p>
              <p className="mt-4 text-sm text-[var(--muted)]">
                Printed exactly as shown — {champion.legendName}'s name and number, not editable. Want a
                different print? Switch to Blank or Custom above.
              </p>
            </div>
          ) : mode === "blank" ? (
            <p className="mt-5 text-sm leading-relaxed text-[var(--muted)]">
              This colorway with no name or number — a clean {champion.colorLabel.toLowerCase()} shirt.
              Switch to Custom to put your own name on it, or Tribute for {champion.legendName}'s exact
              print.
            </p>
          ) : (
            <div className="mt-5">
              <p className="text-sm leading-relaxed text-[var(--muted)]">
                Your name and number on the {champion.colorLabel.toLowerCase()} colorway. Same digits, same
                font. Letters, spaces, hyphens and apostrophes.
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
                  onChange={(v) => setName(sanitizeName(v))}
                  counter={`${name.length} / ${NAME_MAX}`}
                  error={nameError}
                />
              </div>

              {!customComplete && (name || number) && (
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
                disabled={!name && !number}
                className="mt-3 text-sm text-[var(--muted)] underline underline-offset-4 disabled:opacity-40"
              >
                Clear personalization
              </button>
            </div>
          )}

          <section id="field-confirm" className="mt-8 border-t border-[var(--panel-line)] pt-6">
            <label className="flex items-start gap-3 text-sm leading-snug text-[var(--muted)]">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-0.5 size-4 shrink-0 accent-[var(--gold)]"
              />
              <span>
                {mode === "custom"
                  ? "I've checked the spelling, number, and colorway. Personalized pieces cannot be changed after checkout."
                  : "I've checked the colorway and edition."}
              </span>
            </label>
            {checkoutError && (
              <p className="mt-4 text-sm text-red-400" role="alert">
                {checkoutError}
              </p>
            )}
          </section>

          <div className="mt-6 flex items-baseline justify-between gap-4 border-b border-[var(--panel-line)] pb-3">
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              {mode === "tribute" ? "Tribute" : mode === "blank" ? "Blank" : "Custom"}
            </span>
            <span className="text-sm tabular-nums text-[var(--muted)]">${price}</span>
          </div>

          <button
            type="button"
            disabled={checkoutBusy}
            onClick={() => void goNext()}
            className="liquid-btn mt-5 w-full bg-[var(--gold)] py-3.5 text-xs font-bold uppercase tracking-[0.14em] text-[var(--ink)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {nextLabel}
          </button>
          <p className="mt-3 text-center text-[0.68rem] leading-snug text-[var(--muted)]">
            Tribute ${priceFor("tribute")} · Blank ${priceFor("blank")} · Custom ${priceFor("custom")} ·
            Stripe checkout
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
