/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect, oneEvent } from '@open-wc/testing';
import { Table } from '../src/table/index.js';
import type { TableColumn, TableRow } from '../src/table/table.js';
import { Pagination } from '../src/pagination/index.js';
import { resetDeprecationWarnings } from '../src/__internal/utils/deprecate.js';

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

function grid(el: Table): HTMLElement {
  return root(el).querySelector('[role="grid"]') as HTMLElement;
}

function bodyRows(el: Table): HTMLElement[] {
  return [...root(el).querySelectorAll<HTMLElement>('.body .row')];
}

function cellText(row: HTMLElement, col: number): string {
  return row.querySelector(`[data-col="${col}"]`)?.textContent?.trim() ?? '';
}

function header(el: Table, col: number): HTMLElement {
  return root(el).querySelector(
    `.header-row [data-col="${col}"]`,
  ) as HTMLElement;
}

function key(
  target: HTMLElement,
  init: ConstructorParameters<typeof KeyboardEvent>[1],
) {
  target.dispatchEvent(
    new KeyboardEvent('keydown', { bubbles: true, composed: true, ...init }),
  );
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

describe('Table features', () => {
  let warnings: string[];
  let originalWarn: typeof console.warn;

  beforeEach(() => {
    resetDeprecationWarnings();
    warnings = [];
    originalWarn = console.warn;
    console.warn = (message: string) => {
      warnings.push(message);
    };
  });

  afterEach(() => {
    console.warn = originalWarn;
  });

  describe('selection modes', () => {
    it('selects several rows with selection="multiple" without warnings', async () => {
      const el = await render(
        html`<wc-table selection="multiple"></wc-table>`,
        people(3),
      );
      expect(grid(el).getAttribute('aria-multiselectable')).to.equal('true');
      expect(root(el).querySelector('.header wc-checkbox')).to.not.equal(null);
      el.selectedRowKeys = ['p-1', 'p-3'];
      await el.updateComplete;
      expect(
        bodyRows(el).map(row => row.getAttribute('aria-selected')),
      ).to.deep.equal(['true', 'false', 'true']);
      expect(warnings).to.have.length(0);
    });

    it('selects one row at a time with selection="single"', async () => {
      const el = await render(
        html`<wc-table selection="single"></wc-table>`,
        people(3),
      );
      expect(grid(el).hasAttribute('aria-multiselectable')).to.be.false;
      expect(root(el).querySelector('.header wc-checkbox')).to.equal(null);
      expect(root(el).querySelectorAll('.body wc-radio')).to.have.length(3);

      const cell = (row: number) =>
        root(el).querySelector(
          `.body [data-row="${row}"][data-col="1"]`,
        ) as HTMLElement;
      setTimeout(() => key(cell(1), { key: ' ' }));
      let event = await oneEvent(el, 'selection-change');
      expect(event.detail.value).to.deep.equal(['p-1']);
      await el.updateComplete;

      setTimeout(() => key(cell(3), { key: ' ' }));
      event = await oneEvent(el, 'selection-change');
      expect(event.detail.value).to.deep.equal(['p-3']);
      await el.updateComplete;
      expect(
        bodyRows(el).map(row => row.getAttribute('aria-selected')),
      ).to.deep.equal(['false', 'false', 'true']);
      expect(root(el).querySelector('.bulk-bar')).to.equal(null);
    });

    it('skips rows isRowSelectable rules out', async () => {
      const el = await render(
        html`<wc-table selection="multiple"></wc-table>`,
        people(3),
      );
      el.isRowSelectable = row => row.id !== 'p-2';
      await el.updateComplete;

      const checkboxes = [
        ...root(el).querySelectorAll<HTMLElement>('.body wc-checkbox'),
      ];
      expect(checkboxes.map(box => box.hasAttribute('disabled'))).to.deep.equal(
        [false, true, false],
      );
      expect(bodyRows(el)[1].getAttribute('aria-disabled')).to.equal('true');

      let fired = false;
      el.addEventListener('selection-change', () => {
        fired = true;
      });
      key(
        root(el).querySelector(
          '.body [data-row="2"][data-col="1"]',
        ) as HTMLElement,
        { key: ' ' },
      );
      expect(fired).to.be.false;

      setTimeout(() =>
        root(el)
          .querySelector('.header wc-checkbox')
          ?.dispatchEvent(new CustomEvent('change')),
      );
      const event = await oneEvent(el, 'selection-change');
      expect(event.detail.value).to.deep.equal(['p-1', 'p-3']);
      expect(event.detail.isSelectAll).to.be.true;
    });

    it('matches numeric keys with string keys', async () => {
      const data = [
        { id: 1, name: 'One' },
        { id: 2, name: 'Two' },
      ];
      const el = await render(
        html`<wc-table
          selection="multiple"
          selected-row-keys='["2"]'
        ></wc-table>`,
        data,
      );
      expect(bodyRows(el)[1].classList.contains('selected')).to.be.true;

      (el as unknown as { selectedRowKeys: unknown[] }).selectedRowKeys = [1];
      await el.updateComplete;
      expect(el.selectedRowKeys).to.deep.equal(['1']);
      expect(bodyRows(el)[0].classList.contains('selected')).to.be.true;

      setTimeout(() =>
        key(
          root(el).querySelector(
            '.body [data-row="2"][data-col="1"]',
          ) as HTMLElement,
          { key: ' ' },
        ),
      );
      const event = await oneEvent(el, 'selection-change');
      expect(event.detail.value).to.deep.equal(['1', '2']);
    });
  });

  describe('grid semantics', () => {
    it('always sets aria-rowcount and aria-colcount', async () => {
      const el = await render(
        html`<wc-table selection="multiple"></wc-table>`,
        people(3),
      );
      expect(grid(el).getAttribute('aria-rowcount')).to.equal('4');
      expect(grid(el).getAttribute('aria-colcount')).to.equal('3');
      expect(bodyRows(el)[0].getAttribute('aria-rowindex')).to.equal('2');
    });
  });

  describe('empty and error states', () => {
    it('shows the empty slot, falling back to the default empty state', async () => {
      const el = await render(html`<wc-table></wc-table>`, []);
      const empty = root(el).querySelector('.empty-table .state-message');
      expect(empty?.querySelector('.state-headline')?.textContent).to.equal(
        'No items',
      );
      expect(
        empty?.querySelector('wc-illustration')?.getAttribute('name'),
      ).to.equal('empty');
      expect(
        root(el).querySelector('.empty-table')?.getAttribute('role'),
      ).to.equal('gridcell');

      const custom = await render(
        html`<wc-table
          ><p slot="empty" class="mine">Nothing here</p></wc-table
        >`,
        [],
      );
      const slot = root(custom).querySelector(
        'slot[name="empty"]',
      ) as HTMLSlotElement;
      expect(slot.assignedElements()[0]?.classList.contains('mine')).to.be.true;
    });

    it('shows an error row instead of the data and announces it', async () => {
      const el = await render(
        html`<wc-table error error-text="The server is down"></wc-table>`,
        people(3),
      );
      expect(bodyRows(el)).to.have.length(0);
      const error = root(el).querySelector('.error-table');
      expect(error).to.not.equal(null);
      expect(error?.querySelector('.state-text')?.textContent).to.equal(
        'The server is down',
      );
      expect(
        error?.querySelector('wc-illustration')?.getAttribute('name'),
      ).to.equal('error');
      const live = root(el).querySelector(
        '[aria-live="polite"].visually-hidden',
      );
      expect(live?.textContent).to.contain('The server is down');

      el.error = false;
      await el.updateComplete;
      expect(bodyRows(el)).to.have.length(3);
    });

    it('takes custom error content from the error slot', async () => {
      const el = await render(
        html`<wc-table error><p slot="error">Retry later</p></wc-table>`,
        [],
      );
      const slot = root(el).querySelector(
        'slot[name="error"]',
      ) as HTMLSlotElement;
      expect(slot.assignedElements()).to.have.length(1);
    });
  });

  describe('footer slot pagination', () => {
    it('pages the rows with a slotted wc-pagination in client mode', async () => {
      const el = await render(
        html`<wc-table>
          <wc-pagination
            slot="footer"
            page-size="10"
            .pageSizes=${[2, 10]}
          ></wc-pagination>
        </wc-table>`,
        people(5),
      );
      const pagination = el.querySelector('wc-pagination') as Pagination;
      pagination.pageSize = 2;
      pagination.dispatchEvent(
        new CustomEvent('page', {
          detail: { page: 1, pageSize: 2 },
          bubbles: true,
          composed: true,
        }),
      );
      await el.updateComplete;
      expect(bodyRows(el)).to.have.length(2);
      expect(pagination.totalItems).to.equal(5);

      pagination.dispatchEvent(
        new CustomEvent('page', {
          detail: { page: 3, pageSize: 2 },
          bubbles: true,
          composed: true,
        }),
      );
      await el.updateComplete;
      expect(el.page).to.equal(3);
      expect(bodyRows(el).map(row => cellText(row, 0))).to.deep.equal([
        'Person 5',
      ]);
      expect(bodyRows(el)[0].getAttribute('aria-rowindex')).to.equal('6');
      expect(grid(el).getAttribute('aria-rowcount')).to.equal('6');
      expect(warnings).to.have.length(0);
    });

    it('leaves paging to the owner in managed mode', async () => {
      const el = await render(
        html`<wc-table managed>
          <wc-pagination
            slot="footer"
            page="2"
            page-size="10"
            total-items="42"
          ></wc-pagination>
        </wc-table>`,
        people(10),
      );
      await el.updateComplete;
      expect(bodyRows(el)).to.have.length(10);
      expect(bodyRows(el)[0].getAttribute('aria-rowindex')).to.equal('12');
      expect(grid(el).getAttribute('aria-rowcount')).to.equal('43');
    });
  });

  describe('multi-sort', () => {
    const data = [
      { id: 'a', name: 'Beta', age: 30 },
      { id: 'b', name: 'Alpha', age: 30 },
      { id: 'c', name: 'Gamma', age: 20 },
    ];

    it('adds a secondary sort with Shift+click', async () => {
      const el = await render(html`<wc-table></wc-table>`, data);
      const button = (col: number) =>
        header(el, col).querySelector('button') as HTMLButtonElement;

      button(1).click();
      await el.updateComplete;
      setTimeout(() =>
        button(0).dispatchEvent(
          new MouseEvent('click', { shiftKey: true, bubbles: true }),
        ),
      );
      const event = await oneEvent(el, 'sort');
      expect(event.detail).to.deep.equal({
        sortBy: 'age',
        sortOrder: 'asc',
        sorts: [
          { name: 'age', order: 'asc' },
          { name: 'name', order: 'asc' },
        ],
      });
      await el.updateComplete;

      expect(bodyRows(el).map(row => cellText(row, 0))).to.deep.equal([
        'Gamma',
        'Alpha',
        'Beta',
      ]);
      expect(header(el, 1).getAttribute('aria-sort')).to.equal('ascending');
      expect(header(el, 0).getAttribute('aria-sort')).to.equal('none');
      expect(
        header(el, 0).querySelector('.sort-priority')?.textContent?.trim(),
      ).to.equal('2');
      expect(
        header(el, 0).querySelector('.visually-hidden')?.textContent,
      ).to.contain('Sort priority 2');

      // A plain click starts over with that column alone.
      button(0).click();
      await el.updateComplete;
      expect(el.sorts).to.deep.equal([{ name: 'name', order: 'asc' }]);
      expect(root(el).querySelector('.sort-priority')).to.equal(null);
    });

    it('adds a sort level with Shift+Enter on a header', async () => {
      const el = await render(html`<wc-table sort-by="age"></wc-table>`, data);
      const button = header(el, 0).querySelector('button') as HTMLElement;
      setTimeout(() => key(button, { key: 'Enter', shiftKey: true }));
      const event = await oneEvent(el, 'sort');
      expect(event.detail.sorts).to.deep.equal([
        { name: 'age', order: 'asc' },
        { name: 'name', order: 'asc' },
      ]);
    });

    it('keeps sorts and sort-by in step', async () => {
      const el = await render(html`<wc-table></wc-table>`, data);
      el.sorts = [
        { name: 'age', order: 'desc' },
        { name: 'name', order: 'asc' },
      ];
      await el.updateComplete;
      expect(el.sortBy).to.equal('age');
      expect(el.sortOrder).to.equal('desc');
      expect(bodyRows(el).map(row => cellText(row, 0))).to.deep.equal([
        'Alpha',
        'Beta',
        'Gamma',
      ]);

      el.sortBy = 'name';
      await el.updateComplete;
      expect(el.sorts).to.deep.equal([{ name: 'name', order: 'desc' }]);
    });
  });
});
