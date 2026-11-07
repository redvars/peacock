/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect, oneEvent, waitUntil } from '@open-wc/testing';
// Import modules directly: src/index.js pulls in html-editor's CommonJS js-beautify, which the
// test server cannot load.
import {
  FilterBar,
  type FilterBarChangeDetail,
  type FilterBarViewChangeDetail,
  type FilterDefinition,
} from '../src/filter-bar/index.js';
import { Chip } from '../src/chip/chip/index.js';
import { Popover, PopoverContent } from '../src/popover/index.js';
import { Menu, MenuItem } from '../src/menu/index.js';
import { Item } from '../src/item/index.js';
import { Field } from '../src/field/index.js';
import { Select, SelectOptionElement } from '../src/select/index.js';
import { Switch } from '../src/switch/index.js';
import { Input } from '../src/input/index.js';
import { Search } from '../src/search/index.js';
import { Button } from '../src/button/index.js';
import { Divider } from '../src/divider/index.js';

const elements: [string, typeof HTMLElement][] = [
  ['wc-filter-bar', FilterBar],
  ['wc-chip', Chip],
  ['wc-popover', Popover],
  ['wc-popover-content', PopoverContent],
  ['wc-menu', Menu],
  ['wc-menu-item', MenuItem],
  ['wc-item', Item],
  ['wc-field', Field],
  ['wc-select', Select],
  ['wc-option', SelectOptionElement],
  ['wc-switch', Switch],
  ['wc-input', Input],
  ['wc-search', Search],
  ['wc-button', Button],
  ['wc-divider', Divider],
];
for (const [tag, ctor] of elements) {
  if (!customElements.get(tag)) customElements.define(tag, ctor);
}

const FILTERS: FilterDefinition[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Open', value: 'open' },
      { label: 'Closed', value: 'closed' },
    ],
  },
  {
    key: 'tags',
    label: 'Tags',
    type: 'multiselect',
    options: [
      { label: 'Bug', value: 'bug' },
      { label: 'Feature', value: 'feature' },
      { label: 'Docs', value: 'docs' },
    ],
  },
  { key: 'owner', label: 'Owner', type: 'text', placeholder: 'Name' },
  { key: 'created', label: 'Created', type: 'date-range' },
  { key: 'archived', label: 'Archived', type: 'boolean' },
];

async function settle(el: FilterBar) {
  await el.updateComplete;
  const children = Array.from(
    el.shadowRoot!.querySelectorAll<
      HTMLElement & { updateComplete?: Promise<unknown> }
    >('*'),
  );
  await Promise.all(children.map(child => child.updateComplete));
  await el.updateComplete;
}

async function create(
  template = html`<wc-filter-bar></wc-filter-bar>`,
): Promise<FilterBar> {
  const el = await fixture<FilterBar>(template);
  el.filters = FILTERS;
  await settle(el);
  return el;
}

function chips(el: FilterBar): Chip[] {
  return Array.from(
    el.shadowRoot!.querySelectorAll<Chip>('wc-chip.filter-chip'),
  );
}

function chipText(element: Element) {
  return (element.textContent ?? '').trim();
}

function popoverFor(el: FilterBar, filterKey: string) {
  return el.shadowRoot!.querySelector<Popover>(
    `wc-popover[data-key="${filterKey}"]`,
  )!;
}

function key(target: Element, name: string) {
  target.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: name,
      bubbles: true,
      composed: true,
      cancelable: true,
    }),
  );
}

function changes(el: FilterBar) {
  const seen: FilterBarChangeDetail[] = [];
  el.addEventListener('change', event => {
    seen.push((event as CustomEvent<FilterBarChangeDetail>).detail);
  });
  return seen;
}

describe('FilterBar', () => {
  it('is a group named "Filters", or by label', async () => {
    const el = await create();
    expect(el.getAttribute('role')).to.equal('group');
    expect(el.getAttribute('aria-label')).to.equal('Filters');
    el.label = 'Issue filters';
    await settle(el);
    expect(el.getAttribute('aria-label')).to.equal('Issue filters');
  });

  it('lists the definitions in the "Add filter" menu and shows no chip without a value', async () => {
    const el = await create();
    const items = Array.from(
      el.shadowRoot!.querySelectorAll<MenuItem>('.add-menu wc-menu-item'),
    );
    expect(items.map(item => item.value)).to.deep.equal([
      'status',
      'tags',
      'owner',
      'created',
      'archived',
    ]);
    expect(chips(el)).to.have.length(0);
    expect(el.shadowRoot!.querySelector('.clear-button')).to.be.null;
    expect(el.shadowRoot!.querySelector('wc-search')).to.be.null;
  });

  it('shows each active filter as a "Label: value" chip', async () => {
    const el = await create();
    el.value = {
      status: 'open',
      tags: ['bug', 'docs'],
      archived: false,
      owner: 'Ada',
      created: '2026-11-03/2026-11-09',
    };
    await settle(el);
    const texts = chips(el).map(chipText);
    expect(texts[0]).to.equal('Status: Open');
    expect(texts[1]).to.equal('Tags: Bug +1');
    expect(texts[2]).to.equal('Archived: No');
    expect(texts[3]).to.equal('Owner: Ada');
    expect(texts[4]).to.match(/^Created: /);
    expect(texts[4]).to.not.equal('Created: ');
    // The accessible name lists every value.
    const button = chips(el)[1].shadowRoot!.querySelector('#button')!;
    expect(button.getAttribute('aria-label')).to.equal('Tags: Bug or Docs');
    expect(button.getAttribute('aria-haspopup')).to.equal('dialog');
    // Filters in use leave the menu.
    const items = Array.from(
      el.shadowRoot!.querySelectorAll<MenuItem>('.add-menu wc-menu-item'),
    );
    expect(items).to.have.length(0);
    expect(
      el.shadowRoot!.querySelector('.add-button')!.hasAttribute('disabled'),
    ).to.be.true;
  });

  it('adds a filter from the menu, edits it in a popover and fires change', async () => {
    const el = await create();
    const seen = changes(el);
    const addButton = el.shadowRoot!.querySelector<Button>('.add-button')!;
    addButton.click();
    const menu = el.shadowRoot!.querySelector<Menu>('.add-menu')!;
    await waitUntil(() => menu.open, 'add menu opens');
    expect(addButton.getAttribute('aria-expanded')).to.equal('true');
    const item = el.shadowRoot!.querySelector<MenuItem>(
      '.add-menu wc-menu-item[value="status"]',
    )!;
    item.click();
    await waitUntil(() => popoverFor(el, 'status')?.open, 'popover opens');
    await settle(el);
    // A pending chip with no value yet.
    expect(chips(el).map(chipText)).to.deep.equal(['Status']);
    expect(seen).to.have.length(0);
    const content = popoverFor(el, 'status').querySelector(
      'wc-popover-content',
    )!;
    expect(content.getAttribute('role')).to.equal('dialog');
    expect(content.getAttribute('aria-label')).to.equal('Status');

    const select = content.querySelector<Select>('wc-select')!;
    select.value = 'closed';
    select.dispatchEvent(
      new CustomEvent('change', { bubbles: true, composed: true }),
    );
    await settle(el);

    expect(el.value).to.deep.equal({ status: 'closed' });
    expect(seen).to.have.length(1);
    expect(seen[0].value).to.deep.equal({ status: 'closed' });
    expect(chips(el).map(chipText)).to.deep.equal(['Status: Closed']);
    // Picking from a single select closes the popover.
    await waitUntil(() => !popoverFor(el, 'status').open, 'popover closes');
  });

  it('drops a filter added from the menu when its popover closes without a value', async () => {
    const el = await create();
    const seen = changes(el);
    el.shadowRoot!.querySelector<Button>('.add-button')!.click();
    const menu = el.shadowRoot!.querySelector<Menu>('.add-menu')!;
    await waitUntil(() => menu.open);
    el.shadowRoot!.querySelector<MenuItem>(
      '.add-menu wc-menu-item[value="owner"]',
    )!.click();
    await waitUntil(() => popoverFor(el, 'owner')?.open);
    popoverFor(el, 'owner').hide();
    await settle(el);
    expect(chips(el)).to.have.length(0);
    expect(seen).to.have.length(0);
  });

  it('edits a text, multiselect and boolean filter', async () => {
    const el = await create();
    el.value = { owner: 'Ada', tags: ['bug'], archived: true };
    await settle(el);
    const seen = changes(el);

    chips(el)[0].click();
    await waitUntil(() => popoverFor(el, 'owner').open);
    await settle(el);
    const input = popoverFor(el, 'owner').querySelector<Input>('wc-input')!;
    expect(input.value).to.equal('Ada');
    input.value = 'Grace';
    input.dispatchEvent(
      new CustomEvent('change', { bubbles: true, composed: true }),
    );
    await settle(el);
    expect(el.value.owner).to.equal('Grace');
    popoverFor(el, 'owner').hide();
    await settle(el);

    chips(el)[1].click();
    await waitUntil(() => popoverFor(el, 'tags').open);
    await settle(el);
    const select = popoverFor(el, 'tags').querySelector<Select>('wc-select')!;
    expect(select.multiple).to.be.true;
    select.values = ['bug', 'feature'];
    select.dispatchEvent(
      new CustomEvent('change', { bubbles: true, composed: true }),
    );
    await settle(el);
    expect(el.value.tags).to.deep.equal(['bug', 'feature']);
    popoverFor(el, 'tags').hide();
    await settle(el);

    chips(el)[2].click();
    await waitUntil(() => popoverFor(el, 'archived').open);
    await settle(el);
    const toggle = popoverFor(el, 'archived').querySelector<Switch>(
      'wc-switch',
    )!;
    expect(toggle.checked).to.be.true;
    toggle.checked = false;
    toggle.dispatchEvent(
      new CustomEvent('change', { bubbles: true, composed: true }),
    );
    await settle(el);
    expect(el.value.archived).to.equal(false);
    expect(chips(el).map(chipText)[2]).to.equal('Archived: No');

    expect(seen.map(detail => detail.value)).to.deep.equal([
      { owner: 'Grace', tags: ['bug'], archived: true },
      { owner: 'Grace', tags: ['bug', 'feature'], archived: true },
      { owner: 'Grace', tags: ['bug', 'feature'], archived: false },
    ]);
  });

  it("keeps the inner controls' events inside", async () => {
    const el = await create();
    el.value = { status: 'open' };
    await settle(el);
    const seen = changes(el);
    chips(el)[0].click();
    await waitUntil(() => popoverFor(el, 'status').open);
    await settle(el);
    const select = popoverFor(el, 'status').querySelector<Select>('wc-select')!;
    // Same value: the bar's value does not change, and the select's event must not leak.
    select.dispatchEvent(
      new CustomEvent('change', { bubbles: true, composed: true }),
    );
    await settle(el);
    expect(seen).to.have.length(0);
  });

  it('removes a filter with the dismiss button and announces it', async () => {
    const el = await create();
    el.value = { status: 'open', owner: 'Ada' };
    await settle(el);
    const seen = changes(el);
    const close =
      chips(el)[0].shadowRoot!.querySelector<HTMLButtonElement>('.close-btn')!;
    close.click();
    await settle(el);
    expect(el.value).to.deep.equal({ owner: 'Ada' });
    expect(seen).to.have.length(1);
    expect(seen[0].value).to.deep.equal({ owner: 'Ada' });
    const live = el.shadowRoot!.querySelector('[aria-live="polite"]')!;
    expect(live.getAttribute('role')).to.equal('status');
    await waitUntil(
      () => (live.textContent ?? '').trim() === 'Status filter removed',
      'removal is announced',
    );
  });

  it('moves between chips with the arrow keys and removes one with Delete', async () => {
    const el = await create();
    el.value = { status: 'open', owner: 'Ada', archived: true };
    await settle(el);
    const [first, second, third] = chips(el);
    expect(first.tabIndex).to.equal(0);
    expect(second.tabIndex).to.equal(-1);
    expect(third.tabIndex).to.equal(-1);

    first.focus();
    key(first, 'ArrowRight');
    await settle(el);
    expect(second.tabIndex).to.equal(0);
    expect(first.tabIndex).to.equal(-1);
    expect(el.shadowRoot!.activeElement).to.equal(second);
    key(second, 'End');
    expect(el.shadowRoot!.activeElement).to.equal(third);
    key(third, 'ArrowRight');
    expect(el.shadowRoot!.activeElement).to.equal(first);

    key(first, 'Delete');
    await settle(el);
    expect(el.value).to.deep.equal({ owner: 'Ada', archived: true });
    // Focus moves to the chip that took its place.
    expect(el.shadowRoot!.activeElement).to.equal(chips(el)[0]);
  });

  it('clears every filter but the search text', async () => {
    const el = await create(html`<wc-filter-bar search></wc-filter-bar>`);
    el.value = { q: 'crash', status: 'open', archived: true };
    await settle(el);
    const seen = changes(el);
    el.shadowRoot!.querySelector<Button>('.clear-button')!.click();
    await settle(el);
    expect(el.value).to.deep.equal({ q: 'crash' });
    expect(seen).to.have.length(1);
    expect(chips(el)).to.have.length(0);
    expect(el.shadowRoot!.querySelector('.clear-button')).to.be.null;
    const live = el.shadowRoot!.querySelector('[aria-live="polite"]')!;
    await waitUntil(
      () => (live.textContent ?? '').trim() === 'All filters cleared',
    );
  });

  it('puts the search text in value.q: input while typing, change on commit', async () => {
    const el = await create(
      html`<wc-filter-bar
        search
        search-placeholder="Search issues"
      ></wc-filter-bar>`,
    );
    const search = el.shadowRoot!.querySelector<Search>('wc-search')!;
    expect(search.placeholder).to.equal('Search issues');
    expect(search.size).to.equal('sm');
    const inputs: FilterBarChangeDetail[] = [];
    el.addEventListener('input', event => {
      inputs.push((event as CustomEvent<FilterBarChangeDetail>).detail);
    });
    const seen = changes(el);
    search.value = 'cra';
    search.dispatchEvent(
      new CustomEvent('input', { bubbles: true, composed: true }),
    );
    expect(inputs).to.have.length(1);
    expect(inputs[0].value).to.deep.equal({ q: 'cra' });
    expect(seen).to.have.length(0);
    search.dispatchEvent(
      new CustomEvent('change', { bubbles: true, composed: true }),
    );
    await settle(el);
    expect(el.value).to.deep.equal({ q: 'cra' });
    expect(seen).to.have.length(1);
  });

  it('applies a saved view and fires view-change, then change', async () => {
    const el = await create();
    el.views = [
      {
        id: 'mine',
        label: 'My open issues',
        value: { status: 'open', owner: 'me' },
      },
      { id: 'bugs', label: 'Bugs', value: { tags: ['bug'] } },
    ];
    await settle(el);
    const order: string[] = [];
    let viewDetail: FilterBarViewChangeDetail | undefined;
    el.addEventListener('view-change', event => {
      order.push('view-change');
      viewDetail = (event as CustomEvent<FilterBarViewChangeDetail>).detail;
    });
    el.addEventListener('change', () => order.push('change'));

    const button = el.shadowRoot!.querySelector<Button>('.views-button')!;
    expect(chipText(button)).to.equal('All');
    button.click();
    const menu = el.shadowRoot!.querySelector<Menu>('.views-menu')!;
    await waitUntil(() => menu.open);
    el.shadowRoot!.querySelector<MenuItem>(
      '.views-menu wc-menu-item[value="mine"]',
    )!.click();
    await settle(el);

    expect(order).to.deep.equal(['view-change', 'change']);
    expect(viewDetail).to.deep.equal({ value: 'mine' });
    expect(el.view).to.equal('mine');
    expect(el.value).to.deep.equal({ status: 'open', owner: 'me' });
    expect(chipText(button)).to.equal('My open issues');
    // The view's own value is not shared with the bar.
    expect(el.value).to.not.equal(el.views[0].value);

    button.click();
    await waitUntil(() => menu.open);
    el.shadowRoot!.querySelector<MenuItem>(
      '.views-menu wc-menu-item[value=""]',
    )!.click();
    await settle(el);
    expect(el.view).to.equal('');
    expect(el.value).to.deep.equal({});
    expect(viewDetail).to.deep.equal({ value: '' });
  });

  it('fires view-save with the current value', async () => {
    const el = await create(html`<wc-filter-bar saveable></wc-filter-bar>`);
    el.value = { status: 'closed' };
    await settle(el);
    const button = el.shadowRoot!.querySelector<Button>('.views-button')!;
    button.click();
    const menu = el.shadowRoot!.querySelector<Menu>('.views-menu')!;
    await waitUntil(() => menu.open);
    const save = el.shadowRoot!.querySelector<MenuItem>(
      '.views-menu .save-view',
    )!;
    setTimeout(() => save.click());
    const event = await oneEvent(el, 'view-save');
    expect(event.detail).to.deep.equal({ value: { status: 'closed' } });
  });

  it('hides the views menu without views or saveable', async () => {
    const el = await create();
    expect(el.shadowRoot!.querySelector('.views-button')).to.be.null;
  });

  it('keeps the value serialisable and hands out copies', async () => {
    const el = await create();
    el.value = {
      tags: ['bug'],
      archived: true,
      created: '2026-11-01/2026-11-30',
    };
    await settle(el);
    const seen = changes(el);
    chips(el)[0]
      .shadowRoot!.querySelector<HTMLButtonElement>('.close-btn')!
      .click();
    await settle(el);
    const detail = seen[0].value;
    expect(JSON.parse(JSON.stringify(detail))).to.deep.equal(detail);
    expect(JSON.parse(JSON.stringify(el.value))).to.deep.equal(el.value);
    (detail as Record<string, unknown>).archived = false;
    expect(el.value.archived).to.equal(true);
  });
});
