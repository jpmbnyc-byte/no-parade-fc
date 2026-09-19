# No Parade F.C. — The Champions

**The Champions — Release 01.** Four fixed colorways, each named for the
legend who wore the number: Pelé 10 in Garnet, Robben 11 in Orange,
Henry 12 in Powder Blue, Ballack 13 in Black. Each colorway sells three
ways:

- **Tribute** — the legend's exact name and number, printed as shown.
  Not editable.
- **Blank** — the colorway with no name or number.
- **Custom** — your own name and number, same personalization engine
  as before.

This replaces the nation-edition architecture (France/Jamaica/Haiti/
USA) entirely — there is no more unlock roadmap; all four colorways
are live from day one. Stripe checkout, live overlay preview for
Custom mode.

Legal note: printing real professional athletes' names/numbers
commercially is a right-of-publicity and trademark exposure point
without a license or estate agreement. The Hall of Fame cards raise
this further — they carry actual photographs of the players, and
third-party marks (adidas, Nike, national federation crests) are
visible within those photographs. That's a business decision outside
this codebase, not something resolved by the code — flagging it here
so it isn't missed before a real launch.

The personalization mechanic (for Blank/Custom mode) is still the one
ported from Bayonne Athletics' product page (`ba-athletics.com/team`):
`src/components/JerseyCanvas.tsx` is Bayonne's `ProductCanvas.tsx`
(percentage-of-plate lettering, canvas-based ink centering).

## Branding

`public/logo.png` and `public/logo-white.png` are the real No Parade
F.C. wordmark (trimmed, `logo-white.png` recolored for dark
backgrounds — regenerate it from `logo.png` if the source art changes
rather than hand-editing it), used in the nav, footer, and both order
pages. `public/favicon.png` is cropped to just the chevron mark.

`public/champions-hero.jpg` is the campaign art, and `public/og.jpg` is
the same frame cropped to 2400×1260 for social. The art carries its own
NOPARADE / CHAMPIONS lockup, which is why the hero shows it whole at its
native 1672:941 aspect on `md` and up and keeps the HTML `h1`
screen-reader only there. The lockup sits at 64–96% of the frame width
and overlaps the rightmost player vertically, so it cannot be cropped
off with a straight vertical cut — below `md` the frame goes to 4:5 and
`object-position: 30%` crops to the players, taking the baked lockup off
frame, and the HTML lockup becomes visible in its place. If the art is
ever re-cut, re-check that crop percentage against where the "C" of
CHAMPIONS starts.

`public/champions-<legend>-front.jpg`/`-back.jpg` (8 files: pele,
robben, henry, ballack) are real product photography extracted at full
resolution from "THE CHAMPIONS by No Parade FC" reference deck — not
placeholders. Front plates never carry
a name or number in this design (only the crest, `noparade` wordmark,
and the Peace box); back plates in these 8 files have the legend's
tribute print already baked in, which is why Tribute mode renders them
as a plain photo (`JerseyCanvas`'s `showOverlay={false}`) rather than
compositing live text on top of them.

`public/champions-<legend>-back-blank.jpg` (4 files) are flat-lay
nameless backs — the plate Blank mode shows as-is, and the plate Custom
mode overlays the typed name/number onto live. Flat lays are used here
rather than the turned 3/4 product shots because the print area is
undistorted and symmetric, so custom input reads clearly.

They are normalized before being committed: each source flat lay is
scaled and positioned so the garment occupies an identical box (center
x at 50%, top at 5%, height 90% of the square canvas). The sources were
framed at slightly different scales, and without that pass one layout
could not land identically on all four. `normalize.js` is not kept in
the repo — if a plate is ever re-shot, re-normalize it to that same
garment box rather than adjusting `JERSEY_LAYOUT` per colorway.

`public/fonts/france-wc-2026-away.otf` ("France WC 2026 Away") is the
real jersey lettering face — full A–Z, 0–9, and accented coverage
(é, for PELÉ) — registered via `@font-face` in `styles.css` and used
as `JERSEY_FONT_FAMILY`, the default font for the live overlay in
Blank/Custom mode. Tribute mode never uses it, since that print is
baked into the real photo.

## How the custom overlay is calibrated

Custom input is meant to sit where the real tribute print sits, and
`JERSEY_LAYOUT` in `src/lib/kit.ts` is derived rather than eyeballed:

1. The painted ink box of the tribute print (`ROBBEN` / `11`) was
   measured out of the tribute photo, and expressed as a fraction of
   that garment's own bounding box.
2. Those vertical fractions were transferred onto the normalized
   flat-lay plate. Vertical proportions carry across a horizontally
   turned pose; horizontal ones do not, which is why `centerX` is
   simply 50 — the flat lay is symmetric — rather than transferred.
3. The live overlay was then rendered and re-measured — by diffing a
   Custom-mode screenshot against a Blank-mode screenshot of the same
   plate, which isolates the overlay exactly — and the CSS was solved
   against the target box until every edge landed within ~0.15% of
   the plate.

Two consequences worth keeping:

- The figure is `aspect-square`. Every plate photo is square, so with
  `object-contain` a percentage in `JERSEY_LAYOUT` maps 1:1 onto the
  photo. Any other container ratio letterboxes the photo and silently
  shifts every overlay position.
- `name` and `number` carry their own `trackingEm`: the real print is
  set looser than the font's default spacing.

Long names scale to fit: `useInkMetrics` measures the painted width on
an offscreen canvas and the overlay scales down once it would exceed
`name.maxWidthPct` (30% of the plate — the panel width at print height,
before the raglan seam). Names are capped at `NAME_MAX` (15).

`public/champions-<legend>-card.jpg` (4 files) are the Hall of Fame
campaign cards. They are finished editorial art — each already carries
its own headline, kit shot, back detail and crest at actual size — so
`HallOfFame.tsx` presents them whole rather than breaking them apart
and re-laying them out, and links each to the full-size file, since the
fine print doesn't survive a card scaled down to phone width.

Every nav item, footer link, and hero CTA is wired to something real:
`Home` scrolls to top, `NPFC`/`PBWY`/`Explore NPFC` scroll to the "This
is not merch" section, `The Champions`/the hero's primary CTA scroll to
the configurator, and `Hall of Fame` scrolls to the cards. There's no
multi-page routing here (yet) — everything lives on the one page, so
these are anchors, not separate destinations.

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
preview. (Checkout will 500 under plain `vite preview`/`vite dev`
without `vercel dev` running alongside it — the Edge Functions aren't
served by Vite's own static/dev server.)

## Deploy (Vercel)

1. Import this repo. Framework preset: **Vite** (auto-detected).
2. Environment variable: `STRIPE_SECRET_KEY` (a restricted or secret
   key, `rk_...`/`sk_...`). Without it, checkout falls back to a local
   `/order/complete` mock so the UI can still be reviewed end-to-end.
3. Attach the custom domain: add `npfc.noparade.store` in this
   project's Vercel domain settings, then point a `CNAME` for `npfc`
   at your `noparade.store` DNS provider → the CNAME target Vercel
   shows for this project. See `No-Parade-Main`'s README for the full
   hub domain plan.

## Pricing

`src/lib/kit.ts`'s `priceFor(mode)` is the single source for both the
UI and `api/create-checkout-session.ts` — the server always recomputes
price from `mode`, never trusts a client-sent amount.

- **Tribute** — $148 (the legend's exact print — the premium tier)
- **Blank** — $118 (no name or number)
- **Custom** — $138 (your own name + number, both required and valid)

## Liquid effects

`styles.css` carries three motion pieces used by the hero, all
opacity/transform only and all disabled under `prefers-reduced-motion`:

- `.liquid-field` — two blurred colour blobs (gold, stadium blue) drifting
  across the art on long offset cycles, `mix-blend-mode: screen`.
- `.liquid-sheen` — a single bright pass crossing the frame, like a
  stadium light sweeping through.
- `.liquid-glass` — frosted panel (`backdrop-filter`) for anything laid
  over the art; `.liquid-btn` gives the primary action a fluid sweep on
  hover.

Keep these subtle. The measured delta between two hero frames is ~13/255
at peak — enough to feel alive, not enough to read as an animation.

## What checkout captures

`api/create-checkout-session.ts` puts champion, mode, and (for Tribute/
Custom) name and number into the Stripe Checkout Session's `metadata`,
so it survives to the order and `order-summary` can read it back on
the confirmation page.
