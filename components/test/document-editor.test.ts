/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect, oneEvent, waitUntil } from '@open-wc/testing';
import type { Editor } from '@tiptap/core';
import {
  DocumentEditor,
  type DocumentImageUploadDetail,
  type DocumentValueDetail,
} from '../src/document-editor/index.js';
import {
  marginPresetOf,
  normalizeDocument,
  pageGeometry,
  PX_PER_MM,
} from '../src/document-editor/document-model.js';
import { paginationKey } from '../src/document-editor/pagination.js';

if (!customElements.get('wc-document-editor')) {
  customElements.define('wc-document-editor', DocumentEditor);
}

type Internals = {
  _body: Editor;
  _header: Editor;
  _footer: Editor;
};

function body(el: DocumentEditor): Editor {
  return (el as unknown as Internals)._body;
}

function root(el: DocumentEditor): ShadowRoot {
  return el.shadowRoot as ShadowRoot;
}

type ZoomInternals = { _scale: number; _paginateNow: () => void };

function zoomOf(el: DocumentEditor): ZoomInternals {
  return el as unknown as ZoomInternals;
}

const frame = () =>
  new Promise(resolve => {
    requestAnimationFrame(resolve);
  });

const settle = (ms = 300) =>
  new Promise(resolve => {
    setTimeout(resolve, ms);
  });

async function documentEditor() {
  const el = await fixture<DocumentEditor>(
    html`<wc-document-editor
      style="--document-editor-height: 30rem"
    ></wc-document-editor>`,
  );
  await el.updateComplete;
  return el;
}

const paragraph =
  'Acme keeps personal data only for as long as it needs it to provide its services, meet its legal obligations and resolve disputes. This explains what that means for the teams that collect, store and process data.';

describe('document model', () => {
  it('fills a partial value from the defaults', () => {
    const doc = normalizeDocument({
      page: { size: 'letter', orientation: 'landscape', margins: { top: 500 } },
    } as never);
    expect(doc.version).to.equal(1);
    expect(doc.page.size).to.equal('letter');
    expect(doc.page.orientation).to.equal('landscape');
    expect(doc.page.margins.top).to.equal(100);
    expect(doc.page.margins.left).to.equal(25.4);
    expect(doc.body.type).to.equal('doc');
  });

  it('measures pages in CSS pixels', () => {
    const portrait = pageGeometry({
      size: 'a4',
      orientation: 'portrait',
      margins: { top: 25.4, right: 25.4, bottom: 25.4, left: 25.4 },
    });
    expect(Math.round(portrait.width)).to.equal(Math.round(210 * PX_PER_MM));
    expect(Math.round(portrait.contentWidth)).to.equal(
      Math.round((210 - 50.8) * PX_PER_MM),
    );
    const landscape = pageGeometry({
      ...normalizeDocument(null).page,
      orientation: 'landscape',
    });
    expect(landscape.width).to.be.greaterThan(landscape.height);
  });

  it('recognises margin presets', () => {
    expect(
      marginPresetOf({ top: 12.7, right: 12.7, bottom: 12.7, left: 12.7 }),
    ).to.equal('narrow');
    expect(
      marginPresetOf({ top: 10, right: 12.7, bottom: 12.7, left: 12.7 }),
    ).to.equal(undefined);
  });
});

describe('DocumentEditor', () => {
  it('loads a value and reports edits with the whole document', async () => {
    const el = await documentEditor();
    el.value = normalizeDocument({
      body: {
        type: 'doc',
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] },
        ],
      },
    });
    expect(body(el).getText()).to.equal('Hello');

    el.debounce = 0;
    const input = oneEvent(el, 'input');
    body(el).chain().focus('end').insertContent(' world').run();
    const event = (await input) as CustomEvent<DocumentValueDetail>;
    expect(JSON.stringify(event.detail.value.body)).to.contain('Hello world');
    expect(event.detail.value.page.size).to.equal('a4');
  });

  it('flows long content over several pages', async () => {
    const el = await documentEditor();
    el.importMarkdown(
      Array.from(
        { length: 14 },
        (_, i) => `## Section ${i + 1}\n\n${paragraph}`,
      ).join('\n\n'),
    );
    await waitUntil(() => el.pageCount > 1, 'did not paginate');
    expect(root(el).querySelectorAll('.page').length).to.equal(el.pageCount);
    expect(root(el).querySelectorAll('.page-spacer').length).to.be.greaterThan(
      0,
    );
    expect(root(el).querySelector('.status-bar')?.textContent).to.contain(
      `of ${el.pageCount}`,
    );
  });

  it('starts a new page after a page break', async () => {
    const el = await documentEditor();
    el.importMarkdown('First page\n\nSecond page');
    await waitUntil(() => body(el).getText().includes('Second'));
    const first = body(el).state.doc.child(0);
    body(el)
      .chain()
      .setTextSelection(first.nodeSize - 1)
      .setPageBreak()
      .run();
    await waitUntil(() => el.pageCount === 2, 'no second page');

    const geometry = pageGeometry(el.value.page);
    const pages = root(el).querySelector('.pages') as HTMLElement;
    const second = Array.from(body(el).view.dom.querySelectorAll('p')).find(
      p => p.textContent === 'Second page',
    ) as HTMLElement;
    // In layout pixels: the default fixture is narrower than A4, so the pages are fitted to it.
    const top =
      (second.getBoundingClientRect().top - pages.getBoundingClientRect().top) /
      zoomOf(el)._scale;
    expect(top).to.be.closeTo(
      geometry.height + geometry.gap + geometry.marginTop,
      4,
    );
    expect(el.getMarkdown()).to.contain('<!-- page break -->');
  });

  it('splits a paragraph taller than a page at a line', async () => {
    const el = await documentEditor();
    el.importMarkdown(Array.from({ length: 40 }, () => paragraph).join(' '));
    await waitUntil(() => el.pageCount > 1, 'did not paginate');
    const spacer = root(el).querySelector('.page-spacer') as HTMLElement;
    expect(spacer.parentElement?.tagName).to.equal('P');
  });

  it('changes the page setup from the status bar', async () => {
    const el = await documentEditor();
    el.debounce = 0;
    const pages = root(el).querySelector('.pages') as HTMLElement;
    const portraitWidth = pages.offsetWidth;
    const menu = root(el).querySelectorAll('.status-bar wc-dropdown-button')[1];
    let inputs = 0;
    el.addEventListener('input', () => {
      inputs += 1;
    });
    // An item without a known value changes nothing.
    menu.dispatchEvent(
      new CustomEvent('menu-item-activate', {
        detail: { item: document.createElement('div') },
      }),
    );
    expect(el.value.page.orientation).to.equal('portrait');
    const input = oneEvent(el, 'input');
    const item = document.createElement('div');
    item.setAttribute('value', 'landscape');
    menu.dispatchEvent(
      new CustomEvent('menu-item-activate', { detail: { item } }),
    );
    const event = (await input) as CustomEvent<DocumentValueDetail>;
    expect(event.detail.value.page.orientation).to.equal('landscape');
    expect(inputs).to.equal(1);
    await el.updateComplete;
    expect(pages.offsetWidth).to.be.greaterThan(portraitWidth);
  });

  it('numbers the pages in the footer', async () => {
    const el = await documentEditor();
    el.value = normalizeDocument({
      footer: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Page ' },
              { type: 'pageNumber', attrs: { kind: 'current' } },
              { type: 'text', text: ' of ' },
              { type: 'pageNumber', attrs: { kind: 'total' } },
            ],
          },
        ],
      },
    });
    body(el).chain().setPageBreak().run();
    await waitUntil(() => el.pageCount === 2);
    await el.updateComplete;
    const footers = Array.from(
      root(el).querySelectorAll('.marginal-copy.footer'),
    ).map(footer => footer.textContent?.trim());
    expect(footers).to.deep.equal(['Page 1 of 2', 'Page 2 of 2']);
  });

  it('edits the header on double-click', async () => {
    const el = await documentEditor();
    const copy = root(el).querySelector('.marginal-copy.header') as HTMLElement;
    copy.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    await el.updateComplete;
    expect(
      root(el)
        .querySelector('.marginal-live.header')
        ?.classList.contains('active'),
    ).to.equal(true);
    expect(copy.classList.contains('hidden')).to.equal(true);
    expect(root(el).querySelector('.page-number-menu')).to.exist;
  });

  it('asks the app to store pasted images and inserts only safe addresses', async () => {
    const el = await documentEditor();
    const requests: DocumentImageUploadDetail[] = [];
    el.addEventListener('image-upload', event => {
      requests.push((event as CustomEvent<DocumentImageUploadDetail>).detail);
    });
    const data = new DataTransfer();
    data.items.add(new File(['x'], 'chart.png', { type: 'image/png' }));
    body(el).view.dom.dispatchEvent(
      new ClipboardEvent('paste', {
        clipboardData: data,
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(requests.length).to.equal(1);
    expect(requests[0].file.name).to.equal('chart.png');

    // eslint-disable-next-line no-script-url
    requests[0].respond('javascript:alert(1)');
    expect(JSON.stringify(body(el).getJSON())).to.not.contain('image');
    requests[0].respond('https://example.com/chart.png');
    const image = body(el).view.dom.querySelector('img');
    expect(image?.getAttribute('src')).to.equal(
      'https://example.com/chart.png',
    );
    expect(image?.getAttribute('alt')).to.equal('chart.png');
  });

  it('exports the body as Markdown and HTML', async () => {
    const el = await documentEditor();
    el.importMarkdown('# Title\n\nSome **bold** text');
    expect(el.getMarkdown()).to.contain('# Title');
    expect(el.getMarkdown()).to.contain('**bold**');
    expect(el.getHTML()).to.contain('<h1');
  });

  it('lists headings in the outline and goes to them', async () => {
    const el = await documentEditor();
    el.outlineOpen = true;
    el.importMarkdown('# One\n\nText\n\n## Two\n\nMore');
    await el.updateComplete;
    const buttons = Array.from(
      root(el).querySelectorAll('.outline button'),
    ) as HTMLElement[];
    expect(buttons.map(b => b.textContent?.trim())).to.deep.equal([
      'One',
      'Two',
    ]);
    buttons[1].click();
    await el.updateComplete;
    expect(body(el).state.selection.$from.parent.textContent).to.equal('Two');
  });

  it('hides the formatting tools while read-only, but keeps the zoom', async () => {
    const el = await documentEditor();
    el.readonly = true;
    await el.updateComplete;
    expect(body(el).isEditable).to.equal(false);
    const labels = Array.from(
      root(el).querySelectorAll('.toolbar [aria-label]'),
    ).map(t => t.getAttribute('aria-label'));
    expect(labels).to.not.include('Bold');
    expect(labels).to.include('Print');
    expect(root(el).querySelector('.zoom-menu')).to.exist;
  });
});

describe('DocumentEditor zoom', () => {
  it('fits a page wider than the editor to its width, never above 100%', async () => {
    const narrow = await fixture<DocumentEditor>(
      html`<wc-document-editor
        style="width: 420px; --document-editor-height: 30rem"
      ></wc-document-editor>`,
    );
    await waitUntil(() => zoomOf(narrow)._scale < 1, 'did not fit the page');
    await narrow.updateComplete;
    await frame();
    const canvas = root(narrow).querySelector('.canvas') as HTMLElement;
    const page = root(narrow).querySelector('.page') as HTMLElement;
    expect(canvas.scrollWidth).to.be.at.most(canvas.clientWidth);
    expect(page.getBoundingClientRect().width).to.be.at.most(
      canvas.clientWidth,
    );
    const menu = root(narrow).querySelector('.zoom-menu') as HTMLElement;
    const shown = Array.from(menu.childNodes)
      .filter(node => node.nodeType === Node.TEXT_NODE)
      .map(node => node.textContent)
      .join('')
      .trim();
    expect(shown).to.equal(`${Math.round(zoomOf(narrow)._scale * 100)}%`);

    const wide = await fixture<DocumentEditor>(
      html`<wc-document-editor
        style="width: 1400px; --document-editor-height: 30rem"
      ></wc-document-editor>`,
    );
    await settle(100);
    expect(zoomOf(wide)._scale).to.equal(1);
    const sheet = root(wide).querySelector('.sheet') as HTMLElement;
    expect(sheet.style.transform).to.equal('');
  });

  it('shows a fixed zoom picked in the status bar and reports it', async () => {
    const el = await fixture<DocumentEditor>(
      html`<wc-document-editor
        style="width: 1000px; --document-editor-height: 30rem"
      ></wc-document-editor>`,
    );
    const menu = root(el).querySelector('.zoom-menu') as HTMLElement;
    const item = menu.querySelector('wc-menu-item[value="75"]') as HTMLElement;
    const changed = oneEvent(el, 'zoom-change');
    menu.dispatchEvent(
      new CustomEvent('menu-item-activate', { detail: { item } }),
    );
    expect(
      ((await changed) as CustomEvent<{ zoom: number }>).detail.zoom,
    ).to.equal(75);
    await el.updateComplete;
    expect(el.zoom).to.equal(75);
    const page = root(el).querySelector('.page') as HTMLElement;
    const geometry = pageGeometry(el.value.page);
    expect(page.getBoundingClientRect().width).to.be.closeTo(
      geometry.width * 0.75,
      1,
    );

    el.setAttribute('zoom', 'fit');
    await el.updateComplete;
    expect(el.zoom).to.equal('fit');
  });

  it('paginates to the same pages at 60% as at 100%', async () => {
    const el = await fixture<DocumentEditor>(
      html`<wc-document-editor
        zoom="100"
        style="width: 1000px; --document-editor-height: 30rem"
      ></wc-document-editor>`,
    );
    el.importMarkdown(
      [
        ...Array.from(
          { length: 10 },
          (_, i) => `## Section ${i + 1}\n\n${paragraph}\n\n- One\n- Two`,
        ),
        Array.from({ length: 30 }, () => paragraph).join(' '),
      ].join('\n\n'),
    );
    await waitUntil(() => el.pageCount > 2, 'did not paginate');
    await settle();
    const spacers = () =>
      (paginationKey.getState(body(el).state)?.spacers ?? []).map(spacer => ({
        pos: spacer.pos,
        height: spacer.height,
      }));
    const pages = el.pageCount;
    const atFull = spacers();

    el.zoom = 60;
    await el.updateComplete;
    expect(zoomOf(el)._scale).to.equal(0.6);
    zoomOf(el)._paginateNow();
    await el.updateComplete;
    expect(el.pageCount).to.equal(pages);
    const atSixty = spacers();
    expect(atSixty.map(s => s.pos)).to.deep.equal(atFull.map(s => s.pos));
    atSixty.forEach((spacer, index) =>
      expect(spacer.height).to.be.closeTo(atFull[index].height, 1),
    );

    // The pages and the text are shown at 60%, and the second page starts where it should.
    const geometry = pageGeometry(el.value.page);
    const sheets = root(el).querySelectorAll<HTMLElement>('.page');
    expect(sheets[0].getBoundingClientRect().height).to.be.closeTo(
      geometry.height * 0.6,
      1,
    );
    expect(
      sheets[1].getBoundingClientRect().top -
        sheets[0].getBoundingClientRect().top,
    ).to.be.closeTo((geometry.height + geometry.gap) * 0.6, 1);
  });

  it('keeps threads and the block handle beside their text when zoomed', async () => {
    const el = await fixture<DocumentEditor>(
      html`<wc-document-editor
        zoom="60"
        style="width: 1100px; --document-editor-height: 30rem"
      ></wc-document-editor>`,
    );
    el.importMarkdown(
      [...Array.from({ length: 20 }, () => paragraph), 'Target words'].join(
        '\n\n',
      ),
    );
    await waitUntil(() => el.pageCount > 1, 'did not paginate');
    await settle();
    const editor = body(el);
    let from = -1;
    editor.state.doc.descendants((node, pos) => {
      if (node.isText && node.text?.startsWith('Target')) from = pos;
    });
    editor.commands.setTextSelection({ from, to: from + 6 });
    editor.commands.setComment('z1');
    const thread = document.createElement('div');
    thread.slot = 'comments';
    thread.setAttribute('thread-id', 'z1');
    thread.textContent = 'A thread';
    el.append(thread);
    await waitUntil(() => thread.style.top !== '', 'thread not placed');
    await frame();

    const canvas = root(el).querySelector('.canvas') as HTMLElement;
    const textTop = () => editor.view.coordsAtPos(from).top;
    expect(thread.getBoundingClientRect().top).to.be.closeTo(textTop(), 2);

    const scrolled = oneEvent(canvas, 'scroll');
    canvas.scrollTop = 200;
    await scrolled;
    expect(thread.getBoundingClientRect().top).to.be.closeTo(textTop(), 2);

    // The block handle follows the scaled block.
    const block = editor.view.nodeDOM(0) as HTMLElement;
    const rect = block.getBoundingClientRect();
    block.dispatchEvent(
      new MouseEvent('mousemove', {
        bubbles: true,
        clientX: rect.left + 20,
        clientY: rect.top + 4,
      }),
    );
    await el.updateComplete;
    const handle = root(el).querySelector('.block-handle') as HTMLElement;
    const handleRect = handle.getBoundingClientRect();
    expect(handleRect.right).to.be.at.most(rect.left);
    expect(handleRect.top).to.be.lessThan(rect.top + 14);
    expect(handleRect.bottom).to.be.greaterThan(rect.top);
  });
});
