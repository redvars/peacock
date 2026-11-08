/// <reference types="mocha" />
import { html } from 'lit';
import { expect, fixture, oneEvent } from '@open-wc/testing';
import { Workflow } from '../src/workflow/workflow.js';
import type {
  WorkflowChangeDetail,
  WorkflowDeleteDetail,
  WorkflowSelectDetail,
  WorkflowStepAddDetail,
  WorkflowStepType,
  WorkflowValue,
} from '../src/workflow/workflow.js';
import {
  cloneWithNewIds,
  createStep,
  findStep,
  listTerminates,
  moveStep,
  removeStep,
} from '../src/workflow/workflow-model.js';

if (!customElements.get('wc-workflow'))
  customElements.define('wc-workflow', Workflow);

function makeValue(): WorkflowValue {
  return {
    trigger: {
      id: 't',
      type: 'action',
      headline: 'Expense created',
      icon: 'bolt',
    },
    steps: [
      {
        id: 'lookup',
        type: 'action',
        headline: 'Look up manager',
        fields: [{ label: 'User', value: '{{Trigger.submitted_by}}' }],
        outputs: [{ name: 'manager' }],
      },
      {
        id: 'amount',
        type: 'branch',
        headline: 'Amount check',
        paths: [
          {
            id: 'big',
            label: 'amount > 1,000',
            steps: [
              { id: 'approve', type: 'action', headline: 'Manager approval' },
            ],
          },
          {
            id: 'small',
            label: 'Otherwise',
            isDefault: true,
            steps: [{ id: 'auto', type: 'action', headline: 'Auto approve' }],
          },
        ],
      },
      { id: 'notify', type: 'action', headline: 'Notify submitter' },
    ],
  };
}

const ACTIONS: WorkflowStepType[] = [
  {
    kind: 'email',
    type: 'action',
    headline: 'Send email',
    icon: 'mail',
    category: 'Actions',
  },
  {
    kind: 'http',
    type: 'action',
    headline: 'HTTP request',
    icon: 'api',
    category: 'Actions',
  },
  {
    kind: 'branch',
    type: 'branch',
    headline: 'Branch',
    icon: 'call_split',
    category: 'Logic',
  },
  {
    kind: 'record',
    type: 'action',
    headline: 'Record created',
    icon: 'bolt',
    trigger: true,
  },
];

async function settle(el: Workflow) {
  await el.updateComplete;
  await new Promise(resolve => {
    requestAnimationFrame(resolve);
  });
  await el.updateComplete;
}

async function mount(value = makeValue(), editable = false) {
  const el = await fixture<Workflow>(
    html`<wc-workflow
      style="height: 700px"
      ?editable=${editable}
      .value=${value}
      .stepTypes=${ACTIONS}
    ></wc-workflow>`,
  );
  await settle(el);
  return el;
}

function card(el: Workflow, id: string) {
  return el.shadowRoot?.querySelector(`[data-card-id="${id}"]`) as HTMLElement;
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

describe('wc-workflow', () => {
  it('draws the trigger, steps, branch paths and the join, as a tree', async () => {
    const el = await mount();
    const root = el.shadowRoot as ShadowRoot;
    expect(root.querySelector('[role="tree"]')).to.not.equal(null);
    expect(card(el, 't').getAttribute('role')).to.equal('treeitem');
    expect(card(el, 'approve').getAttribute('aria-level')).to.equal('2');
    expect(card(el, 'amount').getAttribute('aria-expanded')).to.equal('true');
    expect(
      [...root.querySelectorAll('.wf-pill')].map(p => p.textContent?.trim()),
    ).to.deep.equal(['amount > 1,000', 'Otherwise']);
    expect(root.querySelector('[data-join-for="amount"]')).to.not.equal(null);
    expect(root.querySelector('.wf-ref')?.textContent).to.contain('Trigger');
    expect(card(el, 'lookup').textContent).to.contain('manager');
    // trigger→lookup, lookup→branch, 2 forks, 2 path starts, 2 merges, join→notify
    expect(root.querySelectorAll('.wf-connectors .wf-conn').length).to.equal(9);
    // Only one card is in the Tab order.
    expect(
      root.querySelectorAll('[role="treeitem"][tabindex="0"]').length,
    ).to.equal(1);
  });

  it('draws no join when every path ends, and flags what comes after as a problem', async () => {
    const value: WorkflowValue = {
      steps: [
        {
          id: 'b',
          type: 'branch',
          headline: 'Check',
          paths: [
            { id: 'p1', label: 'Yes', steps: [{ id: 'e1', type: 'end' }] },
            { id: 'p2', label: 'No', steps: [{ id: 'e2', type: 'end' }] },
          ],
        },
        { id: 'never', type: 'action', headline: 'Never runs' },
      ],
    };
    const el = await mount(value);
    expect(el.shadowRoot?.querySelector('[data-join-for="b"]')).to.equal(null);
    expect(el.problems.map(p => p.id)).to.deep.equal(['never']);
    expect(card(el, 'never').classList.contains('is-invalid')).to.equal(true);
    expect(
      el.shadowRoot?.querySelector('.wf-problems')?.textContent,
    ).to.contain('1 problem');
  });

  it('adds a step from the palette, firing step-add then change', async () => {
    const el = await mount(makeValue(), true);
    const plus = el.shadowRoot?.querySelector(
      '[data-gap="root#1"] .wf-plus',
    ) as HTMLElement;
    plus.click();
    await el.updateComplete;
    const input = el.shadowRoot?.querySelector(
      '.wf-palette input',
    ) as HTMLInputElement;
    expect(input).to.not.equal(null);
    // Triggers are not offered between steps.
    expect(el.shadowRoot?.querySelectorAll('.wf-option').length).to.equal(3);
    input.value = 'mail';
    input.dispatchEvent(new Event('input'));
    await el.updateComplete;
    expect(el.shadowRoot?.querySelectorAll('.wf-option').length).to.equal(1);

    const adds: WorkflowStepAddDetail[] = [];
    el.addEventListener('step-add', e =>
      adds.push((e as CustomEvent<WorkflowStepAddDetail>).detail),
    );
    const original = el.value;
    setTimeout(() => key(input, 'Enter'));
    const change = (await oneEvent(
      el,
      'change',
    )) as CustomEvent<WorkflowChangeDetail>;
    expect(change.detail.reason).to.equal('add');
    expect(adds[0]).to.include({ index: 1, trigger: false });
    expect(el.value.steps.map(s => s.id)).to.deep.equal([
      'lookup',
      'email',
      'amount',
      'notify',
    ]);
    expect(original.steps.map(s => s.id)).to.deep.equal([
      'lookup',
      'amount',
      'notify',
    ]);
    expect(el.selected).to.equal('email');
    expect(el.shadowRoot?.querySelector('.wf-palette')).to.equal(null);
  });

  it('lets the app cancel step-add and adds a branch with two paths otherwise', async () => {
    const el = await mount(makeValue(), true);
    el.addEventListener('step-add', e => e.preventDefault(), { once: true });
    (
      el.shadowRoot?.querySelector(
        '[data-gap="root#3"] .wf-plus',
      ) as HTMLElement
    ).click();
    await el.updateComplete;
    (el.shadowRoot?.querySelector('.wf-option') as HTMLElement).click();
    await el.updateComplete;
    expect(el.value.steps).to.have.length(3);

    (
      el.shadowRoot?.querySelector(
        '[data-gap="path:amount:small#1"] .wf-plus',
      ) as HTMLElement
    ).click();
    await el.updateComplete;
    const branch = [
      ...(el.shadowRoot?.querySelectorAll('.wf-option') ?? []),
    ].find(o => o.textContent?.includes('Branch')) as HTMLElement;
    branch.click();
    await el.updateComplete;
    const small = findStep(el.value, 'auto');
    expect(small?.ref).to.deep.equal({
      kind: 'path',
      stepId: 'amount',
      pathId: 'small',
    });
    const added = findStep(el.value, 'branch')?.step;
    expect(added?.type).to.equal('branch');
    expect(added && 'paths' in added ? added.paths.length : 0).to.equal(2);
  });

  it('adds a trigger from the placeholder, offering only trigger steps', async () => {
    const el = await mount({ steps: [] }, true);
    (el.shadowRoot?.querySelector('.wf-add-trigger') as HTMLElement).click();
    await el.updateComplete;
    const options = el.shadowRoot?.querySelectorAll('.wf-option') ?? [];
    expect(options.length).to.equal(1);
    (options[0] as HTMLElement).click();
    await el.updateComplete;
    expect(el.value.trigger?.headline).to.equal('Record created');
  });

  it('removes a step with Delete, unless delete is canceled, and undoes it', async () => {
    const el = await mount(makeValue(), true);
    el.addEventListener('delete', e => e.preventDefault(), { once: true });
    key(card(el, 'notify'), 'Delete');
    await el.updateComplete;
    expect(el.value.steps).to.have.length(3);

    const changed = oneEvent(el, 'change');
    setTimeout(() => key(card(el, 'amount'), 'Delete'));
    const del = (await oneEvent(
      el,
      'delete',
    )) as CustomEvent<WorkflowDeleteDetail>;
    expect(del.detail.ids).to.deep.equal(['amount']);
    await changed;
    expect(el.value.steps.map(s => s.id)).to.deep.equal(['lookup', 'notify']);
    expect(el.canUndo).to.equal(true);
    el.undo();
    expect(el.value.steps.map(s => s.id)).to.deep.equal([
      'lookup',
      'amount',
      'notify',
    ]);
    el.redo();
    expect(el.value.steps.map(s => s.id)).to.deep.equal(['lookup', 'notify']);
  });

  it('moves focus in reading order and between paths with the arrow keys', async () => {
    const el = await mount();
    const focused = () =>
      (el.shadowRoot?.activeElement as HTMLElement | null)?.dataset.cardId;
    card(el, 't').focus();
    key(card(el, 't'), 'ArrowDown');
    await settle(el);
    expect(focused()).to.equal('lookup');
    key(card(el, 'lookup'), 'ArrowDown');
    await settle(el);
    key(card(el, 'amount'), 'ArrowDown');
    await settle(el);
    expect(focused()).to.equal('approve');
    key(card(el, 'approve'), 'ArrowRight');
    await settle(el);
    expect(focused()).to.equal('auto');
    key(card(el, 'auto'), 'ArrowDown');
    await settle(el);
    expect(focused()).to.equal('notify');
    key(card(el, 'notify'), 'Home');
    await settle(el);
    expect(focused()).to.equal('t');
    expect(card(el, 't').getAttribute('tabindex')).to.equal('0');
    expect(card(el, 'notify').getAttribute('tabindex')).to.equal('-1');
  });

  it('selects with Enter and moves a step with Alt + arrow', async () => {
    const el = await mount(makeValue(), true);
    setTimeout(() => key(card(el, 'lookup'), 'Enter'));
    const sel = (await oneEvent(
      el,
      'select',
    )) as CustomEvent<WorkflowSelectDetail>;
    expect(sel.detail.id).to.equal('lookup');
    expect(card(el, 'lookup').getAttribute('aria-selected')).to.equal('true');
    key(card(el, 'lookup'), 'ArrowDown', { altKey: true });
    await el.updateComplete;
    expect(el.value.steps.map(s => s.id)).to.deep.equal([
      'amount',
      'lookup',
      'notify',
    ]);
  });

  it('collapses a block with Shift + Enter into a summary card', async () => {
    const el = await mount();
    key(card(el, 'amount'), 'Enter', { shiftKey: true });
    await settle(el);
    expect(card(el, 'approve')).to.equal(null);
    expect(card(el, 'amount').getAttribute('aria-expanded')).to.equal('false');
    expect(card(el, 'amount').textContent).to.contain('2 paths, 2 steps');
    el.expand('amount');
    await settle(el);
    expect(card(el, 'approve')).to.not.equal(null);
  });

  it('applies inspector edits with updateStep', async () => {
    const el = await mount(makeValue(), true);
    setTimeout(() => el.updateStep('notify', { headline: 'Email submitter' }));
    const change = (await oneEvent(
      el,
      'change',
    )) as CustomEvent<WorkflowChangeDetail>;
    expect(change.detail.reason).to.equal('update');
    expect(card(el, 'notify').textContent).to.contain('Email submitter');
  });

  it('drags a step onto another gap to move it', async () => {
    const el = await mount(makeValue(), true);
    const source = card(el, 'notify');
    const gap = el.shadowRoot?.querySelector(
      '[data-gap="path:amount:big#1"]',
    ) as HTMLElement;
    const g = gap.getBoundingClientRect();
    const s = source.getBoundingClientRect();
    const fire = (type: string, x: number, y: number) =>
      source.dispatchEvent(
        new PointerEvent(type, {
          pointerId: 4,
          button: 0,
          clientX: x,
          clientY: y,
          bubbles: true,
          composed: true,
        }),
      );
    fire('pointerdown', s.left + 20, s.top + 10);
    fire('pointermove', g.left + g.width / 2, g.top + g.height / 2);
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('.wf-ghost')).to.not.equal(null);
    fire('pointerup', g.left + g.width / 2, g.top + g.height / 2);
    await el.updateComplete;
    expect(findStep(el.value, 'notify')?.ref).to.deep.equal({
      kind: 'path',
      stepId: 'amount',
      pathId: 'big',
    });
  });

  it('copies and pastes a block with new ids', async () => {
    const el = await mount(makeValue(), true);
    el.selected = 'amount';
    await el.updateComplete;
    const vp = el.shadowRoot?.querySelector('.wf-viewport') as HTMLElement;
    key(vp, 'c', { ctrlKey: true });
    key(vp, 'v', { ctrlKey: true });
    await el.updateComplete;
    expect(el.value.steps.map(s => s.id)).to.deep.equal([
      'lookup',
      'amount',
      'amount-copy',
      'notify',
    ]);
    expect(findStep(el.value, 'approve-copy')).to.not.equal(undefined);
  });

  it('lays out left to right with direction="horizontal"', async () => {
    const el = await mount();
    el.direction = 'horizontal';
    await settle(el);
    const a = card(el, 'lookup').getBoundingClientRect();
    const b = card(el, 'notify').getBoundingClientRect();
    expect(b.left).to.be.greaterThan(a.right);
  });
});

describe('workflow model', () => {
  it('moves steps across lists and within one', () => {
    const v = makeValue();
    const down = moveStep(v, 'lookup', { kind: 'root' }, 2);
    expect(down.steps.map(s => s.id)).to.deep.equal([
      'amount',
      'lookup',
      'notify',
    ]);
    const into = moveStep(
      v,
      'notify',
      { kind: 'path', stepId: 'amount', pathId: 'small' },
      0,
    );
    expect(findStep(into, 'notify')?.index).to.equal(0);
    expect(v.steps).to.have.length(3);
  });

  it('removes nested steps and the trigger', () => {
    const v = removeStep(makeValue(), 'approve');
    expect(findStep(v, 'approve')).to.equal(undefined);
    expect(removeStep(v, 't').trigger).to.equal(undefined);
  });

  it('knows when a list ends the flow', () => {
    expect(listTerminates([{ id: 'e', type: 'end' }])).to.equal(true);
    expect(listTerminates(makeValue().steps)).to.equal(false);
  });

  it('clones blocks with fresh ids and creates steps from palette entries', () => {
    const taken = new Set(['amount', 'big', 'small', 'approve', 'auto']);
    const original = makeValue().steps[1];
    const copy = cloneWithNewIds(original, taken);
    expect(copy.id).to.equal('amount-copy');
    expect(copy.type === 'branch' && copy.paths[0].steps[0].id).to.equal(
      'approve-copy',
    );
    const loop = createStep(
      { kind: 'loop', type: 'loop', headline: 'Loop' },
      new Set(['loop']),
    );
    expect(loop.id).to.equal('loop-2');
    expect(loop.type).to.equal('loop');
  });
});
