import fs from 'fs/promises';
import path from 'path';

// Get the project root directory
const projectRoot = process.cwd(); 

// Construct the path to the target folder
const sourceFolder = path.join(projectRoot, 'dist'); 
const targetFolder = path.join(projectRoot, '../components/scss/'); 
console.log(`Accessing folder at: ${targetFolder}`);
console.log('Deploying design tokens to components...');

await fs.cp(sourceFolder, targetFolder, {
  recursive: true,
  force: true,
});

console.log('Design tokens deployment completed successfully.');
