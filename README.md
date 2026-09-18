# No Parade F.C. — The Champions

**The Champions — Release 01.** Four fixed colorways, each named for the
legend who wore the number: Pelé 10 in Garnet, Robben 11 in Orange,
Henry 12 in Powder Blue, Reyna 13 in Black. Each colorway sells three
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
without a license or estate agreement. That's a business decision
outside this codebase, not something resolved by the code — flagging
it here so it isn't missed before a real launch.

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

`public/champions-hero.jpg` and `public/champions-<legend>-front.jpg`/
`-back.jpg` (8 files: pele, robben, henry, reyna) are real product
photography extracted at full resolution from "THE CHAMPIONS by No
Parade FC" reference deck — not placeholders. Front plates never carry
a name or number in this design (only the crest, `noparade` wordmark,
and the Peace box); back plates in the extracted photos have the
legend's tribute print already baked in, which is why Tribute mode
renders them as a plain photo (`JerseyCanvas`'s `showOverlay={false}`)
rather than compositing live text on top of them.

`public/og.jpg` is a built social-share card from the old Build Your
Crest headline — due for a re-render now that the product is The
Champions; the meta tags in `index.html` already point at the new
copy.

Every nav item, footer link, and hero CTA is wired to something real:
`Home` scrolls to top, `NPFC`/`PBWY`/`Explore NPFC` scroll to the "This
is not merch" section, `The Champions`/`Collections`/the hero's
primary CTA scroll to the configurator. There's no multi-page routing
here (yet) — everything lives on the one page, so these are anchors,
not separate destinations.

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

## Pending assets — placeholders in place, need real files

Nothing below blocks the app from working end-to-end; it blocks the
*preview* from being pixel-accurate. Swap these in and nothing else
needs to change:

- **Blank back plates.** There is no nameless back photo for any of
  the four colorways yet — only the tribute-baked ones extracted from
  the reference deck. `JerseyCanvas.tsx` passes `backSrc={null}` for
  Blank/Custom mode, so the back view falls back to the honest
  "pending blank plate photography" placeholder (with a live text
  preview of whatever name/number is typed) rather than showing real
  photography with someone else's name still printed on it. Shoot a
  blank back for each colorway and wire it into `Configurator.tsx`'s
  `backSrc={mode === "tribute" ? champion.backSrc : null}` line once
  available.
- **`JERSEY_LAYOUT` geometry.** Tuned by eye against the real tribute
  back photos (a real improvement over the old France-only guess), but
  still not verified against an actual blank plate — re-check `name`/
  `number` y/height/width percentages once real blank backs exist.
  Front never needs a number layer in this design — none of the four
  reference front photos carry one.
- **Brand typeface.** Live overlay text (Blank/Custom mode) still
  renders in the UI's own font (Manrope) rather than the "France WC
  Font"-style diamond-tipped numeral face visible in the real tribute
  photography — same "swap the font, nothing else changes" situation
  as Bayonne Athletics' local OTF fonts.
- **OG card.** `public/og.jpg` still carries the old Build Your Crest
  headline — regenerate it against The Champions once there's a moment
  for it; the site works fine without this.

## What checkout captures

`api/create-checkout-session.ts` puts champion, mode, and (for Tribute/
Custom) name and number into the Stripe Checkout Session's `metadata`,
so it survives to the order and `order-summary` can read it back on
the confirmation page.
