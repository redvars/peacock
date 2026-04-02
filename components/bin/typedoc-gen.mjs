import * as td from 'typedoc';
import { readFile, writeFile, rm } from 'node:fs/promises';

async function run() {
  const app = await td.Application.bootstrapWithPlugins({
    // 2. Force entry points to be absolute
    entryPoints: ['src/index.ts'],
    entryPointStrategy: td.EntryPointStrategy.Expand,
    blockTags: [
      '@label',
      '@example',
      '@deprecated',
      '@rawTag',
      '@tag',
      '@tags',
      '@summary',
      '@overview',
      '@parentRawTag',
    ],
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
        const component = {};
        child.comment?.blockTags.forEach(tag => {
          // Strip '@' prefix: '@rawTag' → 'rawTag'
          const key = tag.tag.slice(1);
          // Concatenate all content items into a single string
          component[key] = tag.content.map(c => c.text).join('');
        });
        return component;
      })
      .filter(comp => !!comp.rawTag)
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
