/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect, nextFrame } from '@open-wc/testing';
// Import modules directly: src/index.js pulls in html-editor's CommonJS js-beautify, which the
// test server cannot load.
import {
  CbDivider,
  CbGroup,
  CbRule,
  ConditionBuilder,
} from '../src/condition-builder/index.js';

if (!customElements.get('wc-condition-builder')) {
  customElements.define('wc-condition-builder', ConditionBuilder);
}

if (!customElements.get('wc-cb-group')) {
  customElements.define('wc-cb-group', CbGroup);
}

if (!customElements.get('wc-cb-rule')) {
  customElements.define('wc-cb-rule', CbRule);
}

if (!customElements.get('wc-cb-divider')) {
  customElements.define('wc-cb-divider', CbDivider);
}

function byId<T extends HTMLElement>(root: Element, id: string): T {
  return root.querySelector(`#${id}`) as T;
}

function ids(group: ConditionBuilder | CbGroup): string[] {
  return group.items.map(item => item.id);
}

/** Waits for slotchange and the re-render it triggers. */
async function settle(...elements: (ConditionBuilder | CbGroup | CbRule)[]) {
  await nextFrame();
  await Promise.all(elements.map(element => element.updateComplete));
}

async function renderBuilder() {
  const el = await fixture<ConditionBuilder>(html`
    <wc-condition-builder>
      <wc-cb-rule id="a">A</wc-cb-rule>
      <wc-cb-rule id="b">B</wc-cb-rule>
      <wc-cb-group id="g" operator="or">
        <wc-cb-rule id="c">C</wc-cb-rule>
      </wc-cb-group>
    </wc-condition-builder>
  `);
  const group = byId<CbGroup>(el, 'g');
  await settle(el, group);
  return { el, group };
}

describe('Condition builder', () => {
  it('lists its rules and groups as items', async () => {
    const { el, group } = await renderBuilder();

    expect(ids(el)).to.deep.equal(['a', 'b', 'g']);
    expect(ids(group)).to.deep.equal(['c']);
  });

  it('shows the operator pill only when a group has two or more items', async () => {
    const { el, group } = await renderBuilder();

    expect(el.shadowRoot?.querySelector('.operator-pill')).to.exist;
    expect(group.shadowRoot?.querySelector('.operator-pill')).to.not.exist;

    group.append(document.createElement('wc-cb-rule'));
    await settle(group);
    expect(group.shadowRoot?.querySelector('.operator-pill')).to.exist;
  });

  it('switches the operator from the menu and fires operator-change', async () => {
    const { el } = await renderBuilder();
    let detail: unknown;
    el.addEventListener('operator-change', event => {
      detail = (event as CustomEvent).detail;
    });

    el.shadowRoot?.querySelector('wc-menu')?.dispatchEvent(
      new CustomEvent('menu-item-activate', {
        detail: { item: { value: 'or' } },
      }),
    );
    await el.updateComplete;

    expect(detail).to.deep.equal({ operator: 'or' });
    expect(el.getAttribute('operator')).to.equal('or');
    expect(
      el.shadowRoot?.querySelector('.operator-label')?.textContent,
    ).to.equal('Or');
  });

  it('removes a rule from its remove button unless rule-remove is prevented', async () => {
    const { el } = await renderBuilder();
    const rule = byId<CbRule>(el, 'a');
    const removeButton = rule.shadowRoot?.querySelector<HTMLElement>(
      '.remove wc-icon-button',
    );

    el.addEventListener('rule-remove', event => event.preventDefault(), {
      once: true,
    });
    removeButton?.click();
    expect(rule.isConnected).to.be.true;

    let detail: { rule: CbRule; group: HTMLElement | null } | undefined;
    el.addEventListener('rule-remove', event => {
      detail = (event as CustomEvent).detail;
    });
    removeButton?.click();
    expect(detail?.rule).to.equal(rule);
    expect(detail?.group).to.equal(el);
    expect(ids(el)).to.deep.equal(['b', 'g']);
  });

  it('moves rules with moveRule and fires rule-move', async () => {
    const { el, group } = await renderBuilder();
    const a = byId<CbRule>(el, 'a');
    const b = byId<CbRule>(el, 'b');
    let detail: Record<string, unknown> | undefined;
    el.addEventListener('rule-move', event => {
      detail = (event as CustomEvent).detail;
    });

    expect(el.moveRule(a, 0)).to.be.false;
    expect(detail).to.be.undefined;

    expect(el.moveRule(a, 1)).to.be.true;
    expect(ids(el)).to.deep.equal(['b', 'a', 'g']);

    expect(group.moveRule(b, 0)).to.be.true;
    expect(detail).to.deep.equal({ rule: b, from: el, to: group, index: 0 });
    expect(ids(group)).to.deep.equal(['b', 'c']);
    expect(ids(el)).to.deep.equal(['a', 'g']);
  });

  it('keeps the order when rule-move is prevented', async () => {
    const { el } = await renderBuilder();
    el.addEventListener('rule-move', event => event.preventDefault());

    expect(el.moveRule(byId<CbRule>(el, 'a'), 1)).to.be.false;
    expect(ids(el)).to.deep.equal(['a', 'b', 'g']);
  });

  it('moves a rule with ArrowDown and ArrowUp on its handle', async () => {
    const { el } = await renderBuilder();
    const handle = byId<CbRule>(el, 'a').shadowRoot?.querySelector('.handle');

    handle?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(ids(el)).to.deep.equal(['b', 'a', 'g']);

    handle?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    expect(ids(el)).to.deep.equal(['a', 'b', 'g']);
  });

  it('drops a dragged rule into a nested group', async () => {
    const { el, group } = await renderBuilder();
    const rule = byId<CbRule>(el, 'a');
    const target = byId<CbRule>(el, 'c');
    const handle = rule.shadowRoot?.querySelector('.handle');
    const dataTransfer = new DataTransfer();
    const below = target.getBoundingClientRect().bottom - 1;
    const dragInit = {
      bubbles: true,
      composed: true,
      cancelable: true,
      dataTransfer,
      clientY: below,
    };

    handle?.dispatchEvent(new DragEvent('dragstart', dragInit));
    const dragEnter = new DragEvent('dragenter', dragInit);
    target.dispatchEvent(dragEnter);
    const dragOver = new DragEvent('dragover', dragInit);
    target.dispatchEvent(dragOver);
    await group.updateComplete;

    expect(dragEnter.defaultPrevented).to.be.true;
    expect(dragOver.defaultPrevented).to.be.true;
    expect(group.shadowRoot?.querySelector('.drop-indicator')).to.exist;
    expect(el.shadowRoot?.querySelector('.drop-indicator')).to.not.exist;

    target.dispatchEvent(new DragEvent('drop', dragInit));
    handle?.dispatchEvent(new DragEvent('dragend', dragInit));
    await group.updateComplete;

    expect(ids(group)).to.deep.equal(['c', 'a']);
    expect(ids(el)).to.deep.equal(['b', 'g']);
    expect(group.shadowRoot?.querySelector('.drop-indicator')).to.not.exist;
  });

  it('ignores drags that are not rules', async () => {
    const { group } = await renderBuilder();
    const dragOver = new DragEvent('dragover', {
      bubbles: true,
      composed: true,
      cancelable: true,
    });

    group.dispatchEvent(dragOver);
    expect(dragOver.defaultPrevented).to.be.false;
  });

  it('fires add-rule and add-group from the default actions', async () => {
    const { el, group } = await renderBuilder();
    const events: [string, HTMLElement][] = [];
    const record = (event: Event) =>
      events.push([event.type, (event as CustomEvent).detail.group]);
    el.addEventListener('add-rule', record);
    el.addEventListener('add-group', record);

    const [addRule, addGroup] = Array.from(
      el.shadowRoot?.querySelectorAll<HTMLElement>('.actions wc-button') ?? [],
    );
    addRule?.click();
    addGroup?.click();
    group.shadowRoot?.querySelector<HTMLElement>('.add-condition')?.click();

    expect(events).to.deep.equal([
      ['add-rule', el],
      ['add-group', el],
      ['add-rule', group],
    ]);
  });
});
