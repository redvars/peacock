import fs from "fs";
import path from "path";

const projectRoot = process.cwd();

fs.cpSync(
  `${projectRoot}/dist/custom-elements-jsdocs.json`,
  `${projectRoot}/../docs/src/_data/custom-elements-jsdocs.json`,
  {
    recursive: true,
    force: true,
  },
);

const sourceDir = `${projectRoot}/dist`;
const destDir = `${projectRoot}/../docs/public/assets/peacock`;

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

  files.forEach((file) => {
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

// 1. Clean the destination
clearDirectory(destDir);

// 2. Perform the copy
copyFolderRecursiveSync(sourceDir, destDir);

console.log("Published to docs successfully.");
