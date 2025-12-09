// Convert hex to RGB (0-1 range)
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  } : null;
}

// sRGB to linear RGB
function srgbToLinear(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

// Linear RGB to sRGB
function linearToSrgb(c) {
  return c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

// RGB to OKLCH
function rgbToOklch(r, g, b) {
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

// OKLCH to RGB
function oklchToRgb(L, C, h) {
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

// RGB to Hex
function rgbToHex(r, g, b) {
  const toHex = (c) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Calculate APCA contrast
function calculateAPCA(txtColor, bgColor) {
  const txtRgb = hexToRgb(txtColor);
  const bgRgb = hexToRgb(bgColor);

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

// Get usage category for weight
function getUsageCategory(weight) {
  if (weight <= 200) return 'backgrounds';
  if (weight <= 400) return 'borders';
  if (weight <= 600) return 'primary';
  return 'text';
}

// Determine best text color (black or white) based on APCA contrast
function getBestTextColor(bgColorHex) {
  const apcaOnWhite = Math.abs(calculateAPCA('#ffffff', bgColorHex));
  const apcaOnBlack = Math.abs(calculateAPCA('#000000', bgColorHex));
  
  return apcaOnWhite > apcaOnBlack ? '#ffffff' : '#000000';
}

// Main function: Generate color shades from base color
export function generateColorShades(baseColorHex) {
  const rgb = hexToRgb(baseColorHex);
  if (!rgb) return null;

  const oklch = rgbToOklch(rgb.r, rgb.g, rgb.b);
  
  const weights = {
    50: { L: 0.97, C: oklch.C * 0.15 },
    100: { L: 0.94, C: oklch.C * 0.25 },
    200: { L: 0.88, C: oklch.C * 0.40 },
    300: { L: 0.78, C: oklch.C * 0.60 },
    400: { L: 0.68, C: oklch.C * 0.80 },
    500: { L: oklch.L, C: oklch.C },
    600: { L: oklch.L * 0.85, C: oklch.C * 0.95 },
    700: { L: oklch.L * 0.70, C: oklch.C * 0.90 },
    800: { L: oklch.L * 0.55, C: oklch.C * 0.85 },
    900: { L: oklch.L * 0.40, C: oklch.C * 0.80 },
    950: { L: oklch.L * 0.28, C: oklch.C * 0.75 },
  };

  const shades = {};
  
  Object.entries(weights).forEach(([weight, { L, C }]) => {
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
      usage: getUsageCategory(parseInt(weight))
    };
  });

  return shades;
}