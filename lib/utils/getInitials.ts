/**
 * Returns up to two uppercase initials from a full name.
 * Falls back to "?" if name is null/empty.
 *
 * getInitials("Amara Okonkwo") → "AO"
 * getInitials("Chidi")         → "C"
 * getInitials(null)            → "?"
 */
export function getInitials(name: string | null | undefined): string {
  if (!name?.trim()) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}
