import * as td from 'typedoc';
import { readFile, writeFile, rm } from 'node:fs/promises';

async function run() {
  const app = await td.Application.bootstrapWithPlugins({
    // 2. Force entry points to be absolute
    entryPoints: ['src/index.ts'],
    // 3. Explicitly tell the app where the base directory is
    disableSources: true,
  });

  const project = await app.convert();

  if (project) {
    // 4. Pass the absolute root here again.
    // If this still fails, try path.resolve(root) + path.sep
    await app.generateJson(project, './dist/typedoc.json');
    const data = JSON.parse(await readFile('./dist/typedoc.json', 'utf8'));

    const customElementsInfo = JSON.parse(
      await readFile('./dist/custom-elements.json', 'utf8'),
    );

    const components = data.children
      .filter(child => child)
      .map(child => {
        const result = {};
        child.comment.blockTags.forEach(tag => {
          result[tag.tag] = tag.content;
        });
        return {
          rawTag:
            result['@rawTag'] && result['@rawTag'][0]
              ? result['@rawTag'][0].text
              : null,
          label:
            result['@label'] && result['@label'][0]
              ? result['@label'][0].text
              : '',
          jsdoc: result,
        };
      })
      .filter(child => !!child.rawTag)
      .map(component => {
        const customElement = customElementsInfo.modules.find(m => {
          return m.declarations.find(
            d => d.rawTag && d.rawTag.name === component.rawTag,
          );
        });
        if (customElement) {
          component.customElement = customElement.declarations[0];
        }
        return component;
      });

    await writeFile(
      './dist/custom-elements-jsdocs.json',
      JSON.stringify(components, null, 2),
    );
    await rm('./dist/typedoc.json');
  }
}

run().catch(console.error);
