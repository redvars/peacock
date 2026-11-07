/// <reference types="mocha" />
import { html } from 'lit';
import { fixtureSync, expect, waitUntil } from '@open-wc/testing';
import {
  VirtualList,
  type VirtualListEndReachedDetail,
} from '../src/virtual-list/index.js';

if (!customElements.get('wc-virtual-list')) {
  customElements.define('wc-virtual-list', VirtualList);
}

const range = (length: number) =>
  Array.from({ length }, (_, index) => `Item ${index + 1}`);

async function settle(el: VirtualList) {
  for (let round = 0; round < 3; round += 1) {
    // eslint-disable-next-line no-await-in-loop
    await el.updateComplete;
  }
}

async function mount(
  items: unknown[],
  template = html`<wc-virtual-list
    label="Items"
    item-height="20"
    style="height: 200px"
  ></wc-virtual-list>`,
) {
  const el = fixtureSync<VirtualList>(template);
  el.items = items;
  await settle(el);
  return el;
}

function rows(el: VirtualList) {
  return Array.from(
    el.querySelectorAll<HTMLElement>(':scope > [role=listitem]'),
  );
}

function indices(el: VirtualList) {
  return rows(el).map(row => Number(row.dataset.index));
}

function scrollTo(el: VirtualList, top: number) {
  el.scrollTo({ top });
  el.dispatchEvent(new Event('scroll'));
}

function press(target: Element, key: string) {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    composed: true,
    cancelable: true,
  });
  target.dispatchEvent(event);
  return event;
}

describe('wc-virtual-list', () => {
  it('renders only the items in view, with the real size for screen readers', async () => {
    const el = await mount(range(10000));
    expect(el.getAttribute('role')).to.equal('list');
    expect(el.getAttribute('aria-label')).to.equal('Items');
    const shown = rows(el);
    // 200px / 20px = 10 visible, + 1 partial, + 3 overscan below.
    expect(shown.length).to.equal(14);
    expect(shown[0].getAttribute('aria-setsize')).to.equal('10000');
    expect(shown[0].getAttribute('aria-posinset')).to.equal('1');
    expect(shown[0].textContent?.trim()).to.equal('Item 1');
    const content = el.shadowRoot?.querySelector<HTMLElement>('.content');
    expect(content?.style.blockSize).to.equal('200000px');
  });

  it('renders the window around the scroll position', async () => {
    const el = await mount(range(10000));
    scrollTo(el, 2000);
    await settle(el);
    const shown = indices(el);
    expect(shown[0]).to.equal(97);
    expect(shown).to.include(100);
    expect(shown).to.include(109);
    const row = rows(el).find(item => item.dataset.index === '100');
    expect(row?.style.insetBlockStart).to.equal('2000px');
    expect(row?.getAttribute('aria-posinset')).to.equal('101');
  });

  it('scrolls to an index with an alignment', async () => {
    const el = await mount(range(10000));
    el.scrollToIndex(5000, { align: 'start' });
    await settle(el);
    expect(el.scrollTop).to.equal(100000);
    expect(indices(el)).to.include(5000);

    el.scrollToIndex(5000, { align: 'end' });
    await settle(el);
    expect(el.scrollTop).to.equal(100000 + 20 - 200);

    // Already in view: nearest does not move.
    el.scrollToIndex(4995);
    await settle(el);
    expect(el.scrollTop).to.equal(100000 + 20 - 200);

    el.scrollToIndex(20000, { align: 'center' });
    await settle(el);
    expect(indices(el)).to.include(9999);
  });

  it('keeps a focused item rendered when it scrolls out of view', async () => {
    const el = await mount(range(10000));
    const row = rows(el)[2];
    row.dispatchEvent(
      new FocusEvent('focusin', { bubbles: true, composed: true }),
    );
    scrollTo(el, 50000);
    await settle(el);
    const shown = indices(el);
    expect(shown[0]).to.equal(2);
    expect(shown).to.include(2500);
    expect(rows(el)[0]).to.equal(row);

    row.dispatchEvent(
      new FocusEvent('focusout', { bubbles: true, composed: true }),
    );
    await settle(el);
    expect(indices(el)).not.to.include(2);
  });

  it('fires end-reached once per length and keeps the scroll position on append', async () => {
    const el = fixtureSync<VirtualList>(
      html`<wc-virtual-list
        item-height="20"
        threshold="2"
        style="height: 200px"
      ></wc-virtual-list>`,
    );
    const counts: number[] = [];
    el.addEventListener('end-reached', event =>
      counts.push(
        (event as CustomEvent<VirtualListEndReachedDetail>).detail.count,
      ),
    );
    el.items = range(100);
    await settle(el);
    expect(counts).to.deep.equal([]);

    scrollTo(el, 1500);
    await settle(el);
    expect(counts).to.deep.equal([]);
    scrollTo(el, 1760);
    await settle(el);
    expect(counts).to.deep.equal([100]);
    scrollTo(el, 1780);
    await settle(el);
    expect(counts).to.deep.equal([100]);

    el.items = [...el.items, ...range(100)];
    await settle(el);
    expect(el.scrollTop).to.equal(1780);
    expect(counts).to.deep.equal([100]);
    scrollTo(el, 3800);
    await settle(el);
    expect(counts).to.deep.equal([100, 200]);
  });

  it('fires end-reached for a list shorter than its view, but not while loading', async () => {
    const el = fixtureSync<VirtualList>(
      html`<wc-virtual-list
        loading
        item-height="20"
        style="height: 200px"
      ></wc-virtual-list>`,
    );
    let fired = 0;
    el.addEventListener('end-reached', () => {
      fired += 1;
    });
    el.items = range(3);
    await settle(el);
    expect(el.getAttribute('aria-busy')).to.equal('true');
    expect(el.shadowRoot?.querySelector('.loading')).to.exist;
    expect(fired).to.equal(0);
    el.loading = false;
    await settle(el);
    expect(el.hasAttribute('aria-busy')).to.equal(false);
    expect(fired).to.equal(1);
  });

  it('renders Lit templates and DOM nodes from renderItem', async () => {
    const el = await mount([{ name: 'Ada' }, { name: 'Grace' }]);
    el.renderItem = (item, index) =>
      html`<strong>${index}: ${(item as { name: string }).name}</strong>`;
    await settle(el);
    expect(rows(el)[1].querySelector('strong')?.textContent).to.equal(
      '1: Grace',
    );

    el.renderItem = item => {
      const span = document.createElement('span');
      span.textContent = (item as { name: string }).name;
      return span;
    };
    await settle(el);
    expect(rows(el)[0].querySelector('span')?.textContent).to.equal('Ada');
  });

  it('moves a roving tab stop through every item with navigable', async () => {
    const el = await mount(
      range(1000),
      html`<wc-virtual-list
        navigable
        item-height="20"
        style="height: 200px"
      ></wc-virtual-list>`,
    );
    const first = rows(el)[0];
    expect(first.getAttribute('tabindex')).to.equal('0');
    expect(rows(el)[1].getAttribute('tabindex')).to.equal('-1');

    first.focus();
    expect(press(first, 'ArrowDown').defaultPrevented).to.equal(true);
    await settle(el);
    const second = rows(el).find(row => row.dataset.index === '1');
    expect(second?.getAttribute('tabindex')).to.equal('0');
    expect(first.getAttribute('tabindex')).to.equal('-1');

    press(second as HTMLElement, 'End');
    await settle(el);
    await waitUntil(() => indices(el).includes(999));
    const last = rows(el).find(row => row.dataset.index === '999');
    expect(last?.getAttribute('tabindex')).to.equal('0');
    expect(el.scrollTop).to.equal(1000 * 20 - 200);

    press(last as HTMLElement, 'PageUp');
    await settle(el);
    expect(
      rows(el)
        .find(row => row.dataset.index === '989')
        ?.getAttribute('tabindex'),
    ).to.equal('0');
  });

  it('leaves items out of the tab order without navigable', async () => {
    const el = await mount(range(10));
    expect(rows(el)[0].hasAttribute('tabindex')).to.equal(false);
    expect(press(rows(el)[0], 'ArrowDown').defaultPrevented).to.equal(false);
  });
});
