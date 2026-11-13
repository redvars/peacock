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
import { setActiveRule } from '../src/condition-builder/cb-drag.js';

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

  it('swaps the operator with a click on the pill and fires operator-change', async () => {
    const { el } = await renderBuilder();
    const details: unknown[] = [];
    el.addEventListener('operator-change', event => {
      details.push((event as CustomEvent).detail);
    });
    const pill = () =>
      el.shadowRoot!.querySelector<HTMLButtonElement>('.operator-pill')!;
    const tooltip = () =>
      el.shadowRoot!.querySelector('.operator-tooltip')?.textContent?.trim();

    expect(pill().getAttribute('aria-label')).to.equal(
      'Match conditions with And',
    );
    expect(pill().getAttribute('aria-description')).to.equal('Switch to Or');
    expect(pill().querySelector('wc-icon')?.getAttribute('name')).to.equal(
      'swap_vert',
    );
    expect(tooltip()).to.equal('Switch to Or');
    expect(pill().hasAttribute('aria-haspopup')).to.be.false;
    expect(el.shadowRoot?.querySelector('wc-menu')).to.not.exist;

    pill().click();
    await el.updateComplete;
    expect(details).to.deep.equal([{ operator: 'or' }]);
    expect(el.getAttribute('operator')).to.equal('or');
    expect(
      el.shadowRoot?.querySelector('.operator-label')?.textContent,
    ).to.equal('Or');
    expect(pill().getAttribute('aria-label')).to.equal(
      'Match conditions with Or',
    );
    expect(tooltip()).to.equal('Switch to And');

    pill().click();
    await el.updateComplete;
    expect(details).to.deep.equal([{ operator: 'or' }, { operator: 'and' }]);
    expect(el.getAttribute('operator')).to.equal('and');
  });

  it('announces the operator it swapped to', async () => {
    const { el } = await renderBuilder();
    el.shadowRoot!.querySelector<HTMLButtonElement>('.operator-pill')!.click();
    await new Promise(resolve => {
      requestAnimationFrame(resolve);
    });
    await el.updateComplete;

    expect(
      el.shadowRoot?.querySelector('[aria-live="polite"]')?.textContent,
    ).to.equal('Conditions now match with Or');
  });

  it('leaves a gap between the operator pill and the items it joins', async () => {
    const { el } = await renderBuilder();
    const pill = el
      .shadowRoot!.querySelector('.operator-pill')!
      .getBoundingClientRect();
    const first = byId<CbRule>(el, 'a').getBoundingClientRect();

    expect(first.left - pill.right).to.be.at.least(4);
  });

  it('isolates a rule only while its drag image is captured, so the image shows only the rule', async () => {
    const { el } = await renderBuilder();
    const rule = byId<CbRule>(el, 'a');
    const handle = rule.shadowRoot!.querySelector('.handle')!;

    // Chrome paints a drag image from the nearest stacking context, cut to the rule's box.
    expect(getComputedStyle(rule).isolation).to.equal('auto');
    handle.dispatchEvent(
      new DragEvent('dragstart', {
        bubbles: true,
        composed: true,
        cancelable: true,
        dataTransfer: new DataTransfer(),
      }),
    );
    expect(getComputedStyle(rule).isolation).to.equal('isolate');

    await new Promise(resolve => {
      requestAnimationFrame(resolve);
    });
    expect(getComputedStyle(rule).isolation).to.equal('auto');
    expect(rule.hasAttribute('dragging')).to.be.true;

    handle.dispatchEvent(
      new DragEvent('dragend', { bubbles: true, composed: true }),
    );
    expect(rule.hasAttribute('dragging')).to.be.false;
    expect(rule.hasAttribute('drag-capture')).to.be.false;
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

    group.shadowRoot?.querySelector<HTMLElement>('.add-group')?.click();

    expect(events).to.deep.equal([
      ['add-rule', el],
      ['add-group', el],
      ['add-rule', group],
      ['add-group', group],
    ]);
  });

  it('returns the query tree as value', async () => {
    const el = await fixture<ConditionBuilder>(html`
      <wc-condition-builder id="root" operator="or" data-source="orders">
        <wc-cb-rule id="named">
          <input name="field" value="status" />
          <input name="value" value="open" />
        </wc-cb-rule>
        <wc-cb-group id="g">
          <wc-cb-rule id="plain"
            ><input value="x" /><input value="y"
          /></wc-cb-rule>
          <wc-cb-rule id="own" data-kind="custom"></wc-cb-rule>
        </wc-cb-group>
      </wc-condition-builder>
    `);
    const own = byId<CbRule>(el, 'own');
    own.value = { field: 'total', operator: '>', value: 10 };

    const { value } = el;
    expect(JSON.parse(JSON.stringify(value))).to.deep.equal({
      type: 'group',
      id: 'root',
      operator: 'or',
      data: { source: 'orders' },
      children: [
        {
          type: 'rule',
          id: 'named',
          value: { field: 'status', value: 'open' },
          data: {},
        },
        {
          type: 'group',
          id: 'g',
          operator: 'and',
          data: {},
          children: [
            { type: 'rule', id: 'plain', value: ['x', 'y'], data: {} },
            {
              type: 'rule',
              id: 'own',
              value: { field: 'total', operator: '>', value: 10 },
              data: { kind: 'custom' },
            },
          ],
        },
      ],
    });
    expect(value.element).to.equal(el);
    expect(value.children[0].element).to.equal(byId(el, 'named'));
    expect(value.children[1].element).to.equal(byId(el, 'g'));
  });

  it('moves a rule into and out of a group with ArrowRight and ArrowLeft, and announces it', async () => {
    const { el, group } = await renderBuilder();
    const b = byId<CbRule>(el, 'b');
    const handle = () =>
      b.shadowRoot?.querySelector('.handle') as HTMLElement | null;

    handle()?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight' }),
    );
    expect(ids(group)).to.deep.equal(['b', 'c']);
    expect(ids(el)).to.deep.equal(['a', 'g']);
    await nextFrame();
    await el.updateComplete;
    expect(
      el.shadowRoot?.querySelector('[aria-live="polite"]')?.textContent,
    ).to.equal('Moved into group, position 1 of 2');

    await b.updateComplete;
    handle()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    expect(ids(group)).to.deep.equal(['c']);
    expect(ids(el)).to.deep.equal(['a', 'g', 'b']);
    await nextFrame();
    await el.updateComplete;
    expect(
      el.shadowRoot?.querySelector('[aria-live="polite"]')?.textContent,
    ).to.equal('Moved out of group, position 3 of 3');
  });

  it('announces moves within a group', async () => {
    const { el } = await renderBuilder();
    const handle = byId<CbRule>(el, 'a').shadowRoot?.querySelector('.handle');

    handle?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    await nextFrame();
    await el.updateComplete;
    expect(
      el.shadowRoot?.querySelector('[aria-live="polite"]')?.textContent,
    ).to.equal('Moved to position 2 of 3');
  });

  it('passes disabled and readonly down and hides the editing controls', async () => {
    const { el, group } = await renderBuilder();
    const rule = byId<CbRule>(el, 'c');

    el.readonly = true;
    await el.updateComplete;
    await group.updateComplete;
    await rule.updateComplete;

    expect(group.locked).to.be.true;
    expect(rule.locked).to.be.true;
    expect(rule.shadowRoot?.querySelector('.handle')).to.not.exist;
    expect(rule.shadowRoot?.querySelector('.remove')).to.not.exist;
    expect(el.shadowRoot?.querySelector('.actions slot[name="actions"]')).to.not
      .exist;
    expect(el.shadowRoot?.querySelector('.operator-tooltip')).to.not.exist;
    expect(el.shadowRoot?.querySelector('.operator-pill wc-icon')).to.not.exist;
    expect(group.shadowRoot?.querySelector('.footer')).to.not.exist;

    el.readonly = false;
    el.disabled = true;
    await el.updateComplete;
    await rule.updateComplete;
    expect(rule.locked).to.be.true;
    expect(
      el.shadowRoot?.querySelector<HTMLButtonElement>('.operator-pill')
        ?.disabled,
    ).to.be.true;
    expect(
      rule.shadowRoot?.querySelector('.rule')?.getAttribute('aria-disabled'),
    ).to.equal('true');

    el.disabled = false;
    await el.updateComplete;
    await rule.updateComplete;
    expect(rule.locked).to.be.false;
    expect(rule.shadowRoot?.querySelector('.handle')).to.exist;
  });

  it('passes the state down to items added later', async () => {
    const { el } = await renderBuilder();
    el.disabled = true;
    await el.updateComplete;

    const added = document.createElement('wc-cb-rule') as CbRule;
    el.append(added);
    await settle(el, added);
    await added.updateComplete;
    expect(added.locked).to.be.true;
  });

  it('ignores drags while locked', async () => {
    const { el, group } = await renderBuilder();
    el.readonly = true;
    await el.updateComplete;
    await group.updateComplete;

    const dragOver = new DragEvent('dragover', {
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    setActiveRule(byId<CbRule>(el, 'a'));
    group.dispatchEvent(dragOver);
    setActiveRule(null);
    expect(dragOver.defaultPrevented).to.be.false;
  });

  it('reserves the connector column only for two or more items', async () => {
    const { el, group } = await renderBuilder();
    const body = (target: ConditionBuilder | CbGroup) =>
      target.shadowRoot?.querySelector('.body') as HTMLElement;
    const indent = (target: ConditionBuilder | CbGroup) =>
      parseFloat(getComputedStyle(body(target)).paddingInlineStart);

    // The root joins two rules and a group; the inner group holds a single rule.
    expect(body(el).classList.contains('connected')).to.be.true;
    expect(indent(el)).to.be.greaterThan(0);
    expect(body(group).classList.contains('connected')).to.be.false;
    expect(indent(group)).to.equal(0);
    const footer = group.shadowRoot?.querySelector('.footer') as HTMLElement;
    expect(parseFloat(getComputedStyle(footer).paddingInlineStart)).to.equal(0);

    const rule = document.createElement('wc-cb-rule');
    rule.textContent = 'D';
    group.append(rule);
    await settle(group);
    expect(indent(group)).to.be.greaterThan(0);
  });
});
