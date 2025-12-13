import StyleDictionary from 'style-dictionary';
import { formats } from 'style-dictionary/enums';
import { fileHeader, formattedVariables } from 'style-dictionary/utils';

const sd = new StyleDictionary({
  source: ['src/tokens/**/*.json'],
  platforms: {
    web: {
      transformGroup: 'css',
      files: [
        {
          destination: 'dist/variables.css', // Destination file for CSS variables
          format: 'css/variables', // Custom format for CSS variables with dark mode support
          options: {
            outputReferences: true,
          },
        },
        {
          destination: 'dist/variables-dark.css', // Destination file for CSS variables
          format: 'cssDark', // Custom format for CSS variables with dark mode support
          options: {
            outputReferences: true, // Enable outputReferences for this file
          },
        },
        {
          format: 'javascript/esm',
          destination: 'dist/styles.js',
          options: {
            minify: true,
          },
        },
      ],
    },
  },
});

StyleDictionary.registerFormat({
  name: 'cssDark',
  format: async ({ dictionary, file, options }) => {
    const dictionaryDark = Object.assign({}, dictionary);
    // Override each token's `value` with `darkValue`
    dictionaryDark.allTokens = dictionary.allTokens
      .filter(token => {
        return token.hasOwnProperty('$darkValue');
      })
      .map(token => {
        return Object.assign({}, token, {
          value: token.$darkValue,
        });
      });

    // 1. Generate the standard CSS variables output
    const variables = await formattedVariables({
      format: 'css',
      dictionary: dictionaryDark,
      outputReferences: options.outputReferences,
      formatting: options.formatting, // Supports indentation, etc.
    });

    // 2. Generate the file header (optional but recommended)
    const header = await fileHeader({ file });

    // 3. Return your custom extended string
    // Example: Wrapping variables in a specific data-theme attribute
    return `${header}
[data-theme="dark"] {
${variables}
}
`;
  },
});

await sd.buildAllPlatforms();
