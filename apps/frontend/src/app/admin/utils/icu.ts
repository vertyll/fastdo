const OPEN = '{';
const CLOSE = '}';
const ARGUMENT_NAME = /^[A-Za-z0-9_]+$/;

/**
 * Names of the arguments an ICU pattern feeds, e.g. `{count}` and `{name}` in
 * `{name} has {count} tasks`. Nested plural and select branches are walked, so
 * `{count, plural, one{# task} other{# tasks}}` yields just `count`.
 */
export function argumentsOf(pattern: string): Set<string> {
  const found = new Set<string>();
  let depth = 0;

  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] === CLOSE) {
      depth = Math.max(0, depth - 1);
      continue;
    }
    if (pattern[i] !== OPEN) {
      continue;
    }

    depth++;
    let end = i + 1;
    while (end < pattern.length && pattern[end] !== CLOSE && pattern[end] !== ',') {
      end++;
    }
    const name = pattern.slice(i + 1, end).trim();
    if (ARGUMENT_NAME.test(name)) {
      found.add(name);
    }
  }

  return found;
}

/** True when every brace is closed in order. */
export function bracesBalanced(pattern: string): boolean {
  let depth = 0;
  for (const char of pattern) {
    if (char === OPEN) {
      depth++;
    } else if (char === CLOSE) {
      depth--;
      if (depth < 0) {
        return false;
      }
    }
  }
  return depth === 0;
}

export type ArgumentDrift = {
  missing: string[];
  unexpected: string[];
};

/**
 * How a candidate translation departs from the arguments of the shipped default.
 * `null` when they match, or when there is no default to compare against.
 */
export function argumentDrift(defaultValue: string | null, candidate: string): ArgumentDrift | null {
  if (defaultValue === null) {
    return null;
  }

  const expected = argumentsOf(defaultValue);
  const actual = argumentsOf(candidate);
  const missing = [...expected].filter(name => !actual.has(name)).sort();
  const unexpected = [...actual].filter(name => !expected.has(name)).sort();

  return missing.length || unexpected.length ? { missing, unexpected } : null;
}
