/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarSubMenu,
} from '../src/sidebar-menu/index.js';
import { resetDeprecationWarnings } from '../src/__internal/utils/deprecate.js';

if (!customElements.get('wc-sidebar-menu')) {
  customElements.define('wc-sidebar-menu', SidebarMenu);
}

if (!customElements.get('wc-sidebar-menu-item')) {
  customElements.define('wc-sidebar-menu-item', SidebarMenuItem);
}

if (!customElements.get('wc-sidebar-sub-menu')) {
  customElements.define('wc-sidebar-sub-menu', SidebarSubMenu);
}

describe('SidebarMenu (deprecated)', () => {
  let warnings: string[];
  let original: typeof console.warn;

  beforeEach(() => {
    resetDeprecationWarnings();
    warnings = [];
    original = console.warn;
    console.warn = (message: string) => {
      warnings.push(message);
    };
  });

  afterEach(() => {
    console.warn = original;
  });

  it('warns once per element, naming the navigation drawer', async () => {
    await fixture(html`
      <div>
        <wc-sidebar-menu>
          <wc-sidebar-sub-menu label="Parent">
            <wc-sidebar-menu-item label="A"></wc-sidebar-menu-item>
            <wc-sidebar-menu-item label="B"></wc-sidebar-menu-item>
          </wc-sidebar-sub-menu>
        </wc-sidebar-menu>
        <wc-sidebar-menu></wc-sidebar-menu>
      </div>
    `);
    expect(warnings).to.have.length(3);
    expect(warnings.find(w => w.includes('wc-sidebar-menu:'))).to.contain(
      '<wc-navigation-drawer> with groups',
    );
    expect(warnings.find(w => w.includes('wc-sidebar-sub-menu'))).to.contain(
      '<wc-navigation-drawer-group>',
    );
    expect(warnings.find(w => w.includes('wc-sidebar-menu-item'))).to.contain(
      '<wc-navigation-drawer-item>',
    );
  });

  it('fires change and the old sidebar-menu:change with the same detail', async () => {
    const el = await fixture<SidebarMenu>(html`
      <wc-sidebar-menu>
        <wc-sidebar-menu-item label="Home" value="home"></wc-sidebar-menu-item>
      </wc-sidebar-menu>
    `);
    const item = el.querySelector<SidebarMenuItem>('wc-sidebar-menu-item')!;
    await item.updateComplete;
    const events: CustomEvent[] = [];
    el.addEventListener('change', e => events.push(e as CustomEvent));
    el.addEventListener('sidebar-menu:change', e =>
      events.push(e as CustomEvent),
    );

    (item.shadowRoot!.querySelector('#item') as HTMLElement).click();

    expect(events.map(e => e.type)).to.deep.equal([
      'sidebar-menu:change',
      'change',
    ]);
    expect(events[1].detail).to.include({ value: 'home', item });
    expect(el.selectedItem).to.equal('home');
  });

  it('is a navigation landmark of buttons, not a tree', async () => {
    const el = await fixture<SidebarMenu>(html`
      <wc-sidebar-menu selected-item="home">
        <wc-sidebar-menu-item label="Home" value="home"></wc-sidebar-menu-item>
        <wc-sidebar-sub-menu label="Parent">
          <wc-sidebar-menu-item label="Child"></wc-sidebar-menu-item>
        </wc-sidebar-sub-menu>
      </wc-sidebar-menu>
    `);
    const item = el.querySelector<SidebarMenuItem>('wc-sidebar-menu-item')!;
    const sub = el.querySelector<SidebarSubMenu>('wc-sidebar-sub-menu')!;
    await item.updateComplete;
    await sub.updateComplete;

    expect(el.getAttribute('role')).to.equal('navigation');
    const itemButton = item.shadowRoot!.querySelector('#item')!;
    expect(itemButton.tagName).to.equal('BUTTON');
    expect(itemButton.getAttribute('aria-current')).to.equal('page');
    const subButton = sub.shadowRoot!.querySelector('#item')!;
    expect(subButton.tagName).to.equal('BUTTON');
    expect(subButton.getAttribute('aria-expanded')).to.equal('false');
    expect(sub.hasAttribute('aria-expanded')).to.be.false;
  });
});

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

describe('SidebarMenuItem', () => {
  it('moves focus to its focusable element', async () => {
    const el = await fixture<SidebarMenuItem>(
      html`<wc-sidebar-menu-item label="Home"></wc-sidebar-menu-item>`,
    );
    el.focus();
    expect(el.shadowRoot!.activeElement?.id).to.equal('item');
  });

  it('marks a disabled item aria-disabled="true"', async () => {
    const el = await fixture<SidebarMenuItem>(
      html`<wc-sidebar-menu-item label="Home" disabled></wc-sidebar-menu-item>`,
    );
    expect(
      el.shadowRoot!.querySelector('#item')!.getAttribute('aria-disabled'),
    ).to.equal('true');
  });
});
