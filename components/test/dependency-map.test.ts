/// <reference types="mocha" />
import { html } from 'lit';
import { expect, fixture, oneEvent } from '@open-wc/testing';
import { DependencyMap } from '../src/dependency-map/dependency-map.js';
import {
  forceLayout,
  layeredLayout,
  radialLayout,
  reachable,
  withinHops,
  GROUP_PADDING,
} from '../src/dependency-map/dependency-map-layout.js';
import type {
  DependencyMapEdge,
  DependencyMapFilterDetail,
  DependencyMapFocusDetail,
  DependencyMapGroup,
  DependencyMapGroupDetail,
  DependencyMapNode,
  DependencyMapSelectDetail,
} from '../src/dependency-map/dependency-map.js';

if (!customElements.get('wc-dependency-map'))
  customElements.define('wc-dependency-map', DependencyMap);

function mesh(): {
  nodes: DependencyMapNode[];
  edges: DependencyMapEdge[];
  groups: DependencyMapGroup[];
} {
  return {
    nodes: [
      {
        id: 'web',
        type: 'Service',
        headline: 'checkout-web',
        status: 'healthy',
        group: 'shop',
      },
      {
        id: 'cart',
        type: 'Service',
        headline: 'cart-api',
        status: 'healthy',
        group: 'shop',
      },
      {
        id: 'pay',
        type: 'Service',
        headline: 'payments-api',
        status: 'degraded',
        group: 'pay',
      },
      {
        id: 'fraud',
        type: 'Service',
        headline: 'fraud-check',
        status: 'healthy',
        group: 'pay',
      },
      {
        id: 'db',
        type: 'Database',
        headline: 'payments-db',
        status: 'down',
        group: 'pay',
      },
      { id: 'q', type: 'Queue', headline: 'orders-queue', status: 'healthy' },
    ],
    edges: [
      { id: 'e1', source: 'web', target: 'cart', metrics: { rps: 400 } },
      {
        id: 'e2',
        source: 'web',
        target: 'pay',
        metrics: { rps: 120, errorRate: 0.02 },
      },
      { id: 'e3', source: 'pay', target: 'fraud', metrics: { rps: 120 } },
      {
        id: 'e4',
        source: 'pay',
        target: 'db',
        metrics: { rps: 900, errorRate: 0.08 },
      },
      { id: 'e5', source: 'fraud', target: 'db', metrics: { rps: 60 } },
      { id: 'e6', source: 'cart', target: 'q', metrics: { rps: 30 } },
    ],
    groups: [
      { id: 'shop', label: 'Storefront' },
      { id: 'pay', label: 'Payments' },
    ],
  };
}

async function settle(el: DependencyMap) {
  await el.updateComplete;
  await new Promise(resolve => {
    requestAnimationFrame(resolve);
  });
  await el.updateComplete;
}

async function render(extra: Partial<DependencyMap> = {}) {
  const data = mesh();
  const el = await fixture<DependencyMap>(
    html`<wc-dependency-map
      style="width: 900px; height: 600px; display: block"
      .nodes=${data.nodes}
      .edges=${data.edges}
      .groups=${data.groups}
    ></wc-dependency-map>`,
  );
  Object.assign(el, extra);
  await settle(el);
  return el;
}

const nodeIds = (el: DependencyMap) =>
  [...(el.shadowRoot?.querySelectorAll<HTMLElement>('.dm-node') ?? [])].map(
    n => n.dataset.id,
  );

const node = (el: DependencyMap, id: string) =>
  el.shadowRoot?.querySelector<HTMLElement>(
    `.dm-node[data-id="${id}"]`,
  ) as HTMLElement;

const key = (target: HTMLElement, k: string) =>
  target.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: k,
      bubbles: true,
      composed: true,
      cancelable: true,
    }),
  );

describe('dependency map layouts', () => {
  const nodes = mesh().nodes.map(n => ({ id: n.id, group: n.group }));
  const { edges } = mesh();
  const options = { nodeWidth: 200, nodeHeight: 52 };

  it('force layout is deterministic and keeps nodes apart', () => {
    const a = forceLayout(nodes, edges, options);
    const b = forceLayout(nodes, edges, options);
    expect([...a]).to.deep.equal([...b]);
    const points = [...a.values()];
    for (let i = 0; i < points.length; i += 1) {
      for (let j = i + 1; j < points.length; j += 1) {
        expect(
          Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y),
        ).to.be.greaterThan(60);
      }
    }
  });

  it('force layout keeps pinned nodes and warm-starts close to the previous positions', () => {
    const first = forceLayout(nodes, edges, options);
    const pinned = forceLayout(
      nodes.map(n =>
        n.id === 'db' ? { ...n, pinned: { x: 999, y: -999 } } : n,
      ),
      edges,
      options,
    );
    expect(pinned.get('db')).to.deep.equal({ x: 999, y: -999 });
    const again = forceLayout(nodes, edges, { ...options, previous: first });
    const drift = Math.max(
      ...[...first].map(([id, p]) => {
        const q = again.get(id) ?? p;
        return Math.hypot(q.x - p.x, q.y - p.y);
      }),
    );
    expect(drift).to.be.lessThan(120);
  });

  it('layered layout puts callers left of their dependencies, even with a cycle', () => {
    const cyclic = [...edges, { source: 'db', target: 'web' }];
    const p = layeredLayout(nodes, cyclic, options);
    expect((p.get('web')?.x ?? 0) < (p.get('pay')?.x ?? 0)).to.be.true;
    expect((p.get('pay')?.x ?? 0) < (p.get('db')?.x ?? 0)).to.be.true;
    expect((p.get('fraud')?.x ?? 0) < (p.get('db')?.x ?? 0)).to.be.true;
  });

  const groupBox = (
    p: Map<string, { x: number; y: number }>,
    ids: string[],
  ) => {
    const ps = ids.map(id => p.get(id) ?? { x: 0, y: 0 });
    return {
      x1: Math.min(...ps.map(q => q.x)) - 100 - GROUP_PADDING.x,
      x2: Math.max(...ps.map(q => q.x)) + 100 + GROUP_PADDING.x,
      y1: Math.min(...ps.map(q => q.y)) - 26 - GROUP_PADDING.top,
      y2: Math.max(...ps.map(q => q.y)) + 26 + GROUP_PADDING.bottom,
    };
  };
  const overlaps = (
    a: ReturnType<typeof groupBox>,
    b: ReturnType<typeof groupBox>,
  ) =>
    Math.min(a.x2, b.x2) > Math.max(a.x1, b.x1) &&
    Math.min(a.y2, b.y2) > Math.max(a.y1, b.y1);

  it('force layout keeps group boxes apart from each other and from loose nodes', () => {
    const p = forceLayout(nodes, edges, options);
    const shop = groupBox(p, ['web', 'cart']);
    const pay = groupBox(p, ['pay', 'fraud', 'db']);
    expect(overlaps(shop, pay)).to.be.false;
    const q = p.get('q') ?? { x: 0, y: 0 };
    const loose = { x1: q.x - 100, x2: q.x + 100, y1: q.y - 26, y2: q.y + 26 };
    expect(overlaps(shop, loose)).to.be.false;
    expect(overlaps(pay, loose)).to.be.false;
  });

  it('layered layout puts each group in its own lane', () => {
    const p = layeredLayout(nodes, edges, options);
    const shop = groupBox(p, ['web', 'cart']);
    const pay = groupBox(p, ['pay', 'fraud', 'db']);
    expect(overlaps(shop, pay)).to.be.false;
  });

  it('radial layout puts the centre at the origin and neighbours on the first ring', () => {
    const p = radialLayout(nodes, edges, { ...options, center: 'pay' });
    expect(p.get('pay')).to.deep.equal({ x: 0, y: 0 });
    const r = (id: string) => Math.hypot(p.get(id)?.x ?? 0, p.get(id)?.y ?? 0);
    expect(r('web')).to.be.closeTo(r('db'), 0.001);
    expect(r('q')).to.be.greaterThan(r('web'));
  });

  it('finds what depends on a node and what it depends on', () => {
    expect([...reachable('db', edges, 'upstream')].sort()).to.deep.equal([
      'db',
      'fraud',
      'pay',
      'web',
    ]);
    expect([...reachable('pay', edges, 'downstream')].sort()).to.deep.equal([
      'db',
      'fraud',
      'pay',
    ]);
    expect([...withinHops('cart', edges, 1)].sort()).to.deep.equal([
      'cart',
      'q',
      'web',
    ]);
  });
});

describe('wc-dependency-map', () => {
  it('renders every node as a button with status and neighbour counts', async () => {
    const el = await render();
    expect(nodeIds(el)).to.have.members([
      'web',
      'cart',
      'pay',
      'fraud',
      'db',
      'q',
    ]);
    const db = node(el, 'db');
    expect(db.getAttribute('role')).to.equal('button');
    expect(db.classList.contains('st-down')).to.be.true;
    expect(db.getAttribute('aria-label')).to.contain('payments-db');
    expect(db.getAttribute('aria-label')).to.contain('Down');
    expect(el.shadowRoot?.querySelectorAll('.dm-edge').length).to.equal(6);
    expect(el.shadowRoot?.querySelectorAll('.dm-group').length).to.equal(2);
  });

  it('scales edges with traffic and colours them by errors', async () => {
    const el = await render();
    const edges = [
      ...(el.shadowRoot?.querySelectorAll<SVGGElement>('.dm-edge') ?? []),
    ];
    const widths = edges.map(g =>
      parseFloat(
        (g.querySelector('.dm-edge-line') as SVGPathElement).style.strokeWidth,
      ),
    );
    expect(Math.max(...widths)).to.be.closeTo(5.5, 0.01);
    expect(Math.min(...widths)).to.be.greaterThan(1.5);
    expect(edges.filter(g => g.classList.contains('is-error')).length).to.equal(
      1,
    );
    expect(
      edges.filter(g => g.classList.contains('is-warning')).length,
    ).to.equal(1);
  });

  it('selects on click and fires select', async () => {
    const el = await render();
    const target = node(el, 'pay');
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
    const { detail } = (await oneEvent(
      el,
      'select',
    )) as CustomEvent<DependencyMapSelectDetail>;
    expect(detail.id).to.equal('pay');
    expect(detail.node?.headline).to.equal('payments-api');
    await settle(el);
    expect(el.selected).to.equal('pay');
    expect(node(el, 'pay').classList.contains('is-selected')).to.be.true;
  });

  it('highlights upstream impact and dims the rest', async () => {
    const el = await render({ selected: 'db', impact: 'upstream' });
    expect(node(el, 'pay').classList.contains('is-impact')).to.be.true;
    expect(node(el, 'web').classList.contains('is-impact')).to.be.true;
    expect(node(el, 'cart').classList.contains('is-dim')).to.be.true;
    expect(node(el, 'q').classList.contains('is-dim')).to.be.true;
    el.impact = 'downstream';
    el.selected = 'pay';
    await settle(el);
    expect(node(el, 'db').classList.contains('is-impact')).to.be.true;
    expect(node(el, 'web').classList.contains('is-dim')).to.be.true;
  });

  it('focus mode shows only nodes within the hop count', async () => {
    const el = await render({ focusedNode: 'q', hops: 1 });
    expect(nodeIds(el)).to.have.members(['q', 'cart']);
    el.hops = 2;
    await settle(el);
    expect(nodeIds(el)).to.have.members(['q', 'cart', 'web']);
    el.clearFocus();
    await settle(el);
    expect(nodeIds(el).length).to.equal(6);
  });

  it('filters by type, status and text', async () => {
    const el = await render({ filter: { types: ['Service'] } });
    expect(nodeIds(el)).to.not.include('db');
    expect(nodeIds(el)).to.not.include('q');
    el.filter = { statuses: ['down', 'degraded'] };
    await settle(el);
    expect(nodeIds(el)).to.have.members(['pay', 'db']);
    el.filter = { text: 'CART' };
    await settle(el);
    expect(nodeIds(el)).to.deep.equal(['cart']);
  });

  it('legend types toggle the filter and fire filter-change', async () => {
    const el = await render();
    const toggles = [
      ...(el.shadowRoot?.querySelectorAll<HTMLButtonElement>(
        '.dm-type-toggle',
      ) ?? []),
    ];
    expect(
      toggles.map(t => t.textContent?.replace(/\d+/g, '').trim()),
    ).to.deep.equal(['Service', 'Database', 'Queue']);
    const queue = toggles[2];
    setTimeout(() => queue.click());
    const { detail } = (await oneEvent(
      el,
      'filter-change',
    )) as CustomEvent<DependencyMapFilterDetail>;
    expect(detail.filter.types).to.deep.equal(['Service', 'Database']);
    await settle(el);
    expect(nodeIds(el)).to.not.include('q');
    expect(queue.getAttribute('aria-pressed')).to.equal('false');
  });

  it('collapses a group into one node with combined status and merged edges', async () => {
    const el = await render();
    setTimeout(() => el.collapseGroup('pay'));
    const { detail } = (await oneEvent(
      el,
      'group-toggle',
    )) as CustomEvent<DependencyMapGroupDetail>;
    expect(detail).to.deep.equal({ id: 'pay', collapsed: true });
    await settle(el);
    expect(nodeIds(el)).to.have.members(['web', 'cart', 'q', 'group:pay']);
    const group = node(el, 'group:pay');
    expect(group.classList.contains('st-down')).to.be.true;
    expect(group.getAttribute('aria-label')).to.contain('3 items');
    // web → pay becomes web → group:pay; edges inside the group disappear.
    expect(el.shadowRoot?.querySelectorAll('.dm-edge').length).to.equal(3);
    el.expandGroup('pay');
    await settle(el);
    expect(nodeIds(el).length).to.equal(6);
  });

  it('starts groups collapsed when asked', async () => {
    const data = mesh();
    const el = await render({
      groups: data.groups.map(g =>
        g.id === 'shop' ? { ...g, collapsed: true } : g,
      ),
    });
    expect(nodeIds(el)).to.include('group:shop');
    expect(nodeIds(el)).to.not.include('web');
  });

  it('merges parallel edges into a group with a count', async () => {
    const data = mesh();
    const el = await render({
      edges: [
        ...data.edges,
        { id: 'e7', source: 'web', target: 'db', metrics: { rps: 5 } },
      ],
      groups: data.groups.map(g =>
        g.id === 'pay' ? { ...g, collapsed: true } : g,
      ),
    });
    const counts = [
      ...(el.shadowRoot?.querySelectorAll('.dm-edge-count') ?? []),
    ].map(t => t.textContent);
    expect(counts).to.deep.equal(['2 connections']);
  });

  it('moves along edges with the arrow keys and focuses with F', async () => {
    const el = await render({ layout: 'layered' });
    const web = node(el, 'web');
    web.focus();
    key(web, 'ArrowDown');
    await settle(el);
    const next = el.shadowRoot?.activeElement as HTMLElement;
    expect(['cart', 'pay']).to.include(next.dataset.id);
    key(next, next.dataset.id === 'cart' ? 'ArrowRight' : 'ArrowLeft');
    await settle(el);
    const sibling = el.shadowRoot?.activeElement as HTMLElement;
    expect(sibling.dataset.id).to.not.equal(next.dataset.id);
    key(sibling, 'ArrowUp');
    await settle(el);
    expect((el.shadowRoot?.activeElement as HTMLElement).dataset.id).to.equal(
      'web',
    );

    const current = el.shadowRoot?.activeElement as HTMLElement;
    setTimeout(() => key(current, 'f'));
    const { detail } = (await oneEvent(
      el,
      'focus-change',
    )) as CustomEvent<DependencyMapFocusDetail>;
    expect(detail).to.deep.equal({ id: 'web', hops: 2 });
    expect(el.focusedNode).to.equal('web');
  });

  it('uses one tab stop', async () => {
    const el = await render();
    const stops = [
      ...(el.shadowRoot?.querySelectorAll('.dm-node') ?? []),
    ].filter(n => n.getAttribute('tabindex') === '0');
    expect(stops.length).to.equal(1);
  });

  it('keeps existing nodes in place on a live update', async () => {
    const el = await render();
    const before = node(el, 'web').style.left;
    el.nodes = el.nodes.map(n =>
      n.id === 'db' ? { ...n, status: 'healthy' as const } : n,
    );
    await settle(el);
    expect(node(el, 'web').style.left).to.equal(before);
    expect(node(el, 'db').classList.contains('st-healthy')).to.be.true;
  });

  it('draws status dots when zoomed far out', async () => {
    const el = await render();
    el.zoomTo(0.3);
    await settle(el);
    expect(
      el.shadowRoot
        ?.querySelector('.dm-viewport')
        ?.classList.contains('lod-dot'),
    ).to.be.true;
  });

  it('hides the legend with hide-legend', async () => {
    const el = await render({ hideLegend: true });
    expect(el.shadowRoot?.querySelector('.dm-legend')).to.be.null;
  });
});
