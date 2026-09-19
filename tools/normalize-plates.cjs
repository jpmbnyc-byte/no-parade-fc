/**
 * Plate pipeline: knockout -> edge decontamination -> common garment box.
 *
 * Every plate was shot on a white studio sweep. Cutting the garment out
 * leaves a ring of semi-transparent pixels that still carry the *background*
 * colour: measured across the set, the average luminance of those edge pixels
 * was 240-249. On a white page that is invisible. On this site's near-black
 * ground it draws a white outline around every silhouette -- the "cutout
 * shape" against the background. Powder Blue hides it; Garnet, Orange and
 * Black do not.
 *
 * The fix is to unmix rather than to blur. A partially covered pixel holds
 *     observed = a*garment + (1-a)*white
 * so the garment's own colour is recoverable as (observed - (1-a)*white)/a.
 * That is exact, keeps the soft edge soft, and works on any ground.
 *
 * The same pass re-fits each garment to one box, because the tribute plates
 * were rendered ~8% larger than the blank plates (bbox height 96-98.5% of
 * frame against 90.3%): they crowded the frame so the hem read as cropped,
 * and the garment jumped size when you switched Tribute to Custom. The blank
 * backs set the target box since JERSEY_LAYOUT is calibrated against them.
 */
const sharp = require(process.env.SHARP || "sharp");
const path = require("path");

const SIZE = 1254;
// From the blank backs, which are the overlay calibration reference.
const TARGET_H = 0.902;
const TARGET_CX = 0.5;
const TARGET_CY = 0.5;

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

function bbox(data, W, H, thresh = 40) {
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (data[(y * W + x) * 4 + 3] > thresh) {
      if (x < x0) x0 = x; if (x > x1) x1 = x;
      if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
  }
  return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0 };
}

/** Flood the white sweep from the frame edge. Only for sources without alpha. */
function knockout(data, W, H) {
  const N = W * H;
  const lum = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const j = i * 4;
    lum[i] = 0.299 * data[j] + 0.587 * data[j + 1] + 0.114 * data[j + 2];
  }
  // Cutoff from this image's own border, so a warm or cool sweep both work.
  const border = [];
  for (let x = 0; x < W; x++) { border.push(lum[x]); border.push(lum[(H - 1) * W + x]); }
  for (let y = 0; y < H; y++) { border.push(lum[y * W]); border.push(lum[y * W + W - 1]); }
  border.sort((a, b) => a - b);
  const floor = border[Math.floor(border.length * 0.02)];
  const cutoff = floor - 4;

  const bg = new Uint8Array(N);
  const stack = [];
  const push = (x, y) => {
    const i = y * W + x;
    if (bg[i] || lum[i] < cutoff) return;
    bg[i] = 1; stack.push(i);
  };
  for (let x = 0; x < W; x++) { push(x, 0); push(x, H - 1); }
  for (let y = 0; y < H; y++) { push(0, y); push(W - 1, y); }
  while (stack.length) {
    const i = stack.pop(), x = i % W, y = (i / W) | 0;
    if (x > 0) push(x - 1, y);
    if (x < W - 1) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y < H - 1) push(x, y + 1);
  }

  // Soft edge: alpha ramps with how far the pixel sits below the sweep.
  for (let i = 0; i < N; i++) {
    const j = i * 4;
    if (bg[i]) { data[j + 3] = 0; continue; }
    const t = clamp((cutoff + 10 - lum[i]) / 18, 0, 1);
    data[j + 3] = Math.round(255 * (0.25 + 0.75 * t));
  }
  // Anything fully enclosed by garment stays opaque regardless of luminance,
  // so white side panels and print are never eaten.
  for (let i = 0; i < N; i++) if (!bg[i] && data[i * 4 + 3] < 255) {
    const x = i % W, y = (i / W) | 0;
    let edge = false;
    for (const k of [i - 1, i + 1, i - W, i + W]) if (k >= 0 && k < N && bg[k]) edge = true;
    if (!edge) data[i * 4 + 3] = 255;
  }
  return data;
}

/** Remove the white background still mixed into partially covered pixels. */
function decontaminate(data, N, bgValue = 255) {
  let fixed = 0;
  for (let i = 0; i < N; i++) {
    const j = i * 4;
    const a = data[j + 3];
    if (a === 0 || a === 255) continue;
    const af = a / 255;
    // Below this the unmix divides by almost nothing and amplifies noise;
    // those pixels are nearly invisible anyway, so drop them instead.
    if (af < 0.08) { data[j + 3] = 0; continue; }
    for (let c = 0; c < 3; c++) {
      data[j + c] = clamp(Math.round((data[j + c] - (1 - af) * bgValue) / af), 0, 255);
    }
    fixed++;
  }
  return fixed;
}

async function run(src, out, { doKnockout = false, refit = true } = {}) {
  const img = sharp(src).ensureAlpha();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  const N = W * H;

  if (doKnockout) knockout(data, W, H);
  const fixed = decontaminate(data, N);

  const b = bbox(data, W, H);
  // The blank backs are the reference JERSEY_LAYOUT was calibrated against,
  // so they are cleaned but never re-scaled: a half-percent rescale there
  // would walk the live name and number off the print area.
  const scale = refit ? (TARGET_H * SIZE) / b.h : 1;
  const newW = Math.round(W * scale), newH = Math.round(H * scale);

  const scaled = await sharp(Buffer.from(data), { raw: { width: W, height: H, channels: 4 } })
    .resize(newW, newH, { kernel: "lanczos3" })
    .raw().toBuffer({ resolveWithObject: true });

  // Place the garment's own centre on the target centre.
  const sb = bbox(scaled.data, scaled.info.width, scaled.info.height);
  const left = Math.round(TARGET_CX * SIZE - (sb.x0 + sb.w / 2));
  const top = Math.round(TARGET_CY * SIZE - (sb.y0 + sb.h / 2));

  // The scaled plate can be larger than the canvas (a garment shot small in
  // frame scales up past 1254), and sharp will not composite an oversized
  // input, so take the window of it that actually lands on the canvas.
  const sw = scaled.info.width, sh = scaled.info.height;
  const srcX = Math.max(0, -left), srcY = Math.max(0, -top);
  const dstX = Math.max(0, left), dstY = Math.max(0, top);
  const cw = Math.min(sw - srcX, SIZE - dstX);
  const ch = Math.min(sh - srcY, SIZE - dstY);

  const window = await sharp(Buffer.from(scaled.data), { raw: { width: sw, height: sh, channels: 4 } })
    .extract({ left: srcX, top: srcY, width: cw, height: ch })
    .raw().toBuffer();

  const canvas = sharp({
    create: { width: SIZE, height: SIZE, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  }).composite([{
    input: window,
    raw: { width: cw, height: ch, channels: 4 },
    left: dstX, top: dstY,
  }]);

  const buf = await canvas.png().toBuffer();
  await sharp(buf).webp({ quality: 92, alphaQuality: 100 }).toFile(out);

  const final = await sharp(out).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const fb = bbox(final.data, final.info.width, final.info.height);
  const pct = v => (100 * v / SIZE).toFixed(1);
  console.log(
    path.basename(out).padEnd(34),
    `decontaminated ${String(fixed).padStart(6)}  →  y ${pct(fb.y0)}→${pct(fb.y1)}  h ${pct(fb.h)}  cx ${pct(fb.x0 + fb.w / 2)}`,
  );
}

module.exports = { run };

if (require.main === module) {
  const [, , src, out, ...flags] = process.argv;
  run(src, out, {
    doKnockout: flags.includes("--knockout"),
    refit: !flags.includes("--no-refit"),
  }).catch(e => { console.error(e); process.exit(1); });
}
