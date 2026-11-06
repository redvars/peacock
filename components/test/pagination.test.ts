/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect, oneEvent } from '@open-wc/testing';
import { Pagination } from '../src/pagination/index.js';
import { getPageItems } from '../src/pagination/page-items.js';

if (!customElements.get('wc-pagination')) {
  customElements.define('wc-pagination', Pagination);
}

function root(el: Pagination): ShadowRoot {
  return el.shadowRoot as ShadowRoot;
}

function pageButtons(el: Pagination): HTMLButtonElement[] {
  return [...root(el).querySelectorAll<HTMLButtonElement>('.page-button')];
}

describe('getPageItems', () => {
  it('lists every page when they fit', () => {
    expect(getPageItems(1, 1)).to.deep.equal([1]);
    expect(getPageItems(4, 7)).to.deep.equal([1, 2, 3, 4, 5, 6, 7]);
  });

  it('keeps the start pages near the beginning', () => {
    expect(getPageItems(1, 8)).to.deep.equal([1, 2, 3, 4, 5, 'ellipsis', 8]);
    expect(getPageItems(4, 100)).to.deep.equal([
      1,
      2,
      3,
      4,
      5,
      'ellipsis',
      100,
    ]);
  });

  it('keeps the end pages near the end', () => {
    expect(getPageItems(8, 8)).to.deep.equal([1, 'ellipsis', 4, 5, 6, 7, 8]);
    expect(getPageItems(97, 100)).to.deep.equal([
      1,
      'ellipsis',
      96,
      97,
      98,
      99,
      100,
    ]);
  });

  it('shows the current page with its neighbours in the middle', () => {
    expect(getPageItems(50, 100)).to.deep.equal([
      1,
      'ellipsis',
      49,
      50,
      51,
      'ellipsis',
      100,
    ]);
  });

  it('always uses the same number of slots', () => {
    for (let page = 1; page <= 30; page += 1) {
      expect(getPageItems(page, 30)).to.have.length(7);
    }
  });

  it('clamps an out-of-range page', () => {
    expect(getPageItems(0, 3)).to.deep.equal([1, 2, 3]);
    expect(getPageItems(99, 10)).to.deep.equal([1, 'ellipsis', 6, 7, 8, 9, 10]);
  });
});

describe('Pagination', () => {
  it('renders a navigation landmark with the current page marked', async () => {
    const el = await fixture<Pagination>(
      html`<wc-pagination page="3" total-items="240"></wc-pagination>`,
    );
    const nav = root(el).querySelector('nav');
    expect(nav?.getAttribute('aria-label')).to.equal('Pagination');

    const current = pageButtons(el).find(
      button => button.getAttribute('aria-current') === 'page',
    );
    expect(current?.textContent?.trim()).to.equal('3');
    expect(root(el).querySelector('.range')?.textContent?.trim()).to.equal(
      '21–30 of 240',
    );
  });

  it('dispatches a page event when a page number is clicked', async () => {
    const el = await fixture<Pagination>(
      html`<wc-pagination page="1" total-items="240"></wc-pagination>`,
    );
    const target = pageButtons(el).find(
      button => button.textContent?.trim() === '4',
    );
    setTimeout(() => target?.click());
    const event = await oneEvent(el, 'page');
    expect(event.detail).to.deep.equal({ page: 4, pageSize: 10 });
    expect(el.page).to.equal(4);
  });

  it('disables previous on the first page and next on the last', async () => {
    const el = await fixture<Pagination>(
      html`<wc-pagination page="1" total-items="25"></wc-pagination>`,
    );
    const prev = () => root(el).querySelector('.previous') as HTMLElement;
    const next = () => root(el).querySelector('.next') as HTMLElement;
    expect(prev().hasAttribute('disabled')).to.be.true;
    expect(next().hasAttribute('disabled')).to.be.false;

    el.page = 3;
    await el.updateComplete;
    expect(prev().hasAttribute('disabled')).to.be.false;
    expect(next().hasAttribute('disabled')).to.be.true;
  });

  it('clamps the page to the last page', async () => {
    const el = await fixture<Pagination>(
      html`<wc-pagination page="40" total-items="25"></wc-pagination>`,
    );
    expect(el.page).to.equal(3);
  });

  it('renders a jump field in the compact variant', async () => {
    const el = await fixture<Pagination>(
      html`<wc-pagination
        variant="compact"
        page="2"
        total-items="240"
      ></wc-pagination>`,
    );
    expect(root(el).querySelector('.page-list')).to.equal(null);
    const input = root(el).querySelector('.page-input') as HTMLInputElement;
    expect(input.value).to.equal('2');

    input.value = '99';
    setTimeout(() => input.dispatchEvent(new Event('change')));
    const event = await oneEvent(el, 'page');
    // 240 items at 10 per page: 99 is clamped to the last page.
    expect(event.detail.page).to.equal(24);
    expect(input.value).to.equal('24');
  });

  it('shows previous and next only in the simple variant', async () => {
    const el = await fixture<Pagination>(
      html`<wc-pagination variant="simple" total-items="240"></wc-pagination>`,
    );
    expect(root(el).querySelector('.page-list')).to.equal(null);
    expect(root(el).querySelector('.page-input')).to.equal(null);
  });

  it('works without a total, driven by has-next', async () => {
    const el = await fixture<Pagination>(
      html`<wc-pagination page="2" page-size="25" has-next></wc-pagination>`,
    );
    expect(root(el).querySelector('.page-list')).to.equal(null);
    expect(root(el).querySelector('.range')?.textContent?.trim()).to.equal(
      '26–50',
    );
    const next = root(el).querySelector('.next') as HTMLElement;
    expect(next.hasAttribute('disabled')).to.be.false;

    el.hasNext = false;
    await el.updateComplete;
    expect(next.hasAttribute('disabled')).to.be.true;
  });

  it('keeps the first visible item when the page size changes', async () => {
    const el = await fixture<Pagination>(
      html`<wc-pagination page="5" total-items="240"></wc-pagination>`,
    );
    const select = root(el).querySelector('.page-size-select') as HTMLElement;
    setTimeout(() =>
      select.dispatchEvent(
        new CustomEvent('change', { detail: { value: '25' } }),
      ),
    );
    const event = await oneEvent(el, 'page');
    // Item 41 was first on page 5 of 10; with 25 per page it is on page 2.
    expect(event.detail).to.deep.equal({ page: 2, pageSize: 25 });
  });

  it('shows first and last buttons on request', async () => {
    const el = await fixture<Pagination>(
      html`<wc-pagination
        show-first-last
        page="3"
        total-items="240"
      ></wc-pagination>`,
    );
    const last = root(el).querySelector('.last') as HTMLElement;
    setTimeout(() => last.click());
    const event = await oneEvent(el, 'page');
    expect(event.detail.page).to.equal(24);
  });
});
