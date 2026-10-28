/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarSubMenu,
} from '../src/sidebar-menu/index.js';

if (!customElements.get('wc-sidebar-menu')) {
  customElements.define('wc-sidebar-menu', SidebarMenu);
}

if (!customElements.get('wc-sidebar-menu-item')) {
  customElements.define('wc-sidebar-menu-item', SidebarMenuItem);
}

if (!customElements.get('wc-sidebar-sub-menu')) {
  customElements.define('wc-sidebar-sub-menu', SidebarSubMenu);
}

describe('SidebarSubMenu', () => {
  it('shows child items when expanded toggles to true', async () => {
    const el = await fixture<SidebarSubMenu>(html`
      <wc-sidebar-sub-menu label="Parent">
        <wc-sidebar-menu-item label="Child"></wc-sidebar-menu-item>
      </wc-sidebar-sub-menu>
    `);

    await el.updateComplete;

    const childrenContainer = el.shadowRoot!.querySelector(
      '.sidebar-sub-menu-children',
    ) as HTMLDivElement;
    // The whole row toggles a sub-menu that has children.
    const expandButton = el.shadowRoot!.querySelector('#item') as HTMLElement;

    // Collapsed children are hidden with a class, not the `hidden` attribute.
    expect(childrenContainer.classList.contains('hidden')).to.equal(true);

    expandButton.click();
    await el.updateComplete;

    expect(el.expanded).to.equal(true);
    expect(childrenContainer.classList.contains('hidden')).to.equal(false);
  });
});
