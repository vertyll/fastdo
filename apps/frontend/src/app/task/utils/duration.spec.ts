import { describe, expect, it } from 'vitest';
import { formatDuration, parseDuration } from './duration';

describe('parseDuration', () => {
  it('reads a bare number as minutes', () => {
    expect(parseDuration('90')).toBe(90);
  });

  it('reads hours and minutes together', () => {
    expect(parseDuration('1h 30m')).toBe(90);
    expect(parseDuration('2h')).toBe(120);
    expect(parseDuration('45m')).toBe(45);
  });

  it('accepts fractional hours with either separator', () => {
    expect(parseDuration('1.5h')).toBe(90);
    expect(parseDuration('1,5h')).toBe(90);
  });

  it('ignores case and surrounding space', () => {
    expect(parseDuration('  2H 15M ')).toBe(135);
  });

  it('rejects anything that is not a duration', () => {
    expect(parseDuration('')).toBeNull();
    expect(parseDuration('abc')).toBeNull();
    expect(parseDuration('0')).toBeNull();
    expect(parseDuration('0h 0m')).toBeNull();
    expect(parseDuration('1d')).toBeNull();
  });
});

describe('formatDuration', () => {
  it('drops the part that is zero', () => {
    expect(formatDuration(120)).toBe('2h');
    expect(formatDuration(45)).toBe('45m');
    expect(formatDuration(90)).toBe('1h 30m');
  });

  it('renders nothing logged as zero minutes', () => {
    expect(formatDuration(0)).toBe('0m');
  });

  it('round-trips what parseDuration produced', () => {
    expect(parseDuration(formatDuration(135))).toBe(135);
  });
});
