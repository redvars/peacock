/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { Item } from '../src/item/index.js';
import { Menu, MenuItem, SubMenu } from '../src/menu/index.js';

if (!customElements.get('wc-item')) {
  customElements.define('wc-item', Item);
}

if (!customElements.get('wc-menu')) {
  customElements.define('wc-menu', Menu);
}

if (!customElements.get('wc-menu-item')) {
  customElements.define('wc-menu-item', MenuItem);
}

if (!customElements.get('wc-sub-menu')) {
  customElements.define('wc-sub-menu', SubMenu);
}

describe('SubMenu', () => {
  it('opens submenu with ArrowRight in LTR', async () => {
    const el = await fixture<Menu>(html`
      <wc-menu open>
        <wc-sub-menu>
          <wc-menu-item slot="item">Parent</wc-menu-item>
          <wc-menu slot="menu">
            <wc-menu-item>Child</wc-menu-item>
          </wc-menu>
        </wc-sub-menu>
      </wc-menu>
    `);

    const subMenu = el.querySelector<SubMenu>('wc-sub-menu')!;
    const item = subMenu.item!;

    item
      .shadowRoot!.querySelector('wc-item')!
      .dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowRight',
          bubbles: true,
          composed: true,
        }),
      );

    await el.updateComplete;
    await subMenu.updateComplete;

    expect(subMenu.menu?.open).to.equal(true);
    expect(item.submenuOpen).to.equal(true);
  });

  it('closes only one level on Escape', async () => {
    const el = await fixture<Menu>(html`
      <wc-menu open>
        <wc-sub-menu>
          <wc-menu-item slot="item">Parent</wc-menu-item>
          <wc-menu slot="menu" open>
            <wc-menu-item>Child</wc-menu-item>
          </wc-menu>
        </wc-sub-menu>
      </wc-menu>
    `);

    const subMenu = el.querySelector<SubMenu>('wc-sub-menu')!;
    const childMenu = subMenu.menu!;

    childMenu.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        composed: true,
      }),
    );

    await el.updateComplete;
    await subMenu.updateComplete;

    expect(childMenu.open).to.equal(false);
    expect(el.open).to.equal(true);
  });

  it('keeps ArrowDown navigation within the submenu', async () => {
    const el = await fixture<Menu>(html`
      <wc-menu open>
        <wc-sub-menu>
          <wc-menu-item slot="item">Parent</wc-menu-item>
          <wc-menu slot="menu" open>
            <wc-menu-item>Child 1</wc-menu-item>
            <wc-menu-item>Child 2</wc-menu-item>
          </wc-menu>
        </wc-sub-menu>
        <wc-menu-item>Sibling</wc-menu-item>
      </wc-menu>
    `);

    await el.updateComplete;

    const subMenu = el.querySelector<SubMenu>('wc-sub-menu')!;
    const childMenu = subMenu.menu!;
    const childItems = childMenu.querySelectorAll<MenuItem>('wc-menu-item');
    const parentItems = el.items;

    parentItems[0].tabIndex = 0;
    parentItems[1].tabIndex = -1;
    childItems[0].tabIndex = 0;
    childItems[1].tabIndex = -1;

    childItems[0].shadowRoot!.querySelector('wc-item')!.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        composed: true,
      }),
    );

    await childMenu.updateComplete;
    await el.updateComplete;

    expect(childItems[0].tabIndex).to.equal(-1);
    expect(childItems[1].tabIndex).to.equal(0);
    expect(parentItems[0].tabIndex).to.equal(0);
    expect(parentItems[1].tabIndex).to.equal(-1);
  });

  it('closes the parent menu when a submenu item is picked', async () => {
    const el = await fixture<Menu>(html`
      <wc-menu open>
        <wc-sub-menu>
          <wc-menu-item slot="item">Parent</wc-menu-item>
          <wc-menu slot="menu" open>
            <wc-menu-item>Child</wc-menu-item>
          </wc-menu>
        </wc-sub-menu>
      </wc-menu>
    `);

    const subMenu = el.querySelector<SubMenu>('wc-sub-menu')!;
    const child = subMenu.menu!.querySelector<MenuItem>('wc-menu-item')!;
    child.shadowRoot!.querySelector<HTMLElement>('#menu-item')!.click();
    await subMenu.menu!.updateComplete;
    await el.updateComplete;

    expect(subMenu.menu!.open).to.equal(false);
    expect(el.open).to.equal(false);
  });

  it('marks its item as having a submenu and inherits the parent variant', async () => {
    const el = await fixture<Menu>(html`
      <wc-menu open variant="expressive">
        <wc-sub-menu>
          <wc-menu-item slot="item">Parent</wc-menu-item>
          <wc-menu slot="menu">
            <wc-menu-item>Child</wc-menu-item>
          </wc-menu>
        </wc-sub-menu>
      </wc-menu>
    `);

    const subMenu = el.querySelector<SubMenu>('wc-sub-menu')!;
    expect(subMenu.item!.hasSubmenu).to.be.true;

    await subMenu.show();
    await subMenu.menu!.updateComplete;
    expect(subMenu.menu!.variant).to.equal('expressive');
    expect(subMenu.item!.submenuOpen).to.be.true;
  });

  it('opens the nested menu on the logical end side, without deprecation warnings', async () => {
    const warnings: string[] = [];
    const originalWarn = console.warn;
    console.warn = (message: string) => warnings.push(message);
    try {
      const el = await fixture<Menu>(html`
        <wc-menu open>
          <wc-sub-menu>
            <wc-menu-item slot="item">Parent</wc-menu-item>
            <wc-menu slot="menu">
              <wc-menu-item>Child</wc-menu-item>
            </wc-menu>
          </wc-sub-menu>
        </wc-menu>
      `);
      const subMenu = el.querySelector<SubMenu>('wc-sub-menu')!;
      await subMenu.show();
      await subMenu.menu!.updateComplete;

      expect(subMenu.menu!.placement).to.equal('end-start');
      expect(warnings.filter(w => w.includes('wc-menu'))).to.deep.equal([]);
    } finally {
      console.warn = originalWarn;
    }
  });
});
