import fs from 'fs/promises';
import path from 'path';

// Get the project root directory
const projectRoot = process.cwd();
const componentsRoot = path.join(projectRoot, '../components');

// tokens.css feeds the components' SCSS build; theme.js (the theme engine)
// ships as dist/assets/theme.js through the components' assets folder.
const targets = [
  ['dist/tokens.css', 'scss/tokens.css'],
  ['dist/theme.js', 'assets/theme.js'],
  ['src/engine/theme.d.ts', 'assets/theme.d.ts'],
];

console.log('Deploying design tokens to components...');

for (const [source, target] of targets) {
  await fs.cp(path.join(projectRoot, source), path.join(componentsRoot, target), {
    force: true,
  });
  console.log(`  ${source} -> components/${target}`);
}

console.log('Design tokens deployment completed successfully.');
