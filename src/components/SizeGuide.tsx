import { useEffect } from "react";
import { SIZE_GUIDE, SIZE_GUIDE_IS_PLACEHOLDER } from "@/lib/kit";

type Props = { open: boolean; onClose: () => void };

/** Measurements table for the size selector. */
export function SizeGuide({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button aria-label="Close size guide" onClick={onClose} className="absolute inset-0 bg-black/70" />
      <div
        role="dialog"
        aria-label="Size guide"
        className="relative w-full max-w-md border border-[var(--panel-line)] bg-[var(--ink)] px-6 py-6 sm:rounded-sm"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-[var(--gold)]">
              Size guide
            </p>
            <p className="mt-2 text-xs text-[var(--muted)]">Inches, measured flat across the garment.</p>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)] transition-colors hover:text-[var(--cream)]"
          >
            Close
          </button>
        </div>

        <table className="mt-5 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--panel-line)] text-[0.62rem] uppercase tracking-[0.18em] text-[var(--muted)]">
              <th className="pb-2 font-semibold">Size</th>
              <th className="pb-2 font-semibold">Chest</th>
              <th className="pb-2 font-semibold">Length</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--panel-line)]">
            {SIZE_GUIDE.map((row) => (
              <tr key={row.size}>
                <td className="py-2.5 font-semibold text-[var(--cream)]">{row.size}</td>
                <td className="py-2.5 tabular-nums text-[var(--muted)]">{row.chest}"</td>
                <td className="py-2.5 tabular-nums text-[var(--muted)]">{row.length}"</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mt-5 text-xs leading-relaxed text-[var(--muted)]">
          Match-cut, so it sits close to the body. If you are between sizes or want room underneath,
          take the larger one.
        </p>

        {SIZE_GUIDE_IS_PLACEHOLDER && (
          <p className="mt-4 border-t border-[var(--panel-line)] pt-4 text-xs leading-relaxed text-[var(--gold)]">
            These are standard match-shirt measurements, not this garment's measured spec. Confirm
            before ordering.
          </p>
        )}
      </div>
    </div>
  );
}
