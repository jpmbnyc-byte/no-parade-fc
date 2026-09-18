import { useState } from "react";
import { JERSEY_FONT_FAMILY, JERSEY_LAYOUT } from "@/lib/kit";
import { useInkBias } from "@/lib/useInkBias";

export type CanvasView = "front" | "back";

type Props = {
  view: CanvasView;
  frontSrc: string;
  /** No real blank back plate exists yet — null renders an honest placeholder instead of a fake photo. */
  backSrc: string | null;
  name: string;
  number: string;
  /**
   * false in Tribute mode: the photo already has the legend's name/number
   * baked in at full print quality, so no live text layer is drawn on
   * top of it (that would double the print). true in Blank/Custom mode,
   * where the plate has no printing and the live overlay is the only
   * name/number shown.
   */
  showOverlay?: boolean;
  fontFamily?: string;
};

/**
 * Live overlay preview — ported from Bayonne Athletics' ProductCanvas.tsx:
 * percentage-of-plate lettering, canvas ink-bias centering, name on the
 * back baseline, number below it. Defaults to the real "France WC 2026
 * Away" jersey face (registered in styles.css) rather than a UI font.
 * Positions in src/lib/kit.ts's JERSEY_LAYOUT are calibrated against the
 * real blank back plates but still approximate — see that constant's
 * comment. The Champions design never prints a number on the front, so
 * there's no front overlay layer at all.
 */
export function JerseyCanvas({
  view,
  frontSrc,
  backSrc,
  name,
  number,
  showOverlay = true,
  fontFamily = JERSEY_FONT_FAMILY,
}: Props) {
  const [plate, setPlate] = useState<{ w: number; h: number } | null>(null);
  const layout = JERSEY_LAYOUT;

  const nameChars = Math.max(name.replace(/\s/g, "").length, 1);
  const nameTracking = nameChars >= 10 ? 0.01 : nameChars >= 7 ? 0.035 : 0.06;
  const nameFit = Math.min(1, 8 / nameChars);
  const nameBias = useInkBias(name || "A", fontFamily, nameTracking);
  const numberBias = useInkBias(number || "8", fontFamily, 0) + (number.length === 1 ? 0.03 : 0);

  const showBack = view === "back";

  const textStyle = {
    color: "var(--cream)",
    WebkitTextStroke: "0.04em rgba(10,13,19,0.85)",
    paintOrder: "stroke fill" as const,
  };

  if (showBack && !backSrc) {
    return (
      <figure className="relative flex aspect-[4/5] w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-sm border border-dashed border-[var(--panel-line)] bg-[var(--panel)] px-8 text-center">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          {name ? (
            <p className="absolute left-1/2 top-[16%] w-[70%] -translate-x-1/2 text-center text-4xl font-bold uppercase text-[var(--muted)]">
              {name}
            </p>
          ) : null}
          {number ? (
            <p className="absolute left-1/2 top-[26%] -translate-x-1/2 text-center text-8xl font-bold text-[var(--muted)]">
              {number}
            </p>
          ) : null}
        </div>
        <p className="relative text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          Back view — pending blank plate photography
        </p>
      </figure>
    );
  }

  const src = view === "front" ? frontSrc : (backSrc as string);

  return (
    <figure
      className="relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-[var(--panel)]"
      style={{ containerType: "size" }}
    >
      <img
        key={src}
        src={src}
        alt={`No Parade F.C. jersey, ${view} view`}
        className="absolute inset-0 h-full w-full object-contain object-center"
        draggable={false}
        onLoad={(e) => {
          const el = e.currentTarget;
          setPlate({ w: el.naturalWidth, h: el.naturalHeight });
        }}
      />

      {showOverlay && (
        <div className="pointer-events-none absolute inset-0" aria-hidden={!plate}>
          {showBack && name ? (
            <p
              className="absolute flex items-end justify-center whitespace-nowrap text-center uppercase"
              style={{
                top: `${layout.name.y}%`,
                left: `${layout.centerX}%`,
                transform: `translateX(calc(-50% - ${nameBias}em)) scale(${nameFit})`,
                transformOrigin: "center bottom",
                width: `${layout.name.maxWidthPct}%`,
                height: `${layout.name.heightPct}%`,
                fontFamily,
                fontWeight: 700,
                fontSize: `calc(${layout.name.heightPct} * 1cqh)`,
                letterSpacing: `${nameTracking}em`,
                lineHeight: 0.9,
                overflow: "visible",
                ...textStyle,
              }}
            >
              {name}
            </p>
          ) : null}

          {showBack && number ? (
            <p
              className="absolute flex items-start justify-center whitespace-nowrap text-center"
              style={{
                top: `${layout.number.y}%`,
                left: `${layout.centerX}%`,
                transform: `translateX(calc(-50% - ${numberBias}em))`,
                transformOrigin: "center top",
                width: "max-content",
                maxWidth: `${layout.number.maxWidthPct}%`,
                height: `${layout.number.heightPct}%`,
                fontFamily,
                fontWeight: 700,
                fontSize: `calc(${layout.number.heightPct} * 1cqh)`,
                lineHeight: 0.85,
                overflow: "visible",
                ...textStyle,
              }}
            >
              {number}
            </p>
          ) : null}
        </div>
      )}
    </figure>
  );
}
