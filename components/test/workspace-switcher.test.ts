/// <reference types="mocha" />
import { html } from 'lit';
import { fixtureSync, expect } from '@open-wc/testing';
import { Item } from '../src/item/index.js';
import { Menu, MenuItem } from '../src/menu/index.js';
import {
  WorkspaceSwitcher,
  type Workspace,
} from '../src/workspace-switcher/index.js';

const DEFINITIONS: [string, typeof HTMLElement][] = [
  ['wc-item', Item],
  ['wc-menu', Menu],
  ['wc-menu-item', MenuItem],
  ['wc-workspace-switcher', WorkspaceSwitcher],
];
for (const [tag, ctor] of DEFINITIONS) {
  if (!customElements.get(tag)) customElements.define(tag, ctor);
}

const WORKSPACES: Workspace[] = [
  { value: 'acme', label: 'Acme Inc', description: 'Enterprise' },
  { value: 'globex', label: 'Globex', description: 'Free' },
  { value: 'initech', label: 'Initech', description: 'Team' },
];

async function create(
  template = html`<wc-workspace-switcher value="acme"></wc-workspace-switcher>`,
) {
  const el = fixtureSync<WorkspaceSwitcher>(template);
  el.workspaces = WORKSPACES;
  await el.updateComplete;
  return el;
}

function trigger(el: WorkspaceSwitcher): HTMLButtonElement {
  const found = el.shadowRoot?.querySelector<HTMLButtonElement>('.trigger');
  if (!found) throw new Error('no trigger');
  return found;
}

function menu(el: WorkspaceSwitcher): Menu {
  const found = el.shadowRoot?.querySelector<Menu>('wc-menu');
  if (!found) throw new Error('no menu');
  return found;
}

function items(el: WorkspaceSwitcher): MenuItem[] {
  return Array.from(
    el.shadowRoot?.querySelectorAll<MenuItem>('wc-menu-item.workspace-item') ??
      [],
  );
}

function search(el: WorkspaceSwitcher): HTMLInputElement | null {
  return (
    el.shadowRoot?.querySelector<HTMLInputElement>('.search-input') ?? null
  );
}

async function settle(el: WorkspaceSwitcher) {
  await el.updateComplete;
  await menu(el).updateComplete;
  await el.updateComplete;
}

async function openMenu(el: WorkspaceSwitcher) {
  trigger(el).click();
  await settle(el);
}

async function type(el: WorkspaceSwitcher, text: string) {
  const field = search(el);
  if (!field) throw new Error('no search');
  field.value = text;
  field.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  await settle(el);
}

describe('WorkspaceSwitcher', () => {
  it('shows the current workspace on the trigger', async () => {
    const el = await create();
    const button = trigger(el);
    expect(button.querySelector('.name')?.textContent).to.equal('Acme Inc');
    expect(button.querySelector('.description')?.textContent).to.equal(
      'Enterprise',
    );
    expect(button.getAttribute('aria-label')).to.equal(
      'Acme Inc, switch workspace',
    );
    expect(button.getAttribute('aria-haspopup')).to.equal('menu');
    expect(button.getAttribute('aria-expanded')).to.equal('false');
    expect(button.getAttribute('aria-controls')).to.equal(menu(el).id);
  });

  it('opens the menu with a check on the current workspace', async () => {
    const el = await create();
    const opened: EventTarget[] = [];
    el.addEventListener('open', event =>
      opened.push(event.target as EventTarget),
    );
    await openMenu(el);
    expect(menu(el).open).to.be.true;
    expect(trigger(el).getAttribute('aria-expanded')).to.equal('true');
    // Only the switcher's own `open` reaches the page, not the inner menu's.
    expect(opened).to.deep.equal([el]);
    expect(items(el).map(item => item.selected)).to.deep.equal([
      true,
      false,
      false,
    ]);
    expect(items(el).every(item => item.type === 'radio')).to.be.true;
  });

  it('fires change and closes when another workspace is picked', async () => {
    const el = await create();
    let value = '';
    let reason = '';
    el.addEventListener('change', event => {
      value = (event as CustomEvent).detail.value;
    });
    el.addEventListener('close', event => {
      reason = (event as CustomEvent).detail.reason;
    });
    await openMenu(el);
    items(el)[1].click();
    await settle(el);
    expect(value).to.equal('globex');
    expect(el.value).to.equal('globex');
    expect(menu(el).open).to.be.false;
    expect(reason).to.equal('action');
    expect(trigger(el).querySelector('.name')?.textContent).to.equal('Globex');
  });

  it('does not fire change for the current workspace', async () => {
    const el = await create();
    let changes = 0;
    el.addEventListener('change', () => {
      changes += 1;
    });
    await openMenu(el);
    items(el)[0].click();
    await settle(el);
    expect(changes).to.equal(0);
  });

  it('filters the list with the search field and shows an empty state', async () => {
    const el = await create();
    await openMenu(el);
    await type(el, 'glo');
    expect(items(el).map(item => item.value)).to.deep.equal(['globex']);
    await type(el, 'team');
    expect(items(el).map(item => item.value)).to.deep.equal(['initech']);
    await type(el, 'zzz');
    expect(items(el)).to.have.length(0);
    expect(el.shadowRoot?.querySelector('.empty')?.textContent).to.contain(
      'No workspaces match "zzz"',
    );
  });

  it('picks the first match with Enter in the search field', async () => {
    const el = await create();
    let value = '';
    el.addEventListener('change', event => {
      value = (event as CustomEvent).detail.value;
    });
    await openMenu(el);
    await type(el, 'ini');
    search(el)?.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        composed: true,
      }),
    );
    await settle(el);
    expect(value).to.equal('initech');
  });

  it('keeps typed keys from the menu typeahead', async () => {
    const el = await create();
    await openMenu(el);
    const seen: string[] = [];
    menu(el).addEventListener('keydown', event => seen.push(event.key));
    search(el)?.dispatchEvent(
      new KeyboardEvent('keydown', { key: ' ', bubbles: true, composed: true }),
    );
    search(el)?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'g', bubbles: true, composed: true }),
    );
    expect(seen).to.deep.equal([]);
    expect(menu(el).open).to.be.true;
  });

  it('clears the search when the menu closes', async () => {
    const el = await create();
    await openMenu(el);
    await type(el, 'glo');
    menu(el).close();
    await settle(el);
    await openMenu(el);
    expect(search(el)?.value).to.equal('');
    expect(items(el)).to.have.length(3);
  });

  it('fires create with the search text when creatable', async () => {
    const el = await create(
      html`<wc-workspace-switcher
        value="acme"
        creatable
      ></wc-workspace-switcher>`,
    );
    let created: string | undefined;
    el.addEventListener('create', event => {
      created = (event as CustomEvent).detail.value;
    });
    await openMenu(el);
    await type(el, 'Umbrella');
    el.shadowRoot?.querySelector<MenuItem>('.create-item')?.click();
    await settle(el);
    expect(created).to.equal('Umbrella');
    expect(menu(el).open).to.be.false;
  });

  it('has no create action or search field when not asked for', async () => {
    const el = await create(
      html`<wc-workspace-switcher
        value="acme"
        hide-search
      ></wc-workspace-switcher>`,
    );
    await openMenu(el);
    expect(search(el)).to.be.null;
    expect(el.shadowRoot?.querySelector('.create-item')).to.be.null;
    // Without a search field the menu focuses an item itself.
    expect(menu(el).noAutofocus).to.be.false;
  });

  it('shows only the logo and a tooltip when collapsed', async () => {
    const el = await create(
      html`<wc-workspace-switcher
        value="acme"
        collapsed
      ></wc-workspace-switcher>`,
    );
    expect(trigger(el).querySelector('.name')).to.be.null;
    expect(trigger(el).getAttribute('aria-label')).to.equal(
      'Acme Inc, switch workspace',
    );
    const tooltip = el.shadowRoot?.querySelector('wc-tooltip');
    expect(tooltip?.getAttribute('for')).to.equal('trigger');
    expect(tooltip?.textContent).to.equal('Acme Inc');
  });

  it('does not open when disabled', async () => {
    const el = await create(
      html`<wc-workspace-switcher
        value="acme"
        disabled
      ></wc-workspace-switcher>`,
    );
    el.show();
    await settle(el);
    expect(menu(el).open).to.be.false;
    expect(trigger(el).disabled).to.be.true;
  });

  it('opens on Arrow Down and closes on Escape with reason escape', async () => {
    const el = await create(
      html`<wc-workspace-switcher
        value="acme"
        hide-search
      ></wc-workspace-switcher>`,
    );
    let reason = '';
    el.addEventListener('close', event => {
      reason = (event as CustomEvent).detail.reason;
    });
    trigger(el).dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    );
    await settle(el);
    expect(menu(el).open).to.be.true;
    items(el)[0].dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        composed: true,
      }),
    );
    await settle(el);
    expect(menu(el).open).to.be.false;
    expect(reason).to.equal('escape');
  });
});
