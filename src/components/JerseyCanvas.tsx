import { useState } from "react";
import { JERSEY_FONT_FAMILY, JERSEY_LAYOUT } from "@/lib/kit";
import { useInkMetrics } from "@/lib/useInkMetrics";

export type CanvasView = "front" | "back";

type Props = {
  view: CanvasView;
  frontSrc: string;
  /** null renders an honest placeholder instead of a fake photo. */
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
 * percentage-of-plate lettering, canvas ink measurement, name above number
 * on the back. Renders in the real "France WC 2026 Away" jersey face.
 *
 * The figure is deliberately `aspect-square` because every plate photo in
 * this collection is square: with `object-contain`, a square image inside
 * a square box fills it exactly, so a percentage in JERSEY_LAYOUT maps 1:1
 * onto the photo. Any other container ratio letterboxes the photo and
 * silently shifts every overlay position away from the print area.
 *
 * The Champions design never prints a number on the front, so there's no
 * front overlay layer at all.
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

  const nameTracking = layout.name.trackingEm;
  const numberTracking = layout.number.trackingEm;
  const nameInk = useInkMetrics(name || "A", fontFamily, nameTracking);
  const numberInk = useInkMetrics(number || "8", fontFamily, numberTracking);

  // Ink width as a percentage of the plate, at scale 1 (font size is a
  // percentage of the square container, so em * heightPct == plate %).
  const namePlateWidthPct = nameInk.widthEm * layout.name.heightPct;
  const nameFit =
    namePlateWidthPct > 0 ? Math.min(1, layout.name.maxWidthPct / namePlateWidthPct) : 1;

  const showBack = view === "back";

  // Matches the tribute print: solid white, no keyline. The numeral's inner
  // spine detail comes from the France WC face itself, not from a stroke.
  const textStyle = { color: "#ffffff" };

  if (showBack && !backSrc) {
    return (
      <figure className="relative flex aspect-square w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-sm border border-dashed border-[var(--panel-line)] bg-[var(--panel)] px-8 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          Back view — pending blank plate photography
        </p>
      </figure>
    );
  }

  const src = view === "front" ? frontSrc : (backSrc as string);

  return (
    <figure
      className="relative aspect-square w-full overflow-hidden rounded-sm bg-[var(--panel)]"
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
              data-overlay="name"
              className="absolute m-0 whitespace-nowrap text-center uppercase"
              style={{
                top: `${layout.name.y}%`,
                left: `${layout.name.centerX}%`,
                transform: `translate(calc(-50% - ${nameInk.biasEm}em), 0) scale(${nameFit})`,
                transformOrigin: "center top",
                fontFamily,
                fontWeight: 400,
                fontSize: `calc(${layout.name.heightPct} * 1cqh)`,
                letterSpacing: `${nameTracking}em`,
                lineHeight: 1,
                ...textStyle,
              }}
            >
              {name}
            </p>
          ) : null}

          {showBack && number ? (
            <p
              data-overlay="number"
              className="absolute m-0 whitespace-nowrap text-center"
              style={{
                top: `${layout.number.y}%`,
                left: `${layout.number.centerX}%`,
                transform: `translate(calc(-50% - ${numberInk.biasEm}em), 0)`,
                transformOrigin: "center top",
                fontFamily,
                fontWeight: 400,
                fontSize: `calc(${layout.number.heightPct} * 1cqh)`,
                letterSpacing: `${numberTracking}em`,
                lineHeight: 1,
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
