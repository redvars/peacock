import fs from 'fs';
import { customElementsManifestToMarkdown } from '@custom-elements-manifest/to-markdown';

const manifest = JSON.parse(
  fs.readFileSync('./dist/custom-elements.json', 'utf-8'),
);
const markdown = customElementsManifestToMarkdown(manifest, {
  private: 'hidden',
});

fs.writeFileSync('./custom-elements.md', markdown);
