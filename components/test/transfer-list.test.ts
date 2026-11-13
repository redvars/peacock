/// <reference types="mocha" />
import { html, type TemplateResult } from 'lit';
import { expect, fixtureSync, waitUntil } from '@open-wc/testing';
import {
  TransferList,
  type TransferListChangeDetail,
  type TransferListOption,
} from '../src/transfer-list/index.js';
import { Listbox, ListboxOption } from '../src/listbox/index.js';
import { Search } from '../src/search/index.js';
import { IconButton } from '../src/button/index.js';

for (const [tag, element] of [
  ['wc-listbox', Listbox],
  ['wc-listbox-option', ListboxOption],
  ['wc-search', Search],
  ['wc-icon-button', IconButton],
  ['wc-transfer-list', TransferList],
] as const) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

const OPTIONS: TransferListOption[] = [
  { value: 'admin', label: 'Administrator', description: 'Full access' },
  { value: 'editor', label: 'Editor' },
  { value: 'viewer', label: 'Viewer' },
  { value: 'auditor', label: 'Auditor', disabled: true },
  { value: 'guest', label: 'Guest' },
];

function lists(el: TransferList): Listbox[] {
  return Array.from(el.shadowRoot!.querySelectorAll<Listbox>('wc-listbox'));
}

async function settle(el: TransferList) {
  await el.updateComplete;
  const boxes = lists(el);
  await Promise.all(boxes.map(box => box.updateComplete));
  await Promise.all(
    boxes.flatMap(box => box.options.map(item => item.updateComplete)),
  );
  await el.updateComplete;
}

async function setup(
  template: TemplateResult = html`<wc-transfer-list
    label="Roles"
    .options=${OPTIONS}
  ></wc-transfer-list>`,
) {
  const el = fixtureSync<TransferList>(template);
  await settle(el);
  return el;
}

function list(el: TransferList, side: 'available' | 'selected') {
  return el.shadowRoot!.querySelector<Listbox>(`.list-${side}`)!;
}

function shownValues(el: TransferList, side: 'available' | 'selected') {
  return list(el, side)
    .options.filter(item => !item.hidden)
    .map(item => item.optionValue);
}

function button(el: TransferList, name: string) {
  return el.shadowRoot!.querySelector<IconButton>(`.${name}`)!;
}

function headline(el: TransferList, side: 'available' | 'selected') {
  return el
    .shadowRoot!.querySelector(`.pane-${side} .headline`)!
    .textContent!.trim();
}

function option(el: TransferList, value: string) {
  for (const box of lists(el)) {
    const found = box.options.find(o => o.optionValue === value);
    if (found) return found;
  }
  throw new Error(`no option ${value}`);
}

function press(target: Element, key: string, init: { altKey?: boolean } = {}) {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    composed: true,
    cancelable: true,
    ...init,
  });
  target.dispatchEvent(event);
  return event;
}

async function check(el: TransferList, value: string) {
  option(el, value).click();
  await settle(el);
}

function changes(el: TransferList) {
  const seen: TransferListChangeDetail[] = [];
  el.addEventListener('change', event =>
    seen.push((event as CustomEvent<TransferListChangeDetail>).detail),
  );
  return seen;
}

function announcement(el: TransferList) {
  return el.shadowRoot!.querySelector('[role="status"]')!.textContent!.trim();
}

describe('TransferList', () => {
  it('reuses wc-listbox multiple for both lists, named by their headlines', async () => {
    const el = await setup();
    const [available, selected] = lists(el);
    expect(available.multiple).to.be.true;
    expect(selected.multiple).to.be.true;
    expect(available.getAttribute('aria-label')).to.equal('Available (5)');
    expect(selected.getAttribute('aria-label')).to.equal('Selected (0)');
    const group = el.shadowRoot!.querySelector('[role="group"]')!;
    const labelId = group.getAttribute('aria-labelledby')!;
    expect(el.shadowRoot!.getElementById(labelId)!.textContent).to.contain(
      'Roles',
    );
  });

  it('splits the options by value and shows counts in the headlines', async () => {
    const el = await setup(
      html`<wc-transfer-list
        .options=${OPTIONS}
        value="viewer,admin"
      ></wc-transfer-list>`,
    );
    expect(shownValues(el, 'available')).to.deep.equal([
      'editor',
      'auditor',
      'guest',
    ]);
    // Without `ordered`, the selected list keeps the option order.
    expect(shownValues(el, 'selected')).to.deep.equal(['admin', 'viewer']);
    expect(headline(el, 'available')).to.equal('Available (3)');
    expect(headline(el, 'selected')).to.equal('Selected (2)');
    expect(el.values).to.deep.equal(['viewer', 'admin']);
  });

  it('shows the description and disables disabled options', async () => {
    const el = await setup();
    const admin = option(el, 'admin');
    expect(
      admin.querySelector('[slot="supporting-text"]')!.textContent,
    ).to.equal('Full access');
    expect(option(el, 'auditor').disabled).to.be.true;
  });

  it('moves checked items with the button and fires change with value and values', async () => {
    const el = await setup();
    const seen = changes(el);
    const moveChecked = button(el, 'move-checked-to-selected');
    expect(moveChecked.disabled).to.be.true;
    await check(el, 'guest');
    await check(el, 'editor');
    expect(moveChecked.disabled).to.be.false;
    // The listbox's own change stays inside.
    expect(seen).to.have.length(0);

    moveChecked.click();
    await settle(el);
    expect(el.value).to.equal('editor,guest');
    expect(seen).to.deep.equal([
      { value: 'editor,guest', values: ['editor', 'guest'] },
    ]);
    expect(shownValues(el, 'selected')).to.deep.equal(['editor', 'guest']);
    expect(button(el, 'move-checked-to-selected').disabled).to.be.true;
  });

  it('moves all enabled items both ways and leaves disabled ones in place', async () => {
    const el = await setup(
      html`<wc-transfer-list
        .options=${[
          ...OPTIONS.slice(0, 3),
          { value: 'owner', label: 'Owner', disabled: true },
        ]}
        value="owner"
      ></wc-transfer-list>`,
    );
    button(el, 'move-all-to-selected').click();
    await settle(el);
    expect(el.values).to.deep.equal(['admin', 'editor', 'viewer', 'owner']);

    button(el, 'move-all-to-available').click();
    await settle(el);
    // The disabled selected option is locked in.
    expect(el.values).to.deep.equal(['owner']);
    expect(button(el, 'move-all-to-available').disabled).to.be.true;
  });

  it('moves an item on Enter, without checking it, and keeps focus in the list', async () => {
    const el = await setup();
    const seen = changes(el);
    const editor = option(el, 'editor');
    const event = press(editor, 'Enter');
    expect(event.defaultPrevented).to.be.true;
    await settle(el);
    expect(el.value).to.equal('editor');
    expect(seen).to.have.length(1);
    expect(option(el, 'editor').selected).to.be.false;
    await waitUntil(
      () =>
        el.shadowRoot!.activeElement === option(el, 'viewer') ||
        list(el, 'available').matches(':focus-within'),
      'focus stays in the available list',
    );

    press(option(el, 'editor'), 'Enter');
    await settle(el);
    expect(el.value).to.equal('');
  });

  it('moves an item on double click', async () => {
    const el = await setup();
    option(el, 'viewer').dispatchEvent(
      new MouseEvent('dblclick', { bubbles: true, composed: true }),
    );
    await settle(el);
    expect(el.value).to.equal('viewer');
  });

  it('does not move disabled options on Enter or double click', async () => {
    const el = await setup();
    press(option(el, 'auditor'), 'Enter');
    option(el, 'auditor').dispatchEvent(
      new MouseEvent('dblclick', { bubbles: true, composed: true }),
    );
    await settle(el);
    expect(el.value).to.equal('');
  });

  it('announces moves in a polite live region', async () => {
    const el = await setup();
    await check(el, 'admin');
    await check(el, 'viewer');
    button(el, 'move-checked-to-selected').click();
    await waitUntil(() => announcement(el) !== '', 'announced');
    expect(announcement(el)).to.equal('2 items moved to Selected');
    press(option(el, 'viewer'), 'Enter');
    await waitUntil(
      () => announcement(el) === '1 item moved to Available',
      'announced the move back',
    );
  });

  it('uses custom headlines in counts, buttons and announcements', async () => {
    const el = await setup(
      html`<wc-transfer-list
        .options=${OPTIONS}
        available-headline="All roles"
        selected-headline="Assigned"
      ></wc-transfer-list>`,
    );
    expect(headline(el, 'selected')).to.equal('Assigned (0)');
    expect(
      button(el, 'move-all-to-selected').getAttribute('aria-label'),
    ).to.equal('Move all items to Assigned');
    expect(
      button(el, 'move-checked-to-available').getAttribute('aria-label'),
    ).to.equal('Move checked items to All roles');
  });

  it('filters each list with searchable, and moves only matching items', async () => {
    const el = await setup(
      html`<wc-transfer-list
        .options=${OPTIONS}
        searchable
      ></wc-transfer-list>`,
    );
    const seen = changes(el);
    const search = el.shadowRoot!.querySelector<Search>('.search-available')!;
    expect(search.getAttribute('label')).to.equal('Search Available');
    search.value = 'ED';
    search.dispatchEvent(
      new CustomEvent('input', {
        detail: { value: 'ED' },
        bubbles: true,
        composed: true,
      }),
    );
    await settle(el);
    expect(shownValues(el, 'available')).to.deep.equal(['editor']);
    // The search box's own events stay inside.
    expect(seen).to.have.length(0);

    button(el, 'move-all-to-selected').click();
    await settle(el);
    expect(el.value).to.equal('editor');

    search.dispatchEvent(
      new CustomEvent('input', {
        detail: { value: 'zzz' },
        bubbles: true,
        composed: true,
      }),
    );
    await settle(el);
    expect(
      el.shadowRoot!.querySelector('.pane-available .empty')!.textContent,
    ).to.contain('No matching items');
  });

  it('shows an empty state in an empty list', async () => {
    const el = await setup();
    expect(
      el.shadowRoot!.querySelector('.pane-selected .empty')!.textContent,
    ).to.contain('No items');
    expect(el.shadowRoot!.querySelector('.pane-available .empty')).to.be.null;
  });

  it('keeps the person order with ordered and reorders with buttons and Alt+arrows', async () => {
    const el = await setup(
      html`<wc-transfer-list
        .options=${OPTIONS}
        ordered
        value="viewer"
      ></wc-transfer-list>`,
    );
    press(option(el, 'admin'), 'Enter');
    await settle(el);
    // Moved items join at the end.
    expect(el.values).to.deep.equal(['viewer', 'admin']);
    expect(shownValues(el, 'selected')).to.deep.equal(['viewer', 'admin']);

    expect(button(el, 'move-up').disabled).to.be.true;
    await check(el, 'admin');
    expect(button(el, 'move-up').disabled).to.be.false;
    expect(button(el, 'move-down').disabled).to.be.true;
    button(el, 'move-up').click();
    await settle(el);
    expect(el.values).to.deep.equal(['admin', 'viewer']);

    const seen = changes(el);
    const event = press(option(el, 'admin'), 'ArrowDown', { altKey: true });
    expect(event.defaultPrevented).to.be.true;
    await settle(el);
    expect(el.values).to.deep.equal(['viewer', 'admin']);
    expect(seen).to.deep.equal([
      { value: 'viewer,admin', values: ['viewer', 'admin'] },
    ]);
    await waitUntil(
      () => announcement(el) === 'Administrator, position 2 of 2',
      'announced the new position',
    );
  });

  describe('drag to reorder', () => {
    const ORDERED = 'admin,editor,viewer,auditor,guest';

    async function orderedSetup(
      extra: { value?: string; searchable?: boolean } = {},
    ) {
      return setup(
        html`<wc-transfer-list
          style="width: 48rem"
          .options=${OPTIONS}
          ordered
          ?searchable=${!!extra.searchable}
          value=${extra.value ?? ORDERED}
        ></wc-transfer-list>`,
      );
    }

    function handle(el: TransferList, value: string) {
      return option(el, value).querySelector<HTMLElement>('.drag-handle');
    }

    function pointer(
      type: string,
      x: number,
      y: number,
      target: EventTarget = window,
    ) {
      target.dispatchEvent(
        new PointerEvent(type, {
          pointerId: 7,
          button: 0,
          clientX: x,
          clientY: y,
          bubbles: true,
          composed: true,
          cancelable: true,
        }),
      );
    }

    /** A point above (`before`) or below (`after`) the middle of an option. */
    function at(el: TransferList, value: string, where: 'before' | 'after') {
      const rect = option(el, value).getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: where === 'before' ? rect.top + 2 : rect.bottom - 2,
      };
    }

    async function startDrag(el: TransferList, value: string) {
      const grip = handle(el, value)!;
      const rect = grip.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      pointer('pointerdown', x, y, grip);
      return { x, y };
    }

    async function moveTo(el: TransferList, x: number, y: number) {
      pointer('pointermove', x, y);
      await settle(el);
    }

    async function drop(el: TransferList, x: number, y: number) {
      pointer('pointerup', x, y);
      await settle(el);
    }

    it('shows a drag handle on enabled selected items only with ordered', async () => {
      const el = await orderedSetup({ value: 'admin,auditor' });
      expect(handle(el, 'admin')).to.exist;
      expect(handle(el, 'admin')!.getAttribute('aria-hidden')).to.equal('true');
      expect(handle(el, 'auditor')).to.be.null;
      expect(handle(el, 'editor')).to.be.null;

      el.readonly = true;
      await settle(el);
      expect(handle(el, 'admin')).to.be.null;

      el.readonly = false;
      el.ordered = false;
      await settle(el);
      expect(handle(el, 'admin')).to.be.null;
    });

    it('moves one item down and up, announces it and fires change', async () => {
      const el = await orderedSetup();
      const seen = changes(el);
      await startDrag(el, 'admin');
      const below = at(el, 'viewer', 'after');
      await moveTo(el, below.x, below.y);
      expect(option(el, 'admin').classList.contains('dragging')).to.be.true;
      expect(el.shadowRoot!.querySelector('.drop-indicator')).to.exist;
      expect(
        el.shadowRoot!.querySelector('.drag-preview')!.textContent,
      ).to.contain('Administrator');
      expect(el.shadowRoot!.querySelector('.drag-count')).to.be.null;
      await drop(el, below.x, below.y);

      expect(el.values).to.deep.equal([
        'editor',
        'viewer',
        'admin',
        'auditor',
        'guest',
      ]);
      expect(seen).to.have.length(1);
      expect(seen[0].values).to.deep.equal(el.values);
      expect(el.shadowRoot!.querySelector('.drop-indicator')).to.be.null;
      expect(el.shadowRoot!.querySelector('.drag-preview')).to.be.null;
      expect(option(el, 'admin').classList.contains('dragging')).to.be.false;
      await waitUntil(
        () => announcement(el) === 'Administrator, position 3 of 5',
        'announced the new position',
      );

      await startDrag(el, 'guest');
      const top = at(el, 'editor', 'before');
      await moveTo(el, top.x, top.y);
      await drop(el, top.x, top.y);
      expect(el.values).to.deep.equal([
        'guest',
        'editor',
        'viewer',
        'admin',
        'auditor',
      ]);
    });

    it('moves all checked items together when the dragged one is checked', async () => {
      const el = await orderedSetup();
      await check(el, 'admin');
      await check(el, 'viewer');
      await startDrag(el, 'viewer');
      const end = at(el, 'guest', 'after');
      await moveTo(el, end.x, end.y);
      expect(el.shadowRoot!.querySelector('.drag-count')!.textContent).to.equal(
        '2',
      );
      await drop(el, end.x, end.y);
      expect(el.values).to.deep.equal([
        'editor',
        'auditor',
        'guest',
        'admin',
        'viewer',
      ]);
      await waitUntil(
        () => announcement(el) === '2 items moved to position 4',
        'announced the group move',
      );
    });

    it('moves only the dragged item when it is not checked', async () => {
      const el = await orderedSetup();
      await check(el, 'admin');
      await startDrag(el, 'editor');
      const end = at(el, 'guest', 'after');
      await moveTo(el, end.x, end.y);
      await drop(el, end.x, end.y);
      expect(el.values).to.deep.equal([
        'admin',
        'viewer',
        'auditor',
        'guest',
        'editor',
      ]);
    });

    it('does nothing for a drop that keeps the order, a click or a short press', async () => {
      const el = await orderedSetup();
      const seen = changes(el);
      const start = await startDrag(el, 'editor');
      const same = at(el, 'editor', 'after');
      await moveTo(el, same.x, same.y);
      expect(el.shadowRoot!.querySelector('.drop-indicator')).to.be.null;
      await drop(el, same.x, same.y);

      await startDrag(el, 'editor');
      await drop(el, start.x, start.y + 1);
      expect(el.value).to.equal(ORDERED);
      expect(seen).to.have.length(0);
    });

    it('cancels on Escape and on a release outside the list', async () => {
      const el = await orderedSetup();
      const seen = changes(el);
      await startDrag(el, 'admin');
      const target = at(el, 'guest', 'after');
      await moveTo(el, target.x, target.y);
      press(document.body, 'Escape');
      await settle(el);
      expect(el.shadowRoot!.querySelector('.drag-preview')).to.be.null;
      await drop(el, target.x, target.y);
      expect(el.value).to.equal(ORDERED);

      await startDrag(el, 'admin');
      await moveTo(el, target.x, target.y);
      const box = list(el, 'available').getBoundingClientRect();
      await moveTo(el, box.left + 10, box.top + 10);
      expect(el.shadowRoot!.querySelector('.drop-indicator')).to.be.null;
      await drop(el, box.left + 10, box.top + 10);
      expect(el.value).to.equal(ORDERED);
      expect(seen).to.have.length(0);
    });

    it('swallows the click that ends a drag, so the item is not checked', async () => {
      const el = await orderedSetup();
      await startDrag(el, 'admin');
      const target = at(el, 'viewer', 'after');
      await moveTo(el, target.x, target.y);
      await drop(el, target.x, target.y);
      handle(el, 'admin')!.click();
      await settle(el);
      expect(option(el, 'admin').selected).to.be.false;
    });

    it('drops around disabled items and keeps hidden items in place while searching', async () => {
      const el = await orderedSetup({ searchable: true });
      await startDrag(el, 'admin');
      const past = at(el, 'auditor', 'after');
      await moveTo(el, past.x, past.y);
      await drop(el, past.x, past.y);
      expect(el.values).to.deep.equal([
        'editor',
        'viewer',
        'auditor',
        'admin',
        'guest',
      ]);

      // "e" hides only Auditor (Administrator matches through "Full access").
      const search = el.shadowRoot!.querySelector<Search>('.search-selected')!;
      search.dispatchEvent(
        new CustomEvent('input', {
          detail: { value: 'e' },
          bubbles: true,
          composed: true,
        }),
      );
      await settle(el);
      expect(shownValues(el, 'selected')).to.deep.equal([
        'editor',
        'viewer',
        'admin',
        'guest',
      ]);
      await startDrag(el, 'editor');
      const line = at(el, 'admin', 'before');
      await moveTo(el, line.x, line.y);
      await drop(el, line.x, line.y);
      // Dropped right before Administrator; the hidden Auditor keeps its place above.
      expect(el.values).to.deep.equal([
        'viewer',
        'auditor',
        'editor',
        'admin',
        'guest',
      ]);
    });
  });

  it('keeps each list at --transfer-list-list-block-size and scrolls a long one', async () => {
    const many = Array.from({ length: 30 }, (_, i) => ({
      value: `v${i}`,
      label: `Item ${i}`,
    }));
    const el = await setup(
      html`<wc-transfer-list
        style="width: 48rem; --transfer-list-list-block-size: 8rem"
        .options=${many}
      ></wc-transfer-list>`,
    );
    const wrapper = el.shadowRoot!.querySelector<HTMLElement>(
      '.pane-available .list-wrapper',
    )!;
    expect(wrapper.clientHeight).to.equal(128);
    expect(wrapper.scrollHeight).to.be.greaterThan(wrapper.clientHeight);
  });

  it('has no reorder buttons without ordered', async () => {
    const el = await setup();
    expect(el.shadowRoot!.querySelector('.move-up')).to.be.null;
  });

  it('submits each selected value under its name', async () => {
    const form = fixtureSync<HTMLFormElement>(
      html`<form>
        <wc-transfer-list
          name="roles"
          .options=${OPTIONS}
          value="admin,viewer"
        ></wc-transfer-list>
      </form>`,
    );
    const el = form.querySelector('wc-transfer-list') as TransferList;
    await settle(el);
    expect(new FormData(form).getAll('roles')).to.deep.equal([
      'admin',
      'viewer',
    ]);
    el.values = [];
    await settle(el);
    expect(new FormData(form).getAll('roles')).to.deep.equal([]);
  });

  it('blocks submission while required and empty, and shows the message', async () => {
    const form = fixtureSync<HTMLFormElement>(
      html`<form>
        <wc-transfer-list
          name="roles"
          label="Roles"
          required
          .options=${OPTIONS}
        ></wc-transfer-list>
      </form>`,
    );
    const el = form.querySelector('wc-transfer-list') as TransferList;
    await settle(el);
    expect(el.validity.valueMissing).to.be.true;
    expect(form.checkValidity()).to.be.false;
    form.requestSubmit();
    await settle(el);
    const helper = el.shadowRoot!.querySelector('.helper')!;
    expect(helper.textContent).to.contain('Please select an item');
    const group = el.shadowRoot!.querySelector('[role="group"]')!;
    expect(group.getAttribute('aria-describedby')).to.equal(helper.id);

    press(option(el, 'admin'), 'Enter');
    await settle(el);
    expect(el.checkValidity()).to.be.true;
  });

  it('restores the first value and clears checks and search on form reset', async () => {
    const form = fixtureSync<HTMLFormElement>(
      html`<form>
        <wc-transfer-list
          name="roles"
          searchable
          .options=${OPTIONS}
          value="admin"
        ></wc-transfer-list>
      </form>`,
    );
    const el = form.querySelector('wc-transfer-list') as TransferList;
    await settle(el);
    press(option(el, 'editor'), 'Enter');
    await settle(el);
    await check(el, 'viewer');
    expect(el.value).to.equal('admin,editor');
    form.reset();
    await settle(el);
    expect(el.value).to.equal('admin');
    expect(list(el, 'available').value).to.equal('');
  });

  it('restores form state from entries', async () => {
    const el = await setup();
    el.formStateRestoreCallback([
      ['roles', 'editor'],
      ['roles', 'guest'],
    ]);
    await settle(el);
    expect(el.values).to.deep.equal(['editor', 'guest']);
  });

  it('moves nothing while disabled or readonly', async () => {
    const el = await setup(
      html`<wc-transfer-list .options=${OPTIONS} readonly></wc-transfer-list>`,
    );
    expect(button(el, 'move-all-to-selected').disabled).to.be.true;
    press(option(el, 'admin'), 'Enter');
    await settle(el);
    expect(el.value).to.equal('');
    expect(list(el, 'available').readonly).to.be.true;

    el.readonly = false;
    el.disabled = true;
    await settle(el);
    expect(button(el, 'move-all-to-selected').disabled).to.be.true;
    expect(list(el, 'available').disabled).to.be.true;
    option(el, 'admin').dispatchEvent(
      new MouseEvent('dblclick', { bubbles: true, composed: true }),
    );
    await settle(el);
    expect(el.value).to.equal('');
  });

  it('drops checks of items that leave a side when value is set', async () => {
    const el = await setup();
    await check(el, 'admin');
    expect(list(el, 'available').value).to.equal('admin');
    el.value = 'admin';
    await settle(el);
    expect(list(el, 'available').value).to.equal('');
    expect(button(el, 'move-checked-to-selected').disabled).to.be.true;
  });

  it('names the move buttons and shows helper text', async () => {
    const el = await setup(
      html`<wc-transfer-list
        .options=${OPTIONS}
        helper-text="Pick roles"
      ></wc-transfer-list>`,
    );
    expect(
      button(el, 'move-checked-to-selected').getAttribute('aria-label'),
    ).to.equal('Move checked items to Selected');
    expect(
      button(el, 'move-all-to-available').getAttribute('aria-label'),
    ).to.equal('Move all items to Available');
    const group = el.shadowRoot!.querySelector('[role="group"]')!;
    const id = group.getAttribute('aria-describedby')!;
    expect(el.shadowRoot!.getElementById(id)!.textContent).to.contain(
      'Pick roles',
    );
  });

  it('formats the counts in the locale', async () => {
    const many = Array.from({ length: 1200 }, (_, index) => ({
      value: `v${index}`,
      label: `Item ${index}`,
    }));
    const el = await setup(
      html`<wc-transfer-list
        locale="de-DE"
        .options=${many}
      ></wc-transfer-list>`,
    );
    expect(headline(el, 'available')).to.equal('Available (1.200)');
  });

  it('lays the lists side by side, stacks them in a narrow container and mirrors the arrows in RTL', async () => {
    const el = await setup(
      html`<wc-transfer-list
        style="width: 48rem"
        .options=${OPTIONS}
      ></wc-transfer-list>`,
    );
    const panes = el.shadowRoot!.querySelector('.panes')!;
    const icon = el.shadowRoot!.querySelector('.direction-icon')!;
    const tracks = () =>
      getComputedStyle(panes).gridTemplateColumns.split(' ').length;
    expect(tracks()).to.equal(3);
    expect(getComputedStyle(icon).transform).to.equal('none');

    el.setAttribute('dir', 'rtl');
    await settle(el);
    // scaleX(-1)
    expect(getComputedStyle(icon).transform).to.equal(
      'matrix(-1, 0, 0, 1, 0, 0)',
    );

    el.style.width = '20rem';
    await settle(el);
    expect(tracks()).to.equal(1);
    // rotate(90deg), in both directions
    expect(getComputedStyle(icon).transform).to.equal(
      'matrix(0, 1, -1, 0, 0, 0)',
    );
  });
});
