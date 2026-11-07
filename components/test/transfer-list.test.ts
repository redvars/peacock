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
