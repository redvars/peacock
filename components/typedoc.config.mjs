/** @type {Partial<import("typedoc").TypeDocOptions>} */
const config = {
  entryPoints: ['./src/index.ts'],
  outputs: [
    {
      name: 'json',
      path: './tsdocs.json',
    },
  ],
  excludeNotDocumented: true,
};

export default config;
