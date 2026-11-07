/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect, oneEvent } from '@open-wc/testing';
import { Table } from '../src/table/index.js';
import type { TableColumn, TableRow } from '../src/table/table.js';
import { Item } from '../src/item/index.js';
import { Menu, MenuItem } from '../src/menu/index.js';
import {
  buildGridColumns,
  emptyColumnState,
  moveColumnTo,
  reconcileColumnState,
} from '../src/table/table-columns.js';
import { nextSorts } from '../src/table/table-sort.js';

if (!customElements.get('wc-table')) {
  customElements.define('wc-table', Table);
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

const columns: TableColumn[] = [
  { name: 'name', label: 'Name', width: 10 },
  { name: 'age', label: 'Age', width: 6, type: 'number' },
  { name: 'city', label: 'City', width: 8 },
];

function people(count: number): TableRow[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `p-${index + 1}`,
    name: `Person ${index + 1}`,
    age: 20 + index,
    city: `City ${index + 1}`,
  }));
}

function root(el: Table): ShadowRoot {
  return el.shadowRoot as ShadowRoot;
}

function headerNames(el: Table): string[] {
  return [
    ...root(el).querySelectorAll<HTMLElement>('.header-row [data-name]'),
  ].map(cell => cell.dataset.name ?? '');
}

function headerCell(el: Table, name: string): HTMLElement {
  return root(el).querySelector(
    `.header-row [data-name="${name}"]`,
  ) as HTMLElement;
}

function pointer(
  target: EventTarget,
  type: string,
  clientX: number,
  clientY = 0,
) {
  target.dispatchEvent(
    new PointerEvent(type, {
      clientX,
      clientY,
      button: 0,
      bubbles: true,
      composed: true,
    }),
  );
}

async function render(
  template: ReturnType<typeof html>,
  cols: TableColumn[] = columns,
  data: TableRow[] = people(3),
): Promise<Table> {
  const el = await fixture<Table>(template);
  el.columns = cols;
  el.data = data;
  await el.updateComplete;
  return el;
}

describe('Table columns', () => {
  describe('widths', () => {
    it('sizes cells from width, minWidth, maxWidth and flex', async () => {
      const el = await render(html`<wc-table></wc-table>`, [
        { name: 'name', label: 'Name', width: 10, flex: 2, minWidth: 8 },
        { name: 'age', label: 'Age', maxWidth: 6 },
        { name: 'city', label: 'City', width: 8 },
      ]);
      const name = headerCell(el, 'name').style;
      expect(name.flex).to.equal('2 0 10rem');
      expect(name.minWidth).to.equal('8rem');
      // maxWidth clamps the default 16rem.
      expect(headerCell(el, 'age').style.flexBasis).to.equal('6rem');
      expect(headerCell(el, 'age').style.maxWidth).to.equal('6rem');
      // With an explicit flex elsewhere, the last column no longer grows.
      expect(headerCell(el, 'city').style.flexGrow).to.equal('0');
    });

    it('grows the last scrolling column when no column sets flex', async () => {
      const el = await render(html`<wc-table></wc-table>`);
      expect(headerCell(el, 'city').style.flexGrow).to.equal('1');
      expect(headerCell(el, 'name').style.flexGrow).to.equal('0');
    });
  });

  describe('resize', () => {
    it('resizes a column by dragging its edge', async () => {
      const el = await render(html`<wc-table resizable></wc-table>`);
      const handle = headerCell(el, 'name').querySelector(
        '.resize-handle',
      ) as HTMLElement;
      expect(handle.getAttribute('role')).to.equal('separator');

      pointer(handle, 'pointerdown', 100);
      pointer(window, 'pointermove', 132);
      await el.updateComplete;
      expect(headerCell(el, 'name').style.flexBasis).to.equal('12rem');

      setTimeout(() => pointer(window, 'pointerup', 132));
      const event = await oneEvent(el, 'column-resize');
      expect(event.detail).to.deep.equal({ name: 'name', width: 12 });
    });

    it('resizes with the arrow keys on the focused handle, within min and max', async () => {
      const el = await render(html`<wc-table></wc-table>`, [
        {
          name: 'name',
          label: 'Name',
          width: 10,
          resizable: true,
          maxWidth: 11,
        },
        { name: 'age', label: 'Age', width: 6 },
      ]);
      const handle = () =>
        headerCell(el, 'name').querySelector('.resize-handle') as HTMLElement;
      expect(headerCell(el, 'age').querySelector('.resize-handle')).to.equal(
        null,
      );

      setTimeout(() =>
        handle().dispatchEvent(
          new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
        ),
      );
      let event = await oneEvent(el, 'column-resize');
      expect(event.detail.width).to.equal(11);
      await el.updateComplete;

      setTimeout(() =>
        handle().dispatchEvent(
          new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
        ),
      );
      event = await oneEvent(el, 'column-resize');
      expect(event.detail.width).to.equal(11);
      await el.updateComplete;
      expect(handle().getAttribute('aria-valuenow')).to.equal('11');
    });
  });

  describe('reorder', () => {
    it('moves a column with Alt+Arrow keys and keeps focus on it', async () => {
      const el = await render(html`<wc-table reorderable></wc-table>`);
      const button = headerCell(el, 'name').querySelector(
        'button',
      ) as HTMLElement;
      button.focus();
      setTimeout(() =>
        button.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'ArrowRight',
            altKey: true,
            bubbles: true,
            composed: true,
          }),
        ),
      );
      const event = await oneEvent(el, 'column-reorder');
      expect(event.detail.order).to.deep.equal(['age', 'name', 'city']);
      await el.updateComplete;
      expect(headerNames(el)).to.deep.equal(['age', 'name', 'city']);
      expect(root(el).activeElement?.closest('[data-name]')).to.equal(
        headerCell(el, 'name'),
      );
      expect(
        root(el).querySelector('.visually-hidden[aria-live]')?.textContent,
      ).to.contain('Name moved to position 2 of 3');
    });

    it('moves a column by dragging its header', async () => {
      const el = await render(html`<wc-table reorderable></wc-table>`);
      const source = headerCell(el, 'name').getBoundingClientRect();
      const target = headerCell(el, 'city').getBoundingClientRect();
      const y = source.top + source.height / 2;

      pointer(headerCell(el, 'name'), 'pointerdown', source.left + 5, y);
      pointer(window, 'pointermove', target.left + 10, y);
      await el.updateComplete;
      expect(headerCell(el, 'name').classList.contains('dragging')).to.be.true;
      expect(headerCell(el, 'city').classList.contains('drop-target')).to.be
        .true;

      setTimeout(() => pointer(window, 'pointerup', target.left + 10, y));
      const event = await oneEvent(el, 'column-reorder');
      expect(event.detail.order).to.deep.equal(['age', 'city', 'name']);
    });

    it('keeps pinned columns among the columns pinned to the same edge', async () => {
      const cols: TableColumn[] = [
        { name: 'name', label: 'Name', fixed: 'start' },
        { name: 'age', label: 'Age' },
        { name: 'city', label: 'City' },
      ];
      expect(moveColumnTo(cols, emptyColumnState(), 'name', 'age')).to.equal(
        undefined,
      );
      const el = await render(html`<wc-table reorderable></wc-table>`, cols);
      let fired = false;
      el.addEventListener('column-reorder', () => {
        fired = true;
      });
      const button = headerCell(el, 'name').querySelector(
        'button',
      ) as HTMLElement;
      button.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowRight',
          altKey: true,
          bubbles: true,
          composed: true,
        }),
      );
      await el.updateComplete;
      expect(fired).to.be.false;
      expect(headerNames(el)).to.deep.equal(['name', 'age', 'city']);
    });
  });

  describe('visibility', () => {
    it('leaves hidden columns out of the grid', async () => {
      const el = await render(html`<wc-table></wc-table>`, [
        { name: 'name', label: 'Name' },
        { name: 'age', label: 'Age', hidden: true },
      ]);
      expect(headerNames(el)).to.deep.equal(['name']);
      expect(
        root(el).querySelector('[role="grid"]')?.getAttribute('aria-colcount'),
      ).to.equal('1');
    });

    it('shows and hides columns from the column menu', async () => {
      const el = await render(html`<wc-table column-menu></wc-table>`, [
        { name: 'name', label: 'Name' },
        { name: 'age', label: 'Age', hidden: true },
        { name: 'id', label: '', hideable: false },
      ]);
      const button = root(el).querySelector(
        '.column-menu-button',
      ) as HTMLElement;
      expect(button.getAttribute('aria-label')).to.equal(
        'Show or hide columns',
      );
      const menu = root(el).querySelector('.column-menu') as Menu;
      const items = [...menu.querySelectorAll<MenuItem>('wc-menu-item')];
      expect(items.map(item => item.value)).to.deep.equal(['name', 'age']);
      expect(items.map(item => item.selected)).to.deep.equal([true, false]);
      // Only the last visible column is locked; `id` is still visible.
      expect(items[0].disabled).to.be.false;

      button.click();
      await menu.updateComplete;
      expect(menu.open).to.be.true;

      setTimeout(() => items[1].click());
      const event = await oneEvent(el, 'column-visibility');
      expect(event.detail).to.deep.equal({ name: 'age', hidden: false });
      await el.updateComplete;
      expect(headerNames(el)).to.deep.equal(['name', 'age', 'id']);
    });
  });

  describe('column groups', () => {
    it('renders a group header row with spans and keeps the grid indexes', async () => {
      const el = await render(html`<wc-table></wc-table>`, [
        { name: 'name', label: 'Name' },
        { name: 'age', label: 'Age', group: 'Details' },
        { name: 'city', label: 'City', group: 'Details' },
      ]);
      const groupRow = root(el).querySelector('.group-row') as HTMLElement;
      expect(groupRow.getAttribute('aria-rowindex')).to.equal('1');
      const groups = [...groupRow.querySelectorAll<HTMLElement>('.group-cell')];
      expect(
        groups.map(cell => cell.getAttribute('aria-colspan')),
      ).to.deep.equal(['1', '2']);
      expect(groups[1].textContent?.trim()).to.equal('Details');

      const grid = root(el).querySelector('[role="grid"]') as HTMLElement;
      expect(grid.getAttribute('aria-rowcount')).to.equal('5');
      expect(
        root(el).querySelector('.header-row')?.getAttribute('aria-rowindex'),
      ).to.equal('2');
      expect(
        root(el).querySelector('.body .row')?.getAttribute('aria-rowindex'),
      ).to.equal('3');

      // Group cells are not part of keyboard navigation.
      expect(groupRow.querySelector('[data-cell]')).to.equal(null);
      const first = headerCell(el, 'name').querySelector(
        'button',
      ) as HTMLElement;
      first.focus();
      first.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowDown',
          bubbles: true,
          composed: true,
        }),
      );
      await el.updateComplete;
      expect(
        root(el)
          .activeElement?.closest('[data-cell]')
          ?.getAttribute('data-row'),
      ).to.equal('1');
    });
  });

  describe('header template', () => {
    it('renders custom header content inside the sort button', async () => {
      const el = await render(html`<wc-table></wc-table>`, [
        {
          name: 'name',
          label: 'Name',
          headerTemplate: column =>
            html`<em class="custom-header">${column.label}!</em>`,
        },
        { name: 'age', label: 'Age', headerTemplate: () => '<b>Age</b>' },
      ]);
      expect(
        headerCell(el, 'name').querySelector('button .custom-header')
          ?.textContent,
      ).to.equal('Name!');
      // Strings are text, not HTML.
      expect(headerCell(el, 'age').querySelector('b')).to.equal(null);
      expect(headerCell(el, 'age').textContent).to.contain('<b>Age</b>');
    });
  });

  describe('helpers', () => {
    it('cycles a plain sort and stacks Shift sorts', () => {
      expect(nextSorts([], 'a', false)).to.deep.equal([
        { name: 'a', order: 'asc' },
      ]);
      expect(
        nextSorts([{ name: 'a', order: 'asc' }], 'a', false),
      ).to.deep.equal([{ name: 'a', order: 'desc' }]);
      expect(
        nextSorts([{ name: 'a', order: 'desc' }], 'a', false),
      ).to.deep.equal([]);
      expect(
        nextSorts(
          [
            { name: 'a', order: 'asc' },
            { name: 'b', order: 'desc' },
          ],
          'b',
          true,
        ),
      ).to.deep.equal([{ name: 'a', order: 'asc' }]);
    });

    it('keeps resized widths across new columns unless the width changed', () => {
      const state = { ...emptyColumnState(), widths: { name: 12, age: 9 } };
      const next = reconcileColumnState(state, columns, [
        { name: 'name', label: 'Name', width: 10 },
        { name: 'age', label: 'Age', width: 7 },
      ]);
      expect(next.widths).to.deep.equal({ name: 12 });
      const grid = buildGridColumns(columns, next, {
        select: true,
        menu: true,
      });
      expect(grid.map(entry => entry.kind)).to.deep.equal([
        'select',
        'data',
        'data',
        'data',
        'menu',
      ]);
      expect(grid[1].width).to.equal(12);
    });
  });
});
