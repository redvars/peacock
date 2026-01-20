import fs from 'fs';
import path from 'path';

const sourceDir = '../components/dist';
const destDir = './public/assets/peacock';

/**
 * Clears the destination directory
 */
function clearDirectory(directory) {
  if (fs.existsSync(directory)) {
    // recursive: true deletes subdirectories
    // force: true ignores errors if the path doesn't exist
    fs.rmSync(directory, { recursive: true, force: true });
    console.log(`Cleared directory: ${directory}`);
  }
}

function copyFolderRecursiveSync(source, destination) {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  const files = fs.readdirSync(source);

  files.forEach(file => {
    const srcPath = path.join(source, file);
    const destPath = path.join(destination, file);
    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      copyFolderRecursiveSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });

  console.log(`Copied: ${source} -> ${destination}`);
}

// --- Execution ---

// 1. Clean the source first
clearDirectory(sourceDir);

// 2. Clean the destination
clearDirectory(destDir);

// 3. Perform the copy
copyFolderRecursiveSync(sourceDir, destDir);
