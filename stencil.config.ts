import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';
import { JsonDocs } from '@stencil/core/internal';
import dotEnvPlugin from 'rollup-plugin-dotenv';
import * as fs from 'fs';
import { reactOutputTarget } from '@stencil/react-output-target';

export const config: Config = {
  namespace: 'peacock',
  outputTargets: [
    {
      type: 'dist',
      copy: [{ src: 'assets' }],
      esmLoaderPath: '../loader',
    },
    reactOutputTarget({
      componentCorePackage: '@goatui/components',
      proxiesFile: 'dist/generated/goatui-react/index.ts',
      includeImportCustomElements: true,
    }),
    {
      type: 'dist-custom-elements',
      externalRuntime: false,
    },
    {
      type: 'docs-readme',
      footer: '*Built with love!*',
    },
    {
      type: 'docs-custom',
      generator: (docs: JsonDocs) => {
        docs.components.forEach(component => {
          // @ts-ignore
          const metadata: any = {};

          component.docsTags.forEach(tag => {
            if (tag.name === 'tags') {
              metadata[tag.name] = tag.text.split(',');
            } else {
              metadata[tag.name] = tag.text;
            }
          });

          delete component.docsTags;

          // @ts-ignore
          component.metadata = metadata;
        });

        fs.writeFileSync(
          __dirname + '/docs/src/_data/componentsDetails.json',
          JSON.stringify(docs, null, 2),
        );
      },
    },
    {
      type: 'www',
      dir: 'docs/public/assets/goatui-dev/',
      serviceWorker: null, // disable service workers
      copy: [{ src: 'assets', dest: 'build/assets' }],
    },
  ],
  plugins: [sass(), dotEnvPlugin()],
  testing: {
    browserHeadless: 'new',
  },
};
