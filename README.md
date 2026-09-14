# No Parade F.C. — Build Your Crest™

A working jersey customizer: 5-step configurator (Kit → Name & Number →
Crest Language → Crest Details → Review) with a live overlay preview
and Stripe checkout, replacing the frozen Shopify + Teeinblue listings.

The overlay engine (percentage-of-plate lettering, canvas-based ink
centering) is ported from Bayonne Athletics' `src/components/ProductCanvas.tsx`
and `src/lib/kit.ts` — same technique, extended with the crest badge,
motto, and heritage-line layers this configurator needs.

## Stack

Plain Vite + React + TypeScript + Tailwind v4 — no framework beyond
Vite, so it installs from the public npm registry with no special
setup. Stripe checkout runs as two Vercel Edge Functions in `api/`
(`create-checkout-session`, `order-summary`), the same split as
Bayonne Athletics' `checkout.functions.ts`, just as plain
Request/Response handlers instead of TanStack Start server functions.

## Run locally

```
npm install
npm run dev       # app on :5173
```

The dev server proxies `/api/*` to `localhost:3000` (see
`vite.config.ts`) — run `vercel dev` in a second terminal to serve the
API functions locally, or just test against the deployed Vercel
preview.

## Deploy (Vercel)

1. Import this repo. Framework preset: **Vite** (auto-detected).
2. Environment variable: `STRIPE_SECRET_KEY` (a restricted or secret
   key, `rk_...`/`sk_...`). Without it, checkout falls back to a local
   `/order/complete` mock so the UI can still be reviewed end-to-end.
3. Attach the custom domain once DNS is ready — see `No-Parade-Main`'s
   README for the full domain/DNS runbook (`npfc.noparade-store.com`
   needs to be added in Shopify's old domain settings first if that's
   still holding the name, then pointed here instead).

## Pending assets — placeholders in place, need real files

Nothing below blocks the app from working end-to-end; it blocks the
*preview* from being pixel-accurate. Swap these in and nothing else
needs to change:

- **Front plate.** `frontSrc` still points at the finished reference
  mock (`public/france-front-placeholder.jpg`) — there's no real blank
  France Edition front photo yet, so the crest badge overlay sits on
  top of the already-printed NPFC crest. Swap it in and re-check
  `CREST_LAYOUT.crestBadge` once a blank front exists.
- **Back plate — real photo now in use.** `public/france-back.jpg` is
  the actual France Edition back print (no name/number baked in), not
  a placeholder — `CrestCanvas.tsx`'s `!backSrc` fallback only fires
  when a nation has no back photo at all (still true for Jamaica/Haiti/
  USA). `public/haiti-back.jpg` is saved for when the Haiti nation
  unlocks, but nothing wires it up yet. Both source images have a
  visible checker pattern instead of real transparency (they're flat
  RGB, not RGBA) — harmless behind the dark preview panel, but worth
  a real cutout/transparent export if that bothers anyone visually.
- **Real crest artwork.** The 5 crest badges (Peace, Heritage, Grace,
  Club, Family) in `src/components/CrestBadge.tsx` are original
  placeholder line-art capturing each crest's theme, not the licensed
  final designs. Swap in real crest images (or vector paths) once
  they exist.
- **Brand typeface.** Jersey lettering currently renders in the UI's
  own font (Manrope) rather than a licensed print face — same
  "swap the font, nothing else changes" situation as Bayonne
  Athletics' local OTF fonts.
- **Other nations.** Jamaica, Haiti, and USA editions are wired into
  `NATIONS` in `src/lib/kit.ts` as `unlocked: false` — add their kit
  photography and flip the flag once each is ready.

## What checkout captures

`api/create-checkout-session.ts` puts every field (kit, nation, name,
number, year, crest, crest initials, motto, heritage line) into the
Stripe Checkout Session's `metadata`, so it survives to the order and
`order-summary` can read it back on the confirmation page.
