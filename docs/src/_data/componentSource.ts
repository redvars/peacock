// Where each component's source lives in the repository, read at build time from the manifest
// that `npm run publish:docs` copies into public/assets/peacock/. Component pages link to it.
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { REPO_URL } from '../siteconfig';

interface ManifestModule {
  path: string;
  declarations?: { tagName?: string }[];
}

let sourceByTag: Map<string, string> | undefined;

function loadSourceMap(): Map<string, string> {
  if (sourceByTag) return sourceByTag;
  sourceByTag = new Map();
  const manifestPath = path.resolve('public/assets/peacock/custom-elements.json');
  if (!existsSync(manifestPath)) return sourceByTag;
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as { modules?: ManifestModule[] };
  for (const module of manifest.modules ?? []) {
    // The analyzer writes absolute paths on some machines: keep the part from src/ on.
    const normalized = module.path.replaceAll('\\', '/');
    const index = normalized.lastIndexOf('/src/');
    const relative = index === -1 ? normalized : normalized.slice(index + 1);
    for (const declaration of module.declarations ?? []) {
      if (declaration.tagName) sourceByTag.set(declaration.tagName, relative);
    }
  }
  return sourceByTag;
}

/** GitHub URL of the folder holding a component's source, such as `.../components/src/button/button`. */
export function getComponentSourceUrl(tagName: string): string {
  const file = loadSourceMap().get(tagName);
  const rawTag = tagName.replace(/^wc-/, '');
  const folder = file ? path.posix.dirname(file) : `src/${rawTag}`;
  return `${REPO_URL}/tree/main/components/${folder}`;
}

/** GitHub URL of a docs page folder, for "Edit this page". */
export function getDocsEditUrl(pageFolder: string): string {
  return `${REPO_URL}/tree/main/docs/src/pages/${pageFolder}`;
}
