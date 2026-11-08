/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { Button } from '../src/button/button/button.js';
import { Item } from '../src/item/index.js';
import { Menu, MenuItem } from '../src/menu/index.js';
import { DropdownButton } from '../src/dropdown-button/index.js';

if (!customElements.get('wc-button')) {
  customElements.define('wc-button', Button);
}

if (!customElements.get('wc-item')) {
  customElements.define('wc-item', Item);
}

if (!customElements.get('wc-menu')) {
  customElements.define('wc-menu', Menu);
}

if (!customElements.get('wc-menu-item')) {
  customElements.define('wc-menu-item', MenuItem);
}

if (!customElements.get('wc-dropdown-button')) {
  customElements.define('wc-dropdown-button', DropdownButton);
}

function parts(el: DropdownButton) {
  const triggerEl = el.shadowRoot!.querySelector<Button>('.trigger-button')!;
  const menu = el.shadowRoot!.querySelector<Menu>('wc-menu')!;
  return { triggerEl, menu };
}

/** The native `<button>` inside the trigger's shadow root, which carries the ARIA. */
function nativeTrigger(el: DropdownButton) {
  return parts(el).triggerEl.shadowRoot!.querySelector('button')!;
}

async function settle(el: DropdownButton) {
  await el.updateComplete;
  await parts(el).menu.updateComplete;
  await parts(el).triggerEl.updateComplete;
}

describe('DropdownButton', () => {
  it('opens and closes the menu when the button is clicked twice', async () => {
    const el = await fixture<DropdownButton>(html`
      <wc-dropdown-button>
        Actions
        <wc-menu-item slot="menu">Edit</wc-menu-item>
      </wc-dropdown-button>
    `);
    const { triggerEl, menu } = parts(el);

    triggerEl.click();
    await settle(el);
    expect(menu.open).to.be.true;
    expect(menu.anchorElement).to.equal(el);

    triggerEl.click();
    await settle(el);
    expect(menu.open).to.be.false;
  });

  it('opens on the first item with Arrow Down and the last with Arrow Up', async () => {
    const el = await fixture<DropdownButton>(html`
      <wc-dropdown-button>
        Actions
        <wc-menu-item slot="menu">Edit</wc-menu-item>
        <wc-menu-item slot="menu">Delete</wc-menu-item>
      </wc-dropdown-button>
    `);
    const { triggerEl, menu } = parts(el);
    const items = el.querySelectorAll('wc-menu-item');

    triggerEl.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    );
    await settle(el);
    expect(document.activeElement === items[0]).to.be.true;

    menu.close();
    await settle(el);

    triggerEl.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }),
    );
    await settle(el);
    expect(document.activeElement === items[1]).to.be.true;
  });

  it('does not open when disabled', async () => {
    const el = await fixture<DropdownButton>(html`
      <wc-dropdown-button disabled>
        Actions
        <wc-menu-item slot="menu">Edit</wc-menu-item>
      </wc-dropdown-button>
    `);
    el.show();
    await settle(el);
    expect(parts(el).menu.open).to.be.false;
  });

  it('fires its own open and close, with the menu reason, and updates the trigger ARIA', async () => {
    const el = await fixture<DropdownButton>(html`
      <wc-dropdown-button>
        Actions
        <wc-menu-item slot="menu">Edit</wc-menu-item>
      </wc-dropdown-button>
    `);
    const { triggerEl } = parts(el);
    const seen: string[] = [];
    const record = (event: Event) => {
      const { reason } =
        (event as CustomEvent<{ reason?: string } | null>).detail ?? {};
      const from = event.target === el ? 'host' : 'inner';
      seen.push([event.type, from, reason].filter(Boolean).join(':'));
    };
    document.addEventListener('open', record);
    document.addEventListener('close', record);
    const aria = (name: string) => nativeTrigger(el).getAttribute(name);

    expect(aria('aria-expanded')).to.equal('false');
    expect(aria('aria-haspopup')).to.equal('menu');
    // The menu lives in the dropdown button's shadow root, out of reach of an ID reference.
    expect(aria('aria-controls')).to.be.null;

    el.show();
    await settle(el);
    await el.updateComplete;
    await triggerEl.updateComplete;
    expect(aria('aria-expanded')).to.equal('true');
    expect(triggerEl.classList.contains('active')).to.be.true;

    el.close();
    await settle(el);
    await el.updateComplete;
    await triggerEl.updateComplete;
    expect(aria('aria-expanded')).to.equal('false');
    document.removeEventListener('open', record);
    document.removeEventListener('close', record);
    expect(seen).to.deep.equal(['open:host', 'close:host:api']);
  });

  it('passes logical placements to the menu', async () => {
    const el = await fixture<DropdownButton>(html`
      <wc-dropdown-button placement="end-start">
        Actions
        <wc-menu-item slot="menu">Edit</wc-menu-item>
      </wc-dropdown-button>
    `);
    expect(parts(el).menu.placement).to.equal('end-start');

    el.placement = 'top-end';
    await el.updateComplete;
    expect(parts(el).menu.placement).to.equal('top-end');
  });

  it('passes menu-variant to the menu', async () => {
    const el = await fixture<DropdownButton>(html`
      <wc-dropdown-button menu-variant="expressive">
        Actions
        <wc-menu-item slot="menu">Edit</wc-menu-item>
      </wc-dropdown-button>
    `);
    expect(parts(el).menu.variant).to.equal('expressive');
  });
});
