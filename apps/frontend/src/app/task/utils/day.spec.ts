import { describe, expect, it } from 'vitest';
import { toIsoDay } from './day';

describe('toIsoDay', () => {
  it('keeps the local calendar day, not the UTC one', () => {
    const lateEvening = new Date(2026, 8, 2, 23, 30);

    expect(toIsoDay(lateEvening)).toBe('2026-09-02');
  });

  it('pads month and day', () => {
    expect(toIsoDay(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('accepts a string it can round-trip', () => {
    expect(toIsoDay('2026-12-31')).toBe('2026-12-31');
  });
});
