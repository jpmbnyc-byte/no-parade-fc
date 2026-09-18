import { useEffect, useState } from "react";

export type InkMetrics = {
  /**
   * How far glyph *ink* sits to the right of the CSS layout box center, in em.
   * Positive -> shift left so painted strokes land back on the layout center.
   */
  biasEm: number;
  /** Painted width of the string, in em. Used to scale long names down to fit the print area. */
  widthEm: number;
};

const FALLBACK: InkMetrics = { biasEm: 0.02, widthEm: 0 };

/**
 * Measures painted glyph ink for overlay text. Ported from Bayonne Athletics'
 * ProductCanvas.tsx ink-bias measurement — same offscreen-canvas technique,
 * extended to also report ink width so the name can be scaled to the plate's
 * print area exactly rather than guessed from character count.
 */
export function useInkMetrics(text: string, fontFamily: string, letterSpacingEm: number): InkMetrics {
  const [metrics, setMetrics] = useState<InkMetrics>(FALLBACK);

  useEffect(() => {
    let cancelled = false;

    const measure = () => {
      if (cancelled || typeof document === "undefined" || !text) {
        if (!cancelled) setMetrics(FALLBACK);
        return;
      }
      const fontSize = 180;
      const pad = 24;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        setMetrics(FALLBACK);
        return;
      }
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.letterSpacing = `${letterSpacingEm}em`;
      const layoutW = Math.ceil(ctx.measureText(text).width);
      if (layoutW < 2) {
        setMetrics(FALLBACK);
        return;
      }
      canvas.width = layoutW + pad * 2;
      canvas.height = fontSize * 1.4;
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.letterSpacing = `${letterSpacingEm}em`;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#fff";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(text, pad, fontSize);
      const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let inkLeft = width;
      let inkRight = 0;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (data[(y * width + x) * 4]! > 40) {
            if (x < inkLeft) inkLeft = x;
            if (x > inkRight) inkRight = x;
          }
        }
      }
      if (inkRight <= inkLeft) {
        setMetrics(FALLBACK);
        return;
      }
      const inkMid = (inkLeft + inkRight) / 2;
      const layoutMid = pad + layoutW / 2;
      const biasEm = (inkMid - layoutMid) / fontSize;
      const widthEm = (inkRight - inkLeft + 1) / fontSize;
      setMetrics({
        biasEm: Number.isFinite(biasEm) ? biasEm : FALLBACK.biasEm,
        widthEm: Number.isFinite(widthEm) ? widthEm : FALLBACK.widthEm,
      });
    };

    const run = () => {
      if (typeof document !== "undefined" && document.fonts?.ready) {
        void document.fonts.ready.then(measure);
      } else {
        measure();
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [text, fontFamily, letterSpacingEm]);

  return metrics;
}
