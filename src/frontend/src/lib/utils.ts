import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a DoD-standard display name: RANK LAST, First MI
 * e.g. formatDisplayName("First Sergeant (1SG)", "Gracie", "Nicholas", "J")
 *   => "1SG GRACIE, Nicholas J"
 */
export function formatDisplayName(
  rank: string,
  lastName: string,
  firstName: string,
  mi: string,
): string {
  // Extract abbreviation from rank string, e.g. "First Sergeant (1SG)" -> "1SG"
  const abbrevMatch = rank.match(/\(([^)]+)\)$/);
  const rankAbbrev = abbrevMatch ? abbrevMatch[1] : rank;

  const last = lastName.trim().toUpperCase();
  const first = firstName.trim();
  const middle = mi.trim().toUpperCase();

  if (!last && !first) return rankAbbrev ? rankAbbrev : "";

  const namePart =
    last && first
      ? `${last}, ${first}${middle ? ` ${middle}` : ""}`
      : last || first;

  return rankAbbrev ? `${rankAbbrev} ${namePart}` : namePart;
}

/**
 * Parse a DoD-standard display name back into components.
 * Handles formats like "1SG SMITH, John A" or "SGT JONES, Mary"
 */
export function parseDisplayName(displayName: string): {
  rank: string;
  lastName: string;
  firstName: string;
  mi: string;
} {
  const trimmed = displayName.trim();

  // Try to match "RANK LAST, First MI" or "RANK LAST, First"
  const match = trimmed.match(/^(\S+)\s+([^,]+),\s+(\S+)(?:\s+(\S))?$/);
  if (match) {
    return {
      rank: match[1] ?? "",
      lastName: match[2]?.trim() ?? "",
      firstName: match[3]?.trim() ?? "",
      mi: match[4]?.trim() ?? "",
    };
  }

  // Fallback: just return the whole thing as lastName
  return { rank: "", lastName: trimmed, firstName: "", mi: "" };
}
