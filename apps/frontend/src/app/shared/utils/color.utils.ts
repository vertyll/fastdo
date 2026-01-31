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

/**
 * Converts hex color to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
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
    return '#000000';
  }

  const rgb = hexToRgb(backgroundColor);
  if (!rgb) {
    return '#000000';
  }

  const luminance = getLuminance(rgb.r, rgb.g, rgb.b);

  // If luminance is greater than 0.5, use black text, otherwise use white
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
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

  const hex = color.replace('#', '');
  const alpha = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0');

  return `#${hex}${alpha}`;
}
