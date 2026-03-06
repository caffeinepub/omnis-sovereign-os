import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a DoD-standard display name: RANK LAST, First MI
 * e.g. formatDisplayName("SGT", "Smith", "John", "A") → "SGT SMITH, John A"
 */
export function formatDisplayName(
  rank: string,
  lastName: string,
  firstName: string,
  mi?: string,
): string {
  const parts: string[] = [];
  if (rank?.trim()) parts.push(rank.trim().toUpperCase());
  const last = lastName?.trim().toUpperCase();
  const first = firstName?.trim();
  if (last && first) {
    parts.push(
      `${last}, ${first}${mi?.trim() ? ` ${mi.trim().toUpperCase()}` : ""}`,
    );
  } else if (last) {
    parts.push(last);
  } else if (first) {
    parts.push(first);
  }
  return parts.join(" ");
}

/**
 * Parse a formatted display name back into components.
 * Handles "RANK LAST, First MI" or fallback plain strings.
 */
export function parseDisplayName(displayName: string): {
  rank: string;
  lastName: string;
  firstName: string;
  mi: string;
} {
  if (!displayName?.trim()) {
    return { rank: "", lastName: "", firstName: "", mi: "" };
  }

  // Try to match "RANK LAST, First MI" pattern
  // Rank is one all-caps word (2-4 chars typical), then "LAST, First [MI]"
  const commaIdx = displayName.indexOf(",");
  if (commaIdx !== -1) {
    const beforeComma = displayName.slice(0, commaIdx).trim();
    const afterComma = displayName.slice(commaIdx + 1).trim();

    // beforeComma = "RANK LAST" or just "LAST"
    const beforeParts = beforeComma.split(/\s+/);
    let rank = "";
    let lastName = "";
    if (beforeParts.length >= 2) {
      rank = beforeParts[0];
      lastName = beforeParts.slice(1).join(" ");
    } else {
      lastName = beforeParts[0] ?? "";
    }

    // afterComma = "First MI" or "First"
    const afterParts = afterComma.split(/\s+/);
    const firstName = afterParts[0] ?? "";
    const mi = afterParts[1] ?? "";

    return { rank, lastName, firstName, mi };
  }

  // Fallback: no comma, treat as plain name
  return { rank: "", lastName: "", firstName: displayName.trim(), mi: "" };
}
