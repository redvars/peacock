import * as fs from 'fs';
import * as path from 'path';

import { generateColorShades } from "./oklch-apcach-shades.mjs";



// File path
const filePath = path.resolve('./src/color-palette.json');

// Step 1: Read JSON file
function readJson() {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading token.json:', err);
    return null;
  }
}



// Step 3: Write JSON back to file
function writeJson(updatedData) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2), 'utf8');
    console.log('token.json updated successfully!');
  } catch (err) {
    console.error('Error writing token.json:', err);
  }
}

function convertToTokensFormat(base) {
  const palette = generateColorShades(base);
  const tokens = {};
  for (const [weight, shade] of Object.entries(palette)) {
    tokens[weight] = {
      "$value": shade.hex,
    };
  }
  return tokens;
}

// Main
const tokens = readJson();
if (tokens) {
  console.log('Original Tokens:', tokens);



  // Update tokens with new palette
  tokens.color = tokens.color || {};

  tokens.color.brand = convertToTokensFormat("#ff0000");
  tokens.color.red = convertToTokensFormat("#ff0000");
  tokens.color.yellow = convertToTokensFormat("#FFDE21");
  tokens.color.green = convertToTokensFormat("#008000");
  tokens.color.blue = convertToTokensFormat("#0000FF");
  tokens.color.gray = convertToTokensFormat("#898989");
  tokens.color.slate = convertToTokensFormat("#6D8196");
  tokens.color.purple = convertToTokensFormat("#9D00FF");
  tokens.color.orange = convertToTokensFormat("#FFA500");
  tokens.color.black = convertToTokensFormat("#000000");

  writeJson(tokens);
}


