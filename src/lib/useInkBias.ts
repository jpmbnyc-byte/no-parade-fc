import { useEffect, useState } from "react";

/**
 * How far glyph *ink* sits to the right of the CSS layout box center, in em.
 * Positive -> shift left so painted strokes land back on the layout center.
 * Ported from Bayonne Athletics' ProductCanvas.tsx ink-bias measurement —
 * same technique, generalized to any overlay text (name, number, year).
 */
export function useInkBias(text: string, fontFamily: string, letterSpacingEm: number, fallback = 0.02) {
  const [biasEm, setBiasEm] = useState(fallback);

  useEffect(() => {
    let cancelled = false;

    const measure = () => {
      if (cancelled || typeof document === "undefined" || !text) {
        if (!cancelled) setBiasEm(fallback);
        return;
      }
      const fontSize = 180;
      const pad = 24;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        setBiasEm(fallback);
        return;
      }
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.letterSpacing = `${letterSpacingEm}em`;
      const layoutW = Math.ceil(ctx.measureText(text).width);
      if (layoutW < 2) {
        setBiasEm(fallback);
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
        setBiasEm(fallback);
        return;
      }
      const inkMid = (inkLeft + inkRight) / 2;
      const layoutMid = pad + layoutW / 2;
      const measured = (inkMid - layoutMid) / fontSize;
      setBiasEm(Number.isFinite(measured) ? measured : fallback);
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
  }, [text, fontFamily, letterSpacingEm, fallback]);

  return biasEm;
}
