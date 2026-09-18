import { it, expect, describe } from 'vitest';

import { formatBatchDate, defaultBatchDate, isValidBatchDate, mostRecentSunday } from './batch-date';

// ----------------------------------------------------------------------

describe('batch date', () => {
  it('formats as YYYYMMDD with zero padding', () => {
    expect(formatBatchDate(new Date(2026, 0, 4))).toBe('20260104');
  });

  it('walks back to the previous Sunday', () => {
    // 2026-09-17 is a Thursday; the Sunday before is the 13th.
    expect(defaultBatchDate(new Date(2026, 8, 17))).toBe('20260913');
  });

  it('treats a Sunday as its own batch date', () => {
    expect(defaultBatchDate(new Date(2026, 8, 13))).toBe('20260913');
  });

  it('crosses a month boundary correctly', () => {
    // 2026-10-01 is a Thursday; the Sunday before falls in September.
    expect(defaultBatchDate(new Date(2026, 9, 1))).toBe('20260927');
  });

  it('returns a date at midnight local time', () => {
    const sunday = mostRecentSunday(new Date(2026, 8, 17, 23, 59));
    expect(sunday.getHours()).toBe(0);
    expect(sunday.getMinutes()).toBe(0);
  });

  it.each(['20260913', '20260101', '20261231'])('accepts %s', (value) => {
    expect(isValidBatchDate(value)).toBe(true);
  });

  it.each(['2026091', '2026-09-13', '20261301', '20260231', '', 'abcdefgh'])(
    'rejects %s',
    (value) => {
      expect(isValidBatchDate(value)).toBe(false);
    }
  );
});
