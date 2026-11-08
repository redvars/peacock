import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import pagefind from 'astro-pagefind';

const NOT_IN_SITEMAP = ['/404/', '/color/', '/components/text/'];

// https://astro.build/config
export default defineConfig({
  devToolbar: { enabled: false },
  site: 'https://peacock.redvars.com',
  compressHTML: false,
  server: { port: 4000, host: true, allowedHosts: ['peacockdev.redvars.com'] },
  integrations: [
    pagefind(),
    // Leave out the 404 page (robots.txt and its noindex meta say the same) and the pages that
    // only redirect with Astro.redirect (pages/color.astro, pages/components/text.astro).
    sitemap({ filter: page => !NOT_IN_SITEMAP.includes(new URL(page).pathname.replace(/\/?$/, '/')) }),
    mdx(),
  ],
  redirects: {
    '/theme-creator': '/theme-builder',
    // Charts moved out of Components into their own section.
    '/components/chart-bar': '/charts/bar/',
    '/components/chart-pie': '/charts/pie/',
    '/components/chart-doughnut': '/charts/doughnut/',
    // wc-flow was renamed to wc-diagram in 4.0.
    '/components/flow': '/components/diagram/',
  },
});
