import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a DoD-standard display name: RANK LAST, First MI
 * e.g. formatDisplayName("SGT", "Smith", "John", "A") → "SGT SMITH, John A"
 */
export function formatDisplayName(
  rank: string,
  lastName: string,
  firstName: string,
  mi?: string,
): string {
  const r = rank.trim();
  const l = lastName.trim().toUpperCase();
  const f = firstName.trim();
  const m = mi ? mi.trim().toUpperCase() : "";

  if (!l && !f) return r || "";

  const namePart = l && f ? `${l}, ${f}${m ? ` ${m}` : ""}` : l || f;
  return r ? `${r} ${namePart}` : namePart;
}

/**
 * Parses a DoD-standard display name back into components.
 * Accepts formats like "SGT SMITH, John A" or "SMITH, John A" or "John Smith"
 */
export function parseDisplayName(displayName: string): {
  rank: string;
  lastName: string;
  firstName: string;
  mi: string;
} {
  const name = displayName.trim();

  // Try "RANK LAST, First MI" format
  const commaIdx = name.indexOf(",");
  if (commaIdx !== -1) {
    const beforeComma = name.slice(0, commaIdx).trim();
    const afterComma = name.slice(commaIdx + 1).trim();

    // beforeComma is either "RANK LAST" or just "LAST"
    const beforeParts = beforeComma.split(/\s+/);
    let rank = "";
    let lastName = "";

    if (beforeParts.length >= 2) {
      // Assume first token is rank if it looks like one (all caps, short)
      rank = beforeParts[0];
      lastName = beforeParts.slice(1).join(" ");
    } else {
      lastName = beforeParts[0] ?? "";
    }

    // afterComma is "First MI" or "First"
    const afterParts = afterComma.split(/\s+/);
    const firstName = afterParts[0] ?? "";
    const mi = afterParts[1] ?? "";

    return { rank, lastName, firstName, mi };
  }

  // Fallback: treat as "First Last" with no rank
  const parts = name.split(/\s+/);
  return {
    rank: "",
    lastName: parts[parts.length - 1] ?? "",
    firstName: parts[0] ?? "",
    mi: "",
  };
}
