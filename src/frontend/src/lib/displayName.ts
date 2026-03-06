/**
 * DoD-standard name formatting utilities.
 * Format: RANK LAST, First MI
 * Example: SGT SMITH, John A
 */

export function formatDisplayName(
  rank: string,
  lastName: string,
  firstName: string,
  mi: string,
): string {
  const last = lastName.trim().toUpperCase();
  const first = firstName.trim();
  const middle = mi.trim().toUpperCase();
  const r = rank.trim();

  if (!last && !first) return r;

  const namePart = last
    ? `${last}, ${first}${middle ? ` ${middle}` : ""}`
    : first;

  return r ? `${r} ${namePart}` : namePart;
}

export function parseDisplayName(displayName: string): {
  rank: string;
  lastName: string;
  firstName: string;
  mi: string;
} {
  // Expected format: "RANK LAST, First MI" or "RANK LAST, First" or "LAST, First MI"
  const name = displayName.trim();

  // Try to find comma separator (Last, First pattern)
  const commaIdx = name.indexOf(",");
  if (commaIdx === -1) {
    // No comma — treat whole thing as name with possible rank prefix
    return { rank: "", lastName: "", firstName: name, mi: "" };
  }

  const beforeComma = name.slice(0, commaIdx).trim(); // e.g. "SGT SMITH" or "SMITH"
  const afterComma = name.slice(commaIdx + 1).trim(); // e.g. "John A" or "John"

  // Parse first + MI from after comma
  const afterParts = afterComma.split(/\s+/).filter(Boolean);
  const firstName = afterParts[0] ?? "";
  const mi = afterParts[1]?.length === 1 ? afterParts[1] : "";

  // Parse rank + lastName from before comma
  // Common enlisted/officer ranks that might appear as prefix
  const beforeParts = beforeComma.split(/\s+/).filter(Boolean);
  if (beforeParts.length === 1) {
    return { rank: "", lastName: beforeParts[0] ?? "", firstName, mi };
  }

  // Heuristic: last token is lastName, everything before is rank
  const lastName = beforeParts[beforeParts.length - 1] ?? "";
  const rank = beforeParts.slice(0, -1).join(" ");

  return { rank, lastName, firstName, mi };
}
