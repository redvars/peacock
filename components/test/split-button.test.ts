/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
// Import modules directly: src/index.js pulls in html-editor's CommonJS js-beautify, which the
// test server cannot load.
import { Item } from '../src/item/index.js';
import { Menu, MenuItem } from '../src/menu/index.js';
import { SplitButton } from '../src/split-button/index.js';

if (!customElements.get('wc-item')) {
  customElements.define('wc-item', Item);
}

if (!customElements.get('wc-menu')) {
  customElements.define('wc-menu', Menu);
}

if (!customElements.get('wc-menu-item')) {
  customElements.define('wc-menu-item', MenuItem);
}

if (!customElements.get('wc-split-button')) {
  customElements.define('wc-split-button', SplitButton);
}

type AriaTrigger = HTMLElement & { configAria: Record<string, string> };

function parts(el: SplitButton) {
  const root = el.shadowRoot!;
  const actionEl = root.querySelector<HTMLElement>('.action-button')!;
  const triggerEl = root.querySelector<AriaTrigger>('.dropdown-trigger')!;
  const menu = root.querySelector<Menu>('wc-menu')!;
  return { actionEl, triggerEl, menu };
}

async function settle(el: SplitButton) {
  await el.updateComplete;
  await parts(el).menu.updateComplete;
  await el.updateComplete;
}

describe('SplitButton', () => {
  it('opens and closes the menu from the trigger, anchored to the button', async () => {
    const el = await fixture<SplitButton>(html`
      <wc-split-button>
        Save
        <wc-menu-item slot="menu">Save as draft</wc-menu-item>
      </wc-split-button>
    `);
    const { triggerEl, menu } = parts(el);

    triggerEl.click();
    await settle(el);
    expect(menu.open).to.be.true;
    expect(menu.anchorElement).to.equal(el);
    expect(triggerEl.configAria['aria-expanded']).to.equal('true');
    expect(triggerEl.configAria['aria-controls']).to.equal(menu.id);
    expect(triggerEl.configAria['aria-label']).to.be.a('string').and.not.empty;

    triggerEl.click();
    await settle(el);
    expect(menu.open).to.be.false;
    expect(triggerEl.configAria['aria-expanded']).to.equal('false');
  });

  it('opens on the first item with Arrow Down and the last with Arrow Up', async () => {
    const el = await fixture<SplitButton>(html`
      <wc-split-button>
        Save
        <wc-menu-item slot="menu">Draft</wc-menu-item>
        <wc-menu-item slot="menu">Publish</wc-menu-item>
      </wc-split-button>
    `);
    const { triggerEl } = parts(el);
    const items = el.querySelectorAll('wc-menu-item');

    triggerEl.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    );
    await settle(el);
    expect(document.activeElement === items[0]).to.be.true;

    el.close();
    await settle(el);

    triggerEl.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }),
    );
    await settle(el);
    expect(document.activeElement === items[1]).to.be.true;
  });

  it('reports toggle-menu and keeps the menu open/close events inside', async () => {
    const el = await fixture<SplitButton>(html`
      <wc-split-button>
        Save
        <wc-menu-item slot="menu">Draft</wc-menu-item>
      </wc-split-button>
    `);
    const toggles: boolean[] = [];
    const leaked: string[] = [];
    el.addEventListener('toggle-menu', event =>
      toggles.push((event as CustomEvent<{ open: boolean }>).detail.open),
    );
    for (const type of ['open', 'close']) {
      document.addEventListener(type, () => leaked.push(type), { once: true });
    }

    el.show();
    await settle(el);
    el.close();
    await settle(el);

    expect(toggles).to.deep.equal([true, false]);
    expect(leaked).to.deep.equal([]);
  });

  it('closes the menu when the primary action is clicked', async () => {
    const el = await fixture<SplitButton>(html`
      <wc-split-button>
        Save
        <wc-menu-item slot="menu">Draft</wc-menu-item>
      </wc-split-button>
    `);
    const { actionEl, menu } = parts(el);

    el.show();
    await settle(el);
    expect(menu.open).to.be.true;

    actionEl.click();
    await settle(el);
    expect(menu.open).to.be.false;
  });

  it('does not open when disabled', async () => {
    const el = await fixture<SplitButton>(html`
      <wc-split-button disabled>
        Save
        <wc-menu-item slot="menu">Draft</wc-menu-item>
      </wc-split-button>
    `);
    parts(el).triggerEl.click();
    el.show();
    await settle(el);
    expect(parts(el).menu.open).to.be.false;
  });

  it('places the menu at bottom-end by default and takes logical placements', async () => {
    const el = await fixture<SplitButton>(html`
      <wc-split-button>
        Save
        <wc-menu-item slot="menu">Draft</wc-menu-item>
      </wc-split-button>
    `);
    expect(el.placement).to.equal('bottom-end');
    expect(parts(el).menu.placement).to.equal('bottom-end');

    el.placement = 'top-start';
    await el.updateComplete;
    expect(parts(el).menu.placement).to.equal('top-start');
    expect(el.getAttribute('placement')).to.equal('top-start');
  });
});
