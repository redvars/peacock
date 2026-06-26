/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { Item, Menu, MenuItem } from '../src/index.js';

if (!customElements.get('wc-item')) {
  customElements.define('wc-item', Item);
}

if (!customElements.get('wc-menu')) {
  customElements.define('wc-menu', Menu);
}

if (!customElements.get('wc-menu-item')) {
  customElements.define('wc-menu-item', MenuItem);
}

describe('Menu', () => {
  it('sets roving tabindex when opened', async () => {
    const el = await fixture<Menu>(html`
      <wc-menu open>
        <wc-menu-item>One</wc-menu-item>
        <wc-menu-item>Two</wc-menu-item>
      </wc-menu>
    `);

    await el.updateComplete;

    const items = el.querySelectorAll<MenuItem>('wc-menu-item');
    expect(items[0].tabIndex).to.equal(0);
    expect(items[1].tabIndex).to.equal(-1);
  });

  it('moves active item with ArrowDown and ArrowUp', async () => {
    const el = await fixture<Menu>(html`
      <wc-menu open>
        <wc-menu-item>One</wc-menu-item>
        <wc-menu-item>Two</wc-menu-item>
      </wc-menu>
    `);

    el.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    );
    await el.updateComplete;

    let items = el.querySelectorAll<MenuItem>('wc-menu-item');
    expect(items[0].tabIndex).to.equal(-1);
    expect(items[1].tabIndex).to.equal(0);

    el.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }),
    );
    await el.updateComplete;

    items = el.querySelectorAll<MenuItem>('wc-menu-item');
    expect(items[0].tabIndex).to.equal(0);
    expect(items[1].tabIndex).to.equal(-1);
  });

  it('closes on menu item selection', async () => {
    const el = await fixture<Menu>(html`
      <wc-menu open>
        <wc-menu-item>One</wc-menu-item>
      </wc-menu>
    `);

    const item = el.querySelector<MenuItem>('wc-menu-item')!;
    const target = item.shadowRoot!
      .querySelector('wc-item')!
      .shadowRoot!.querySelector('.item') as HTMLElement;
    target.click();

    await el.updateComplete;
    expect(el.open).to.equal(false);
  });

  it('emits menu-item-activate when an item is selected', async () => {
    const el = await fixture<Menu>(html`
      <wc-menu open>
        <wc-menu-item value="one">One</wc-menu-item>
      </wc-menu>
    `);

    let activatedItem: MenuItem | undefined;
    el.addEventListener('menu-item-activate', (event: Event) => {
      activatedItem = (event as CustomEvent<{ item: MenuItem }>).detail.item;
    });

    const item = el.querySelector<MenuItem>('wc-menu-item')!;
    const target = item.shadowRoot!
      .querySelector('wc-item')!
      .shadowRoot!.querySelector('.item') as HTMLElement;
    target.click();

    await el.updateComplete;
    expect(activatedItem).to.equal(item);
  });

  it('closes on outside click', async () => {
    const anchor = document.createElement('button');
    anchor.id = 'menu-anchor';
    document.body.append(anchor);

    const el = await fixture<Menu>(html`
      <wc-menu open anchor="menu-anchor">
        <wc-menu-item>One</wc-menu-item>
      </wc-menu>
    `);

    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await el.updateComplete;

    expect(el.open).to.equal(false);
    anchor.remove();
  });

  it('applies selective block elevation variables to items based on positions', async () => {
    const el = await fixture<Menu>(html`
      <wc-menu open>
        <wc-menu-item id="item1">One</wc-menu-item>
        <wc-menu-item id="item2">Two</wc-menu-item>
        <wc-divider></wc-divider>
        <wc-menu-item id="item3">Three</wc-menu-item>
        <wc-menu-item id="item4">Four</wc-menu-item>
      </wc-menu>
    `);

    await el.updateComplete;

    const item1 = el.querySelector('#item1') as HTMLElement;
    const item2 = el.querySelector('#item2') as HTMLElement;
    const item3 = el.querySelector('#item3') as HTMLElement;
    const item4 = el.querySelector('#item4') as HTMLElement;

    expect(item1.hasAttribute('data-position-first')).to.be.true;
    expect(item1.hasAttribute('data-position-last')).to.be.false;
    expect(item1.hasAttribute('data-position-before-divider')).to.be.false;
    expect(item1.hasAttribute('data-position-after-divider')).to.be.false;

    expect(item2.hasAttribute('data-position-before-divider')).to.be.true;

    expect(item3.hasAttribute('data-position-after-divider')).to.be.true;

    expect(item4.hasAttribute('data-position-last')).to.be.true;
    expect(item4.hasAttribute('data-position-first')).to.be.false;
    expect(item4.hasAttribute('data-position-before-divider')).to.be.false;
    expect(item4.hasAttribute('data-position-after-divider')).to.be.false;
  });

});

