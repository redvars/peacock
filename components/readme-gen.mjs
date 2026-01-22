import fs from 'fs';
import { customElementsManifestToMarkdown } from '@custom-elements-manifest/to-markdown';

const customElements = JSON.parse(
  fs.readFileSync('./dist/custom-elements.json', 'utf-8'),
);

customElements.modules = customElements.modules.filter(module =>
  module.declarations.find(d => d.customElement),
);

const markdown = customElementsManifestToMarkdown(customElements, {
  private: 'hidden',
  omitSections: [
    'mixins',
    'variables',
    'functions',
    'exports',
    'staticFields',
    'staticMethods',
  ],
});

fs.writeFileSync('./custom-elements.md', markdown);
