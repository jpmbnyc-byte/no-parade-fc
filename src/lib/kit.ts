/**
 * Single source of truth for The Champions collection: the four legend
 * colorways, pricing per mode, and personalization field limits. Nation
 * architecture (France/Jamaica/Haiti/USA editions) is retired entirely —
 * see "THE CHAMPIONS by No Parade FC" for the collection this replaces
 * it with: four fixed colorways (Pelé/Garnet, Robben/Orange, Henry/Powder
 * Blue, Ballack/Black), each sold three ways — Tribute (the legend's exact
 * name + number, not editable), Blank (no name or number), or Custom
 * (your own name + number, same personalization engine as before).
 */

export const NAME_MAX = 15;
export const NUMBER_MIN = 0;
export const NUMBER_MAX = 99;

export type ChampionId = "pele" | "robben" | "henry" | "ballack";

export type Champion = {
  id: ChampionId;
  legendName: string;
  legendNumber: string;
  colorLabel: string;
  swatch: string;
  country: string;
  tagline: string;
  bio: string;
  frontSrc: string;
  /** Real photo of the tribute print — legend's name/number already baked in. */
  backSrc: string;
  /** Real nameless back photo — used for Blank mode and as the live-overlay plate in Custom mode. */
  blankBackSrc: string;
  /** Hall of Fame campaign card — editorial art, shown in its own section, not in the configurator. */
  cardSrc: string;
};

export const CHAMPIONS: Champion[] = [
  {
    id: "pele",
    legendName: "PELÉ",
    legendNumber: "10",
    colorLabel: "Garnet",
    swatch: "#5A1626",
    country: "Brazil",
    tagline: "The beauty of what's possible.",
    bio: "Pelé represents football at its most universal. He became a World Cup winner at 17 and remains the only player to win three World Cups. But the legacy goes beyond trophies: Pelé turned the No. 10 into a symbol of imagination, excellence and possibility. This jersey honors the player who helped make football a global language.",
    frontSrc: "/champions-pele-front.webp",
    backSrc: "/champions-pele-back.webp",
    blankBackSrc: "/champions-pele-back-blank.webp",
    cardSrc: "/champions-pele-card.jpg",
  },
  {
    id: "robben",
    legendName: "ROBBEN",
    legendNumber: "11",
    colorLabel: "Orange",
    swatch: "#E9821D",
    country: "Netherlands",
    tagline: "Power. Precision. Impact.",
    bio: "Arjen Robben built a career around one unmistakable idea: give him the ball and make him stop you. Pace, precision and relentless confidence defined his game. From the Netherlands to the biggest nights in European football, Robben made the No. 11 feel like an instrument of attack — direct, recognizable and impossible to ignore.",
    frontSrc: "/champions-robben-front.webp",
    backSrc: "/champions-robben-back.webp",
    blankBackSrc: "/champions-robben-back-blank.webp",
    cardSrc: "/champions-robben-card.jpg",
  },
  {
    id: "henry",
    legendName: "HENRY",
    legendNumber: "12",
    colorLabel: "Powder Blue",
    swatch: "#4AB5F8",
    country: "France",
    tagline: "Elegance. Strength. Leadership.",
    bio: "Thierry Henry made elegance look dangerous. His combination of speed, intelligence and finishing helped define a generation of football, from France's World Cup triumph to his dominance at club level. The No. 12 becomes a tribute to a player who showed that power doesn't always have to announce itself.",
    frontSrc: "/champions-henry-front.webp",
    backSrc: "/champions-henry-back.webp",
    blankBackSrc: "/champions-henry-back-blank.webp",
    cardSrc: "/champions-henry-card.jpg",
  },
  {
    id: "ballack",
    legendName: "BALLACK",
    legendNumber: "13",
    colorLabel: "Black",
    swatch: "#1C1817",
    country: "Germany",
    tagline: "Leadership. Passion. Legacy.",
    bio: "Michael Ballack represented a different kind of excellence — power, leadership and an instinct for the biggest moments. He won the Bundesliga and DFB-Pokal three times with Bayern Munich, completing three league-and-cup doubles between 2003 and 2006. At Chelsea, he added the Premier League, three FA Cups and the League Cup, while leading Germany as captain through a defining era of international football.",
    frontSrc: "/champions-ballack-front.webp",
    backSrc: "/champions-ballack-back.webp",
    blankBackSrc: "/champions-ballack-back-blank.webp",
    cardSrc: "/champions-ballack-card.jpg",
  },
];

export function championById(id: ChampionId): Champion {
  return CHAMPIONS.find((c) => c.id === id) ?? CHAMPIONS[0]!;
}

export type Mode = "tribute" | "blank" | "custom";

export const MODE_LABEL: Record<Mode, string> = {
  tribute: "Tribute",
  blank: "Blank",
  custom: "Custom",
};

/** Tribute (legend's exact print) > Custom (your name + number) > Blank (neither). */
export const TRIBUTE_PRICE = 148;
export const PRICE = 118;
export const PERSONALIZED_PRICE = 138;

export function priceFor(mode: Mode): number {
  if (mode === "tribute") return TRIBUTE_PRICE;
  if (mode === "custom") return PERSONALIZED_PRICE;
  return PRICE;
}

/**
 * Percentage-of-plate overlay geometry, used only in Blank/Custom mode
 * (Tribute renders the real baked-in print photo, no live overlay).
 *
 * These are not eyeballed. The tribute photos and the blank plates are
 * the same product shot — one printed, one not — so the tribute print's
 * painted ink box was measured, mapped into the blank plate's frame via
 * the garment bounding box, and the CSS was then calibrated by rendering
 * and re-measuring until the live overlay landed on that same box. See
 * the README. `name` and `number` carry their own `centerX` because the
 * plates are shot at a turned 3/4 angle, so the print centerline is not
 * one fixed x% down the whole plate.
 *
 * Every value is a percentage of the square plate: `y` is the top of the
 * text line box, `heightPct` is the font size, `maxWidthPct` is the
 * widest the painted name may get before it is scaled down to fit.
 */
export type JerseyLayout = {
  name: { centerX: number; y: number; heightPct: number; maxWidthPct: number; trackingEm: number };
  number: { centerX: number; y: number; heightPct: number; trackingEm: number };
};

export const JERSEY_LAYOUT: JerseyLayout = {
  name: { centerX: 50, y: 18.86, heightPct: 9.36, maxWidthPct: 34, trackingEm: 0.059 },
  number: { centerX: 50, y: 25.63, heightPct: 35.24, trackingEm: 0.088 },
};

/**
 * Real licensed-style jersey numeral/lettering face (the "France WC
 * Font" referenced in the reference deck), covering A–Z, 0–9, and
 * accented characters (é for PELÉ). Registered in styles.css via
 * @font-face. Default lettering face for the live overlay in
 * Blank/Custom mode — Tribute mode never uses it since that print is
 * already baked into the real photo.
 */
export const JERSEY_FONT_FAMILY = "'France WC 2026', 'Manrope', sans-serif";

export function sanitizeName(raw: string): string {
  return raw
    .normalize("NFC")
    .toLocaleUpperCase("und")
    .replace(/[^\p{L} \-']/gu, "")
    .slice(0, NAME_MAX);
}

export function sanitizeNumber(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 2);
}

export type BuildState = {
  championId: ChampionId;
  mode: Mode;
  name: string;
  number: string;
};

export const INITIAL_BUILD: BuildState = {
  championId: "pele",
  mode: "tribute",
  name: "",
  number: "",
};

export type FieldIssue = { field: string; message: string };

const BLOCKLIST = new Set(
  ["fuck", "shit", "asshole", "bitch", "cunt", "nigger", "faggot"].map((s) => s.toUpperCase()),
);

/** Only meaningful in Custom mode — Tribute and Blank have nothing to validate. */
export function validateBuild(input: { name: string; number: string }): FieldIssue[] {
  const issues: FieldIssue[] = [];
  const name = sanitizeName(input.name);
  if (name.length > 0 && !/^[\p{L}][\p{L} '\-]{0,14}$/u.test(name)) {
    issues.push({ field: "name", message: `Letters, space, hyphen, apostrophe only. Max ${NAME_MAX}.` });
  }
  if (BLOCKLIST.has(name.replace(/[\s'-]/g, ""))) {
    issues.push({ field: "name", message: "That name cannot be printed." });
  }
  if (input.number !== "") {
    if (!/^\d{1,2}$/.test(input.number)) {
      issues.push({ field: "number", message: "0–99 only." });
    } else {
      // No Parade F.C. prints zero-padded numbers (e.g. "07"), unlike
      // Bayonne Athletics — don't reject a leading zero here.
      const n = Number(input.number);
      if (n < NUMBER_MIN || n > NUMBER_MAX) {
        issues.push({ field: "number", message: "0–99." });
      }
    }
  }
  return issues;
}
