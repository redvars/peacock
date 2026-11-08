import { version as componentsPackageVersion } from '../../components/package.json';
import { resolvePublishedVersion } from './_data/npm';

// ── Site metadata ─────────────────────────────────────────────────────────
export const SITE_TITLE = 'Peacock';
export const SITE_DESCRIPTION =
  'Peacock is a design system and a library of web components built with Lit. Import the component JavaScript and start using them, with no framework dependency.';
export const SITE_TAGLINE = 'Web components and design system';
export const SITE_URL = 'https://peacock.redvars.com';
export const BASE_URL = '';
export const SITE_LOCALE = 'en_US';
/** The default Open Graph / Twitter card image (1200×630), relative to the site root. */
export const SOCIAL_IMAGE = {
  src: '/assets/img/og-image.png',
  width: 1200,
  height: 630,
  alt: 'Peacock: web components and design system, built with Lit',
};

// ── Versioning ────────────────────────────────────────────────────────────
// The one source of the version: the components package, read at build time and checked against
// npm, so the header, the footer and every CDN link show the same version and never point at one
// that is not published. Use VERSION everywhere; never write a version number in a page.
export const NPM_PACKAGE = '@redvars/peacock';
export const NPM_URL = `https://www.npmjs.com/package/${NPM_PACKAGE}`;
const resolvedVersions = await resolvePublishedVersion(NPM_PACKAGE, componentsPackageVersion);
/** The published Peacock version the site shows and links the CDN to, such as `4.0.0`. */
export const VERSION = resolvedVersions.version;
/** The published version before VERSION, loaded when the CDN fails to serve VERSION. */
export const FALLBACK_VERSION = resolvedVersions.fallbackVersion;

// ── Repository ────────────────────────────────────────────────────────────
/** `owner/name` on GitHub. */
export const GITHUB_REPOSITORY = 'redvars/peacock';
export const REPO_URL = `https://github.com/${GITHUB_REPOSITORY}`;
/** Every published version on npm. Peacock has no GitHub releases; npm is where versions live. */
export const NPM_VERSIONS_URL = `${NPM_URL}?activeTab=versions`;
/** The npm page of the version the site shows. */
export const NPM_VERSION_URL = `${NPM_URL}/v/${VERSION}`;

// ── Navigation links ──────────────────────────────────────────────────────
export const PRIVACY_URL = '/privacy';
export const LICENSE_URL = '/license';

// ── Analytics ─────────────────────────────────────────────────────────────
export const GOOGLE_ANALYTICS_ID = 'G-KNH50V85RG';

// ── Author ────────────────────────────────────────────────────────────────
export const AUTHOR = {
  name: 'Redvars',
  email: 'hello@redvars.com',
  url: 'https://redvars.com',
  twitter: 'redvarsHQ',
};
