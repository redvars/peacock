import StyleDictionary from 'style-dictionary';

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
      ],
    },
  },
});

await sd.buildAllPlatforms();
