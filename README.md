# No Parade F.C. — Put Your Name On It

A working jersey customizer with a live overlay preview and Stripe
checkout, replacing the frozen Shopify + Teeinblue listings. Standard
name/number personalization only — no crest, motto, or heritage line;
that flow was retired in favor of the exact working setup already
proven on Bayonne Athletics' product page (`ba-athletics.com/team`).

The whole mechanic is ported from there, not just the overlay math:
`src/components/JerseyCanvas.tsx` is Bayonne's `ProductCanvas.tsx`
(percentage-of-plate lettering, canvas-based ink centering), and
`src/components/Configurator.tsx` is the same single-panel PDP pattern
as Bayonne's `team.$slug.$product.tsx` — a Gallery vs. "Put your name
on it" toggle, front/back tabs, a number+name field pair, a confirm
checkbox, and a dynamic clean-vs-personalized price — not the old
5-step wizard.

## Branding

`public/logo.png` and `public/logo-white.png` are the real No Parade
F.C. logo (trimmed, `logo-white.png` recolored for dark backgrounds —
regenerate it from `logo.png` if the source art changes rather than
hand-editing it). Used in the nav, footer, both order pages, and
`public/favicon.png` (cropped to just the chevron mark). `public/og.jpg`
is a built social-share card from the old Build Your Crest headline —
due for a re-render now that the product is name/number only; the
meta tags in `index.html` already point at the new copy.

Every nav item, footer link, and hero CTA is wired to something real:
`Home` scrolls to top, `NPFC`/`PBWY`/`Explore NPFC` scroll to the "This
is not merch" section, `Put Your Name On It`/`Collections`/the hero's
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

Same differential pattern as Bayonne's PDP: leave both fields blank
for the clean jersey, fill in both for the personalized one.

- **Clean** — $118 (blank fields, no personalization)
- **Personalized** — $138 (name + number both present and valid)

`PRICE`/`PERSONALIZED_PRICE` in `src/lib/kit.ts` are the single source
for both the UI and `api/create-checkout-session.ts`.

## Pending assets — placeholders in place, need real files

Nothing below blocks the app from working end-to-end; it blocks the
*preview* from being pixel-accurate. Swap these in and nothing else
needs to change:

- **Front plate.** `frontSrc` still points at the finished reference
  mock (`public/france-front-placeholder.jpg`) — there's no real blank
  France Edition front photo yet. Swap it in once a blank front exists;
  `JERSEY_LAYOUT.numberFront` may need re-tuning against it.
- **Back plate — real photo now in use.** `public/france-back.jpg` is
  the actual France Edition back print (no name/number baked in), not
  a placeholder — `JerseyCanvas.tsx`'s `!backSrc` fallback only fires
  when a nation has no back photo at all (still true for Jamaica/USA).
  Both source images have a visible checker pattern instead of real
  transparency (flat RGB, not RGBA) — harmless behind the dark preview
  panel, but worth a real cutout/transparent export if that bothers
  anyone visually.
- **Haiti Home — assets saved, not wired up yet.** `public/haiti-back.jpg`
  (product-style back, confirmed the matching pair) and
  `public/haiti-front-lifestyle.jpg` (a lifestyle/environmental shot,
  not a flat product photo) are both real Haiti Home photography. The
  Haiti entry in `NATIONS` (`src/lib/kit.ts`) is still `unlocked: false`
  and `Configurator.tsx` still hardcodes the France assets, so neither
  file is live anywhere yet. Before flipping Haiti on: the lifestyle
  front photo isn't cropped to the garment the way France's front is,
  so name/number overlay positions would need re-tuning against it
  specifically (or swap in a flatter product-style front photo if one
  exists, to match France's treatment).
- **Brand typeface.** Jersey lettering currently renders in the UI's
  own font (Manrope) rather than a licensed print face — same
  "swap the font, nothing else changes" situation as Bayonne
  Athletics' local OTF fonts.
- **OG card.** `public/og.jpg` still carries the old Build Your Crest
  headline — regenerate it against the new "Put Your Name On It" copy
  once there's a moment for it; the site works fine without this.
- **Other nations.** Jamaica, Haiti, and USA editions are wired into
  `NATIONS` in `src/lib/kit.ts` as `unlocked: false` — add their kit
  photography and flip the flag once each is ready.

## What checkout captures

`api/create-checkout-session.ts` puts nation, name, and number into
the Stripe Checkout Session's `metadata`, so it survives to the order
and `order-summary` can read it back on the confirmation page.
