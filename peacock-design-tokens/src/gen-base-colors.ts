/**
 * Base Color Tokens Generator for Deno
 *
 * This script generates color token palettes using OKLCH color shades
 * and writes them to a JSON file in Design Tokens format.
 *
 * @module gen-base-colors
 *
 * @example
 * ```bash
 * deno run --allow-read --allow-write gen-base-colors.ts
 * ```
 */

import { generateColorShades } from './oklch-apca-shades.ts';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Design token value format
 */
interface TokenValue {
  $value: string;
}

/**
 * Color palette with weight-based tokens
 */
type ColorPalette = Record<string, TokenValue | string>;

/**
 * Root tokens structure
 */
interface Tokens {
  color?: {
    brand?: ColorPalette;
    red?: ColorPalette;
    yellow?: ColorPalette;
    green?: ColorPalette;
    blue?: ColorPalette;
    gray?: ColorPalette;
    slate?: ColorPalette;
    purple?: ColorPalette;
    orange?: ColorPalette;
    black?: ColorPalette;
    [key: string]: ColorPalette | undefined;
  };
  [key: string]: unknown;
}

// ============================================================================
// Configuration
// ============================================================================

/**
 * File path for the base color tokens JSON file
 * On Windows, removes the leading slash from paths like /E:/path
 */
const FILE_PATH = new URL(
  './tokens/colors/color.base.json',
  import.meta.url,
).pathname.replace(/^\/([A-Z]:)/, '$1');

// ============================================================================
// File Operations
// ============================================================================

/**
 * Reads and parses the JSON token file
 *
 * @returns Parsed token data or null if error occurs
 */
async function readJson(): Promise<Tokens | null> {
  try {
    const data = await Deno.readTextFile(FILE_PATH);
    return JSON.parse(data) as Tokens;
  } catch (err) {
    console.error('Error reading color.base.json:', err);
    return null;
  }
}

/**
 * Writes updated token data back to JSON file
 *
 * @param updatedData - Updated token data to write
 */
async function writeJson(updatedData: Tokens): Promise<void> {
  try {
    await Deno.writeTextFile(
      FILE_PATH,
      JSON.stringify(updatedData, null, 2) + '\n',
      { create: true },
    );
    console.log('✅ color.base.json updated successfully!');
  } catch (err) {
    console.error('❌ Error writing color.base.json:', err);
  }
}

// ============================================================================
// Token Conversion
// ============================================================================

/**
 * Converts a base hex color into Design Tokens format with all shades
 *
 * @param base - Base color in hex format (e.g., '#ff0000')
 * @returns Color palette object with weights 50-950
 *
 * @example
 * ```typescript
 * const redPalette = convertToTokensFormat('#ff0000');
 * // Returns:
 * // {
 * //   "50": { "$value": "#fef2f2" },
 * //   "100": { "$value": "#fee2e2" },
 * //   ...
 * //   "950": { "$value": "#450a0a" }
 * // }
 * ```
 */
function convertToTokensFormat(base: string): ColorPalette {
  const palette = generateColorShades(base);

  if (!palette) {
    console.warn(`⚠️  Failed to generate shades for color: ${base}`);
    return {};
  }

  const tokens: ColorPalette = {};
  for (const [weight, shade] of Object.entries(palette)) {
    tokens[weight] = {
      $value: shade.hex,
    };

    if (weight === '500') {
      tokens['@'] = {
        $value: shade.hex,
      };
    }
  }
  return tokens;
}

// ============================================================================
// Main Execution
// ============================================================================

/**
 * Main function to generate and update color tokens
 */
async function main(): Promise<void> {
  console.log('🎨 Generating base color tokens...\n');

  const tokens = await readJson();

  if (!tokens) {
    console.error('❌ Failed to read tokens file. Exiting.');
    Deno.exit(1);
  }

  console.log('📖 Original tokens loaded');

  // Initialize color object if it doesn't exist
  tokens.color = tokens.color || {};

  // Generate color palettes for each base color
  console.log('🔄 Generating color shades...\n');

  const colorDefinitions: Record<string, string> = {
    // brand: '#ff0000',
    red: '#ff0000',
    yellow: '#FFDE21',
    green: '#008000',
    blue: '#0000FF',
    gray: '#898989',
    slate: '#6D8196',
    purple: '#9D00FF',
    orange: '#FFA500',
    black: '#000000',
  };

  for (const [colorName, hexValue] of Object.entries(colorDefinitions)) {
    console.log(`  • ${colorName}: ${hexValue}`);
    tokens.color[colorName] = convertToTokensFormat(hexValue);
  }

  console.log('\n💾 Writing tokens to file...');
  await writeJson(tokens);
  console.log('✨ Done!\n');
}

// ============================================================================
// Entry Point
// ============================================================================

// Run main function if this is the main module
if (import.meta.main) {
  await main();
}
