// Stylelint rules that keep component styles on design tokens.
//
// peacock/no-raw-color   blocks hex colors, color functions (rgb(), hsl(), oklch(), …) and
//                        named colors. A raw color is allowed only as a var() fallback.
// peacock/no-raw-radius  blocks hardcoded corner radii. Allowed: 0, percentages (50% circles),
//                        keywords, and var() (with any fallback).
import stylelint from 'stylelint';

const {
  createPlugin,
  utils: { report, ruleMessages, validateOptions },
} = stylelint;

const COLOR_RULE = 'peacock/no-raw-color';
const RADIUS_RULE = 'peacock/no-raw-radius';

const colorMessages = ruleMessages(COLOR_RULE, {
  rejected: (prop, color) =>
    `Unexpected raw color "${color}" in "${prop}". Use a --color-* token, or put the color in a var() fallback.`,
});

const radiusMessages = ruleMessages(RADIUS_RULE, {
  rejected: (prop, value) =>
    `Unexpected hardcoded radius "${value}" in "${prop}". Use a --shape-corner-* token (0 and percentages are fine).`,
});

const NAMED_COLORS = [
  'white',
  'black',
  'red',
  'green',
  'blue',
  'gray',
  'grey',
  'yellow',
  'orange',
  'purple',
  'pink',
  'silver',
  'maroon',
  'navy',
  'teal',
  'olive',
  'lime',
  'aqua',
  'fuchsia',
];

const HEX_COLOR = /#[0-9a-f]{3,8}\b/i;
const COLOR_FUNCTION = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/i;
const NAMED_COLOR = new RegExp(`(^|[\\s,(])(${NAMED_COLORS.join('|')})(?=$|[\\s,)])`, 'i');
// Properties whose values can hold a color keyword; elsewhere words like "red" are identifiers.
const COLOR_PROPERTY = /color|background|border|outline|shadow|fill|stroke|caret|decoration|^--|^\$/i;

// Corner radii: the border-radius family, plus custom properties that hold one
// (`--x-border-radius`, `--_radius`, `--x-shape`, `--x-shape-start-end`). Sizes that merely end
// in "radius", such as `--switch-handle-radius`, are not corners.
const RADIUS_PROPERTY =
  /^(border(-(top|bottom|start|end)-(left|right|start|end))?-radius|--.*border-radius|--_radius|--.*-shape(-(start|end)-(start|end))?)$/i;
const LENGTH = /(^|[^\w-])(-?\d*\.?\d+)(px|rem|em|vh|vw|vmin|vmax|ch|ex|pt)\b/i;

/**
 * Removes the contents of every `name(...)` call so values inside them are ignored. Handles
 * nesting, so `var(--a, var(--b, #fff))` disappears whole.
 */
function stripCalls(value, names) {
  const pattern = new RegExp(`\\b(${names.join('|')})\\(`, 'gi');
  let result = '';
  let index = 0;
  let match;
  pattern.lastIndex = 0;
  // eslint-disable-next-line no-cond-assign
  while ((match = pattern.exec(value))) {
    result += value.slice(index, match.index);
    let depth = 1;
    let cursor = match.index + match[0].length;
    while (cursor < value.length && depth > 0) {
      if (value[cursor] === '(') depth += 1;
      else if (value[cursor] === ')') depth -= 1;
      cursor += 1;
    }
    result += `${match[1]}()`;
    index = cursor;
    pattern.lastIndex = cursor;
  }
  return result + value.slice(index);
}

/** Drops Sass interpolation (`#{...}`) so it is not mistaken for a hex color. */
function stripInterpolation(value) {
  return value.replace(/#\{[^}]*\}/g, '');
}

const noRawColor = createPlugin(COLOR_RULE, primary => (root, result) => {
  if (!validateOptions(result, COLOR_RULE, { actual: primary })) return;

  root.walkDecls(decl => {
    const value = stripInterpolation(stripCalls(decl.value, ['var', 'url']));
    const hex = value.match(HEX_COLOR);
    const fn = value.match(COLOR_FUNCTION);
    const named = COLOR_PROPERTY.test(decl.prop) ? value.match(NAMED_COLOR) : null;
    const found = hex?.[0] ?? (fn ? `${fn[0]}…)` : named?.[2]);
    if (!found) return;
    report({
      ruleName: COLOR_RULE,
      result,
      node: decl,
      // Reported on the declaration itself so `stylelint-disable-next-line` above a multi-line
      // value works.
      message: colorMessages.rejected(decl.prop, found),
    });
  });
});

const noRawRadius = createPlugin(RADIUS_RULE, primary => (root, result) => {
  if (!validateOptions(result, RADIUS_RULE, { actual: primary })) return;

  root.walkDecls(decl => {
    if (!RADIUS_PROPERTY.test(decl.prop)) return;
    const value = stripInterpolation(stripCalls(decl.value, ['var']));
    const length = value.match(LENGTH);
    if (!length || Number(length[2]) === 0) return;
    report({
      ruleName: RADIUS_RULE,
      result,
      node: decl,
      message: radiusMessages.rejected(decl.prop, `${length[2]}${length[3]}`),
    });
  });
});

export default [noRawColor, noRawRadius];
