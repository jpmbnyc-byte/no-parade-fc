import type { CrestId } from "@/lib/kit";

/**
 * Placeholder crest badges — original line-art standing in for the real
 * crest artwork until No Parade F.C. supplies the licensed files. Same
 * shield outline, one distinguishing mark per crest, single gold ink.
 */
export function CrestBadge({ id, className }: { id: CrestId; className?: string }) {
  return (
    <svg viewBox="0 0 64 72" className={className} role="img" aria-label={`${id} crest`}>
      <path
        d="M32 2 L60 12 V34 C60 52 48 64 32 70 C16 64 4 52 4 34 V12 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M32 8 L54 16 V34 C54 48 44 58 32 63 C20 58 10 48 10 34 V16 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.5"
      />
      {id === "peace" ? (
        <path
          d="M20 34c4-6 12-8 18-4 3 2 4 6 2 9-3 4-9 5-14 2m10-11c2-4 6-6 10-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ) : null}
      {id === "heritage" ? (
        <>
          <path d="M32 20 V48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M32 24 C24 26 20 32 20 38 M32 24 C40 26 44 32 44 38" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M32 34 C25 36 22 41 22 46 M32 34 C39 36 42 41 42 46" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </>
      ) : null}
      {id === "grace" ? (
        <path d="M32 18 V50 M22 26 H42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      ) : null}
      {id === "club" ? (
        <circle cx="32" cy="36" r="12" fill="none" stroke="currentColor" strokeWidth="2" />
      ) : null}
      {id === "family" ? (
        <path
          d="M22 40c-3-4-2-9 2-11 3-2 6-1 8 2 2-3 5-4 8-2 4 2 5 7 2 11-3 4-10 9-10 9s-7-5-10-9Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      ) : null}
    </svg>
  );
}
