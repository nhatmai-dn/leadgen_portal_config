/** Batch dates are plain `YYYYMMDD` strings — no timezone, no Date round-trip. */

// ----------------------------------------------------------------------

export function formatBatchDate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}${month}${day}`;
}

/**
 * The most recent Sunday, counting today as Sunday when it is one.
 * Batches are cut weekly on Sunday, so this is the default batch date.
 */
export function mostRecentSunday(from: Date = new Date()): Date {
  const date = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  date.setDate(date.getDate() - date.getDay());

  return date;
}

export function defaultBatchDate(from: Date = new Date()): string {
  return formatBatchDate(mostRecentSunday(from));
}

const BATCH_DATE_PATTERN = /^\d{8}$/;

/** Rejects both malformed strings and impossible dates such as 20260231. */
export function isValidBatchDate(value: string): boolean {
  if (!BATCH_DATE_PATTERN.test(value)) return false;

  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(4, 6));
  const day = Number(value.slice(6, 8));
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
  );
}
