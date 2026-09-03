const OPEN = '{';
const CLOSE = '}';
const ARGUMENT_NAME = /^\w+$/;

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

export function argumentDrift(defaultValue: string | null, candidate: string): ArgumentDrift | null {
  if (defaultValue === null) {
    return null;
  }

  const expected = argumentsOf(defaultValue);
  const actual = argumentsOf(candidate);
  const missing = [...expected].filter(name => !actual.has(name)).sort((a, b) => a.localeCompare(b));
  const unexpected = [...actual].filter(name => !expected.has(name)).sort((a, b) => a.localeCompare(b));

  return missing.length || unexpected.length ? { missing, unexpected } : null;
}
