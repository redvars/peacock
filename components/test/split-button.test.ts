/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect, aTimeout } from '@open-wc/testing';
// Import modules directly: src/index.js pulls in html-editor's CommonJS js-beautify, which the
// test server cannot load.
import { Button } from '../src/button/button/button.js';
import { IconButton } from '../src/button/icon-button/icon-button.js';
import { Item } from '../src/item/index.js';
import { Menu, MenuItem } from '../src/menu/index.js';
import { SplitButton } from '../src/split-button/index.js';
import { resetWarnOnce } from '../src/__internal/utils/warn-once.js';

if (!customElements.get('wc-button')) {
  customElements.define('wc-button', Button);
}

if (!customElements.get('wc-icon-button')) {
  customElements.define('wc-icon-button', IconButton);
}

if (!customElements.get('wc-button')) {
  customElements.define('wc-button', Button);
}

if (!customElements.get('wc-icon-button')) {
  customElements.define('wc-icon-button', IconButton);
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

if (!customElements.get('wc-split-button')) {
  customElements.define('wc-split-button', SplitButton);
}

function parts(el: SplitButton) {
  const root = el.shadowRoot!;
  const actionEl = root.querySelector<HTMLElement>('.action-button')!;
  const triggerEl = root.querySelector<IconButton>('.dropdown-trigger')!;
  const menu = root.querySelector<Menu>('wc-menu')!;
  return { actionEl, triggerEl, menu };
}

/** The native `<button>` inside the menu trigger's shadow root, which carries the ARIA. */
function nativeTrigger(el: SplitButton) {
  return parts(el).triggerEl.shadowRoot!.querySelector('button')!;
}

async function settle(el: SplitButton) {
  await el.updateComplete;
  await parts(el).menu.updateComplete;
  await el.updateComplete;
  await parts(el).triggerEl.updateComplete;
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
    expect(nativeTrigger(el).getAttribute('aria-expanded')).to.equal('true');

    triggerEl.click();
    await settle(el);
    expect(menu.open).to.be.false;
    expect(nativeTrigger(el).getAttribute('aria-expanded')).to.equal('false');
  });

  it('names the menu trigger and marks it as opening a menu', async () => {
    resetWarnOnce();
    const warnings: string[] = [];
    const original = console.warn;
    console.warn = (message: string) => {
      warnings.push(message);
    };
    try {
      const el = await fixture<SplitButton>(html`
        <wc-split-button>
          Save
          <wc-menu-item slot="menu">Draft</wc-menu-item>
        </wc-split-button>
      `);
      await settle(el);
      const button = nativeTrigger(el);

      expect(button.getAttribute('aria-label')).to.be.a('string').and.not.empty;
      expect(button.getAttribute('aria-haspopup')).to.equal('menu');
      expect(button.getAttribute('aria-expanded')).to.equal('false');
      // The menu lives in the split button's shadow root, out of reach of an ID reference.
      expect(button.hasAttribute('aria-controls')).to.be.false;
      expect(
        warnings.filter(message => message.includes('no accessible name')),
      ).to.deep.equal([]);
    } finally {
      console.warn = original;
    }
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

  it('fires its own open and close, with the menu reason, in place of the menu events', async () => {
    const el = await fixture<SplitButton>(html`
      <wc-split-button>
        Save
        <wc-menu-item slot="menu">Draft</wc-menu-item>
      </wc-split-button>
    `);
    const seen: string[] = [];
    const record = (event: Event) => {
      const { reason } =
        (event as CustomEvent<{ reason?: string } | null>).detail ?? {};
      const from = event.target === el ? 'host' : 'inner';
      seen.push([event.type, from, reason].filter(Boolean).join(':'));
    };
    document.addEventListener('open', record);
    document.addEventListener('close', record);

    el.show();
    await settle(el);
    parts(el).menu.close({ kind: 'keydown', key: 'Escape' });
    await settle(el);

    document.removeEventListener('open', record);
    document.removeEventListener('close', record);
    expect(seen).to.deep.equal(['open:host', 'close:host:escape']);
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

  it('follows the M3 shape: round outer corners, small inner ones, a circle when open', async () => {
    // The shape tokens come from the theme stylesheet, which the test page does not load.
    const el = await fixture<SplitButton>(html`
      <wc-split-button
        size="sm"
        style="--shape-corner-extra-small: 4px; --shape-corner-medium: 12px"
      >
        Save
        <wc-menu-item slot="menu">Draft</wc-menu-item>
      </wc-split-button>
    `);
    const { actionEl, triggerEl } = parts(el);
    await (actionEl as Button).updateComplete;
    await (triggerEl as unknown as IconButton).updateComplete;

    const corners = (host: HTMLElement) => {
      const bg = host.shadowRoot!.querySelector<HTMLElement>('.background')!;
      const style = getComputedStyle(bg);
      return [
        style.borderStartStartRadius,
        style.borderStartEndRadius,
        style.borderEndStartRadius,
        style.borderEndEndRadius,
      ];
    };

    expect(corners(actionEl)).to.deep.equal(['20px', '4px', '20px', '4px']);
    expect(corners(triggerEl)).to.deep.equal(['4px', '20px', '4px', '20px']);
    expect(triggerEl.getBoundingClientRect().width).to.equal(48);

    el.show();
    await settle(el);
    await aTimeout(300); // the corner morph animates over 200ms
    expect(corners(triggerEl)).to.deep.equal(['20px', '20px', '20px', '20px']);
  });
});
