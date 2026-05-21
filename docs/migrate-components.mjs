/**
 * Migrates all component index.astro pages from the old WithComponentsSidebar+OverviewPanel
 * tab pattern to the new LitComponent.astro layout.
 *
 * For each component:
 *  1. Parses the sections array from the old index.astro to get title+order per section file.
 *  2. Adds `export const title` and `export const order` to each _sections/*.astro file.
 *  3. Rewrites index.astro to use LitComponent.astro + buildSections.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pagesDir = join(__dirname, 'src/pages/components');

const components = readdirSync(pagesDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

let migrated = 0;
let skipped = 0;
let sectionFilesUpdated = 0;

for (const comp of components) {
  const indexPath = join(pagesDir, comp, 'index.astro');
  if (!existsSync(indexPath)) { skipped++; continue; }

  const content = readFileSync(indexPath, 'utf-8');

  // Already on new layout
  if (content.includes('LitComponent.astro')) { skipped++; continue; }

  // Extract component name from getComponentDetails('...')
  const compNameMatch = content.match(/getComponentDetails\(['"]([^'"]+)['"]\)/);
  const componentName = compNameMatch ? compNameMatch[1] : comp;

  // Extract import lines: import XxxSection from './_sections/filename.astro'
  const importMap = {}; // importName -> filename (e.g. UsageSection -> Usage.astro)
  const importRe = /import\s+(\w+)\s+from\s+['"]\.\/\_sections\/([^'"]+)['"]/g;
  let m;
  while ((m = importRe.exec(content)) !== null) {
    importMap[m[1]] = m[2];
  }

  // Extract sections array entries: look for title + Component pairs
  // Handles both 'title' and "title" key syntax, multi-line blocks
  const sections = [];
  const sectionRe = /['"]title['"]\s*:\s*['"]([^'"]+)['"]\s*,[\s\S]*?['"]Component['"]\s*:\s*(\w+)/g;
  while ((m = sectionRe.exec(content)) !== null) {
    const title = m[1];
    const varName = m[2];
    const filename = importMap[varName];
    if (filename) {
      sections.push({ title, filename });
    }
  }

  // Also try reverse order (Component before title) just in case
  const sectionRe2 = /['"]Component['"]\s*:\s*(\w+)\s*,[\s\S]*?['"]title['"]\s*:\s*['"]([^'"]+)['"]/g;
  const seenFilenames = new Set(sections.map(s => s.filename));
  while ((m = sectionRe2.exec(content)) !== null) {
    const varName = m[1];
    const title = m[2];
    const filename = importMap[varName];
    if (filename && !seenFilenames.has(filename)) {
      sections.push({ title, filename });
      seenFilenames.add(filename);
    }
  }

  // Extract any <style is:inline> block
  const styleMatch = content.match(/<style is:inline>([\s\S]*?)<\/style>/);

  // Update each section file with title + order exports
  for (let i = 0; i < sections.length; i++) {
    const { title, filename } = sections[i];
    const order = (i + 1) * 100;
    const sectionPath = join(pagesDir, comp, '_sections', filename);

    if (!existsSync(sectionPath)) {
      console.warn(`  [WARN] Section file not found: ${sectionPath}`);
      continue;
    }

    let sectionContent = readFileSync(sectionPath, 'utf-8');

    if (sectionContent.includes('export const title')) {
      console.log(`  [SKIP] Already has title export: ${comp}/_sections/${filename}`);
      continue;
    }

    // Normalise line endings then inject into frontmatter
    const normalised = sectionContent.replace(/\r\n/g, '\n');
    const escaped = title.replace(/'/g, "\\'");

    let updated;
    if (normalised.startsWith('---\n')) {
      updated = `---\nexport const title = '${escaped}';\nexport const order = ${order};\n` + normalised.slice(4);
    } else if (normalised.startsWith('---')) {
      // frontmatter exists but with no leading newline gap
      updated = normalised.replace(/^---/, `---\nexport const title = '${escaped}';\nexport const order = ${order};`);
    } else {
      // No frontmatter at all — wrap it
      updated = `---\nexport const title = '${escaped}';\nexport const order = ${order};\n---\n${normalised}`;
    }

    writeFileSync(sectionPath, updated);
    sectionFilesUpdated++;
    console.log(`  [OK] ${comp}/_sections/${filename} → title='${title}', order=${order}`);
  }

  // Build new index.astro content
  let newIndex = `---
import Layout from '../../../layouts/LitComponent.astro';
import { buildSections } from '../../../_data/getSections.ts';

const astroModules = import.meta.glob('./_sections/*.astro', { eager: true });
const mdxModules = import.meta.glob('./_sections/*.mdx', { eager: true });
const sections = buildSections({ ...astroModules, ...mdxModules });
---
`;

  if (styleMatch) {
    newIndex += `\n<style is:inline>${styleMatch[1]}</style>\n`;
  }

  newIndex += `\n<Layout componentName='${componentName}' sections={sections}></Layout>\n`;

  writeFileSync(indexPath, newIndex);
  migrated++;
  console.log(`[MIGRATED] ${comp} (${sections.length} sections)`);
}

console.log(`\nDone. Migrated: ${migrated}, Skipped: ${skipped}, Section files updated: ${sectionFilesUpdated}`);
