import { describe, expect, it } from 'vitest';
import { argumentDrift, argumentsOf, bracesBalanced } from './icu';

describe('argumentsOf', () => {
  it('finds simple placeholders', () => {
    expect([...argumentsOf('{name} has {count} tasks')].sort()).toEqual(['count', 'name']);
  });

  it('reads a plural argument without its branches', () => {
    expect([...argumentsOf('{count, plural, one{# task} other{# tasks}}')]).toEqual(['count']);
  });

  it('returns nothing for a pattern with no arguments', () => {
    expect(argumentsOf('Project not found').size).toBe(0);
  });
});

describe('bracesBalanced', () => {
  it('accepts a balanced pattern', () => {
    expect(bracesBalanced('{count, plural, one{# task} other{# tasks}}')).toBe(true);
  });

  it('rejects an unclosed brace', () => {
    expect(bracesBalanced('{count, plural, one{')).toBe(false);
  });

  it('rejects a stray closing brace', () => {
    expect(bracesBalanced('tasks}')).toBe(false);
  });
});

describe('argumentDrift', () => {
  it('reports nothing when the arguments match', () => {
    expect(argumentDrift('{count} tasks left', 'Zostało {count} zadań')).toBeNull();
  });

  it('reports a renamed argument as both missing and unexpected', () => {
    expect(argumentDrift('{count} tasks', '{liczba} zadań')).toEqual({ missing: ['count'], unexpected: ['liczba'] });
  });

  it('reports a dropped argument', () => {
    expect(argumentDrift('{name} has {count} tasks', '{name} is busy')).toEqual({
      missing: ['count'],
      unexpected: [],
    });
  });

  it('compares nothing when the key ships no default for that language', () => {
    expect(argumentDrift(null, '{whatever}')).toBeNull();
  });
});
