/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
// Import modules directly: src/index.js pulls in html-editor's CommonJS js-beautify, which the
// test server cannot load.
import { Item } from '../src/item/index.js';
import { List, ListItem } from '../src/list/index.js';

if (!customElements.get('wc-item')) {
  customElements.define('wc-item', Item);
}

if (!customElements.get('wc-list')) {
  customElements.define('wc-list', List);
}

if (!customElements.get('wc-list-item')) {
  customElements.define('wc-list-item', ListItem);
}

async function settle(list: List) {
  await list.updateComplete;
  await Promise.all(list.items.map(item => item.updateComplete));
}

function press(target: Element, key: string) {
  target.dispatchEvent(
    new KeyboardEvent('keydown', { key, bubbles: true, composed: true }),
  );
}

/** Elements assigned to the wc-item slot `name`, flattened through list-item's own slots. */
function assignedTo(item: ListItem, name: string) {
  const wcItem = item.shadowRoot?.querySelector<Item>('wc-item');
  const slot = wcItem?.shadowRoot?.querySelector<HTMLSlotElement>(
    `slot[name="${name}"]`,
  );
  return slot?.assignedElements({ flatten: true }) ?? [];
}

describe('List', () => {
  it('gives only the first actionable item tabindex 0', async () => {
    const el = await fixture<List>(html`
      <wc-list>
        <wc-list-item>Static</wc-list-item>
        <wc-list-item actionable>One</wc-list-item>
        <wc-list-item actionable>Two</wc-list-item>
      </wc-list>
    `);
    await settle(el);

    const [stat, one, two] = el.items;
    expect(stat.tabIndex).to.equal(-1);
    expect(one.tabIndex).to.equal(0);
    expect(two.tabIndex).to.equal(-1);
  });

  it('moves the roving tabindex with arrows, Home and End', async () => {
    const el = await fixture<List>(html`
      <wc-list>
        <wc-list-item actionable>One</wc-list-item>
        <wc-list-item>Static</wc-list-item>
        <wc-list-item actionable>Two</wc-list-item>
        <wc-list-item actionable>Three</wc-list-item>
      </wc-list>
    `);
    await settle(el);

    const [one, , two, three] = el.items;
    const active = () => el.items.find(item => item.tabIndex === 0);

    press(one, 'ArrowDown');
    expect(active()).to.equal(two);

    press(two, 'ArrowDown');
    expect(active()).to.equal(three);

    // Wraps around.
    press(three, 'ArrowDown');
    expect(active()).to.equal(one);

    press(one, 'ArrowUp');
    expect(active()).to.equal(three);

    press(three, 'Home');
    expect(active()).to.equal(one);

    press(one, 'End');
    expect(active()).to.equal(three);
  });

  it('renders the selected background on non-actionable items', async () => {
    const el = await fixture<List>(html`
      <wc-list style="--list-item-selected-container-color: rgb(1, 2, 3)">
        <wc-list-item selected>Inbox</wc-list-item>
        <wc-list-item>Sent</wc-list-item>
      </wc-list>
    `);
    await settle(el);

    const [selected, plain] = el.items;
    const background = selected.shadowRoot?.querySelector('.background');
    expect(background).to.exist;
    expect(getComputedStyle(background as Element).backgroundColor).to.equal(
      'rgb(1, 2, 3)',
    );

    const plainBackground = plain.shadowRoot?.querySelector('.background');
    expect(plainBackground).to.exist;
    expect(
      getComputedStyle(plainBackground as Element).backgroundColor,
    ).to.equal('rgba(0, 0, 0, 0)');

    // No interaction layers on a static row.
    expect(selected.shadowRoot?.querySelector('wc-ripple')).to.equal(null);
    expect(selected.shadowRoot?.querySelector('wc-focus-ring')).to.equal(null);
  });

  it('renders ripple and focus ring on actionable items', async () => {
    const el = await fixture<ListItem>(html`
      <wc-list-item actionable>Profile</wc-list-item>
    `);
    expect(el.shadowRoot?.querySelector('.background')).to.exist;
    expect(el.shadowRoot?.querySelector('wc-ripple')).to.exist;
    expect(el.shadowRoot?.querySelector('wc-focus-ring')).to.exist;
  });

  it('places start and end content', async () => {
    const el = await fixture<ListItem>(html`
      <wc-list-item>
        <span slot="start">Start</span>
        Profile
        <span slot="end">End</span>
      </wc-list-item>
    `);
    await el.updateComplete;

    expect(assignedTo(el, 'start').map(n => n.textContent)).to.deep.equal([
      'Start',
    ]);
    expect(assignedTo(el, 'end').map(n => n.textContent)).to.deep.equal([
      'End',
    ]);
  });

  it('places the deprecated leading and trailing content in the same slots', async () => {
    const el = await fixture<ListItem>(html`
      <wc-list-item>
        <span slot="leading">Leading</span>
        Profile
        <span slot="trailing">Trailing</span>
      </wc-list-item>
    `);
    await el.updateComplete;

    expect(assignedTo(el, 'start').map(n => n.textContent)).to.deep.equal([
      'Leading',
    ]);
    expect(assignedTo(el, 'end').map(n => n.textContent)).to.deep.equal([
      'Trailing',
    ]);
  });

  it('shows start content added after the first render', async () => {
    const el = await fixture<ListItem>(
      html`<wc-list-item>Profile</wc-list-item>`,
    );
    expect(assignedTo(el, 'start')).to.have.length(0);

    const icon = document.createElement('span');
    icon.slot = 'start';
    icon.textContent = 'Icon';
    el.append(icon);

    // MutationObserver → list-item update → wc-item update.
    await new Promise(resolve => {
      setTimeout(resolve);
    });
    await el.updateComplete;
    const wcItem = el.shadowRoot?.querySelector<Item>('wc-item');
    await wcItem?.updateComplete;

    expect(assignedTo(el, 'start').map(n => n.textContent)).to.deep.equal([
      'Icon',
    ]);
    const startSlot = wcItem?.shadowRoot?.querySelector('slot[name="start"]');
    expect(startSlot?.hasAttribute('hidden')).to.equal(false);
  });

  it('sets position attributes on items', async () => {
    const el = await fixture<List>(html`
      <wc-list variant="segmented">
        <wc-list-item>One</wc-list-item>
        <wc-list-item>Two</wc-list-item>
        <wc-list-item>Three</wc-list-item>
      </wc-list>
    `);
    await settle(el);

    expect(
      el.items.map(item => item.getAttribute('list-position')),
    ).to.deep.equal(['first', 'middle', 'last']);

    el.items[2].remove();
    el.items[1].remove();
    await new Promise(resolve => {
      setTimeout(resolve);
    });
    await settle(el);
    expect(el.items[0].getAttribute('list-position')).to.equal('only');
  });

  it('rounds the outer corners of segmented rows', async () => {
    const el = await fixture<List>(html`
      <wc-list
        variant="segmented"
        style="--shape-corner-medium: 4px; --shape-corner-large: 16px"
      >
        <wc-list-item>One</wc-list-item>
        <wc-list-item>Two</wc-list-item>
      </wc-list>
    `);
    await settle(el);

    const radii = (item: ListItem) => {
      const style = getComputedStyle(
        item.shadowRoot?.querySelector('.background') as Element,
      );
      return [style.borderTopLeftRadius, style.borderBottomLeftRadius];
    };

    expect(radii(el.items[0])).to.deep.equal(['16px', '4px']);
    expect(radii(el.items[1])).to.deep.equal(['4px', '16px']);
  });
});
