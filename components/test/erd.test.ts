/// <reference types="mocha" />
import { html } from 'lit';
import { expect, fixture, oneEvent } from '@open-wc/testing';
import { Erd } from '../src/erd/erd.js';
import { layoutEntities } from '../src/erd/erd-layout.js';
import type {
  ErdChangeDetail,
  ErdConnectDetail,
  ErdDeleteDetail,
  ErdEntity,
  ErdRelation,
  ErdSelectDetail,
  ErdToggleDetail,
} from '../src/erd/erd.js';

if (!customElements.get('wc-erd')) customElements.define('wc-erd', Erd);

function shop(): { entities: ErdEntity[]; relations: ErdRelation[] } {
  return {
    entities: [
      {
        id: 'customers',
        name: 'customers',
        schema: 'sales',
        columns: [
          { name: 'id', type: 'uuid', pk: true },
          { name: 'email', type: 'text' },
          { name: 'phone', type: 'text', nullable: true },
        ],
      },
      {
        id: 'orders',
        name: 'orders',
        schema: 'sales',
        columns: [
          { name: 'id', type: 'uuid', pk: true },
          { name: 'customer_id', type: 'uuid' },
          { name: 'placed_at', type: 'timestamptz' },
        ],
      },
      {
        id: 'items',
        name: 'order_items',
        schema: 'sales',
        columns: [
          { name: 'order_id', type: 'uuid', pk: true },
          { name: 'product_id', type: 'uuid', pk: true },
          { name: 'quantity', type: 'int' },
        ],
      },
      {
        id: 'products',
        name: 'products',
        schema: 'catalog',
        columns: [
          { name: 'id', type: 'uuid', pk: true },
          { name: 'name', type: 'text' },
        ],
      },
      {
        id: 'audit',
        name: 'audit_log',
        schema: 'ops',
        columns: [{ name: 'id', type: 'bigint', pk: true }],
      },
    ],
    relations: [
      {
        id: 'r1',
        source: 'orders',
        sourceColumn: 'customer_id',
        target: 'customers',
        targetColumn: 'id',
      },
      {
        id: 'r2',
        source: 'items',
        sourceColumn: 'order_id',
        target: 'orders',
        targetColumn: 'id',
      },
      {
        id: 'r3',
        source: 'items',
        sourceColumn: 'product_id',
        target: 'products',
        targetColumn: 'id',
      },
    ],
  };
}

async function settle(el: Erd) {
  await el.updateComplete;
  await new Promise(resolve => {
    requestAnimationFrame(resolve);
  });
  await el.updateComplete;
}

async function render(extra: Partial<Erd> = {}) {
  const data = shop();
  const el = await fixture<Erd>(
    html`<wc-erd
      style="width: 1100px; height: 700px; display: block"
      .entities=${data.entities}
      .relations=${data.relations}
    ></wc-erd>`,
  );
  Object.assign(el, extra);
  await settle(el);
  return el;
}

const card = (el: Erd, id: string) =>
  el.shadowRoot?.querySelector<HTMLElement>(
    `.erd-entity[data-id="${id}"]`,
  ) as HTMLElement;

const cards = (el: Erd) =>
  [...(el.shadowRoot?.querySelectorAll<HTMLElement>('.erd-entity') ?? [])].map(
    c => c.dataset.id,
  );

const row = (el: Erd, id: string, column: string) =>
  card(el, id).querySelector<HTMLElement>(
    `.erd-row[data-column="${column}"]`,
  ) as HTMLElement;

const relation = (el: Erd, id: string) =>
  el.shadowRoot?.querySelector<SVGGElement>(
    `.erd-relation[data-id="${id}"]`,
  ) as SVGGElement;

const key = (
  target: HTMLElement,
  k: string,
  init: Record<string, boolean> = {},
) =>
  target.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: k,
      bubbles: true,
      composed: true,
      cancelable: true,
      ...init,
    }),
  );

const centre = (target: Element) => {
  const r = target.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
};

describe('erd layout', () => {
  it('puts referenced tables left of the tables that reference them, stacked without overlap', () => {
    const data = shop();
    const p = layoutEntities(
      data.entities.map(e => ({
        id: e.id,
        height: 48 + e.columns.length * 28,
      })),
      data.relations,
      { width: 264 },
    );
    const x = (id: string) => p.get(id)?.x ?? 0;
    expect(x('customers')).to.be.lessThan(x('orders'));
    expect(x('orders')).to.be.lessThan(x('items'));
    expect(x('products')).to.be.lessThan(x('items'));
    // customers and products share the first column; they must not overlap.
    expect(x('customers')).to.equal(x('products'));
    const [top, bottom] = ['customers', 'products'].sort(
      (a, b) => (p.get(a)?.y ?? 0) - (p.get(b)?.y ?? 0),
    );
    const topHeight = 48 + (top === 'customers' ? 3 : 2) * 28;
    expect((p.get(bottom)?.y ?? 0) - (p.get(top)?.y ?? 0)).to.be.at.least(
      topHeight,
    );
    // The unrelated table goes after the connected part.
    expect(x('audit')).to.be.greaterThan(x('items'));
  });

  it('keeps pinned entities where they are', () => {
    const p = layoutEntities(
      [{ id: 'a', height: 100, pinned: { x: 7, y: 9 } }],
      [],
      { width: 264 },
    );
    expect(p.get('a')).to.deep.equal({ x: 7, y: 9 });
  });
});

describe('wc-erd', () => {
  it('renders entities with their columns, keys and relations', async () => {
    const el = await render();
    expect(cards(el)).to.have.members([
      'customers',
      'orders',
      'items',
      'products',
      'audit',
    ]);
    expect(card(el, 'orders').querySelectorAll('.erd-row').length).to.equal(3);
    expect(
      row(el, 'orders', 'id')
        .querySelector('.erd-key')
        ?.classList.contains('is-pk'),
    ).to.be.true;
    // Foreign keys come from the relations.
    expect(
      row(el, 'orders', 'customer_id')
        .querySelector('.erd-key')
        ?.classList.contains('is-fk'),
    ).to.be.true;
    expect(row(el, 'customers', 'phone').querySelector('.erd-null')).to.exist;
    expect(el.shadowRoot?.querySelectorAll('.erd-relation').length).to.equal(3);
    expect(card(el, 'orders').getAttribute('aria-label')).to.equal(
      'sales.orders, 3 columns, references customers, referenced by order_items',
    );
  });

  it("joins the column rows with crow's-foot markers", async () => {
    const el = await render();
    const r1 = relation(el, 'r1');
    const markers = r1.querySelectorAll('.erd-marker');
    // many: one crow's foot; one: two bars.
    expect(markers.length).to.equal(2);
    const line = r1.querySelector('.erd-line') as SVGPathElement;
    const start = line.getPointAtLength(0);
    const end = line.getPointAtLength(line.getTotalLength());
    // offsetTop is measured inside the card's 1px border.
    const rowMid = (id: string, column: string) => {
      const c = card(el, id);
      const r = row(el, id, column);
      return parseFloat(c.style.top) + 1 + r.offsetTop + r.offsetHeight / 2;
    };
    expect(start.y).to.be.closeTo(rowMid('orders', 'customer_id'), 1);
    expect(end.y).to.be.closeTo(rowMid('customers', 'id'), 1);
  });

  it('highlights what an entity or column is joined to on hover', async () => {
    const el = await render();
    card(el, 'orders').dispatchEvent(new PointerEvent('pointerenter'));
    await settle(el);
    expect(relation(el, 'r1').classList.contains('is-lit')).to.be.true;
    expect(relation(el, 'r2').classList.contains('is-lit')).to.be.true;
    expect(relation(el, 'r3').classList.contains('is-dim')).to.be.true;
    expect(card(el, 'products').classList.contains('is-dim')).to.be.true;
    row(el, 'orders', 'customer_id').dispatchEvent(
      new PointerEvent('pointerenter'),
    );
    await settle(el);
    expect(relation(el, 'r1').classList.contains('is-lit')).to.be.true;
    expect(relation(el, 'r2').classList.contains('is-dim')).to.be.true;
    expect(row(el, 'customers', 'id').classList.contains('is-lit')).to.be.true;
  });

  it('collapses to the header, attaching relations there', async () => {
    const el = await render();
    setTimeout(() => el.collapse('orders'));
    const { detail } = (await oneEvent(
      el,
      'toggle',
    )) as CustomEvent<ErdToggleDetail>;
    expect(detail).to.deep.equal({ id: 'orders', collapsed: true });
    await settle(el);
    expect(card(el, 'orders').querySelectorAll('.erd-row').length).to.equal(0);
    expect(
      card(el, 'orders').querySelector('.erd-count')?.textContent,
    ).to.equal('3 columns');
    const line = relation(el, 'r1').querySelector(
      '.erd-line',
    ) as SVGPathElement;
    expect(line.getPointAtLength(0).y).to.be.closeTo(
      parseFloat(card(el, 'orders').style.top) + 25,
      1,
    );
    el.expandAll();
    await settle(el);
    expect(card(el, 'orders').querySelectorAll('.erd-row').length).to.equal(3);
  });

  it('routes relations around the entities in between', async () => {
    const el = await render();
    // Collapsing addresses opens a gap; orders.customer_id → customers.id spans a column.
    el.collapse('addresses');
    el.collapse('payments');
    el.collapse('categories');
    await settle(el);
    const line = relation(el, 'r1').querySelector(
      '.erd-line',
    ) as SVGPathElement;
    const length = line.getTotalLength();
    const rects = ['addresses', 'products', 'items', 'payments', 'categories']
      .map(id => card(el, id))
      .filter(Boolean)
      .map(c => ({
        x: parseFloat(c.style.left),
        y: parseFloat(c.style.top),
        w: c.offsetWidth,
        h: c.offsetHeight,
      }));
    for (let at = 0; at <= length; at += 4) {
      const p = line.getPointAtLength(at);
      const inside = rects.some(
        r => p.x > r.x && p.x < r.x + r.w && p.y > r.y && p.y < r.y + r.h,
      );
      expect(
        inside,
        `point ${Math.round(p.x)},${Math.round(p.y)} is inside an entity`,
      ).to.be.false;
    }
  });

  it('starts entities collapsed when asked', async () => {
    const data = shop();
    const el = await fixture<Erd>(
      html`<wc-erd
        style="width: 900px; height: 600px; display: block"
        .entities=${data.entities.map(e =>
          e.id === 'items' ? { ...e, collapsed: true } : e,
        )}
        .relations=${data.relations}
      ></wc-erd>`,
    );
    await settle(el);
    expect(card(el, 'items').classList.contains('is-collapsed')).to.be.true;
    expect(card(el, 'orders').classList.contains('is-collapsed')).to.be.false;
  });

  it('filters by schema and focuses on a neighbourhood', async () => {
    const el = await render({ schema: 'sales' });
    expect(cards(el)).to.have.members(['customers', 'orders', 'items']);
    el.schema = '';
    el.focusedNode = 'customers';
    el.hops = 1;
    await settle(el);
    expect(cards(el)).to.have.members(['customers', 'orders']);
    el.hops = 2;
    await settle(el);
    expect(cards(el)).to.have.members(['customers', 'orders', 'items']);
  });

  it('selects entities and relations', async () => {
    const el = await render();
    const target = card(el, 'orders');
    setTimeout(() => {
      target.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          composed: true,
          button: 0,
          pointerId: 1,
        }),
      );
      target.dispatchEvent(
        new PointerEvent('pointerup', {
          bubbles: true,
          composed: true,
          button: 0,
          pointerId: 1,
        }),
      );
    });
    const first = (await oneEvent(
      el,
      'select',
    )) as CustomEvent<ErdSelectDetail>;
    expect(first.detail.kind).to.equal('entity');
    expect(first.detail.entity?.name).to.equal('orders');
    const hit = relation(el, 'r2').querySelector('.erd-hit') as SVGPathElement;
    setTimeout(() =>
      hit.dispatchEvent(
        new MouseEvent('click', { bubbles: true, composed: true }),
      ),
    );
    const second = (await oneEvent(
      el,
      'select',
    )) as CustomEvent<ErdSelectDetail>;
    expect(second.detail).to.include({ id: 'r2', kind: 'relation' });
    await settle(el);
    expect(relation(el, 'r2').classList.contains('is-selected')).to.be.true;
  });

  it('moves between entities with the arrow keys and uses one tab stop', async () => {
    const el = await render();
    const stops = [
      ...(el.shadowRoot?.querySelectorAll('.erd-entity') ?? []),
    ].filter(c => c.getAttribute('tabindex') === '0');
    expect(stops.length).to.equal(1);
    card(el, 'customers').focus();
    key(card(el, 'customers'), 'ArrowRight');
    await settle(el);
    expect((el.shadowRoot?.activeElement as HTMLElement).dataset.id).to.equal(
      'orders',
    );
  });

  describe('editing', () => {
    it('adds a column and renames it, and relations follow a renamed column', async () => {
      const el = await render({ editable: true });
      const add = card(el, 'customers').querySelector(
        '.erd-add',
      ) as HTMLButtonElement;
      setTimeout(() => add.click());
      const added = (await oneEvent(
        el,
        'change',
      )) as CustomEvent<ErdChangeDetail>;
      expect(added.detail.reason).to.equal('column-add');
      await settle(el);
      const input = el.shadowRoot?.querySelector(
        '.erd-input',
      ) as HTMLInputElement;
      expect(input).to.exist;
      expect(input.value).to.equal('new_column');
      input.value = 'created_at';
      setTimeout(() => key(input, 'Enter'));
      const renamed = (await oneEvent(
        el,
        'change',
      )) as CustomEvent<ErdChangeDetail>;
      expect(renamed.detail.reason).to.equal('rename');
      expect(
        renamed.detail.entities
          .find(e => e.id === 'customers')
          ?.columns.map(c => c.name),
      ).to.include('created_at');

      await settle(el);
      const idName = row(el, 'customers', 'id').querySelector(
        '.erd-col-name',
      ) as HTMLElement;
      idName.dispatchEvent(
        new MouseEvent('dblclick', { bubbles: true, composed: true }),
      );
      await settle(el);
      const idInput = el.shadowRoot?.querySelector(
        '.erd-input',
      ) as HTMLInputElement;
      idInput.value = 'customer_id';
      setTimeout(() => key(idInput, 'Enter'));
      const followed = (await oneEvent(
        el,
        'change',
      )) as CustomEvent<ErdChangeDetail>;
      expect(
        followed.detail.relations.find(r => r.id === 'r1')?.targetColumn,
      ).to.equal('customer_id');
    });

    it('toggles the primary key and removes a column with its relations', async () => {
      const el = await render({ editable: true });
      const keyButton = row(el, 'customers', 'email').querySelector(
        '.erd-key',
      ) as HTMLButtonElement;
      setTimeout(() => keyButton.click());
      const toggled = (await oneEvent(
        el,
        'change',
      )) as CustomEvent<ErdChangeDetail>;
      expect(
        toggled.detail.entities.find(e => e.id === 'customers')?.columns[1].pk,
      ).to.be.true;
      await settle(el);
      const remove = row(el, 'orders', 'customer_id').querySelector(
        '.erd-remove',
      ) as HTMLElement;
      setTimeout(() => remove.click());
      const removed = (await oneEvent(
        el,
        'change',
      )) as CustomEvent<ErdChangeDetail>;
      expect(removed.detail.reason).to.equal('column-remove');
      expect(removed.detail.relations.map(r => r.id)).to.not.include('r1');
    });

    it('adds a relation by dragging a row onto another and picks its cardinality', async () => {
      const el = await render({ editable: true });
      const port = row(el, 'audit', 'id').querySelector(
        '.erd-port',
      ) as HTMLElement;
      const target = centre(row(el, 'products', 'id'));
      const from = centre(port);
      setTimeout(() => {
        port.dispatchEvent(
          new PointerEvent('pointerdown', {
            bubbles: true,
            composed: true,
            button: 0,
            pointerId: 3,
            clientX: from.x,
            clientY: from.y,
          }),
        );
        port.dispatchEvent(
          new PointerEvent('pointermove', {
            bubbles: true,
            composed: true,
            pointerId: 3,
            clientX: target.x,
            clientY: target.y,
          }),
        );
        port.dispatchEvent(
          new PointerEvent('pointerup', {
            bubbles: true,
            composed: true,
            pointerId: 3,
            clientX: target.x,
            clientY: target.y,
          }),
        );
      });
      const { detail } = (await oneEvent(
        el,
        'connect',
      )) as CustomEvent<ErdConnectDetail>;
      expect(detail.relation).to.include({
        source: 'audit',
        sourceColumn: 'id',
        target: 'products',
        targetColumn: 'id',
        sourceCardinality: 'many',
        targetCardinality: 'one',
      });
      await settle(el);
      expect(el.relations.length).to.equal(4);
      const options = [
        ...(el.shadowRoot?.querySelectorAll<HTMLButtonElement>(
          '.erd-picker button',
        ) ?? []),
      ];
      expect(options.length).to.equal(5);
      const oneToOne = options.find(o =>
        o.textContent?.includes('One to one'),
      ) as HTMLButtonElement;
      setTimeout(() => oneToOne.click());
      const changed = (await oneEvent(
        el,
        'change',
      )) as CustomEvent<ErdChangeDetail>;
      expect(changed.detail.reason).to.equal('cardinality');
      expect(changed.detail.relations[3]).to.include({
        sourceCardinality: 'one',
        targetCardinality: 'one',
      });
    });

    it('lets the app cancel connect', async () => {
      const el = await render({ editable: true });
      el.addEventListener('connect', e => e.preventDefault());
      expect(el.addRelation({ source: 'audit', target: 'customers' })).to.be
        .false;
      expect(el.relations.length).to.equal(3);
    });

    it('deletes an entity with its relations and undoes it', async () => {
      const el = await render({ editable: true });
      const orders = card(el, 'orders');
      orders.focus();
      // Without motion the change follows the delete event at once, so listen for both first.
      const deleted = oneEvent(el, 'delete');
      const changed = oneEvent(el, 'change');
      setTimeout(() => key(orders, 'Delete'));
      const { detail } = (await deleted) as CustomEvent<ErdDeleteDetail>;
      expect(detail.entities).to.deep.equal(['orders']);
      expect(detail.relations).to.have.members(['r1', 'r2']);
      await changed;
      await settle(el);
      expect(cards(el)).to.not.include('orders');
      expect(el.relations.map(r => r.id)).to.deep.equal(['r3']);
      expect(el.canUndo).to.be.true;
      el.undo();
      await settle(el);
      expect(cards(el)).to.include('orders');
      expect(el.relations.length).to.equal(3);
    });

    it('renames an entity with F2 and adds new entities', async () => {
      const el = await render({ editable: true });
      const products = card(el, 'products');
      products.focus();
      key(products, 'F2');
      await settle(el);
      const input = el.shadowRoot?.querySelector(
        '.erd-input',
      ) as HTMLInputElement;
      input.value = 'catalog_items';
      setTimeout(() => key(input, 'Enter'));
      const renamed = (await oneEvent(
        el,
        'change',
      )) as CustomEvent<ErdChangeDetail>;
      expect(
        renamed.detail.entities.find(e => e.id === 'products')?.name,
      ).to.equal('catalog_items');
      await settle(el);
      setTimeout(() => el.addEntity({ id: 'shipments' }));
      const added = (await oneEvent(
        el,
        'change',
      )) as CustomEvent<ErdChangeDetail>;
      expect(added.detail.reason).to.equal('entity-add');
      await settle(el);
      expect(cards(el)).to.include('shipments');
    });

    it('does not edit without editable', async () => {
      const el = await render();
      expect(el.shadowRoot?.querySelector('.erd-add')).to.be.null;
      expect(el.shadowRoot?.querySelector('.erd-port')).to.be.null;
      const products = card(el, 'products');
      products.focus();
      key(products, 'Delete');
      await settle(el);
      expect(cards(el)).to.include('products');
    });
  });
});
