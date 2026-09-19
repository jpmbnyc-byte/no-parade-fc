import { forwardRef, useEffect, useRef, useState, type HTMLAttributes } from "react";
import {
  CHAMPIONS,
  NAME_MAX,
  NUMBER_MAX,
  NUMBER_MIN,
  SIZES,
  championById,
  priceFor,
  sanitizeName,
  sanitizeNumber,
  validateBuild,
  type ChampionId,
  type Mode,
  type Size,
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
type Props = {
  championId: ChampionId;
  onChampionChange: (id: ChampionId) => void;
};

export const Configurator = forwardRef<HTMLDivElement, Props>(function Configurator(
  { championId, onChampionChange },
  ref,
) {
  const [mode, setMode] = useState<Mode>("tribute");
  const [size, setSize] = useState<Size | null>(null);
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [view, setView] = useState<CanvasView>("front");
  const [confirmed, setConfirmed] = useState(false);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Below lg everything stacks, which pushes the price and the checkout
  // button a couple of screens under the jersey. The bar keeps both on
  // screen for as long as the configurator is.
  const bodyRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const [bodyOnScreen, setBodyOnScreen] = useState(false);
  const [ctaOnScreen, setCtaOnScreen] = useState(false);
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const watch = (el: Element | null, set: (v: boolean) => void) => {
      if (!el) return () => {};
      const io = new IntersectionObserver(([entry]) => set(entry.isIntersecting));
      io.observe(el);
      return () => io.disconnect();
    };
    const a = watch(bodyRef.current, setBodyOnScreen);
    const b = watch(ctaRef.current, setCtaOnScreen);
    return () => { a(); b(); };
  }, []);
  // The bar exists to reach the button that is off screen; showing it while
  // that button is visible just prints the same control twice.
  const barVisible = bodyOnScreen && !ctaOnScreen;

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
  const checkoutReady = customComplete && size !== null && confirmed;

  const nextLabel = (() => {
    if (checkoutBusy) return "Redirecting to checkout";
    if (mode === "custom" && !customComplete) return "Complete name + number";
    if (!size) return "Choose a size";
    if (!confirmed) return "Confirm selection";
    return `Checkout · $${price}`;
  })();

  async function goNext() {
    if (mode === "custom" && !customComplete) {
      document.getElementById("field-personalize")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (!size) {
      document.getElementById("field-size")?.scrollIntoView({ behavior: "smooth", block: "center" });
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
        size,
        name: mode === "custom" ? name : "",
        number: mode === "custom" ? number : "",
      });
    } catch (e) {
      setCheckoutBusy(false);
      setCheckoutError(e instanceof Error ? e.message : "Checkout could not start.");
    }
  }

  return (
    <section ref={ref} className="mx-auto max-w-[1400px] px-6 pb-28 pt-16 sm:px-10 lg:pb-16">
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-[var(--gold)]">Build yours</p>

      {/* Colorway swatches only — the collection strip above is the visual
          index, so this stays a compact control rather than repeating it. */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        {CHAMPIONS.map((c) => (
          <button
            key={c.id}
            type="button"
            title={`${c.legendName} ${c.legendNumber} — ${c.colorLabel}`}
            aria-label={`${c.legendName} ${c.legendNumber} — ${c.colorLabel}`}
            aria-pressed={championId === c.id}
            onClick={() => {
              onChampionChange(c.id);
              // Keep the side you were working on: in Custom that is the back.
              setView(mode === "custom" ? "back" : "front");
            }}
            className={`size-7 rounded-full transition-all duration-200 ${
              championId === c.id
                ? "ring-1 ring-[var(--gold)] ring-offset-4 ring-offset-[var(--ink)]"
                : "opacity-55 hover:opacity-100"
            }`}
            style={{ background: c.swatch, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.18)" }}
          />
        ))}
      </div>

      <div ref={bodyRef} className="mt-10 grid gap-x-10 gap-y-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start lg:gap-y-10">
        <div className="lg:sticky lg:top-10">
          <div className="mb-4 flex gap-6 border-b border-[var(--panel-line)] pb-3">
            {MODES.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  // Custom prints on the back, so land there; nothing else
                  // would change on screen as you type.
                  setView(m === "custom" ? "back" : "front");
                }}
                aria-pressed={mode === m}
                className={`-mb-[13px] border-b pb-3 text-[0.68rem] font-semibold uppercase tracking-[0.2em] transition-colors ${
                  mode === m
                    ? "border-[var(--gold)] text-[var(--gold)]"
                    : "border-transparent text-[var(--muted)] hover:text-[var(--cream)]"
                }`}
              >
                {m === "tribute" ? "Tribute" : m === "blank" ? "Blank" : "Custom"}
              </button>
            ))}
          </div>

          {/* Front/Back sits above the plate, not on it. It was an overlay
              pill riding the top edge, which landed square on the collar of
              every garment; before that it was text under a plate that runs
              ~740px tall on a laptop, which put it below the fold. Its own
              row costs ~40px and is always both visible and clear of the art. */}
          <div className="mb-3 flex items-center justify-between gap-4">
            <p className="text-xs text-[var(--muted)]">
              {mode === "tribute"
                ? "Real print — not editable"
                : view === "front"
                  ? "Front carries no name or number"
                  : mode === "blank"
                    ? "No name or number"
                    : "Live name and number"}
            </p>
            <div
              className="flex shrink-0 items-center gap-1 rounded-full border border-[var(--panel-line)] bg-[var(--panel)] p-1"
              role="group"
              aria-label="Jersey view"
            >
              {(["front", "back"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  aria-pressed={view === v}
                  className={`rounded-full px-4 py-1.5 text-[0.66rem] font-bold uppercase tracking-[0.16em] transition-colors ${
                    view === v
                      ? "bg-[var(--gold)] text-[var(--ink)]"
                      : "text-[var(--muted)] hover:text-[var(--cream)]"
                  }`}
                >
                  {v === "front" ? "Front" : "Back"}
                </button>
              ))}
            </div>
          </div>

          <JerseyCanvas
            view={view}
            frontSrc={champion.frontSrc}
            backSrc={mode === "tribute" ? champion.backSrc : champion.blankBackSrc}
            name={effectiveName}
            number={effectiveNumber}
            showOverlay={mode !== "tribute"}
          />

        </div>

        <div className="flex flex-col">
            {/* The build controls are ordered, not placed: on a phone they
                come straight after the preview they drive, and on a desktop
                they sit in the right rail with the checkout button. Under the
                plate at both sizes does not work — the desktop plate runs
                ~740px tall, so anything below it starts off screen. */}
            {mode === "custom" && (
              <div className="order-1 border-b border-[var(--panel-line)] pb-5 lg:order-2 lg:mt-6 lg:border-b-0 lg:border-t lg:pb-0 lg:pt-5">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">
                  Name and number
                </p>
                <div id="field-personalize" className="mt-3 grid grid-cols-[7rem_1fr] gap-3">
                  <OutlinedField
                    id="field-number"
                    label="00"
                    value={number}
                    maxLength={2}
                    inputMode="numeric"
                    placeholder="07"
                    onChange={(v) => {
                      setNumber(sanitizeNumber(v));
                      setView("back");
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
                      setView("back");
                    }}
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
            <div id="field-size" className="order-1 mt-5 border-b border-[var(--panel-line)] pb-5 lg:order-2 lg:border-b-0 lg:border-t lg:pb-0 lg:pt-5">
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">
                  Size
                </p>
                {!size && (
                  <p className="text-[0.65rem] uppercase tracking-[0.14em] text-[var(--gold)]">Required</p>
                )}
              </div>
              <div className="mt-3 grid grid-cols-6 gap-2">
                {SIZES.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSize(sz)}
                    aria-pressed={size === sz}
                    className={`border px-1 py-2.5 text-xs font-bold uppercase tracking-[0.06em] transition-colors ${
                      size === sz
                        ? "border-[var(--gold)] bg-[var(--gold)] text-[var(--ink)]"
                        : "border-[var(--panel-line)] text-[var(--cream)] hover:border-[var(--muted)]"
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

          <div className="order-2 lg:order-1">
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
            <p className="mt-5 text-sm leading-relaxed text-[var(--muted)]">
              Your name and number on the {champion.colorLabel.toLowerCase()} colorway — same digits, same
              font as the tribute print. Letters, spaces, hyphens and apostrophes, up to {NAME_MAX} characters.
            </p>
          )}

          </div>

          <section id="field-confirm" className="order-3 mt-8 border-t border-[var(--panel-line)] pt-6">
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

          <div className="order-3 mt-6 flex items-baseline justify-between gap-4 border-b border-[var(--panel-line)] pb-3">
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              {mode === "tribute" ? "Tribute" : mode === "blank" ? "Blank" : "Custom"}
            </span>
            <span className="text-sm tabular-nums text-[var(--muted)]">${price}</span>
          </div>

          <button
            ref={ctaRef}
            type="button"
            disabled={checkoutBusy}
            onClick={() => void goNext()}
            className="liquid-btn order-3 mt-5 w-full bg-[var(--gold)] py-3.5 text-xs font-bold uppercase tracking-[0.14em] text-[var(--ink)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {nextLabel}
          </button>
          <p className="order-3 mt-3 text-center text-[0.68rem] leading-snug text-[var(--muted)]">
            Tribute ${priceFor("tribute")} · Blank ${priceFor("blank")} · Custom ${priceFor("custom")} ·
            Stripe checkout
          </p>
        </div>
      </div>

      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-[var(--panel-line)] bg-[var(--ink)]/92 backdrop-blur-md transition-transform duration-300 lg:hidden ${
          barVisible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex items-center gap-4 px-6 py-3">
          <div className="min-w-0">
            <p className="truncate text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              {champion.legendName} · {mode === "tribute" ? "Tribute" : mode === "blank" ? "Blank" : "Custom"}
              {size ? ` · ${size}` : ""}
            </p>
            <p className="text-sm tabular-nums text-[var(--cream)]">${price}</p>
          </div>
          <button
            type="button"
            disabled={checkoutBusy}
            onClick={() => void goNext()}
            className="ml-auto shrink-0 bg-[var(--gold)] px-6 py-3 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[var(--ink)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {nextLabel}
          </button>
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
