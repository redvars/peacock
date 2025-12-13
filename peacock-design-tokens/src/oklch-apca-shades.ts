/**
 * OKLCH APCA Color Shades Generator
 *
 * A TypeScript library for generating perceptually uniform color shades using OKLCH color space
 * with APCA (Accessible Perceptual Contrast Algorithm) contrast calculations.
 *
 * @module oklch-apca-shades
 * @version 1.0.0
 *
 * @description
 * This library provides utilities to:
 * - Convert between color spaces (Hex, RGB, OKLCH)
 * - Generate 11 perceptually uniform color shades (50-950) from a base color
 * - Calculate APCA contrast ratios for accessibility
 * - Determine optimal text colors for backgrounds
 *
 * @example
 * ```typescript
 * import { generateColorShades } from './oklch-apca-shades';
 *
 * const shades = generateColorShades('#3b82f6');
 * console.log(shades[500]); // Base color with full metadata
 * console.log(shades[900].textColor); // Optimal text color for shade 900
 * ```
 */

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * RGB color representation with values in 0-1 range
 */
interface RGB {
  r: number;
  g: number;
  b: number;
}

/**
 * RGB color representation with values in 0-255 range
 */
interface RGB255 {
  r: number;
  g: number;
  b: number;
}

/**
 * OKLCH color representation
 * @property L - Lightness (0-1)
 * @property C - Chroma (0+)
 * @property h - Hue (0-360 degrees)
 */
interface OKLCH {
  L: number;
  C: number;
  h: number;
}

/**
 * APCA contrast values against white and black backgrounds
 * @property onWhite - Contrast value when used on white background
 * @property onBlack - Contrast value when used on black background
 */
interface APCAContrast {
  onWhite: number;
  onBlack: number;
}

/**
 * Usage categories for different color weights
 */
type UsageCategory = 'backgrounds' | 'borders' | 'primary' | 'text';

/**
 * Complete color shade information
 */
interface ColorShade {
  /** Hexadecimal color value (e.g., "#3b82f6") */
  hex: string;
  /** RGB values in 0-255 range */
  rgb: RGB255;
  /** OKLCH color space values */
  oklch: OKLCH;
  /** APCA contrast ratios */
  apca: APCAContrast;
  /** Recommended text color (black or white) for this background */
  textColor: string;
  /** Suggested usage category based on weight */
  usage: UsageCategory;
}

/**
 * Weight keys for color shades (50, 100, 200, ..., 950)
 */
type ShadeWeight = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;

/**
 * Complete color palette with all shade weights
 */
type ColorShades = Record<ShadeWeight, ColorShade>;

// ============================================================================
// Color Space Conversion Functions
// ============================================================================

/**
 * Converts a hexadecimal color string to RGB values (0-1 range)
 *
 * @param hex - Hexadecimal color string (with or without # prefix)
 * @returns RGB object with values 0-1, or null if invalid hex
 *
 * @example
 * ```typescript
 * hexToRgb('#3b82f6') // { r: 0.231, g: 0.510, b: 0.965 }
 * hexToRgb('3b82f6')  // { r: 0.231, g: 0.510, b: 0.965 }
 * ```
 */
function hexToRgb(hex: string): RGB | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  } : null;
}

/**
 * Converts sRGB color component to linear RGB
 *
 * @param c - sRGB color component (0-1)
 * @returns Linear RGB value (0-1)
 */
function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/**
 * Converts linear RGB color component to sRGB
 *
 * @param c - Linear RGB component (0-1)
 * @returns sRGB value (0-1)
 */
function linearToSrgb(c: number): number {
  return c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

/**
 * Converts RGB color to OKLCH color space
 *
 * OKLCH is a perceptually uniform color space that better represents
 * how humans perceive color differences.
 *
 * @param r - Red component (0-1)
 * @param g - Green component (0-1)
 * @param b - Blue component (0-1)
 * @returns OKLCH color representation
 *
 * @example
 * ```typescript
 * rgbToOklch(0.231, 0.510, 0.965) // { L: 0.621, C: 0.178, h: 264.5 }
 * ```
 */
function rgbToOklch(r: number, g: number, b: number): OKLCH {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);

  const l_ = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m_ = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s_ = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  const l = Math.cbrt(l_);
  const m = Math.cbrt(m_);
  const s = Math.cbrt(s_);

  const L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
  const b_ = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;

  const C = Math.sqrt(a * a + b_ * b_);
  const h = Math.atan2(b_, a) * 180 / Math.PI;

  return { L, C, h: h < 0 ? h + 360 : h };
}

/**
 * Converts OKLCH color to RGB color space
 *
 * @param L - Lightness (0-1)
 * @param C - Chroma (0+)
 * @param h - Hue (0-360 degrees)
 * @returns RGB object with clamped values (0-1)
 *
 * @example
 * ```typescript
 * oklchToRgb(0.621, 0.178, 264.5) // { r: 0.231, g: 0.510, b: 0.965 }
 * ```
 */
function oklchToRgb(L: number, C: number, h: number): RGB {
  const hRad = h * Math.PI / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);

  const l = L + 0.3963377774 * a + 0.2158037573 * b;
  const m = L - 0.1055613458 * a - 0.0638541728 * b;
  const s = L - 0.0894841775 * a - 1.2914855480 * b;

  const l_ = l * l * l;
  const m_ = m * m * m;
  const s_ = s * s * s;

  const lr = +4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_;
  const lg = -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_;
  const lb = -0.0041960863 * l_ - 0.7034186147 * m_ + 1.7076147010 * s_;

  const r = linearToSrgb(lr);
  const g = linearToSrgb(lg);
  const b_ = linearToSrgb(lb);

  return {
    r: Math.max(0, Math.min(1, r)),
    g: Math.max(0, Math.min(1, g)),
    b: Math.max(0, Math.min(1, b_))
  };
}

/**
 * Converts RGB values to hexadecimal color string
 *
 * @param r - Red component (0-1)
 * @param g - Green component (0-1)
 * @param b - Blue component (0-1)
 * @returns Hexadecimal color string with # prefix
 *
 * @example
 * ```typescript
 * rgbToHex(0.231, 0.510, 0.965) // "#3b82f6"
 * ```
 */
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number): string => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// ============================================================================
// APCA Contrast Calculation
// ============================================================================

/**
 * Calculates APCA (Accessible Perceptual Contrast Algorithm) contrast
 *
 * APCA is a modern contrast algorithm that better predicts perceived contrast
 * than WCAG 2.x contrast ratios. It's part of WCAG 3.0 (Silver).
 *
 * @param txtColor - Text color as hex string
 * @param bgColor - Background color as hex string
 * @returns APCA contrast value (0-100+)
 *
 * @see {@link https://www.myndex.com/APCA/}
 *
 * @example
 * ```typescript
 * calculateAPCA('#000000', '#ffffff') // ~106 (high contrast)
 * calculateAPCA('#777777', '#ffffff') // ~40 (low contrast)
 * ```
 */
function calculateAPCA(txtColor: string, bgColor: string): number {
  const txtRgb = hexToRgb(txtColor);
  const bgRgb = hexToRgb(bgColor);

  if (!txtRgb || !bgRgb) {
    return 0;
  }

  const txtY = srgbToLinear(txtRgb.r) * 0.2126729 +
               srgbToLinear(txtRgb.g) * 0.7151522 +
               srgbToLinear(txtRgb.b) * 0.0721750;
  const bgY = srgbToLinear(bgRgb.r) * 0.2126729 +
              srgbToLinear(bgRgb.g) * 0.7151522 +
              srgbToLinear(bgRgb.b) * 0.0721750;

  const normBg = bgY > 0.022 ? bgY : bgY + Math.pow(0.022 - bgY, 1.414);
  const normTxt = txtY > 0.022 ? txtY : txtY + Math.pow(0.022 - txtY, 1.414);

  let contrast = 0;
  if (normBg > normTxt) {
    contrast = (Math.pow(normBg, 0.56) - Math.pow(normTxt, 0.57)) * 1.14;
  } else {
    contrast = (Math.pow(normBg, 0.65) - Math.pow(normTxt, 0.62)) * 1.14;
  }

  return Math.abs(contrast) * 100;
}

/**
 * Determines the best text color (black or white) for a given background color
 * based on APCA contrast calculations
 *
 * @param bgColorHex - Background color as hex string
 * @returns Either '#ffffff' (white) or '#000000' (black)
 *
 * @example
 * ```typescript
 * getBestTextColor('#3b82f6') // "#ffffff" (white on blue)
 * getBestTextColor('#fbbf24') // "#000000" (black on yellow)
 * ```
 */
function getBestTextColor(bgColorHex: string): string {
  const apcaOnWhite = Math.abs(calculateAPCA('#ffffff', bgColorHex));
  const apcaOnBlack = Math.abs(calculateAPCA('#000000', bgColorHex));

  return apcaOnWhite > apcaOnBlack ? '#ffffff' : '#000000';
}

// ============================================================================
// Usage Category
// ============================================================================

/**
 * Determines the recommended usage category based on color weight
 *
 * @param weight - Shade weight (50-950)
 * @returns Usage category recommendation
 *
 * @example
 * ```typescript
 * getUsageCategory(50)  // "backgrounds" - very light shades
 * getUsageCategory(300) // "borders" - light-medium shades
 * getUsageCategory(500) // "primary" - medium shades
 * getUsageCategory(900) // "text" - dark shades
 * ```
 */
function getUsageCategory(weight: number): UsageCategory {
  if (weight <= 200) return 'backgrounds';
  if (weight <= 400) return 'borders';
  if (weight <= 600) return 'primary';
  return 'text';
}

// ============================================================================
// Main Export: Color Shade Generator
// ============================================================================

/**
 * Generates a complete color palette with 11 perceptually uniform shades
 *
 * Creates shades from 50 (lightest) to 950 (darkest) using OKLCH color space
 * for perceptual uniformity. Each shade includes:
 * - Hex, RGB, and OKLCH values
 * - APCA contrast ratios against white and black
 * - Recommended text color for accessibility
 * - Usage category suggestion
 *
 * @param baseColorHex - Base color as hex string (will become shade 500)
 * @returns Object with shades keyed by weight (50-950), or null if invalid hex
 *
 * @example
 * ```typescript
 * const shades = generateColorShades('#3b82f6');
 *
 * // Access specific shade
 * console.log(shades[500].hex); // "#3b82f6" (base color)
 * console.log(shades[50].hex);  // "#eff6ff" (lightest)
 * console.log(shades[950].hex); // "#172554" (darkest)
 *
 * // Check accessibility
 * console.log(shades[600].textColor); // "#ffffff"
 * console.log(shades[600].apca.onWhite); // 45.2
 *
 * // Get usage recommendations
 * console.log(shades[100].usage); // "backgrounds"
 * console.log(shades[600].usage); // "primary"
 * ```
 *
 * @see {@link https://oklch.com/} - OKLCH color space reference
 * @see {@link https://www.myndex.com/APCA/} - APCA contrast algorithm
 */
export function generateColorShades(baseColorHex: string): ColorShades | null {
  const rgb = hexToRgb(baseColorHex);
  if (!rgb) return null;

  const oklch = rgbToOklch(rgb.r, rgb.g, rgb.b);

  // Define lightness and chroma adjustments for each weight
  const weights: Record<ShadeWeight, { L: number; C: number }> = {
    50: { L: 0.97, C: oklch.C * 0.15 },
    100: { L: 0.94, C: oklch.C * 0.25 },
    200: { L: 0.88, C: oklch.C * 0.4 },
    300: { L: 0.78, C: oklch.C * 0.6 },
    400: { L: 0.68, C: oklch.C * 0.8 },
    500: { L: oklch.L, C: oklch.C },
    600: { L: oklch.L * 0.85, C: oklch.C * 0.95 },
    700: { L: oklch.L * 0.7, C: oklch.C * 0.9 },
    800: { L: oklch.L * 0.55, C: oklch.C * 0.85 },
    900: { L: oklch.L * 0.4, C: oklch.C * 0.8 },
    950: { L: oklch.L * 0.28, C: oklch.C * 0.75 },
  };

  const shades = {} as ColorShades;

  (Object.entries(weights) as unknown as [ShadeWeight, { L: number; C: number }][]).forEach(([weight, { L, C }]) => {
    const rgb = oklchToRgb(L, C, oklch.h);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    const apcaOnWhite = calculateAPCA(hex, '#ffffff');
    const apcaOnBlack = calculateAPCA(hex, '#000000');
    const textColor = getBestTextColor(hex);

    shades[weight] = {
      hex,
      rgb: {
        r: Math.round(rgb.r * 255),
        g: Math.round(rgb.g * 255),
        b: Math.round(rgb.b * 255)
      },
      oklch: {
        L: parseFloat(L.toFixed(3)),
        C: parseFloat(C.toFixed(3)),
        h: parseFloat(oklch.h.toFixed(1))
      },
      apca: {
        onWhite: parseFloat(apcaOnWhite.toFixed(1)),
        onBlack: parseFloat(apcaOnBlack.toFixed(1))
      },
      textColor,
      usage: getUsageCategory(weight)
    };
  });

  return shades;
}

// ============================================================================
// Additional Exports
// ============================================================================

// Export types for consumer use
export type {
  RGB,
  RGB255,
  OKLCH,
  APCAContrast,
  UsageCategory,
  ColorShade,
  ShadeWeight,
  ColorShades
};
