import * as scule from 'https://cdn.jsdelivr.net/npm/scule@1.3.0/+esm';
const { kebabCase } = scule;

/**
 * Custom Terrazzo Plugin to apply alpha transformation
 * based on the 'org.terrazzo.operations' extension.
 * * @param {object} options - Plugin options (if needed)
 * @returns {import('@terrazzo/cli').Plugin}
 */
export function customTransformerPlugin(options = {}) {
  return {
    // 1. Name the plugin
    name: 'operations-transformer',

    // 2. The core transformation function
    transform({ tokens, setTransform }) {
      // Loop through all tokens and their modes
      for (const [id, token] of Object.entries(tokens)) {
        if (
          token.$type === 'color' &&
          token.originalValue?.$extensions?.['alpha']
        ) {
          // Process the base value (default/light mode)
          processTokenValue(
            id,
            token,
            token.$value,
            token.originalValue?.$extensions?.['alpha'],
            setTransform,
            '.',
          );

          // Process values inside of modes (e.g., dark mode)
          if (token.mode) {
            Object.entries(token.mode).forEach(([modeName, modeValue]) => {
              if (modeValue) {
                // Since the modeValue object is what we modify, we pass it.
                processTokenValue(
                  id,
                  token,
                  modeValue,
                  token.originalValue?.$extensions?.['alpha'],
                  setTransform,
                  modeName,
                );
              }
            });
          }
        }
      }
    },
  };
}

/**
 * Applies the alpha operation to a token value object.
 * * @param {Token} token - The parent token object.
 * @param {Mode | any} tokenValue - The Token Value object (can be Token or Mode).
 * @param {Array<object>} operations - The array of operations from extensions.
 */
function processTokenValue(
  id,
  token,
  tokenValue,
  alpha,
  setTransform,
  modeName,
) {
  if (alpha) {
    setTransform(id, {
      format: 'css',
      value: `RGBA(var(--${kebabCase(token.aliasOf)}), ${alpha[modeName]})`, // convert original format into CSS-friendly value
      mode: modeName,
    });
  }
}
