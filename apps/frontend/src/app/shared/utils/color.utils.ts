/**
 * Calculates the relative luminance of a color
 * Based on WCAG 2.0 formula
 */
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
const MAX_COLOR_VALUE = 255;

/**
 * Converts hex color to RGB values
 */
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

/**
 * Determines whether to use black or white text on a given background color
 * for optimal contrast and readability
 * @param backgroundColor - Hex color string (e.g., '#FF5733')
 * @returns '#000000' for black text or '#FFFFFF' for white text
 */
export function getContrastColor(backgroundColor: string): string {
  if (!backgroundColor) {
    return COLOR_BLACK;
  }

  const rgb = hexToRgb(backgroundColor);
  if (!rgb) {
    return COLOR_BLACK;
  }

  const luminance = getLuminance(rgb.r, rgb.g, rgb.b);

  // If luminance is greater than threshold, use black text, otherwise use white
  return luminance > LUMINANCE_THRESHOLD ? COLOR_BLACK : COLOR_WHITE;
}

/**
 * Creates a semi-transparent version of a hex color
 * @param color - Hex color string (e.g., '#FF5733')
 * @param opacity - Opacity value between 0 and 1 (default: 0.2)
 * @returns Hex color with opacity in format '#RRGGBBAA'
 */
export function addOpacity(color: string, opacity: number = 0.2): string {
  if (!color) {
    return color;
  }

  const fullHex = color.replace(HEX_3_REGEX, (_, r, g, b) => r + r + g + g + b + b);
  const cleanHex = fullHex.replace('#', '');

  const alpha = Math.round(opacity * MAX_COLOR_VALUE)
    .toString(16)
    .padStart(2, '0');

  return `#${cleanHex}${alpha}`;
}
