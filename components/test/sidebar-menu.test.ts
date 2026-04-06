/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { SidebarMenu, SidebarMenuItem, SidebarSubMenu } from '../src/index.js';

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
    const expandButton = el.shadowRoot!.querySelector(
      '.expand-button',
    ) as HTMLButtonElement;

    expect(childrenContainer.hidden).to.equal(true);

    expandButton.click();
    await el.updateComplete;

    expect(el.expanded).to.equal(true);
    expect(childrenContainer.hidden).to.equal(false);
  });
});
