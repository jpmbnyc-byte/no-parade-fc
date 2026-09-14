import { forwardRef, useState } from "react";
import { INITIAL_BUILD, validateBuild, type BuildState } from "@/lib/kit";
import { CrestCanvas, type CanvasView } from "@/components/CrestCanvas";
import { StepKit } from "@/components/steps/StepKit";
import { StepNameNumber } from "@/components/steps/StepNameNumber";
import { StepCrestLanguage } from "@/components/steps/StepCrestLanguage";
import { StepWriteCode } from "@/components/steps/StepWriteCode";
import { StepReview } from "@/components/steps/StepReview";

const STEPS = [
  { id: 1, label: "Kit", detail: "Choose your kit" },
  { id: 2, label: "Name & Number", detail: "Mark the back" },
  { id: 3, label: "Crest Language", detail: "Choose your crest" },
  { id: 4, label: "Crest Details", detail: "Write your code" },
  { id: 5, label: "Review", detail: "Confirm your identity" },
] as const;

export const Configurator = forwardRef<HTMLDivElement>(function Configurator(_props, ref) {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<BuildState>(INITIAL_BUILD);
  const [view, setView] = useState<CanvasView>("front");

  const issues = validateBuild(state);
  const hasBlockingIssues = issues.length > 0;

  function patch(update: Partial<BuildState>) {
    setState((s) => ({ ...s, ...update }));
  }

  return (
    <section ref={ref} className="mx-auto max-w-[1400px] px-6 py-16 sm:px-10">
      <div className="grid gap-8 lg:grid-cols-[220px_1fr_420px]">
        <aside className="hidden lg:block">
          <div className="flex flex-col gap-1">
            {STEPS.map((s) => (
              <button
                key={s.id}
                onClick={() => setStep(s.id)}
                className={`flex items-start gap-3 border-l-2 px-3 py-2.5 text-left transition-colors ${
                  step === s.id ? "border-[var(--gold)]" : "border-transparent hover:border-[var(--panel-line)]"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[0.65rem] font-bold ${
                    step === s.id ? "bg-[var(--gold)] text-[var(--ink)]" : "border border-[var(--panel-line)] text-[var(--muted)]"
                  }`}
                >
                  {s.id}
                </span>
                <span>
                  <span className="block text-xs font-bold uppercase tracking-[0.08em]">{s.label}</span>
                  <span className="block text-[0.7rem] text-[var(--muted)]">{s.detail}</span>
                </span>
              </button>
            ))}
          </div>
        </aside>

        <div className="border border-[var(--panel-line)] p-6 sm:p-8">
          {step === 1 ? <StepKit state={state} onChange={patch} /> : null}
          {step === 2 ? <StepNameNumber state={state} issues={issues} onChange={patch} /> : null}
          {step === 3 ? <StepCrestLanguage state={state} onChange={patch} /> : null}
          {step === 4 ? <StepWriteCode state={state} onChange={patch} /> : null}
          {step === 5 ? <StepReview state={state} /> : null}

          {step < 5 ? (
            <div className="mt-8 flex justify-between border-t border-[var(--panel-line)] pt-6">
              <button
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                disabled={step === 1}
                className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--muted)] disabled:opacity-30"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep((s) => Math.min(5, s + 1))}
                disabled={step === 2 && hasBlockingIssues}
                className="bg-[var(--gold)] px-6 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue →
              </button>
            </div>
          ) : null}
        </div>

        <div>
          <CrestCanvas
            view={view}
            frontSrc="/france-front-placeholder.jpg"
            backSrc="/france-back.jpg"
            name={state.name}
            number={state.number}
            year={state.year}
            motto={state.kitId === "crest" ? state.motto : ""}
            heritage={state.kitId === "crest" ? state.heritage : ""}
            crestId={state.kitId === "crest" ? state.crestId : null}
          />
          <div className="mt-3 flex justify-center gap-2">
            <button
              onClick={() => setView("front")}
              className={`border px-4 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.1em] ${
                view === "front" ? "border-[var(--gold)]" : "border-[var(--panel-line)] text-[var(--muted)]"
              }`}
            >
              Front
            </button>
            <button
              onClick={() => setView("back")}
              className={`border px-4 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.1em] ${
                view === "back" ? "border-[var(--gold)]" : "border-[var(--panel-line)] text-[var(--muted)]"
              }`}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </section>
  );
});
