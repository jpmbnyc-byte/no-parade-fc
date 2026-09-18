/**
 * Single source of truth for The Champions collection: the four legend
 * colorways, pricing per mode, and personalization field limits. Nation
 * architecture (France/Jamaica/Haiti/USA editions) is retired entirely —
 * see "THE CHAMPIONS by No Parade FC" for the collection this replaces
 * it with: four fixed colorways (Pelé/Garnet, Robben/Orange, Henry/Powder
 * Blue, Reyna/Black), each sold three ways — Tribute (the legend's exact
 * name + number, not editable), Blank (no name or number), or Custom
 * (your own name + number, same personalization engine as before).
 */

export const NAME_MAX = 12;
export const NUMBER_MIN = 0;
export const NUMBER_MAX = 99;

export type ChampionId = "pele" | "robben" | "henry" | "reyna";

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
    frontSrc: "/champions-pele-front.jpg",
    backSrc: "/champions-pele-back.jpg",
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
    frontSrc: "/champions-robben-front.jpg",
    backSrc: "/champions-robben-back.jpg",
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
    frontSrc: "/champions-henry-front.jpg",
    backSrc: "/champions-henry-back.jpg",
  },
  {
    id: "reyna",
    legendName: "REYNA",
    legendNumber: "13",
    colorLabel: "Black",
    swatch: "#1C1817",
    country: "USA",
    tagline: "Vision. Intelligence. Influence.",
    bio: "Claudio Reyna represented a different kind of excellence — control, vision and intelligence. A central figure for the United States across a major era of international football, he helped establish a standard for American players competing on the world stage. No. 13 becomes a marker of influence: the player who could change a match without needing to dominate the spotlight.",
    frontSrc: "/champions-reyna-front.jpg",
    backSrc: "/champions-reyna-back.jpg",
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
 * Percentage-based overlay geometry on the blank jersey plate — mirrors
 * Bayonne Athletics' LetteringLayout. Only used in Blank/Custom mode
 * (Tribute mode renders the real baked-in photo, no live overlay).
 * PLACEHOLDER geometry, tuned by eye against the real tribute back
 * photos in this collection — not a verified blank plate, since no
 * nameless back photo exists yet for any of the four colorways. See
 * README "Pending assets".
 */
export type JerseyLayout = {
  centerX: number;
  name: { y: number; heightPct: number; maxWidthPct: number };
  number: { y: number; heightPct: number; maxWidthPct: number };
};

export const JERSEY_LAYOUT: JerseyLayout = {
  centerX: 50,
  name: { y: 15, heightPct: 6, maxWidthPct: 70 },
  number: { y: 24, heightPct: 30, maxWidthPct: 50 },
};

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
  if (name.length > 0 && !/^[\p{L}][\p{L} '\-]{0,11}$/u.test(name)) {
    issues.push({ field: "name", message: "Letters, space, hyphen, apostrophe only. Max 12." });
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
