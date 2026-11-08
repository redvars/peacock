/// <reference types="mocha" />
import { html } from 'lit';
import { expect, fixture, oneEvent } from '@open-wc/testing';
import { TreeChart } from '../src/tree-chart/tree-chart.js';
import { layoutTree } from '../src/tree-chart/tree-chart-layout.js';
import type {
  TreeChartAddDetail,
  TreeChartChangeDetail,
  TreeChartItem,
  TreeChartItemDetail,
  TreeChartReparentDetail,
} from '../src/tree-chart/tree-chart.js';

if (!customElements.get('wc-tree-chart'))
  customElements.define('wc-tree-chart', TreeChart);

function org(): TreeChartItem[] {
  return [
    { id: 'ceo', headline: 'Sarah Jenkins', supportingText: 'CEO' },
    {
      id: 'cto',
      parentId: 'ceo',
      headline: 'Michael Chen',
      supportingText: 'CTO',
      badge: 'Engineering',
    },
    {
      id: 'cpo',
      parentId: 'ceo',
      headline: 'Elena Rostova',
      supportingText: 'CPO',
      badge: 'Product',
    },
    {
      id: 'dev1',
      parentId: 'cto',
      headline: 'David Miller',
      supportingText: 'Engineer',
    },
    {
      id: 'dev2',
      parentId: 'cto',
      headline: 'Alex Kumar',
      supportingText: 'Engineer',
    },
    {
      id: 'pm',
      parentId: 'cpo',
      headline: 'Ana Ruiz',
      supportingText: 'Product manager',
    },
  ];
}

async function settle(el: TreeChart) {
  await el.updateComplete;
  await new Promise(resolve => {
    requestAnimationFrame(resolve);
  });
  await el.updateComplete;
}

async function mount(
  items = org(),
  attrs: { editable?: boolean; compact?: boolean } = {},
) {
  const el = await fixture<TreeChart>(
    html`<wc-tree-chart
      style="height: 600px"
      ?editable=${!!attrs.editable}
      ?compact=${!!attrs.compact}
      .items=${items}
    ></wc-tree-chart>`,
  );
  await settle(el);
  return el;
}

function node(el: TreeChart, id: string) {
  return el.shadowRoot?.querySelector(
    `.tc-node[data-id="${id}"]`,
  ) as HTMLElement;
}

function box(el: TreeChart, id: string) {
  return node(el, id).getBoundingClientRect();
}

function key(
  target: HTMLElement,
  name: string,
  options: ConstructorParameters<typeof KeyboardEvent>[1] = {},
) {
  target.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: name,
      bubbles: true,
      composed: true,
      cancelable: true,
      ...options,
    }),
  );
}

describe('tree chart layout', () => {
  const size = () => ({ width: 100, height: 40 });
  const nodes = new Map([
    ['a', { id: 'a', children: ['b', 'c'] }],
    ['b', { id: 'b', children: [] }],
    ['c', { id: 'c', children: ['d'] }],
    ['d', { id: 'd', children: [] }],
  ]);
  const options = {
    orientation: 'vertical' as const,
    compact: false,
    siblingGap: 20,
    levelGap: 60,
    stackGap: 10,
    stackIndent: 20,
  };

  it('puts children a level below, centred under their parent, without overlap', () => {
    const { positions } = layoutTree(['a'], nodes, size, options);
    const a = positions.get('a');
    const b = positions.get('b');
    const c = positions.get('c');
    expect(b?.y).to.equal((a?.y ?? 0) + 40 + 60);
    expect(((b?.x ?? 0) + (c?.x ?? 0)) / 2).to.equal(a?.x);
    expect((c?.x ?? 0) - (b?.x ?? 0)).to.be.at.least(120);
    expect(positions.get('d')?.x).to.equal(c?.x);
  });

  it('turns the tree for horizontal charts and stacks leaf teams when compact', () => {
    const horizontal = layoutTree(['a'], nodes, size, {
      ...options,
      orientation: 'horizontal',
    });
    expect(horizontal.positions.get('b')?.x).to.equal(160);
    const leaves = new Map([
      ['a', { id: 'a', children: ['b', 'c', 'd'] }],
      ['b', { id: 'b', children: [] }],
      ['c', { id: 'c', children: [] }],
      ['d', { id: 'd', children: [] }],
    ]);
    const compact = layoutTree(['a'], leaves, size, {
      ...options,
      compact: true,
    });
    expect(compact.stacked.has('a')).to.equal(true);
    const xs = ['b', 'c', 'd'].map(id => compact.positions.get(id)?.x);
    expect(new Set(xs).size).to.equal(1);
    expect(compact.positions.get('c')?.y).to.equal(
      (compact.positions.get('b')?.y ?? 0) + 50,
    );
  });
});

describe('wc-tree-chart', () => {
  it('lays out the tree as an accessible tree with connectors and count chips', async () => {
    const el = await mount();
    expect(el.shadowRoot?.querySelector('[role="tree"]')).to.not.equal(null);
    expect(node(el, 'dev1').getAttribute('aria-level')).to.equal('3');
    expect(node(el, 'cpo').getAttribute('aria-posinset')).to.equal('2');
    expect(node(el, 'cto').getAttribute('aria-expanded')).to.equal('true');
    expect(box(el, 'cto').top).to.be.greaterThan(box(el, 'ceo').bottom);
    expect(box(el, 'cpo').left).to.be.greaterThan(box(el, 'cto').right);
    expect(el.shadowRoot?.querySelectorAll('.tc-link').length).to.equal(5);
    expect(
      node(el, 'cto').querySelector('.tc-count')?.textContent?.trim(),
    ).to.contain('2');
    expect(node(el, 'cto').textContent).to.contain('Engineering');
  });

  it('collapses and expands with the count chip', async () => {
    const el = await mount();
    const chip = node(el, 'cto').querySelector('.tc-count') as HTMLElement;
    setTimeout(() => chip.click());
    const collapse = (await oneEvent(
      el,
      'collapse',
    )) as CustomEvent<TreeChartItemDetail>;
    expect(collapse.detail.id).to.equal('cto');
    await settle(el);
    expect(node(el, 'dev1')).to.equal(null);
    expect(node(el, 'cto').getAttribute('aria-expanded')).to.equal('false');
    el.expand('cto');
    await settle(el);
    expect(node(el, 'dev1')).to.not.equal(null);
  });

  it('asks for lazy children and shows a spinner until they arrive', async () => {
    const items: TreeChartItem[] = [
      { id: 'root', headline: 'Catalogue' },
      { id: 'shoes', parentId: 'root', headline: 'Shoes', hasChildren: true },
    ];
    const el = await mount(items);
    expect(node(el, 'shoes').getAttribute('aria-expanded')).to.equal('false');
    setTimeout(() =>
      (node(el, 'shoes').querySelector('.tc-count') as HTMLElement).click(),
    );
    const expand = (await oneEvent(
      el,
      'expand',
    )) as CustomEvent<TreeChartItemDetail>;
    expect(expand.detail.id).to.equal('shoes');
    await el.updateComplete;
    expect(node(el, 'shoes').querySelector('.tc-spin')).to.not.equal(null);
    el.items = [
      ...items,
      { id: 'boots', parentId: 'shoes', headline: 'Boots' },
    ];
    await settle(el);
    expect(node(el, 'shoes').querySelector('.tc-spin')).to.equal(null);
    expect(node(el, 'boots')).to.not.equal(null);
  });

  it('moves focus like a tree: parent, first child, siblings', async () => {
    const el = await mount();
    const focused = () =>
      (el.shadowRoot?.activeElement as HTMLElement | null)?.dataset.id;
    node(el, 'ceo').focus();
    key(node(el, 'ceo'), 'ArrowDown');
    await settle(el);
    expect(focused()).to.equal('cto');
    key(node(el, 'cto'), 'ArrowRight');
    await settle(el);
    expect(focused()).to.equal('cpo');
    key(node(el, 'cpo'), 'ArrowUp');
    await settle(el);
    expect(focused()).to.equal('ceo');
    key(node(el, 'ceo'), 'End');
    await settle(el);
    expect(focused()).to.equal('pm');
    key(node(el, 'pm'), 'ArrowUp');
    await settle(el);
    key(node(el, 'cpo'), 'Enter', { shiftKey: true });
    await settle(el);
    expect(node(el, 'pm')).to.equal(null);
  });

  it('highlights search matches and the path to them, expanding on the way', async () => {
    const el = await mount();
    el.collapse('cto');
    await settle(el);
    const matches = el.search('alex');
    await settle(el);
    expect(matches).to.deep.equal(['dev2']);
    expect(node(el, 'dev2').classList.contains('is-match')).to.equal(true);
    expect(node(el, 'cpo').classList.contains('is-dim')).to.equal(true);
    expect(node(el, 'cto').classList.contains('is-dim')).to.equal(false);
    expect(el.shadowRoot?.querySelectorAll('.tc-link.is-path').length).to.equal(
      2,
    );
    el.clearSearch();
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('.is-dim')).to.equal(null);
  });

  it('reparents by dragging a card onto another, never into its own branch', async () => {
    const el = await mount(org(), { editable: true });
    const drag = async (from: string, to: string) => {
      const source = node(el, from);
      const s = box(el, from);
      const t = box(el, to);
      const fire = (type: string, x: number, y: number) =>
        source.dispatchEvent(
          new PointerEvent(type, {
            pointerId: 5,
            button: 0,
            clientX: x,
            clientY: y,
            bubbles: true,
            composed: true,
          }),
        );
      fire('pointerdown', s.left + 10, s.top + 10);
      fire('pointermove', t.left + t.width / 2, t.top + t.height / 2);
      await el.updateComplete;
      fire('pointerup', t.left + t.width / 2, t.top + t.height / 2);
      await settle(el);
    };
    const events: TreeChartReparentDetail[] = [];
    el.addEventListener('reparent', e =>
      events.push((e as CustomEvent<TreeChartReparentDetail>).detail),
    );
    await drag('cto', 'dev1');
    expect(events).to.deep.equal([]);
    expect(el.items.find(i => i.id === 'cto')?.parentId).to.equal('ceo');

    const changed = oneEvent(el, 'change');
    await drag('dev2', 'cpo');
    expect(events).to.deep.equal([
      { id: 'dev2', parentId: 'cpo', previousParentId: 'cto' },
    ]);
    expect(
      ((await changed) as CustomEvent<TreeChartChangeDetail>).detail.reason,
    ).to.equal('move');
    expect(el.items.find(i => i.id === 'dev2')?.parentId).to.equal('cpo');
    el.undo();
    expect(el.items.find(i => i.id === 'dev2')?.parentId).to.equal('cto');
  });

  it('adds an item below, and deleting one moves its children up', async () => {
    const el = await mount(org(), { editable: true });
    const add = node(el, 'pm').querySelector(
      '.tc-actions button',
    ) as HTMLElement;
    setTimeout(() => add.click());
    const detail = (await oneEvent(
      el,
      'add',
    )) as CustomEvent<TreeChartAddDetail>;
    expect(detail.detail).to.deep.equal({
      parentId: 'pm',
      position: 'child',
      of: 'pm',
    });
    await settle(el);
    expect(el.items.find(i => i.parentId === 'pm')?.id).to.equal('item');
    expect(el.selected).to.equal('item');

    key(node(el, 'cto'), 'Delete');
    await settle(el);
    expect(el.items.find(i => i.id === 'cto')).to.equal(undefined);
    expect(
      el.items.filter(i => i.parentId === 'ceo').map(i => i.id),
    ).to.include.members(['dev1', 'dev2']);
  });
});
