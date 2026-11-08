// Build-time lookup of a package's published versions on npm. The site takes its version from
// the components package, but CDN links must only point at a version that is on npm, so the
// version is checked against the registry before the pages use it.

const REGISTRY = 'https://registry.npmjs.org';
const STABLE = /^\d+\.\d+\.\d+$/;

export interface ResolvedVersions {
  /** The version the site shows and links the CDN to. */
  version: string;
  /** The published version before it, loaded when the CDN fails to serve `version`. */
  fallbackVersion: string;
}

interface RegistryPackument {
  versions?: Record<string, unknown>;
  'dist-tags'?: Record<string, string>;
}

function compareVersions(a: string, b: string): number {
  const left = a.split('.').map(Number);
  const right = b.split('.').map(Number);
  for (let index = 0; index < 3; index += 1) {
    const difference = (left[index] ?? 0) - (right[index] ?? 0);
    if (difference !== 0) return difference;
  }
  return 0;
}

async function fetchPublishedVersions(name: string): Promise<RegistryPackument | null> {
  try {
    // The abbreviated document ("corgi") lists the versions without their full metadata.
    const response = await fetch(`${REGISTRY}/${name.replace('/', '%2f')}`, {
      headers: { accept: 'application/vnd.npm.install-v1+json' },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return null;
    return (await response.json()) as RegistryPackument;
  } catch {
    return null;
  }
}

/**
 * The version to show and link to: `packageVersion` when it is on npm, else the latest published
 * version. When the registry cannot be reached (an offline build), `packageVersion` as it is.
 */
export async function resolvePublishedVersion(name: string, packageVersion: string): Promise<ResolvedVersions> {
  const packument = await fetchPublishedVersions(name);
  if (!packument?.versions) {
    console.warn(`[siteconfig] Could not reach npm to check ${name}@${packageVersion}; using it unchecked.`);
    return { version: packageVersion, fallbackVersion: packageVersion };
  }

  const published = Object.keys(packument.versions).filter(version => STABLE.test(version)).sort(compareVersions);
  let version = packageVersion;
  if (!published.includes(packageVersion)) {
    version = packument['dist-tags']?.latest ?? published[published.length - 1] ?? packageVersion;
    console.warn(`[siteconfig] ${name}@${packageVersion} is not on npm yet; the site uses ${version}.`);
  }

  const older = published.filter(candidate => compareVersions(candidate, version) < 0);
  return { version, fallbackVersion: older[older.length - 1] ?? version };
}
