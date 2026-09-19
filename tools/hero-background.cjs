const sharp = require('/home/user/pixel-perfect-view-566-1b2dd3b5/node_modules/sharp/dist/index.cjs');

// --- tiny helpers -----------------------------------------------------------
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };

function boxBlur(src, W, H, r) {
  const tmp = new Float32Array(W * H), out = new Float32Array(W * H);
  for (let y = 0; y < H; y++) {
    let acc = 0;
    for (let x = -r; x <= r; x++) acc += src[y * W + clamp(x, 0, W - 1)];
    for (let x = 0; x < W; x++) {
      tmp[y * W + x] = acc / (2 * r + 1);
      acc += src[y * W + clamp(x + r + 1, 0, W - 1)] - src[y * W + clamp(x - r, 0, W - 1)];
    }
  }
  for (let x = 0; x < W; x++) {
    let acc = 0;
    for (let y = -r; y <= r; y++) acc += tmp[clamp(y, 0, H - 1) * W + x];
    for (let y = 0; y < H; y++) {
      out[y * W + x] = acc / (2 * r + 1);
      acc += tmp[clamp(y + r + 1, 0, H - 1) * W + x] - tmp[clamp(y - r, 0, H - 1) * W + x];
    }
  }
  return out;
}

// Deterministic value noise, so reruns produce the identical hero.
function noise2d(W, H, cell, seed) {
  const gw = Math.ceil(W / cell) + 2, gh = Math.ceil(H / cell) + 2;
  const g = new Float32Array(gw * gh);
  let s = seed >>> 0;
  for (let i = 0; i < g.length; i++) { s = (s * 1664525 + 1013904223) >>> 0; g[i] = s / 4294967296; }
  const out = new Float32Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const fx = x / cell, fy = y / cell, ix = fx | 0, iy = fy | 0;
    const tx = smooth(0, 1, fx - ix), ty = smooth(0, 1, fy - iy);
    const a = g[iy * gw + ix], b = g[iy * gw + ix + 1];
    const c = g[(iy + 1) * gw + ix], d = g[(iy + 1) * gw + ix + 1];
    out[y * W + x] = (a + (b - a) * tx) * (1 - ty) + (c + (d - c) * tx) * ty;
  }
  return out;
}

(async () => {
  const SRC = process.argv[2], OUT = process.argv[3];
  const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;
  const N = W * H;

  // --- 1. Model the taupe seamless, per row (it has a vertical falloff) -----
  const bg = new Float32Array(H * 3);
  for (let y = 0; y < H; y++) {
    const ch = [[], [], []];
    for (let k = 0; k < 24; k++) for (const x of [k, W - 1 - k]) {
      const j = (y * W + x) * C, r = data[j], g = data[j + 1], b = data[j + 2];
      if (Math.max(r, g, b) - Math.min(r, g, b) < 30) { ch[0].push(r); ch[1].push(g); ch[2].push(b); }
    }
    for (let c = 0; c < 3; c++) {
      const a = ch[c].sort((p, q) => p - q);
      bg[y * 3 + c] = a.length ? a[a.length >> 1] : [172, 163, 152][c];
    }
  }

  // --- 2. Soft backdrop matte -----------------------------------------------
  // Purely photometric: how much does this pixel look like the wall? Keying by
  // connectivity was tried first and abandoned — any tolerance wide enough to
  // reach the real subject edges also walked into Robben's scalp and Ballack's
  // forehead, which sit at nearly the wall's luminance. Chroma is the reliable
  // separator: the wall runs chroma ~18, every skin tone and kit is 50+.
  const matte = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const j = i * C, y = (i / W) | 0;
    const r = data[j], g = data[j + 1], b = data[j + 2];
    const dr = r - bg[y * 3], dg = g - bg[y * 3 + 1], db = b - bg[y * 3 + 2];
    const dist = Math.sqrt(dr * dr + dg * dg + db * db);
    const chroma = Math.max(r, g, b) - Math.min(r, g, b);
    matte[i] = (1 - smooth(30, 80, dist)) * (1 - smooth(26, 46, chroma));
  }

  // Gate the matte to the region actually connected to the frame edge, so an
  // interior patch that happens to match the wall can never be punched out.
  const reach = new Float32Array(N);
  for (let i = 0; i < N; i++) reach[i] = matte[i] > 0.5 ? 1 : 0;
  const stack = [], seen = new Uint8Array(N);
  const seed = i => { if (!seen[i] && reach[i] > 0) { seen[i] = 1; stack.push(i); } };
  for (let x = 0; x < W; x++) { seed(x); seed((H - 1) * W + x); }
  for (let y = 0; y < H; y++) { seed(y * W); seed(y * W + W - 1); }
  while (stack.length) {
    const i = stack.pop(), x = i % W, y = (i / W) | 0;
    if (x > 0) seed(i - 1);
    if (x < W - 1) seed(i + 1);
    if (y > 0) seed(i - W);
    if (y < H - 1) seed(i + W);
  }
  // Let the connected region bleed a little so enclosed slivers of wall
  // between the figures convert too, then soften the whole edge.
  const gate = boxBlur(Float32Array.from(seen), W, H, 26);
  for (let i = 0; i < N; i++) matte[i] *= smooth(0.015, 0.20, gate[i]);
  // The outermost band of the plate is wall by construction — no figure comes
  // within ~90px of the left, right or top edge — so force it, which clears the
  // mottled residue the photometric test leaves in the vignetted corners. Not
  // the bottom edge: the boots reach it.
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const edge = Math.min(x / 88, (W - 1 - x) / 88, y / 70, 1);
    const i = y * W + x;
    matte[i] = Math.max(matte[i], 1 - smooth(0, 1, edge));
  }
  const soft = boxBlur(matte, W, H, 2);

  // --- 3. The background that replaces it -----------------------------------
  const OW = 2160, OH = H, OX = 40; // subjects left of centre; lockup gets the right
  const mottle = noise2d(OW, OH, 190, 0x9e3779b9);
  const grain = noise2d(OW, OH, 2, 0x85ebca6b);
  const out = Buffer.alloc(OW * OH * 3);

  for (let y = 0; y < OH; y++) for (let x = 0; x < OW; x++) {
    const o = (y * OW + x) * 3;

    // Matte black surface: warm near-black, a broad soft bloom where the
    // group stands so it reads as a lit seamless rather than a void, and a
    // low-frequency mottle + fine grain so it reads as a surface.
    const nx = (x - (OX + W * 0.46)) / (OW * 0.44), ny = (y - OH * 0.34) / (OH * 0.78);
    const bloom = Math.exp(-(nx * nx + ny * ny) * 1.15);
    const floor = smooth(0.72, 1.0, y / OH);
    let base = 9 + 15 * bloom + (mottle[y * OW + x] - 0.5) * 7 + (grain[y * OW + x] - 0.5) * 5.5;
    base *= 1 - 0.45 * floor;                       // ground falls away
    const bgR = clamp(base * 1.13, 0, 255), bgG = clamp(base * 1.02, 0, 255), bgB = clamp(base * 0.93, 0, 255);

    const sx = x - OX, sy = y;
    if (sx < 0 || sx >= W) { out[o] = bgR; out[o + 1] = bgG; out[o + 2] = bgB; continue; }

    const i = sy * W + sx, j = i * C;
    const a = clamp(soft[i], 0, 1);
    // Graded plate: the shot is lit for a light seamless, so on black it needs
    // its blacks crushed and a touch more contrast or it sits flat. The ramp
    // sinks the ground, the plinth and the boots into shadow — spatial, so it
    // can never touch the white shorts the way a tonal key would.
    const sink = 1 - 0.78 * smooth(0.77, 0.99, sy / H);
    const grade = v => clamp((v - 8) * 1.075 * sink, 0, 255);
    out[o]     = grade(data[j])     * (1 - a) + bgR * a;
    out[o + 1] = grade(data[j + 1]) * (1 - a) + bgG * a;
    out[o + 2] = grade(data[j + 2]) * (1 - a) + bgB * a;
  }

  const img = sharp(out, { raw: { width: OW, height: OH, channels: 3 } });
  await img.clone().jpeg({ quality: 92, mozjpeg: true }).toFile(OUT + '.jpg');
  await img.clone().webp({ quality: 88 }).toFile(OUT + '.webp');
  await img.clone().resize({ width: 1000 }).png().toFile(OUT + '-preview.png');
  console.log('wrote', OW + 'x' + OH);
})();
