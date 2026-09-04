function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

const HEX_3_REGEX = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
const HEX_6_REGEX = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;

const COLOR_BLACK = '#000000';
const COLOR_WHITE = '#FFFFFF';
const LUMINANCE_THRESHOLD = 0.5;

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const fullHex = hex.replace(HEX_3_REGEX, (_, r, g, b) => r + r + g + g + b + b);
  const result = HEX_6_REGEX.exec(fullHex);

  return result
    ? {
        r: Number.parseInt(result[1], 16),
        g: Number.parseInt(result[2], 16),
        b: Number.parseInt(result[3], 16),
      }
    : null;
}

export function getContrastColor(backgroundColor: string): string {
  if (!backgroundColor) {
    return COLOR_BLACK;
  }

  const rgb = hexToRgb(backgroundColor);
  if (!rgb) {
    return COLOR_BLACK;
  }

  const luminance = getLuminance(rgb.r, rgb.g, rgb.b);

  return luminance > LUMINANCE_THRESHOLD ? COLOR_BLACK : COLOR_WHITE;
}
