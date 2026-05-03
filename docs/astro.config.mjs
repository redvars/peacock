import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import pagefind from 'astro-pagefind';

// https://astro.build/config
export default defineConfig({
  devToolbar: { enabled: false },
  site: 'https://peacock.redvars.com',
  compressHTML: false,
  server: { port: 4000, host: true, allowedHosts: ['peacockdev.redvars.com'] },
  integrations: [pagefind(), sitemap(), mdx()],
});
