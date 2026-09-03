const HOURS_AND_MINUTES = /^(?:(\d+(?:[.,]\d+)?)\s*h)?\s*(?:(\d+)\s*m)?$/i;
const MINUTES_PER_HOUR = 60;

export function parseDuration(input: string): number | null {
  const value = input.trim().toLowerCase();
  if (!value) {
    return null;
  }

  if (/^\d+$/.test(value)) {
    const minutes = Number(value);
    return minutes > 0 ? minutes : null;
  }

  const match = HOURS_AND_MINUTES.exec(value);
  if (!match || (!match[1] && !match[2])) {
    return null;
  }

  const hours = match[1] ? Number(match[1].replace(',', '.')) : 0;
  const minutes = match[2] ? Number(match[2]) : 0;
  const total = Math.round(hours * MINUTES_PER_HOUR + minutes);
  return total > 0 ? total : null;
}

export function formatDuration(minutes: number): string {
  if (minutes <= 0) {
    return '0m';
  }

  const hours = Math.floor(minutes / MINUTES_PER_HOUR);
  const rest = minutes % MINUTES_PER_HOUR;

  if (hours === 0) {
    return `${rest}m`;
  }
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
}
