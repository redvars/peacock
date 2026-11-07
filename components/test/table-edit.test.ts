/// <reference types="mocha" />
import { html } from 'lit';
import { aTimeout, fixture, expect, oneEvent } from '@open-wc/testing';
import { Table } from '../src/table/index.js';
import type { TableColumn, TableRow } from '../src/table/table.js';
import { Field } from '../src/field/index.js';
import { Input } from '../src/input/index.js';
import { NumberField } from '../src/number-field/index.js';
import { Checkbox } from '../src/checkbox/index.js';

for (const [tag, element] of [
  ['wc-table', Table],
  ['wc-field', Field],
  ['wc-input', Input],
  ['wc-number-field', NumberField],
  ['wc-checkbox', Checkbox],
] as const) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

type EditorElement = HTMLElement & {
  value?: unknown;
  checked?: boolean;
  updateComplete?: Promise<unknown>;
  validationMessage?: string;
};

const columns: TableColumn[] = [
  { name: 'name', label: 'Name', width: 10, editable: true, required: true },
  {
    name: 'age',
    label: 'Age',
    width: 6,
    type: 'number',
    editable: true,
    min: 0,
    max: 120,
  },
  { name: 'city', label: 'City', width: 8 },
  {
    name: 'team',
    label: 'Team',
    width: 8,
    editable: true,
    editor: 'select',
    options: [
      { label: 'Blue', value: 'blue' },
      { label: 'Red', value: 'red' },
    ],
  },
  {
    name: 'active',
    label: 'Active',
    width: 6,
    editable: true,
    editor: 'checkbox',
  },
  { name: 'since', label: 'Since', width: 8, editable: true, editor: 'date' },
];

function people(): TableRow[] {
  return [
    {
      id: 'p-1',
      name: 'Ann',
      age: 30,
      city: 'Oslo',
      team: 'blue',
      active: true,
      since: '2020-01-01',
    },
    {
      id: 'p-2',
      name: 'Bob',
      age: 25,
      city: 'Rome',
      team: 'red',
      active: false,
      since: '2021-06-15',
    },
  ];
}

function root(el: Table): ShadowRoot {
  return el.shadowRoot as ShadowRoot;
}

function cell(el: Table, row: number, col: number): HTMLElement {
  return root(el).querySelector(
    `.body [data-cell][data-row="${row}"][data-col="${col}"]`,
  ) as HTMLElement;
}

function editor(el: Table): EditorElement | null {
  return root(el).querySelector<EditorElement>('.cell-editor .editor');
}

function key(
  target: Element,
  init: ConstructorParameters<typeof KeyboardEvent>[1],
) {
  target.dispatchEvent(
    new KeyboardEvent('keydown', {
      bubbles: true,
      composed: true,
      cancelable: true,
      ...init,
    }),
  );
}

async function render(template = html`<wc-table></wc-table>`) {
  const el = await fixture<Table>(template);
  el.columns = columns;
  el.data = people();
  await el.updateComplete;
  return el;
}

/** Opens the editor of a cell with Enter and waits for it to take focus. */
async function open(el: Table, row: number, col: number, keyName = 'Enter') {
  const target = cell(el, row, col);
  target.focus();
  key(target, { key: keyName });
  await el.updateComplete;
  const field = editor(el) as EditorElement;
  await field?.updateComplete;
  await aTimeout(0);
  return field;
}

async function setValue(field: EditorElement, value: unknown) {
  Object.assign(field, { value });
  await field.updateComplete;
}

describe('Table inline editing', () => {
  it('opens the matching field with Enter and commits a new value with Enter', async () => {
    const el = await render();
    const before = el.data;
    const original = before[0];
    const field = await open(el, 1, 0);
    expect(field.localName).to.equal('wc-input');
    expect(field.getAttribute('size')).to.equal('sm');
    expect(field.value).to.equal('Ann');
    expect(root(el).activeElement).to.equal(field);
    expect(cell(el, 1, 0).classList.contains('editing')).to.be.true;

    await setValue(field, 'Anna');
    setTimeout(() => key(field, { key: 'Enter' }));
    const event = await oneEvent(el, 'cell-edit');
    expect(event.detail).to.deep.equal({
      key: 'p-1',
      column: 'name',
      value: 'Anna',
      oldValue: 'Ann',
      record: original,
    });
    expect(event.cancelable && event.bubbles && event.composed).to.be.true;
    await el.updateComplete;

    expect(editor(el)).to.equal(null);
    expect(el.data).to.not.equal(before);
    expect(el.data[0]).to.deep.equal({ ...original, name: 'Anna' });
    expect(original.name).to.equal('Ann');
    expect(el.data[1]).to.equal(before[1]);
    expect(cell(el, 1, 0).textContent?.trim()).to.equal('Anna');
    expect(root(el).activeElement).to.equal(cell(el, 1, 0));
  });

  it('cancels with Escape and returns focus to the cell', async () => {
    const el = await render();
    let fired = false;
    el.addEventListener('cell-edit', () => {
      fired = true;
    });
    const field = await open(el, 1, 0, 'F2');
    await setValue(field, 'Changed');
    key(field, { key: 'Escape' });
    await el.updateComplete;
    expect(editor(el)).to.equal(null);
    expect(fired).to.be.false;
    expect(el.data[0].name).to.equal('Ann');
    expect(root(el).activeElement).to.equal(cell(el, 1, 0));
  });

  it('opens on double-click and leaves other cells to cell-click', async () => {
    const el = await render();
    cell(el, 2, 1).dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    await el.updateComplete;
    expect(editor(el)?.localName).to.equal('wc-number-field');
    expect(editor(el)?.value).to.equal(25);

    key(editor(el) as Element, { key: 'Escape' });
    await el.updateComplete;
    const city = cell(el, 1, 2);
    city.focus();
    setTimeout(() => key(city, { key: 'Enter' }));
    const event = await oneEvent(el, 'cell-click');
    expect(event.detail.column.name).to.equal('city');
    expect(editor(el)).to.equal(null);
    city.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    await el.updateComplete;
    expect(editor(el)).to.equal(null);
  });

  it('does not apply a value when cell-edit is cancelled', async () => {
    const el = await render();
    el.addEventListener('cell-edit', event => event.preventDefault());
    const field = await open(el, 1, 0);
    await setValue(field, 'Nope');
    key(field, { key: 'Enter' });
    await el.updateComplete;
    expect(editor(el)).to.equal(null);
    expect(el.data[0].name).to.equal('Ann');
  });

  it('only reports the edit in managed mode', async () => {
    const el = await render(html`<wc-table managed></wc-table>`);
    const before = el.data;
    const field = await open(el, 1, 1);
    await setValue(field, 31);
    setTimeout(() => key(field, { key: 'Enter' }));
    const event = await oneEvent(el, 'cell-edit');
    expect(event.detail.value).to.equal(31);
    expect(event.detail.oldValue).to.equal(30);
    expect(el.data).to.equal(before);
  });

  it('keeps editing and shows the message while the value is invalid', async () => {
    const el = await render();
    let fired = false;
    el.addEventListener('cell-edit', () => {
      fired = true;
    });
    const field = await open(el, 1, 0);
    await setValue(field, '');
    key(field, { key: 'Enter' });
    await el.updateComplete;
    await field.updateComplete;
    expect(editor(el)).to.equal(field);
    expect(fired).to.be.false;
    expect(field.validationMessage).to.not.equal('');
    const fieldFrame = field.shadowRoot?.querySelector('wc-field');
    expect(fieldFrame?.getAttribute('error-text')).to.not.equal('');

    await setValue(field, 'Ann B');
    key(field, { key: 'Enter' });
    await el.updateComplete;
    expect(editor(el)).to.equal(null);
    expect(fired).to.be.true;
  });

  it('checks min and max of a number editor and a validate function', async () => {
    const el = await render();
    const field = await open(el, 1, 1);
    await setValue(field, 500);
    key(field, { key: 'Enter' });
    await el.updateComplete;
    expect(editor(el)).to.equal(field);
    await setValue(field, 40);
    key(field, { key: 'Enter' });
    await el.updateComplete;
    expect(editor(el)).to.equal(null);
    expect(el.data[0].age).to.equal(40);

    el.columns = columns.map(column =>
      column.name === 'name'
        ? {
            ...column,
            validate: value =>
              String(value).length < 2 ? 'Too short' : undefined,
          }
        : column,
    );
    await el.updateComplete;
    const name = await open(el, 2, 0);
    await setValue(name, 'B');
    key(name, { key: 'Enter' });
    await el.updateComplete;
    expect(editor(el)).to.equal(name);
    expect(name.validationMessage).to.equal('Too short');
  });

  it('commits when focus leaves the editor', async () => {
    const el = await render();
    const field = await open(el, 1, 0);
    await setValue(field, 'Blurred');
    (field as HTMLElement).blur();
    // A page without system focus (tests running side by side) fires no focus events.
    field.dispatchEvent(
      new FocusEvent('focusout', { bubbles: true, composed: true }),
    );
    await aTimeout(10);
    await el.updateComplete;
    expect(editor(el) === null).to.be.true;
    expect(el.data[0].name).to.equal('Blurred');
  });

  it('commits a pick from select, checkbox and date editors', async () => {
    const el = await render();
    const pick = async (
      col: number,
      change: (field: EditorElement) => void,
    ) => {
      const field = await open(el, 1, col);
      change(field);
      field.dispatchEvent(
        new CustomEvent('change', {
          bubbles: true,
          composed: true,
          detail: { value: field.value },
        }),
      );
      await el.updateComplete;
      expect(editor(el)).to.equal(null);
      return field;
    };

    const select = await pick(3, field => {
      expect(field.localName).to.equal('wc-select');
      expect(field.value).to.equal('blue');
      expect(
        (field as unknown as { options: unknown[] }).options,
      ).to.have.length(2);
      Object.assign(field, { value: 'red' });
    });
    expect(select.getAttribute('size')).to.equal('sm');
    expect(el.data[0].team).to.equal('red');

    await pick(4, field => {
      expect(field.localName).to.equal('wc-checkbox');
      expect(field.checked).to.be.true;
      Object.assign(field, { checked: false });
    });
    expect(el.data[0].active).to.equal(false);

    await pick(5, field => {
      expect(field.localName).to.equal('wc-date-field');
      expect(field.value).to.equal('2020-01-01');
      Object.assign(field, { value: '2022-02-02' });
    });
    expect(el.data[0].since).to.equal('2022-02-02');
  });

  it('keeps the editor events inside the table', async () => {
    const el = await render();
    const heard: string[] = [];
    el.addEventListener('input', () => heard.push('input'));
    el.addEventListener('change', () => heard.push('change'));
    const field = await open(el, 1, 0);
    field.dispatchEvent(
      new CustomEvent('input', { bubbles: true, composed: true }),
    );
    field.dispatchEvent(
      new CustomEvent('change', { bubbles: true, composed: true }),
    );
    expect(heard).to.deep.equal([]);
    // A text editor does not commit on its own change.
    await el.updateComplete;
    expect(editor(el)).to.equal(field);
  });

  it('fires no event when the value did not change', async () => {
    const el = await render();
    let fired = false;
    el.addEventListener('cell-edit', () => {
      fired = true;
    });
    const field = await open(el, 1, 0);
    key(field, { key: 'Enter' });
    await el.updateComplete;
    expect(editor(el)).to.equal(null);
    expect(fired).to.be.false;
  });
});
