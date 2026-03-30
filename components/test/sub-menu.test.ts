/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { Menu, MenuItem, SubMenu } from '../src/index.js';

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
      .shadowRoot!.querySelector('.menu-item')!
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
});
