/// <reference types="mocha" />
import { html } from 'lit';
import { aTimeout, fixture, expect, oneEvent } from '@open-wc/testing';
import { Table } from '../src/table/index.js';
import type { TableColumn, TableRow } from '../src/table/table.js';
import { Pagination } from '../src/pagination/index.js';
import { groupRows, virtualWindow } from '../src/table/table-rows.js';
import { csvField, toCsv } from '../src/table/table-export.js';
import { aggregateValue } from '../src/table/table-aggregate.js';

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
    age: 20 + index,
  }));
}

const team: TableRow[] = [
  { id: 'a', name: 'Ann', team: 'Blue', age: 30 },
  { id: 'b', name: 'Bob', team: 'Red', age: 25 },
  { id: 'c', name: 'Cid', team: 'Blue', age: 41 },
  { id: 'd', name: 'Dee', team: 'Red', age: 35 },
  { id: 'e', name: 'Eve', team: '', age: 28 },
];

function root(el: Table): ShadowRoot {
  return el.shadowRoot as ShadowRoot;
}

function grid(el: Table): HTMLElement {
  return root(el).querySelector('[role="grid"]') as HTMLElement;
}

function dataRows(el: Table): HTMLElement[] {
  return [...root(el).querySelectorAll<HTMLElement>('.body .row[data-key]')];
}

function bodyRows(el: Table): HTMLElement[] {
  return [...root(el).querySelectorAll<HTMLElement>('.body [role="row"]')];
}

function cell(el: Table, row: number, col: number): HTMLElement {
  return root(el).querySelector(
    `.body [data-cell][data-row="${row}"][data-col="${col}"]`,
  ) as HTMLElement;
}

function key(
  target: Element,
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
  // A slotted wc-pagination is picked up on slotchange.
  await aTimeout(0);
  await el.updateComplete;
  return el;
}

describe('Table rows', () => {
  describe('row details', () => {
    async function expandable(keys: unknown[] = []) {
      const el = await fixture<Table>(html`<wc-table></wc-table>`);
      el.columns = columns;
      el.data = people(3);
      el.detailTemplate = row => html`<p class="detail">About ${row.name}</p>`;
      (el as unknown as { expandedRowKeys: unknown[] }).expandedRowKeys = keys;
      await el.updateComplete;
      return el;
    }

    it('adds an expander column only with detailTemplate', async () => {
      const plain = await render(html`<wc-table></wc-table>`, people(2));
      expect(root(plain).querySelector('.expand-button')).to.equal(null);
      expect(grid(plain).getAttribute('aria-colcount')).to.equal('2');

      const el = await expandable();
      expect(grid(el).getAttribute('aria-colcount')).to.equal('3');
      const buttons = root(el).querySelectorAll('.body .expand-button');
      expect(buttons).to.have.length(3);
      expect(buttons[0].getAttribute('aria-expanded')).to.equal('false');
      expect(buttons[0].getAttribute('aria-label')).to.equal(
        'Show row details',
      );
      expect(
        root(el)
          .querySelector('.header-row [data-col="0"]')
          ?.getAttribute('aria-label'),
      ).to.equal('Row details');
    });

    it('shows a detail row spanning every column when a row expands', async () => {
      const el = await expandable();
      const button = root(el).querySelector(
        '.body .expand-button',
      ) as HTMLButtonElement;
      setTimeout(() => button.click());
      const event = await oneEvent(el, 'row-expand');
      expect(event.detail).to.deep.equal({ key: 'p-1', expanded: true });
      expect(event.bubbles && event.composed).to.be.true;
      await el.updateComplete;

      expect(el.expandedRowKeys).to.deep.equal(['p-1']);
      const detail = root(el).querySelector('.detail-row') as HTMLElement;
      expect(detail.getAttribute('role')).to.equal('row');
      expect(detail.hasAttribute('data-cell')).to.be.false;
      expect(detail.querySelector('[data-cell]')).to.equal(null);
      const detailCell = detail.querySelector('[role="gridcell"]');
      expect(detailCell?.getAttribute('aria-colspan')).to.equal('3');
      expect(detail.querySelector('.detail')?.textContent).to.equal(
        'About Person 1',
      );
      expect(button.getAttribute('aria-expanded')).to.equal('true');
      expect(button.getAttribute('aria-controls')).to.equal(detail.id);
      expect(button.getAttribute('aria-label')).to.equal('Hide row details');

      // The detail row takes an aria-rowindex; the rows after it move down.
      expect(
        bodyRows(el).map(row => row.getAttribute('aria-rowindex')),
      ).to.deep.equal(['2', '3', '4', '5']);
      expect(grid(el).getAttribute('aria-rowcount')).to.equal('5');

      setTimeout(() => button.click());
      const collapse = await oneEvent(el, 'row-expand');
      expect(collapse.detail).to.deep.equal({ key: 'p-1', expanded: false });
      await el.updateComplete;
      expect(root(el).querySelector('.detail-row')).to.equal(null);
      expect(button.hasAttribute('aria-controls')).to.be.false;
    });

    it('takes expanded-row-keys, compared as strings', async () => {
      const el = await expandable([2]);
      expect(el.expandedRowKeys).to.deep.equal(['2']);
      expect(root(el).querySelector('.detail-row')).to.equal(null);
      el.expandedRowKeys = ['p-2'];
      await el.updateComplete;
      const detail = root(el).querySelector('.detail-row') as HTMLElement;
      expect(detail.previousElementSibling?.getAttribute('data-key')).to.equal(
        'p-2',
      );
    });

    it('toggles with Enter and Space on the expander and skips detail rows with the arrows', async () => {
      const el = await expandable();
      const expander = cell(el, 1, 0).querySelector('button') as HTMLElement;
      key(expander, { key: 'Enter' });
      await el.updateComplete;
      expect(el.expandedRowKeys).to.deep.equal(['p-1']);

      key(expander, { key: 'ArrowDown' });
      await el.updateComplete;
      // Row 2 is the second data row, not the detail row.
      const focused = root(el).activeElement?.closest('[data-cell]');
      expect(focused).to.equal(cell(el, 2, 0));
      expect(focused?.closest('.row')?.getAttribute('data-key')).to.equal(
        'p-2',
      );

      key(cell(el, 2, 0).querySelector('button') as HTMLElement, { key: ' ' });
      await el.updateComplete;
      expect(el.expandedRowKeys).to.deep.equal(['p-1', 'p-2']);
      expect(root(el).querySelectorAll('.detail-row')).to.have.length(2);
    });

    it('turns virtual off while rows have details', async () => {
      const el = await expandable();
      el.virtual = true;
      await el.updateComplete;
      expect(root(el).querySelector('.is-virtual')).to.equal(null);
      expect(dataRows(el)).to.have.length(3);
    });
  });

  describe('grouping', () => {
    const cols: TableColumn[] = [
      { name: 'name', label: 'Name', width: 10 },
      { name: 'team', label: 'Team', width: 8 },
      { name: 'age', label: 'Age', width: 6, type: 'number' },
    ];

    function groupHeaders(el: Table): HTMLElement[] {
      return [
        ...root(el).querySelectorAll<HTMLElement>('.body .group-header-row'),
      ];
    }

    it('puts rows under group headers with a label, count and toggle', async () => {
      const el = await render(
        html`<wc-table group-by="team"></wc-table>`,
        team,
        cols,
      );
      const headers = groupHeaders(el);
      expect(headers.map(row => row.dataset.groupKey)).to.deep.equal([
        'Blue',
        'Red',
        '',
      ]);
      const first = headers[0];
      expect(first.getAttribute('role')).to.equal('row');
      const gridcell = first.querySelector('[role="gridcell"]') as HTMLElement;
      expect(gridcell.getAttribute('aria-colspan')).to.equal('3');
      expect(first.querySelector('.group-label')?.textContent).to.equal('Blue');
      expect(first.querySelector('.group-count')?.textContent).to.equal(
        '2 rows',
      );
      expect(headers[2].querySelector('.group-label')?.textContent).to.equal(
        '(Empty)',
      );
      expect(headers[2].querySelector('.group-count')?.textContent).to.equal(
        '1 row',
      );
      const toggle = first.querySelector('.group-toggle') as HTMLElement;
      expect(toggle.getAttribute('aria-expanded')).to.equal('true');
      expect(toggle.getAttribute('aria-label')).to.equal('Collapse group Blue');

      // Headers and rows are numbered together.
      expect(
        bodyRows(el).map(row => row.getAttribute('aria-rowindex')),
      ).to.deep.equal(['2', '3', '4', '5', '6', '7', '8', '9']);
      expect(grid(el).getAttribute('aria-rowcount')).to.equal('9');
      expect(dataRows(el).map(row => row.dataset.key)).to.deep.equal([
        'a',
        'c',
        'b',
        'd',
        'e',
      ]);
    });

    it('collapses a group from its toggle and fires group-toggle', async () => {
      const el = await render(
        html`<wc-table group-by="team"></wc-table>`,
        team,
        cols,
      );
      const toggle = groupHeaders(el)[0].querySelector(
        '.group-toggle',
      ) as HTMLButtonElement;
      setTimeout(() => toggle.click());
      const event = await oneEvent(el, 'group-toggle');
      expect(event.detail).to.deep.equal({ group: 'Blue', expanded: false });
      await el.updateComplete;
      expect(el.collapsedGroups).to.deep.equal(['Blue']);
      expect(dataRows(el).map(row => row.dataset.key)).to.deep.equal([
        'b',
        'd',
        'e',
      ]);
      expect(toggle.getAttribute('aria-expanded')).to.equal('false');
      expect(toggle.getAttribute('aria-label')).to.equal('Expand group Blue');
      expect(grid(el).getAttribute('aria-rowcount')).to.equal('7');

      el.collapsedGroups = [];
      await el.updateComplete;
      expect(dataRows(el)).to.have.length(5);
    });

    it('sorts within groups, and orders groups by a sort on the group field', async () => {
      const el = await render(
        html`<wc-table group-by="team"></wc-table>`,
        team,
        cols,
      );
      el.sorts = [{ name: 'age', order: 'desc' }];
      await el.updateComplete;
      expect(dataRows(el).map(row => row.dataset.key)).to.deep.equal([
        'c',
        'a',
        'd',
        'b',
        'e',
      ]);

      el.sorts = [
        { name: 'team', order: 'desc' },
        { name: 'age', order: 'asc' },
      ];
      await el.updateComplete;
      expect(groupHeaders(el).map(row => row.dataset.groupKey)).to.deep.equal([
        'Red',
        'Blue',
        '',
      ]);
      expect(dataRows(el).map(row => row.dataset.key)).to.deep.equal([
        'b',
        'd',
        'a',
        'c',
        'e',
      ]);
    });

    it('reaches group headers with the arrow keys and toggles them with Enter and Space', async () => {
      const el = await render(
        html`<wc-table group-by="team"></wc-table>`,
        team,
        cols,
      );
      // Start on the first data row, in the Age column.
      const age = cell(el, 2, 2);
      age.focus();
      key(age, { key: 'ArrowUp' });
      await el.updateComplete;
      const toggle = groupHeaders(el)[0].querySelector(
        '.group-toggle',
      ) as HTMLElement;
      expect(root(el).activeElement).to.equal(toggle);
      expect(toggle.getAttribute('tabindex')).to.equal('0');

      // Left and Right stay on the header.
      key(toggle, { key: 'ArrowRight' });
      await el.updateComplete;
      expect(root(el).activeElement).to.equal(toggle);

      key(toggle, { key: 'Enter' });
      await el.updateComplete;
      expect(el.collapsedGroups).to.deep.equal(['Blue']);
      key(toggle, { key: ' ' });
      await el.updateComplete;
      expect(el.collapsedGroups).to.deep.equal([]);

      // Down goes back to the column it came from.
      key(toggle, { key: 'ArrowDown' });
      await el.updateComplete;
      expect(root(el).activeElement).to.equal(cell(el, 2, 2));
    });

    it('repeats the group header on the next page', async () => {
      const el = await render(
        html`<wc-table group-by="team">
          <wc-pagination
            slot="footer"
            page-size="3"
            .pageSizes=${[3]}
          ></wc-pagination>
        </wc-table>`,
        team,
        cols,
      );
      expect(dataRows(el).map(row => row.dataset.key)).to.deep.equal([
        'a',
        'c',
        'b',
      ]);
      el.page = 2;
      await el.updateComplete;
      expect(groupHeaders(el).map(row => row.dataset.groupKey)).to.deep.equal([
        'Red',
        '',
      ]);
      expect(dataRows(el).map(row => row.dataset.key)).to.deep.equal([
        'd',
        'e',
      ]);
      // Indexes count over every page: Red's header is the fourth body row.
      expect(
        bodyRows(el).map(row => row.getAttribute('aria-rowindex')),
      ).to.deep.equal(['5', '7', '8', '9']);
    });

    it('orders groups and keeps row order with groupRows', () => {
      const groups = groupRows(team, 'team', 'asc');
      expect(groups.map(group => group.key)).to.deep.equal(['Blue', 'Red', '']);
      expect(groups[0].rows.map(row => row.id)).to.deep.equal(['a', 'c']);
      expect(
        groupRows(team, 'team', 'appearance').map(group => group.key),
      ).to.deep.equal(['Blue', 'Red', '']);
    });
  });

  describe('virtual scrolling', () => {
    async function virtualTable(count = 1000) {
      const el = await fixture<Table>(
        html`<wc-table virtual style="height: 300px"></wc-table>`,
      );
      el.columns = columns;
      el.data = people(count);
      await el.updateComplete;
      // Let it measure the row height and the viewport.
      await aTimeout(20);
      await el.updateComplete;
      return el;
    }

    it('renders only the rows in view, with correct row indexes', async () => {
      const el = await virtualTable();
      const rows = dataRows(el);
      expect(rows.length).to.be.greaterThan(3);
      expect(rows.length).to.be.lessThan(40);
      expect(grid(el).getAttribute('aria-rowcount')).to.equal('1001');
      expect(rows[0].getAttribute('aria-rowindex')).to.equal('2');
      expect(root(el).querySelector('.virtual-spacer')).to.not.equal(null);

      // The body is as tall as every row would be.
      const rowHeight = rows[0].getBoundingClientRect().height;
      const body = root(el).querySelector('.body') as HTMLElement;
      expect(body.getBoundingClientRect().height).to.be.closeTo(
        rowHeight * 1000,
        2,
      );

      const container = grid(el);
      container.scrollTop = rowHeight * 500;
      container.dispatchEvent(new Event('scroll'));
      await el.updateComplete;
      const shown = dataRows(el).map(row => row.dataset.key);
      expect(shown).to.include('p-501');
      expect(shown).to.not.include('p-1');
      const row = root(el).querySelector('[data-key="p-501"]') as HTMLElement;
      expect(row.getAttribute('aria-rowindex')).to.equal('502');
    });

    it('scrolls the target row into view on keyboard moves', async () => {
      const el = await virtualTable();
      const first = cell(el, 1, 0);
      first.focus();
      key(first, { key: 'End', ctrlKey: true });
      await el.updateComplete;
      await el.updateComplete;
      const last = root(el).querySelector('[data-key="p-1000"]') as HTMLElement;
      expect(last).to.not.equal(null);
      expect(last.getAttribute('aria-rowindex')).to.equal('1001');
      expect(root(el).activeElement).to.equal(cell(el, 1000, 1));

      key(cell(el, 1000, 1), { key: 'Home', ctrlKey: true });
      await el.updateComplete;
      key(
        root(el).querySelector('.header-row [data-col="0"] button') as Element,
        { key: 'ArrowDown' },
      );
      await el.updateComplete;
      await el.updateComplete;
      expect(root(el).activeElement).to.equal(cell(el, 1, 0));
      expect(dataRows(el)[0].dataset.key).to.equal('p-1');
    });

    it('keeps a tab stop on a rendered row after scrolling away', async () => {
      const el = await virtualTable();
      const first = cell(el, 1, 0);
      first.focus();
      // Pages run in the background in a full test run fire no focus events; send the one the
      // table listens for, so the body row takes the tab stop as it does for a real focus.
      first.dispatchEvent(
        new FocusEvent('focusin', { bubbles: true, composed: true }),
      );
      await el.updateComplete;
      const container = grid(el);
      container.scrollTop = 20000;
      container.dispatchEvent(new Event('scroll'));
      await el.updateComplete;
      const stops = root(el).querySelectorAll('.body [tabindex="0"]');
      expect(stops).to.have.length(1);
    });

    it('renders every row without virtual', async () => {
      const el = await render(html`<wc-table></wc-table>`, people(60));
      expect(dataRows(el)).to.have.length(60);
      expect(root(el).querySelector('.virtual-spacer')).to.equal(null);
    });

    it('works out the window with virtualWindow', () => {
      expect(
        virtualWindow(1000, {
          rowHeight: 50,
          scrollTop: 500,
          viewport: 200,
          overscan: 2,
        }),
      ).to.deep.equal({ start: 8, end: 17 });
      expect(
        virtualWindow(5, {
          rowHeight: 50,
          scrollTop: 0,
          viewport: 1000,
          overscan: 2,
        }),
      ).to.deep.equal({ start: 0, end: 5 });
    });
  });

  describe('aggregates', () => {
    const cols: TableColumn[] = [
      { name: 'name', label: 'Name', width: 10, aggregate: 'count' },
      { name: 'age', label: 'Age', width: 6, type: 'number', aggregate: 'sum' },
      {
        name: 'score',
        label: 'Score',
        width: 6,
        aggregate: rows => `${rows.filter(row => row.score > 1).length} high`,
      },
    ];
    const data = [
      { id: 1, name: 'A', age: 1000, score: 1 },
      { id: 2, name: 'B', age: 234.5, score: 2 },
      { id: 3, name: 'C', age: 'n/a', score: 3 },
    ];

    function aggregateCells(el: Table): string[] {
      return [
        ...root(el).querySelectorAll<HTMLElement>(
          '.aggregates [role="gridcell"]',
        ),
      ].map(element =>
        [...element.querySelectorAll('span')]
          .map(span => span.textContent?.trim())
          .join(' '),
      );
    }

    it('renders a footer row of aggregates after the body', async () => {
      const el = await render(
        html`<wc-table lang="de-DE"></wc-table>`,
        data,
        cols,
      );
      const rowgroup = root(el).querySelector('.aggregates') as HTMLElement;
      expect(rowgroup.getAttribute('role')).to.equal('rowgroup');
      expect(rowgroup.previousElementSibling?.classList.contains('body')).to.be
        .true;
      const row = rowgroup.querySelector('[role="row"]') as HTMLElement;
      expect(row.getAttribute('aria-rowindex')).to.equal('5');
      expect(grid(el).getAttribute('aria-rowcount')).to.equal('5');
      expect(row.querySelector('[data-cell]')).to.equal(null);
      expect(aggregateCells(el)).to.deep.equal([
        'Count 3',
        'Sum 1.234,5',
        '2 high',
      ]);
    });

    it('covers every row by default and the page with aggregate-scope="page"', async () => {
      const el = await render(
        html`<wc-table>
          <wc-pagination
            slot="footer"
            page-size="2"
            .pageSizes=${[2]}
          ></wc-pagination>
        </wc-table>`,
        data,
        cols,
      );
      expect(aggregateCells(el)[0]).to.equal('Count 3');
      el.aggregateScope = 'page';
      await el.updateComplete;
      expect(aggregateCells(el)[0]).to.equal('Count 2');
    });

    it('has no footer row without aggregates', async () => {
      const el = await render(html`<wc-table></wc-table>`, people(2));
      expect(root(el).querySelector('.aggregates')).to.equal(null);
    });

    it('computes sum, avg, min, max and count', () => {
      const rows = [{ v: 4 }, { v: '6' }, { v: 'x' }, { v: null }, { v: 2 }];
      const of = (aggregate: TableColumn['aggregate']) =>
        aggregateValue(rows, { name: 'v', label: 'V', aggregate });
      expect(of('sum')).to.equal(12);
      expect(of('avg')).to.equal(4);
      expect(of('min')).to.equal(2);
      expect(of('max')).to.equal(6);
      expect(of('count')).to.equal(5);
      expect(
        aggregateValue([{ v: 'x' }], {
          name: 'v',
          label: 'V',
          aggregate: 'sum',
        }),
      ).to.be.undefined;
    });
  });

  describe('export', () => {
    const cols: TableColumn[] = [
      { name: 'name', label: 'Name', width: 10 },
      { name: 'age', label: 'Age', width: 6, type: 'number' },
      {
        name: 'note',
        label: 'Note, "quoted"',
        width: 10,
        exportValue: row => `${row.note}!`,
      },
      { name: 'secret', label: 'Secret', hidden: true },
    ];
    const data = [
      { id: 1, name: 'Beta', age: 30, note: 'a,b', secret: 's1' },
      { id: 2, name: 'Alpha', age: 20, note: 'say "hi"', secret: 's2' },
      { id: 3, name: 'Gamma', age: 25, note: 'line\nbreak', secret: 's3' },
    ];

    it('exports the visible columns and the page rows in the current sort', async () => {
      const el = await render(
        html`<wc-table sort-by="name">
          <wc-pagination
            slot="footer"
            page-size="2"
            .pageSizes=${[2]}
          ></wc-pagination>
        </wc-table>`,
        data,
        cols,
      );
      expect(el.exportCsv()).to.equal(
        'Name,Age,"Note, ""quoted"""\r\n' +
          'Alpha,20,"say ""hi""!"\r\n' +
          'Beta,30,"a,b!"\r\n',
      );
      expect(el.exportCsv({ allRows: true }).split('\r\n')).to.have.length(5);
      expect(
        el.exportCsv({ allRows: true, columns: ['secret', 'name', 'missing'] }),
      ).to.equal('Secret,Name\r\ns2,Alpha\r\ns1,Beta\r\ns3,Gamma\r\n');
    });

    it('downloads the CSV through a Blob URL', async () => {
      const el = await render(html`<wc-table></wc-table>`, data, cols);
      const originalCreate = URL.createObjectURL;
      const originalRevoke = URL.revokeObjectURL;
      const originalClick = HTMLAnchorElement.prototype.click;
      let blob: Blob | undefined;
      let clicked: HTMLAnchorElement | undefined;
      let revoked = '';
      URL.createObjectURL = (object: Blob | MediaSource) => {
        blob = object as Blob;
        return 'blob:table-test';
      };
      URL.revokeObjectURL = (url: string) => {
        revoked = url;
      };
      HTMLAnchorElement.prototype.click = function click(
        this: HTMLAnchorElement,
      ) {
        clicked = this;
      };
      try {
        el.downloadCsv({ filename: 'people.csv', columns: ['name'] });
        await aTimeout(5);
      } finally {
        URL.createObjectURL = originalCreate;
        URL.revokeObjectURL = originalRevoke;
        HTMLAnchorElement.prototype.click = originalClick;
      }
      expect(clicked?.download).to.equal('people.csv');
      expect(clicked?.href).to.equal('blob:table-test');
      expect(clicked?.isConnected).to.be.false;
      expect(revoked).to.equal('blob:table-test');
      expect(blob?.type).to.equal('text/csv;charset=utf-8');
      const bytes = new Uint8Array(await (blob as Blob).arrayBuffer());
      // A UTF-8 byte order mark first; text() drops it when decoding.
      expect([...bytes.slice(0, 3)]).to.deep.equal([0xef, 0xbb, 0xbf]);
      const text = await (blob as Blob).text();
      expect(text).to.equal('Name\r\nBeta\r\nAlpha\r\nGamma\r\n');
    });

    it('quotes fields as RFC 4180 asks', () => {
      expect(csvField('plain')).to.equal('plain');
      expect(csvField('a"b')).to.equal('"a""b"');
      expect(csvField('a\r\nb')).to.equal('"a\r\nb"');
      expect(csvField(null)).to.equal('');
      expect(csvField(new Date(Date.UTC(2024, 0, 2)))).to.equal(
        '2024-01-02T00:00:00.000Z',
      );
      expect(toCsv([{ name: 'x', label: '' }], [{ x: 1 }])).to.equal(
        'x\r\n1\r\n',
      );
    });
  });
});
