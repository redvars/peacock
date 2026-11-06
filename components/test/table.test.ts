/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect, oneEvent } from '@open-wc/testing';
import { Table } from '../src/table/index.js';
import type { TableColumn, TableRow } from '../src/table/table.js';
import { Pagination } from '../src/pagination/index.js';

if (!customElements.get('wc-table')) {
  customElements.define('wc-table', Table);
}
if (!customElements.get('wc-pagination')) {
  customElements.define('wc-pagination', Pagination);
}

const columns: TableColumn[] = [
  { name: 'name', label: 'Name', width: 10 },
  { name: 'age', label: 'Age', width: 6, type: 'number' },
];

function people(count: number): TableRow[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `p-${index + 1}`,
    name: `Person ${index + 1}`,
    age: 20 + ((index * 7) % 50),
  }));
}

function root(el: Table): ShadowRoot {
  return el.shadowRoot as ShadowRoot;
}

function bodyRows(el: Table): HTMLElement[] {
  return [...root(el).querySelectorAll<HTMLElement>('.body .row')];
}

function cellText(row: HTMLElement, col: number): string {
  return row.querySelector(`[data-col="${col}"]`)?.textContent?.trim() ?? '';
}

function headerCheckbox(el: Table): HTMLElement & {
  checked: boolean;
  indeterminate: boolean;
} {
  return root(el).querySelector('.header wc-checkbox') as HTMLElement & {
    checked: boolean;
    indeterminate: boolean;
  };
}

async function render(
  template: ReturnType<typeof html>,
  data: TableRow[],
  cols: TableColumn[] = columns,
): Promise<Table> {
  const el = await fixture<Table>(template);
  el.columns = cols;
  el.data = data;
  await el.updateComplete;
  return el;
}

describe('Table', () => {
  describe('sorting', () => {
    it('cycles ascending, descending and off, and sets aria-sort', async () => {
      const el = await render(html`<wc-table></wc-table>`, people(5));
      const header = () =>
        root(el).querySelector('.header [data-col="1"]') as HTMLElement;
      const button = () => header().querySelector('button') as HTMLElement;

      expect(header().getAttribute('aria-sort')).to.equal('none');

      button().click();
      await el.updateComplete;
      expect(header().getAttribute('aria-sort')).to.equal('ascending');
      const ascending = bodyRows(el).map(row => Number(cellText(row, 1)));
      expect(ascending).to.deep.equal([...ascending].sort((a, b) => a - b));

      button().click();
      await el.updateComplete;
      expect(header().getAttribute('aria-sort')).to.equal('descending');

      setTimeout(() => button().click());
      const event = await oneEvent(el, 'sort');
      expect(event.detail).to.deep.equal({ sortBy: '', sortOrder: 'asc' });
    });

    it('sorts text in natural number order', async () => {
      const el = await render(html`<wc-table sort-by="name"></wc-table>`, [
        { id: 'a', name: 'Item 10' },
        { id: 'b', name: 'Item 2' },
        { id: 'c', name: 'Item 1' },
      ]);
      expect(bodyRows(el).map(row => cellText(row, 0))).to.deep.equal([
        'Item 1',
        'Item 2',
        'Item 10',
      ]);
    });

    it('leaves a column with sortable false without a sort button', async () => {
      const el = await render(html`<wc-table></wc-table>`, people(2), [
        { name: 'name', label: 'Name', sortable: false },
      ]);
      const header = root(el).querySelector('.header [data-col="0"]');
      expect(header?.querySelector('button')).to.equal(null);
      expect(header?.hasAttribute('aria-sort')).to.be.false;
    });
  });

  describe('selection', () => {
    it('shows the header checkbox as mixed when some rows are selected', async () => {
      const el = await render(
        html`<wc-table selection-type="checkbox"></wc-table>`,
        people(3),
      );
      el.selectedRowKeys = ['p-1'];
      await el.updateComplete;
      expect(headerCheckbox(el).indeterminate).to.be.true;
      expect(headerCheckbox(el).checked).to.be.false;

      el.selectedRowKeys = ['p-1', 'p-2', 'p-3'];
      await el.updateComplete;
      expect(headerCheckbox(el).indeterminate).to.be.false;
      expect(headerCheckbox(el).checked).to.be.true;
    });

    it('selects and clears the current page from the header checkbox', async () => {
      const el = await render(
        html`<wc-table
          selection-type="checkbox"
          paginate
          page-size="2"
        ></wc-table>`,
        people(5),
      );
      setTimeout(() =>
        headerCheckbox(el).dispatchEvent(new CustomEvent('change')),
      );
      const event = await oneEvent(el, 'selection-change');
      expect(event.detail.value).to.deep.equal(['p-1', 'p-2']);
      expect(event.detail.isSelectAll).to.be.true;
      expect(event.detail.allPages).to.be.false;

      await el.updateComplete;
      headerCheckbox(el).dispatchEvent(new CustomEvent('change'));
      await el.updateComplete;
      expect(el.selectedRowKeys).to.deep.equal([]);
    });

    it('marks selected rows and shows the selection bar', async () => {
      const el = await render(
        html`<wc-table selection-type="checkbox"></wc-table>`,
        people(3),
      );
      el.selectedRowKeys = ['p-2'];
      await el.updateComplete;

      const rows = bodyRows(el);
      expect(rows[1].classList.contains('selected')).to.be.true;
      expect(rows[1].getAttribute('aria-selected')).to.equal('true');
      expect(rows[0].getAttribute('aria-selected')).to.equal('false');
      expect(
        root(el).querySelector('.bulk-count')?.textContent?.trim(),
      ).to.equal('1 selected');
    });

    it('offers to select every item across pages', async () => {
      const el = await render(
        html`<wc-table
          selection-type="checkbox"
          paginate
          page-size="2"
        ></wc-table>`,
        people(5),
      );
      el.selectedRowKeys = ['p-1', 'p-2'];
      await el.updateComplete;

      const selectAll = root(el).querySelector(
        '.bulk-select-all',
      ) as HTMLElement;
      expect(selectAll.textContent?.trim()).to.equal('Select all 5');

      setTimeout(() => selectAll.click());
      const event = await oneEvent(el, 'selection-change');
      expect(event.detail.allPages).to.be.true;
      expect(event.detail.value).to.have.length(5);
      await el.updateComplete;
      expect(
        root(el).querySelector('.bulk-count')?.textContent?.trim(),
      ).to.equal('5 selected');

      (root(el).querySelector('.bulk-clear') as HTMLElement).click();
      await el.updateComplete;
      expect(el.selectedRowKeys).to.deep.equal([]);
      expect(root(el).querySelector('.bulk-bar')).to.equal(null);
    });
  });

  describe('keyboard', () => {
    it('keeps a single tab stop and moves it with the arrow keys', async () => {
      const el = await render(html`<wc-table></wc-table>`, people(3));
      const tabStops = () =>
        [...root(el).querySelectorAll('[tabindex="0"]')] as HTMLElement[];
      expect(tabStops()).to.have.length(1);

      const first = tabStops()[0];
      first.focus();
      first.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowDown',
          bubbles: true,
          composed: true,
        }),
      );
      await el.updateComplete;

      const [active] = tabStops();
      expect(tabStops()).to.have.length(1);
      expect(active.closest('[data-cell]')?.getAttribute('data-row')).to.equal(
        '1',
      );
      expect(root(el).activeElement).to.equal(active);
    });

    it('toggles the row selection with Space', async () => {
      const el = await render(
        html`<wc-table selection-type="checkbox"></wc-table>`,
        people(3),
      );
      const cell = root(el).querySelector(
        '.body [data-row="2"][data-col="1"]',
      ) as HTMLElement;
      cell.focus();
      setTimeout(() =>
        cell.dispatchEvent(
          new KeyboardEvent('keydown', { key: ' ', bubbles: true }),
        ),
      );
      const event = await oneEvent(el, 'selection-change');
      expect(event.detail.value).to.deep.equal(['p-2']);
    });

    it('fires cell-click and row-click with Enter', async () => {
      const el = await render(html`<wc-table></wc-table>`, people(2));
      const cell = root(el).querySelector(
        '.body [data-row="1"][data-col="0"]',
      ) as HTMLElement;
      cell.focus();
      setTimeout(() =>
        cell.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
        ),
      );
      const event = await oneEvent(el, 'row-click');
      expect(event.detail.record.id).to.equal('p-1');
    });
  });

  describe('layout and states', () => {
    it('places end-pinned columns in the end group', async () => {
      const el = await render(html`<wc-table></wc-table>`, people(1), [
        { name: 'name', label: 'Name', fixed: true },
        { name: 'age', label: 'Age' },
        { name: 'id', label: 'Actions', fixed: 'end' },
      ]);
      const row = bodyRows(el)[0];
      expect(
        cellText(row.querySelector('.pinned-group-start') as HTMLElement, 0),
      ).to.equal('Person 1');
      expect(
        row.querySelector('.pinned-group-end')?.textContent?.trim(),
      ).to.equal('p-1');
    });

    it('end-aligns number columns', async () => {
      const el = await render(html`<wc-table></wc-table>`, people(1));
      const cell = bodyRows(el)[0].querySelector('[data-col="1"]');
      expect(cell?.classList.contains('align-end')).to.be.true;
      expect(cell?.classList.contains('numeric')).to.be.true;
    });

    it('renders template results without parsing HTML strings', async () => {
      const el = await render(html`<wc-table></wc-table>`, people(1), [
        {
          name: 'name',
          label: 'Name',
          template: row => html`<b class="custom">${row.name}</b>`,
        },
      ]);
      expect(root(el).querySelector('.custom')?.textContent?.trim()).to.equal(
        'Person 1',
      );
    });

    it('shows skeleton rows while loading without data', async () => {
      const el = await render(html`<wc-table loading></wc-table>`, []);
      expect(root(el).querySelectorAll('.skeleton-row')).to.have.length(5);
      expect(
        root(el).querySelector('[role="grid"]')?.getAttribute('aria-busy'),
      ).to.equal('true');
      expect(root(el).querySelector('.empty-table')).to.equal(null);
    });

    it('shows a progress bar and keeps rows while loading with data', async () => {
      const el = await render(html`<wc-table loading></wc-table>`, people(2));
      expect(bodyRows(el)).to.have.length(2);
      expect(root(el).querySelector('.loading-bar')).to.not.equal(null);
    });

    it('moves back to the last page when the data shrinks', async () => {
      const el = await render(
        html`<wc-table paginate page-size="2" page="3"></wc-table>`,
        people(6),
      );
      expect(el.page).to.equal(3);
      el.data = people(3);
      await el.updateComplete;
      expect(el.page).to.equal(2);
      expect(bodyRows(el)).to.have.length(1);
    });

    it('reports the full row count under pagination', async () => {
      const el = await render(
        html`<wc-table paginate page-size="2" page="2"></wc-table>`,
        people(6),
      );
      const grid = root(el).querySelector('[role="grid"]');
      expect(grid?.getAttribute('aria-rowcount')).to.equal('7');
      expect(bodyRows(el)[0].getAttribute('aria-rowindex')).to.equal('4');
    });
  });
});
