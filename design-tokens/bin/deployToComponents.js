import fs from 'fs/promises';

console.log('Deploying design tokens to components...');

await fs.cp('./dist/', '../components/assets/styles/', {
  recursive: true,
  force: true,
});

console.log('Design tokens deployment completed successfully.');
