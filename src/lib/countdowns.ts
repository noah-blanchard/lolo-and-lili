/**
 * Pure date-math for countdowns. All UTC to match how dates are stored and so
 * both partners compute identically regardless of device timezone.
 */

/** The next time this date occurs (today or later). Non-recurring = the date itself. */
export function nextOccurrence(dateISO: string, recurring: boolean, from: Date = new Date()): Date {
  const [y, m, d] = dateISO.split("-").map(Number);
  if (!recurring) return new Date(Date.UTC(y, m - 1, d));

  const today = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()));
  let occ = new Date(Date.UTC(today.getUTCFullYear(), m - 1, d));
  if (occ.getTime() < today.getTime()) {
    occ = new Date(Date.UTC(today.getUTCFullYear() + 1, m - 1, d));
  }
  return occ;
}

/** Whole days from `from` to `target` (0 = today). */
export function daysUntil(target: Date, from: Date = new Date()): number {
  const t = Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate());
  const f = Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate());
  return Math.round((t - f) / 86_400_000);
}

/** How many years the recurring occurrence marks (e.g. an anniversary count). */
export function yearsAt(dateISO: string, occurrence: Date): number {
  const startYear = Number(dateISO.slice(0, 4));
  return occurrence.getUTCFullYear() - startYear;
}
