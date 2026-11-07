import type { PageGeometry, PageSetup } from './document-model.js';
import { PAGE_SIZES } from './document-model.js';

/** Paper colors: a printed page is white with dark text, whatever the screen theme. */
const PAPER_TOKENS: Record<string, string> = {
  '--document-editor-page': '#ffffff',
  '--document-editor-canvas': '#ffffff',
  '--color-on-surface': '#1c1b1f',
  '--color-on-surface-variant': '#49454f',
  '--color-outline-variant': '#cac4d0',
  '--color-surface-container-low': '#f7f2fa',
  '--color-surface-container-high': '#ece6f0',
  '--color-surface-container-lowest': '#ffffff',
  '--color-primary': '#1a56db',
  '--color-primary-container': '#e8eefc',
  '--color-on-primary-container': '#0b2a6b',
};

const PRINT_ID = 'peacock-document-print';

/**
 * Prints the editor's pages as they are on screen. The caller lays them out without gaps first,
 * so each page fills one printed sheet exactly: the header, footer, page numbers and page breaks
 * print as they look.
 *
 * The copy is put in a temporary shadow root in the same document, which shares the editor's
 * stylesheets and the page's theme tokens, so it lays out exactly like the screen; a print-only
 * stylesheet hides the rest of the page while the browser prints.
 */
export function printPages(
  host: HTMLElement,
  pages: HTMLElement,
  geometry: PageGeometry,
  page: PageSetup,
): Promise<void> {
  const paper = PAGE_SIZES[page.size];
  const landscape = page.orientation === 'landscape';
  const width = landscape ? paper.height : paper.width;
  const height = landscape ? paper.width : paper.height;

  document.getElementById(PRINT_ID)?.remove();
  const root = document.createElement('div');
  root.id = PRINT_ID;
  root.setAttribute('aria-hidden', 'true');
  for (const [name, value] of Object.entries(PAPER_TOKENS)) {
    root.style.setProperty(name, value);
  }
  // Beat the editor's own :host rules (height, border, scrolling).
  root.style.cssText += `;display:none;height:auto;border:0;border-radius:0;overflow:visible;background:#fff;width:${geometry.width}px;`;

  const shadow = root.attachShadow({ mode: 'open' });
  const source = host.shadowRoot;
  if (source?.adoptedStyleSheets?.length) {
    shadow.adoptedStyleSheets = [...source.adoptedStyleSheets];
  }
  source?.querySelectorAll('style').forEach(style => {
    shadow.append(style.cloneNode(true));
  });
  const wrapper = document.createElement('div');
  wrapper.className = 'document printing';
  const canvas = document.createElement('div');
  canvas.className = 'canvas';
  const copy = pages.cloneNode(true) as HTMLElement;
  copy.querySelectorAll('[contenteditable]').forEach(element => {
    element.removeAttribute('contenteditable');
  });
  canvas.append(copy);
  wrapper.append(canvas);
  const extra = document.createElement('style');
  extra.textContent = `
.document, .canvas { display: block; block-size: auto; overflow: visible; padding: 0; background: #fff; }
.pages { margin: 0; }
.page { box-shadow: none; border-radius: 0; }
.marginal-live, .page-break { visibility: hidden; }
.marginal-copy.hidden { visibility: visible; }
.marginal-copy:hover { outline: none; }
.comment-mark, .comment-active { background: none; border: 0; }`;
  shadow.append(extra, wrapper);

  const pageStyle = document.createElement('style');
  pageStyle.id = `${PRINT_ID}-page`;
  pageStyle.textContent = `@media print {
  @page { size: ${width}mm ${height}mm; margin: 0; }
  html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
  body > *:not(#${PRINT_ID}) { display: none !important; }
  #${PRINT_ID} { display: block !important; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}`;
  document.head.append(pageStyle);
  document.body.append(root);

  return new Promise(resolve => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      window.removeEventListener('afterprint', finish);
      root.remove();
      pageStyle.remove();
      resolve();
    };
    const images = Array.from(copy.querySelectorAll('img')).filter(
      image => !image.complete,
    );
    Promise.all(
      images.map(
        image =>
          new Promise(load => {
            image.addEventListener('load', load, { once: true });
            image.addEventListener('error', load, { once: true });
          }),
      ),
    ).then(() => {
      window.addEventListener('afterprint', finish);
      window.print();
      // print() blocks in most browsers; where it does not, afterprint ends it. The timeout only
      // tidies up if neither happens.
      setTimeout(finish, 60000);
    });
  });
}
