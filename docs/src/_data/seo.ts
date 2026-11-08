// Search and social metadata for every page, used by layouts/Base.astro: the canonical URL, the
// breadcrumb trail and the JSON-LD graph. Pages pass a title and a description; layouts that know
// more (a blog post's date, the home page's structured data) pass a PageSeo.
import {
  AUTHOR,
  NPM_PACKAGE,
  REPO_URL,
  SITE_DESCRIPTION,
  SITE_TITLE,
  SITE_URL,
  VERSION,
} from '../siteconfig';

export type JsonLdNode = Record<string, unknown>;

export interface PageSeo {
  /** The Open Graph type. The home page is a `website`; every other page an `article`. */
  type?: 'website' | 'article';
  /** The social card image, relative to the site root; defaults to SOCIAL_IMAGE. */
  image?: { src: string; width?: number; height?: number; alt?: string };
  /** ISO date the page was first published (blog posts). */
  publishedDate?: string;
  /** More nodes for the page's JSON-LD graph. */
  jsonLd?: JsonLdNode[];
  /** Keeps the page out of search results (the 404 page). */
  noindex?: boolean;
}

/** The section a top-level folder belongs to, for breadcrumbs and the article section. */
const SECTIONS: Record<string, string> = {
  components: 'Components',
  charts: 'Charts',
  blocks: 'Blocks',
  foundations: 'Foundations',
  frameworks: 'Frameworks',
  blog: 'Blog',
};

export const WEBSITE_ID = `${SITE_URL}/#website`;
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const SOFTWARE_ID = `${SITE_URL}/#software`;

/** The page's canonical URL: absolute, with the trailing slash the static build serves. */
export function getCanonicalUrl(pathname: string, site: URL | string = SITE_URL): string {
  let path = pathname.replace(/index\.html$/, '').replace(/\.html$/, '/');
  if (!path.endsWith('/')) path += '/';
  return new URL(path, site).href;
}

/** A page's own name, without the " · Section" suffix layouts add to its title. */
export function getPageName(title: string | undefined): string {
  return (title ?? SITE_TITLE).split(' · ')[0].trim();
}

export interface Crumb {
  name: string;
  url: string;
}

/** Home › Section › Page, from the URL. Pages at the root of a section stop at the section. */
export function getBreadcrumbs(pathname: string, title: string | undefined): Crumb[] {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return [];
  const crumbs: Crumb[] = [{ name: SITE_TITLE, url: getCanonicalUrl('/') }];
  const section = SECTIONS[segments[0]];
  if (section) crumbs.push({ name: section, url: getCanonicalUrl(`/${segments[0]}/`) });
  if (!section || segments.length > 1) {
    crumbs.push({ name: getPageName(title), url: getCanonicalUrl(pathname) });
  }
  return crumbs;
}

export function getSectionName(pathname: string): string | undefined {
  return SECTIONS[pathname.split('/').filter(Boolean)[0] ?? ''];
}

/** The organization and the website every page's graph refers to. */
export function getSiteNodes(): JsonLdNode[] {
  return [
    {
      '@type': 'Organization',
      '@id': ORGANIZATION_ID,
      name: AUTHOR.name,
      url: AUTHOR.url,
      logo: `${SITE_URL}/assets/img/logo.png`,
      sameAs: [REPO_URL, `https://x.com/${AUTHOR.twitter}`],
    },
    {
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      name: SITE_TITLE,
      url: getCanonicalUrl('/'),
      description: SITE_DESCRIPTION,
      inLanguage: 'en',
      publisher: { '@id': ORGANIZATION_ID },
    },
  ];
}

/** The library itself, for the home page. */
export function getSoftwareNode(): JsonLdNode {
  return {
    '@type': 'SoftwareSourceCode',
    '@id': SOFTWARE_ID,
    name: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: getCanonicalUrl('/'),
    codeRepository: REPO_URL,
    programmingLanguage: ['TypeScript', 'JavaScript', 'CSS'],
    runtimePlatform: 'Web browser',
    license: 'https://opensource.org/licenses/MIT',
    version: VERSION,
    identifier: NPM_PACKAGE,
    author: { '@id': ORGANIZATION_ID },
    keywords: 'web components, design system, Lit, UI library, React, Vue, Angular',
  };
}

interface PageNodeOptions {
  pathname: string;
  title: string | undefined;
  description: string;
  image: string;
  seo: PageSeo;
}

/** The JSON-LD graph for one page: site nodes, the page (or article) and its breadcrumbs. */
export function getPageGraph({ pathname, title, description, image, seo }: PageNodeOptions): JsonLdNode {
  const url = getCanonicalUrl(pathname);
  const isHome = pathname === '/' || pathname === '';
  const section = getSectionName(pathname);
  const crumbs = getBreadcrumbs(pathname, title);
  const isBlogPost = section === 'Blog' && Boolean(seo.publishedDate);
  // A page inside a section (a component, a chart, a foundation) reads as technical article.
  const isArticle = !isHome && (isBlogPost || (section !== undefined && pathname.split('/').filter(Boolean).length > 1));

  const page: JsonLdNode = {
    '@type': isBlogPost ? 'BlogPosting' : isArticle ? 'TechArticle' : 'WebPage',
    '@id': `${url}#page`,
    url,
    name: getPageName(title),
    description,
    inLanguage: 'en',
    isPartOf: { '@id': WEBSITE_ID },
    primaryImageOfPage: image,
  };
  if (isArticle) {
    Object.assign(page, {
      headline: getPageName(title),
      image,
      author: { '@id': ORGANIZATION_ID },
      publisher: { '@id': ORGANIZATION_ID },
      mainEntityOfPage: url,
      ...(section && !isBlogPost ? { articleSection: section, about: { '@id': SOFTWARE_ID } } : {}),
      ...(seo.publishedDate ? { datePublished: seo.publishedDate } : {}),
    });
  }
  if (isHome) page.about = { '@id': SOFTWARE_ID };

  const nodes: JsonLdNode[] = [...getSiteNodes(), page, ...(seo.jsonLd ?? [])];
  if (crumbs.length > 1) {
    nodes.push({
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: crumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: crumb.url,
      })),
    });
    page.breadcrumb = { '@id': `${url}#breadcrumb` };
  }
  return { '@context': 'https://schema.org', '@graph': nodes };
}

/** JSON for a `<script type="application/ld+json">`, safe to inline in HTML. */
export function serializeJsonLd(graph: JsonLdNode): string {
  return JSON.stringify(graph).replace(/</g, '\\u003c');
}

/** Plain text from a short markdown or HTML string, for meta descriptions. */
export function toPlainText(value: string | null | undefined): string {
  if (!value) return '';
  return value
    .replace(/<[^>]+>/g, '')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, '$1')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

/** A description of at most `max` characters, cut at a word. */
export function truncateDescription(value: string, max = 160): string {
  if (value.length <= max) return value;
  const cut = value.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,;:.]+$/, '')}…`;
}
