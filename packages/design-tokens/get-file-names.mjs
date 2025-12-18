import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Recreate __dirname for constructing the directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default function getFileNames(folderRawPath) {
  // Define the relative path to the folder you want to read
  const folderPath = join(__dirname, folderRawPath);
  try {
    // Read the directory synchronously (use async fs.readdir for non-blocking I/O)
    const files = readdirSync(folderPath);
    return files.map(file => {
      return `${folderRawPath}/${file}`;
    });
  } catch (err) {
    console.error('Error reading directory:', err);
  }
}
