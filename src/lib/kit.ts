/**
 * Single source of truth for Build Your Crest™ geometry, pricing, and
 * field limits — same "one geometry source" pattern as Bayonne Athletics'
 * src/lib/kit.ts, adapted for No Parade F.C.'s extra crest/motto fields.
 */

export const NAME_MAX = 12;
export const NUMBER_MIN = 0;
export const NUMBER_MAX = 99;
export const YEAR_LEN = 4;
export const CREST_INITIALS_MAX = 4;
export const MOTTO_MAX = 28;
export const HERITAGE_MAX = 24;

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

export type CrestId = "peace" | "heritage" | "grace" | "club" | "family";

export type CrestOption = {
  id: CrestId;
  label: string;
  meaning: string;
};

export const CRESTS: CrestOption[] = [
  { id: "peace", label: "Peace Crest", meaning: "For calm resistance." },
  { id: "heritage", label: "Heritage Crest", meaning: "For where you come from." },
  { id: "grace", label: "Grace Crest", meaning: "For what carries you." },
  { id: "club", label: "Club Crest", meaning: "For belonging without conformity." },
  { id: "family", label: "Family Crest", meaning: "For the name behind the name." },
];

export type KitId = "clean" | "crest";

export const KIT_PRICING: Record<KitId, number> = {
  clean: 118,
  crest: 148,
};

export const KIT_LABEL: Record<KitId, string> = {
  clean: "Clean Kit",
  crest: "Build Your Crest™ Kit",
};

/** Percentage-based overlay geometry on the blank jersey plate — mirrors Bayonne's LetteringLayout. */
export type CrestLayout = {
  centerX: number;
  name: { y: number; heightPct: number; maxWidthPct: number };
  number: { y: number; heightPct: number; maxWidthPct: number };
  numberFront: { y: number; heightPct: number; maxWidthPct: number };
  year: { y: number; heightPct: number };
  motto: { y: number; heightPct: number };
  heritage: { y: number; heightPct: number };
  crestBadge: { x: number; y: number; widthPct: number };
};

/**
 * PLACEHOLDER geometry, tuned against the France Edition reference mock,
 * not a verified blank plate. Re-tune every field once real blank
 * front/back photography exists — see README "Pending assets".
 */
export const CREST_LAYOUT: CrestLayout = {
  centerX: 50,
  name: { y: 16, heightPct: 6, maxWidthPct: 70 },
  number: { y: 24, heightPct: 26, maxWidthPct: 50 },
  numberFront: { y: 46, heightPct: 12, maxWidthPct: 30 },
  year: { y: 54, heightPct: 3.2 },
  motto: { y: 84, heightPct: 3.6 },
  heritage: { y: 89, heightPct: 2.8 },
  crestBadge: { x: 28, y: 20, widthPct: 12 },
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

export function sanitizeYear(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, YEAR_LEN);
}

export function sanitizeFreeText(raw: string, maxChars: number): string {
  return raw.replace(/[<>]/g, "").slice(0, maxChars);
}

export type BuildState = {
  kitId: KitId;
  nation: NationId;
  name: string;
  number: string;
  year: string;
  crestId: CrestId | null;
  crestInitials: string;
  motto: string;
  heritage: string;
};

export const INITIAL_BUILD: BuildState = {
  kitId: "crest",
  nation: "france",
  name: "",
  number: "",
  year: "",
  crestId: "peace",
  crestInitials: "",
  motto: "",
  heritage: "",
};

export type FieldIssue = { field: string; message: string };

const BLOCKLIST = new Set(
  ["fuck", "shit", "asshole", "bitch", "cunt", "nigger", "faggot"].map((s) => s.toUpperCase()),
);

export function validateBuild(input: {
  name: string;
  number: string;
  year: string;
}): FieldIssue[] {
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
  if (input.year !== "" && input.year.length !== YEAR_LEN) {
    issues.push({ field: "year", message: "4 digits, e.g. 2025." });
  }
  return issues;
}
