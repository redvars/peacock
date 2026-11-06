/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect, nextFrame } from '@open-wc/testing';
// Import modules directly: src/index.js pulls in html-editor's CommonJS js-beautify, which the
// test server cannot load.
import { Item } from '../src/item/index.js';
import { Menu, MenuItem } from '../src/menu/index.js';

if (!customElements.get('wc-item')) {
  customElements.define('wc-item', Item);
}

if (!customElements.get('wc-menu')) {
  customElements.define('wc-menu', Menu);
}

if (!customElements.get('wc-menu-item')) {
  customElements.define('wc-menu-item', MenuItem);
}

function key(target: Element, keyName: string) {
  target.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: keyName,
      bubbles: true,
      composed: true,
    }),
  );
}

function clickItem(item: MenuItem) {
  item.shadowRoot!.querySelector<HTMLElement>('#menu-item')!.click();
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

  it('moves the active item with the arrows, wrapping at the ends', async () => {
    const el = await fixture<Menu>(html`
      <wc-menu open>
        <wc-menu-item>One</wc-menu-item>
        <wc-menu-item>Two</wc-menu-item>
      </wc-menu>
    `);
    const items = el.querySelectorAll<MenuItem>('wc-menu-item');

    key(el, 'ArrowDown');
    expect(items[1].tabIndex).to.equal(0);

    key(el, 'ArrowDown');
    expect(items[0].tabIndex).to.equal(0);

    key(el, 'ArrowUp');
    expect(items[1].tabIndex).to.equal(0);
  });

  it('skips disabled items', async () => {
    const el = await fixture<Menu>(html`
      <wc-menu open>
        <wc-menu-item>One</wc-menu-item>
        <wc-menu-item disabled>Two</wc-menu-item>
        <wc-menu-item>Three</wc-menu-item>
      </wc-menu>
    `);
    const items = el.querySelectorAll<MenuItem>('wc-menu-item');

    key(el, 'ArrowDown');
    expect(items[2].tabIndex).to.equal(0);
    expect(items[1].tabIndex).to.equal(-1);
  });

  it('focuses the selected item when it opens', async () => {
    const el = await fixture<Menu>(html`
      <wc-menu>
        <wc-menu-item>One</wc-menu-item>
        <wc-menu-item selected>Two</wc-menu-item>
      </wc-menu>
    `);

    el.show();
    await el.updateComplete;

    expect(document.activeElement === el.querySelectorAll('wc-menu-item')[1]).to
      .be.true;
  });

  it('opens on the last item with show("last")', async () => {
    const el = await fixture<Menu>(html`
      <wc-menu>
        <wc-menu-item>One</wc-menu-item>
        <wc-menu-item>Two</wc-menu-item>
        <wc-menu-item>Three</wc-menu-item>
      </wc-menu>
    `);

    el.show('last');
    await el.updateComplete;

    expect(document.activeElement === el.querySelectorAll('wc-menu-item')[2]).to
      .be.true;
  });

  it('leaves focus alone with no-autofocus', async () => {
    const button = await fixture<HTMLButtonElement>(
      html`<button>Trigger</button>`,
    );
    button.focus();
    const el = await fixture<Menu>(html`
      <wc-menu no-autofocus>
        <wc-menu-item>One</wc-menu-item>
      </wc-menu>
    `);

    el.show();
    await el.updateComplete;

    expect(document.activeElement === button).to.be.true;
  });

  it('jumps to an item by typing its first letters', async () => {
    const el = await fixture<Menu>(html`
      <wc-menu open>
        <wc-menu-item>Apple</wc-menu-item>
        <wc-menu-item>Banana</wc-menu-item>
        <wc-menu-item>Blueberry</wc-menu-item>
        <wc-menu-item>Cherry</wc-menu-item>
      </wc-menu>
    `);
    const items = el.querySelectorAll<MenuItem>('wc-menu-item');

    key(el, 'c');
    expect(document.activeElement === items[3]).to.be.true;

    // Wait for the typeahead buffer to reset before typing a new prefix.
    await new Promise(resolve => {
      setTimeout(resolve, 600);
    });
    key(el, 'b');
    key(el, 'l');
    expect(document.activeElement === items[2]).to.be.true;
  });

  it('cycles through items with the same first letter', async () => {
    const el = await fixture<Menu>(html`
      <wc-menu open>
        <wc-menu-item>Apple</wc-menu-item>
        <wc-menu-item>Banana</wc-menu-item>
        <wc-menu-item>Blueberry</wc-menu-item>
      </wc-menu>
    `);
    const items = el.querySelectorAll<MenuItem>('wc-menu-item');

    key(el, 'b');
    expect(document.activeElement === items[1]).to.be.true;
    key(el, 'b');
    expect(document.activeElement === items[2]).to.be.true;
  });

  it('closes on menu item selection', async () => {
    const el = await fixture<Menu>(html`
      <wc-menu open>
        <wc-menu-item>One</wc-menu-item>
      </wc-menu>
    `);

    clickItem(el.querySelector<MenuItem>('wc-menu-item')!);
    await el.updateComplete;
    expect(el.open).to.equal(false);
  });

  it('stays open for keep-open items and ignores disabled ones', async () => {
    const el = await fixture<Menu>(html`
      <wc-menu open>
        <wc-menu-item keep-open>Keep</wc-menu-item>
        <wc-menu-item soft-disabled>Soft</wc-menu-item>
      </wc-menu>
    `);
    let activations = 0;
    el.addEventListener('menu-item-activate', () => {
      activations += 1;
    });

    const items = el.querySelectorAll<MenuItem>('wc-menu-item');
    clickItem(items[0]);
    clickItem(items[1]);
    await el.updateComplete;

    expect(el.open).to.equal(true);
    expect(activations).to.equal(1);
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
    clickItem(item);

    await el.updateComplete;
    expect(activatedItem).to.equal(item);
  });

  it('fires opened and closed on itself without bubbling, with the close reason', async () => {
    const wrapper = await fixture<HTMLDivElement>(html`
      <div>
        <wc-menu>
          <wc-menu-item>One</wc-menu-item>
        </wc-menu>
      </div>
    `);
    const el = wrapper.querySelector<Menu>('wc-menu')!;
    const seen: string[] = [];
    wrapper.addEventListener('opened', () => seen.push('wrapper:opened'));
    wrapper.addEventListener('closed', () => seen.push('wrapper:closed'));
    el.addEventListener('opened', () => seen.push('opened'));
    el.addEventListener('closed', event =>
      seen.push(`closed:${(event as CustomEvent).detail.reason.kind}`),
    );

    el.show();
    await el.updateComplete;
    key(el, 'Escape');
    await el.updateComplete;

    expect(seen).to.deep.equal(['opened', 'closed:keydown']);
  });

  it('returns focus to the trigger on Escape', async () => {
    const button = await fixture<HTMLButtonElement>(
      html`<button>Trigger</button>`,
    );
    button.focus();
    const el = await fixture<Menu>(html`
      <wc-menu>
        <wc-menu-item>One</wc-menu-item>
      </wc-menu>
    `);

    el.show();
    await el.updateComplete;
    expect(document.activeElement === el.querySelector('wc-menu-item')).to.be
      .true;

    key(el, 'Escape');
    await el.updateComplete;
    expect(document.activeElement === button).to.be.true;
  });

  it('shows the surface in the top layer while open', async () => {
    const el = await fixture<Menu>(html`
      <wc-menu>
        <wc-menu-item>One</wc-menu-item>
      </wc-menu>
    `);
    const surface = el.shadowRoot!.querySelector<HTMLElement>('.menu')!;

    expect(surface.matches(':popover-open')).to.be.false;
    el.show();
    await el.updateComplete;
    expect(surface.matches(':popover-open')).to.be.true;

    el.close();
    await el.updateComplete;
    await new Promise(resolve => {
      setTimeout(resolve, 400);
    });
    expect(surface.matches(':popover-open')).to.be.false;
  });

  it('renders inline without a popover in preview', async () => {
    const el = await fixture<Menu>(html`
      <wc-menu preview>
        <wc-menu-item>One</wc-menu-item>
      </wc-menu>
    `);
    const surface = el.shadowRoot!.querySelector<HTMLElement>('.menu')!;
    expect(surface.hasAttribute('popover')).to.be.false;
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

    // The floating controller closes on mousedown outside the menu and its anchor.
    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    await el.updateComplete;

    expect(el.open).to.equal(false);
    anchor.remove();
  });

  it('sets has-icons when an item has a start icon', async () => {
    const el = await fixture<Menu>(html`
      <wc-menu open>
        <wc-menu-item><span slot="start">*</span>One</wc-menu-item>
        <wc-menu-item>Two</wc-menu-item>
      </wc-menu>
    `);
    expect(el.hasAttribute('has-icons')).to.be.true;
  });

  it('marks segment edges only in the expressive variant', async () => {
    const el = await fixture<Menu>(html`
      <wc-menu open>
        <wc-menu-item id="item1">One</wc-menu-item>
        <wc-menu-item id="item2">Two</wc-menu-item>
        <wc-divider></wc-divider>
        <wc-menu-item id="item3">Three</wc-menu-item>
        <wc-menu-item id="item4">Four</wc-menu-item>
      </wc-menu>
    `);

    const item1 = el.querySelector('#item1') as HTMLElement;
    const item2 = el.querySelector('#item2') as HTMLElement;
    const item3 = el.querySelector('#item3') as HTMLElement;
    const item4 = el.querySelector('#item4') as HTMLElement;

    expect(item1.hasAttribute('data-position-first')).to.be.false;

    el.variant = 'expressive';
    await el.updateComplete;

    expect(item1.hasAttribute('data-position-first')).to.be.true;
    expect(item1.hasAttribute('data-position-last')).to.be.false;
    expect(item2.hasAttribute('data-position-before-divider')).to.be.true;
    expect(item3.hasAttribute('data-position-after-divider')).to.be.true;
    expect(item4.hasAttribute('data-position-last')).to.be.true;
    expect(item4.hasAttribute('data-position-first')).to.be.false;

    el.variant = 'standard';
    await el.updateComplete;
    expect(item1.hasAttribute('data-position-first')).to.be.false;
    expect(item4.hasAttribute('data-position-last')).to.be.false;
  });
});

describe('MenuItem', () => {
  it('shows a check mark when selected', async () => {
    const item = await fixture<MenuItem>(
      html`<wc-menu-item selected>One</wc-menu-item>`,
    );
    expect(item.shadowRoot!.querySelector('.check-indicator')).to.exist;

    item.selected = false;
    await item.updateComplete;
    expect(item.shadowRoot!.querySelector('.check-indicator')).to.not.exist;
  });

  it('shows a chevron instead of a check when it has a submenu', async () => {
    const item = await fixture<MenuItem>(
      html`<wc-menu-item selected has-submenu>One</wc-menu-item>`,
    );
    expect(item.shadowRoot!.querySelector('.submenu-indicator')).to.exist;
    expect(item.shadowRoot!.querySelector('.check-indicator')).to.not.exist;
  });

  it('lets the end slot replace the built-in indicator', async () => {
    const item = await fixture<MenuItem>(
      html`<wc-menu-item selected>One<span slot="end">!</span></wc-menu-item>`,
    );
    expect(item.shadowRoot!.querySelector('.check-indicator')).to.not.exist;
    expect(item.shadowRoot!.querySelector('slot[name="end"]')).to.exist;
  });

  it('renders only the slots it has content for', async () => {
    const item = await fixture<MenuItem>(
      html`<wc-menu-item>One</wc-menu-item>`,
    );
    expect(item.shadowRoot!.querySelector('slot[name="start"]')).to.not.exist;

    const icon = document.createElement('span');
    icon.slot = 'start';
    item.append(icon);
    await nextFrame();
    await item.updateComplete;
    expect(item.shadowRoot!.querySelector('slot[name="start"]')).to.exist;
    expect(item.hasStartContent).to.be.true;
  });

  it('uses the label text for typeahead', async () => {
    const item = await fixture<MenuItem>(html`
      <wc-menu-item>
        <span slot="start">icon</span>
        Settings
        <span slot="supporting-text">More</span>
      </wc-menu-item>
    `);
    expect(item.typeaheadText).to.equal('settings');
  });
});
