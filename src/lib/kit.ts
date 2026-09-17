/**
 * Single source of truth for jersey personalization geometry, pricing,
 * and field limits — same "one geometry source" pattern as Bayonne
 * Athletics' src/lib/kit.ts, and the same standard name/number fields
 * (no crest, motto, or heritage line — that flow was retired in favor
 * of Bayonne's real working setup).
 */

export const NAME_MAX = 12;
export const NUMBER_MIN = 0;
export const NUMBER_MAX = 99;

export type NationId = "france" | "jamaica" | "haiti" | "usa";

export type Nation = {
  id: NationId;
  label: string;
  flagEmoji: string;
  unlocked: boolean;
};

export const NATIONS: Nation[] = [
  { id: "france", label: "France Edition", flagEmoji: "🇫🇷", unlocked: true },
  { id: "jamaica", label: "Jamaica Edition", flagEmoji: "🇯🇲", unlocked: false },
  { id: "haiti", label: "Haiti Edition", flagEmoji: "🇭🇹", unlocked: false },
  { id: "usa", label: "USA Edition", flagEmoji: "🇺🇸", unlocked: false },
];

/** Blank jersey vs. name + number added — same differential as Bayonne's PDP. */
export const PRICE = 118;
export const PERSONALIZED_PRICE = 138;

/** Percentage-based overlay geometry on the blank jersey plate — mirrors Bayonne's LetteringLayout. */
export type JerseyLayout = {
  centerX: number;
  name: { y: number; heightPct: number; maxWidthPct: number };
  number: { y: number; heightPct: number; maxWidthPct: number };
  numberFront: { y: number; heightPct: number; maxWidthPct: number };
};

/**
 * PLACEHOLDER geometry, tuned against the France Edition reference mock,
 * not a verified blank plate. Re-tune every field once real blank
 * front/back photography exists — see README "Pending assets".
 */
export const JERSEY_LAYOUT: JerseyLayout = {
  centerX: 50,
  name: { y: 16, heightPct: 6, maxWidthPct: 70 },
  number: { y: 24, heightPct: 26, maxWidthPct: 50 },
  numberFront: { y: 46, heightPct: 12, maxWidthPct: 30 },
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
  nation: NationId;
  name: string;
  number: string;
};

export const INITIAL_BUILD: BuildState = {
  nation: "france",
  name: "",
  number: "",
};

export type FieldIssue = { field: string; message: string };

const BLOCKLIST = new Set(
  ["fuck", "shit", "asshole", "bitch", "cunt", "nigger", "faggot"].map((s) => s.toUpperCase()),
);

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
