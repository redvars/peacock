import { kebabCase } from 'scule';

/**
 * Custom Terrazzo Plugin to apply alpha transformation
 * based on the 'org.terrazzo.operations' extension.
 * * @param {object} options - Plugin options (if needed)
 * @returns {import('@terrazzo/cli').Plugin}
 */
export function alphaTransformerPlugin(options = {}) {
  return {
    // 1. Name the plugin
    name: 'terrazzo-alpha-transformer',

    // 2. The core transformation function
    transform({ tokens, setTransform }) {
      // Loop through all tokens and their modes
      for (const [id, token] of Object.entries(tokens)) {
        // Find the operations extension on the token itself
        const operations =
          token.originalValue?.$extensions?.['org.terrazzo.operations'];

        if (operations && token.$type === 'color') {
          // Process the base value (default/light mode)
          processTokenValue(id, token, token.$value, operations, setTransform);

          // Process values inside of modes (e.g., dark mode)
          if (token.mode) {
            Object.entries(token.mode).forEach(([modeName, modeValue]) => {
              if (modeValue) {
                // Since the modeValue object is what we modify, we pass it.
                processTokenValue(
                  id,
                  token,
                  modeValue,
                  operations,
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
  operations,
  setTransform,
  modeName,
) {
  // We only care about the first operation for this simple example
  const alphaOp = operations.find(op => op.alpha !== undefined);

  if (alphaOp) {
    token.value = `RGBA(var(--color-red), 0.55)`;
    setTransform(id, {
      format: 'css',
      localID: `--${kebabCase(id)}`,
      value: `RGBA(var(--${kebabCase(token.aliasOf)}), ${alphaOp.alpha})`, // convert original format into CSS-friendly value
      mode: modeName,
    });
  }
}
