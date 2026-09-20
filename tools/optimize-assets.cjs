/**
 * Asset pass. The page was shipping 3.4MB of images: the four Hall of Fame
 * cards were 1536x1024 JPEGs totalling 1,053KB for slots about 700px wide,
 * and the collection grid pulled full 1254px plates into tiles that render
 * at roughly 300. Everything here is derived from the committed originals,
 * so it is repeatable rather than a one-time squeeze.
 */
const sharp = require(process.env.SHARP || "sharp");
const fs = require("fs");
const path = require("path");

const PUB = path.join(__dirname, "..", "public");
// Originals live outside public/ so they are never served, but stay in the
// repo so this script can be re-run. Deleting them once made the pass
// unrepeatable, which defeats the point of checking it in.
const SRC = path.join(__dirname, "..", "assets-src");
const kb = (f) => (fs.statSync(f).size / 1024).toFixed(0);

const NAMES = ["pele", "robben", "henry", "ballack"];

async function main() {
  let before = 0, after = 0;

  // Hall of Fame cards: JPEG -> WebP, and capped at the widest slot they can
  // occupy (a 1400px container, two up, on a 2x screen).
  for (const n of NAMES) {
    const src = path.join(SRC, `champions-${n}-card.jpg`);
    const out = path.join(PUB, `champions-${n}-card.webp`);
    before += fs.statSync(src).size;
    await sharp(src).resize({ width: 1400, withoutEnlargement: true }).webp({ quality: 82 }).toFile(out);
    after += fs.statSync(out).size;
    console.log(`card ${n}`.padEnd(16), kb(src) + "KB jpg", "->", kb(out) + "KB webp");
  }

  // Plates: a 400px variant for the collection grid and the bag thumbnails.
  // The full 1254px file stays for the configurator preview.
  for (const n of NAMES) {
    for (const kind of ["front", "back", "back-blank"]) {
      const src = path.join(PUB, `champions-${n}-${kind}.webp`);
      if (!fs.existsSync(src)) continue;
      for (const w of [400, 800]) {
        const out = path.join(PUB, `champions-${n}-${kind}-${w}.webp`);
        await sharp(src).resize({ width: w }).webp({ quality: 88, alphaQuality: 100 }).toFile(out);
        if (kind === "front") console.log(`plate ${n}`.padEnd(16), kb(src) + "KB", `-> ${w}px`, kb(out) + "KB");
      }
    }
  }

  // The logo is a 1200x105 wordmark rendered at ~170px wide.
  for (const f of ["logo.png", "logo-white.png"]) {
    const src = path.join(SRC, f);
    const out = path.join(PUB, f.replace(".png", ".webp"));
    before += fs.statSync(src).size;
    await sharp(src).resize({ width: 480 }).webp({ quality: 92 }).toFile(out);
    after += fs.statSync(out).size;
    console.log(f.padEnd(16), kb(src) + "KB png", "->", kb(out) + "KB webp");
  }

  // Social card. Shrunk in place once; re-encoding an already-shrunk JPEG on
  // every run would compound its own artefacts, so this is width-gated.
  const og = path.join(PUB, "og.jpg");
  if ((await sharp(og).metadata()).width > 1200) {
    await sharp(og).resize({ width: 1200 }).jpeg({ quality: 82, mozjpeg: true }).toFile(og + ".tmp");
    fs.renameSync(og + ".tmp", og);
  }
  console.log("og.jpg".padEnd(16), "->", kb(og) + "KB");

  console.log(`\nconverted set: ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB`);
}

main().catch((e) => { console.error(e); process.exit(1); });
