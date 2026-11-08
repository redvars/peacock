/// <reference types="mocha" />
import { html } from 'lit';
import { expect, fixture, oneEvent } from '@open-wc/testing';
import { Workflow } from '../src/workflow/workflow.js';
import { WorkflowTimeline } from '../src/workflow-timeline/workflow-timeline.js';
import { formatDuration } from '../src/workflow/workflow-format.js';
import type {
  WorkflowBreakpointDetail,
  WorkflowDebugActionDetail,
  WorkflowIterationDetail,
  WorkflowRun,
  WorkflowStepType,
  WorkflowValue,
} from '../src/workflow/workflow.js';

if (!customElements.get('wc-workflow'))
  customElements.define('wc-workflow', Workflow);
if (!customElements.get('wc-workflow-timeline')) {
  customElements.define('wc-workflow-timeline', WorkflowTimeline);
}

const value: WorkflowValue = {
  trigger: { id: 't', type: 'action', headline: 'Expense created' },
  steps: [
    {
      id: 'amount',
      type: 'branch',
      headline: 'Amount check',
      paths: [
        {
          id: 'big',
          label: 'Big',
          steps: [{ id: 'cfo', type: 'action', headline: 'CFO approval' }],
        },
        {
          id: 'small',
          label: 'Small',
          steps: [{ id: 'mgr', type: 'action', headline: 'Manager approval' }],
        },
      ],
    },
    {
      id: 'items',
      type: 'loop',
      headline: 'Line items',
      steps: [{ id: 'receipt', type: 'action', headline: 'Check receipt' }],
    },
    { id: 'erp', type: 'action', headline: 'Post to ERP' },
  ],
};

const run: WorkflowRun = {
  id: '184',
  status: 'paused',
  current: 'receipt',
  steps: {
    t: { status: 'success', startedAt: 0, durationMs: 100 },
    amount: { status: 'success', startedAt: 100, durationMs: 10 },
    cfo: { status: 'skipped' },
    mgr: { status: 'success', startedAt: 110, durationMs: 2500 },
    items: {
      status: 'running',
      startedAt: 2610,
      iterations: [
        { receipt: { status: 'success', durationMs: 900 } },
        {
          receipt: {
            status: 'failed',
            durationMs: 400,
            error: { message: 'Receipt image unreadable' },
          },
        },
        { receipt: { status: 'paused' } },
      ],
    },
    erp: { status: 'queued' },
  },
};

async function settle(el: HTMLElement & { updateComplete: Promise<boolean> }) {
  await el.updateComplete;
  await new Promise(resolve => {
    requestAnimationFrame(resolve);
  });
  await el.updateComplete;
}

async function mount(mode: 'debug' | 'history' = 'debug', editable = true) {
  const el = await fixture<Workflow>(
    html`<wc-workflow
      style="height: 900px"
      mode=${mode}
      ?editable=${editable}
      .value=${value}
      .run=${run}
    ></wc-workflow>`,
  );
  await settle(el);
  return el;
}

function card(el: Workflow, id: string) {
  return el.shadowRoot?.querySelector(`[data-card-id="${id}"]`) as HTMLElement;
}

describe('wc-workflow debugging', () => {
  it('shows each step’s status and draws the path taken', async () => {
    const el = await mount();
    expect(card(el, 'mgr').classList.contains('st-success')).to.equal(true);
    expect(card(el, 'cfo').classList.contains('st-skipped')).to.equal(true);
    expect(card(el, 'mgr').querySelector('.wf-status')?.textContent).to.contain(
      '2.5',
    );
    expect(card(el, 'mgr').getAttribute('aria-label')).to.contain('Succeeded');
    const conn = (id: string) =>
      el.shadowRoot?.querySelector(
        `.wf-connectors path[data-to="${id}"]`,
      ) as SVGPathElement;
    expect(conn('mgr').classList.contains('is-taken')).to.equal(true);
    expect(conn('cfo').classList.contains('is-untaken')).to.equal(true);
    expect(conn('receipt').classList.contains('is-active')).to.equal(true);
    expect(card(el, 'receipt').classList.contains('is-current')).to.equal(true);
  });

  it('turns editing off outside design mode', async () => {
    const el = await mount();
    expect(el.shadowRoot?.querySelector('.wf-plus')).to.equal(null);
    card(el, 'erp').dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Delete',
        bubbles: true,
        composed: true,
      }),
    );
    await el.updateComplete;
    expect(el.value.steps).to.have.length(3);
  });

  it('shows the picked loop iteration, with the failure and Retry from here', async () => {
    const el = await mount();
    const picker = el.shadowRoot?.querySelector(
      '.wf-iterations',
    ) as HTMLElement;
    expect(picker.textContent).to.contain('3 / 3');
    expect(picker.querySelectorAll('.wf-tick.st-failed').length).to.equal(1);
    expect(card(el, 'receipt').classList.contains('st-paused')).to.equal(true);

    const ticks = picker.querySelectorAll<HTMLElement>('.wf-tick');
    setTimeout(() => ticks[1].click());
    const change = (await oneEvent(
      el,
      'iteration-change',
    )) as CustomEvent<WorkflowIterationDetail>;
    expect(change.detail).to.deep.equal({ loopId: 'items', index: 1 });
    await settle(el);
    expect(card(el, 'receipt').classList.contains('st-failed')).to.equal(true);
    expect(card(el, 'receipt').textContent).to.contain(
      'Receipt image unreadable',
    );

    const retry = card(el, 'receipt').querySelector('.wf-retry') as HTMLElement;
    setTimeout(() => retry.click());
    const action = (await oneEvent(
      el,
      'debug-action',
    )) as CustomEvent<WorkflowDebugActionDetail>;
    expect(action.detail).to.deep.equal({ action: 'retry', stepId: 'receipt' });
  });

  it('toggles breakpoints with the gutter dot and F9', async () => {
    const el = await mount();
    const dot = card(el, 'erp').querySelector('.wf-bp') as HTMLElement;
    setTimeout(() => dot.click());
    const toggle = (await oneEvent(
      el,
      'breakpoint-toggle',
    )) as CustomEvent<WorkflowBreakpointDetail>;
    expect(toggle.detail).to.deep.equal({
      id: 'erp',
      enabled: true,
      breakpoints: ['erp'],
    });
    await el.updateComplete;
    expect(
      card(el, 'erp').querySelector('.wf-bp')?.classList.contains('is-on'),
    ).to.equal(true);
    card(el, 'erp').dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'F9',
        bubbles: true,
        composed: true,
        cancelable: true,
      }),
    );
    expect(el.breakpoints).to.deep.equal([]);
  });

  it('fires debug actions from the bar and the keyboard', async () => {
    const el = await mount();
    const bar = el.shadowRoot?.querySelector('.wf-debugbar') as HTMLElement;
    expect(bar.querySelector('.wf-run-status')?.textContent).to.contain(
      'Paused',
    );
    const actions: string[] = [];
    el.addEventListener('debug-action', e =>
      actions.push((e as CustomEvent<WorkflowDebugActionDetail>).detail.action),
    );
    (bar.querySelector('wc-icon-button') as HTMLElement).click();
    const vp = el.shadowRoot?.querySelector('.wf-viewport') as HTMLElement;
    vp.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'F10',
        bubbles: true,
        composed: true,
        cancelable: true,
      }),
    );
    vp.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'F5',
        shiftKey: true,
        bubbles: true,
        composed: true,
        cancelable: true,
      }),
    );
    expect(actions).to.deep.equal(['continue', 'step-over', 'stop']);
  });

  it('replays a run read-only in history mode', async () => {
    const el = await mount('history');
    expect(el.shadowRoot?.querySelector('.wf-debugbar')).to.equal(null);
    expect(el.shadowRoot?.querySelector('.wf-runbar')?.textContent).to.contain(
      'Run 184',
    );
    expect(el.shadowRoot?.querySelector('.wf-bp')).to.equal(null);
    expect(el.shadowRoot?.querySelector('.wf-retry')).to.equal(null);
  });

  it('pins a step’s data from the card menu', async () => {
    const el = await mount();
    el.updateStep('erp', { pinned: true });
    await el.updateComplete;
    expect(card(el, 'erp').querySelector('.wf-pin')).to.not.equal(null);
  });
});

describe('wc-workflow-timeline', () => {
  it('lists the steps that ran and selects one in the workflow', async () => {
    const wrapper = await fixture<HTMLDivElement>(
      html`<div>
        <wc-workflow
          id="wf"
          style="height: 600px"
          mode="history"
          .value=${value}
          .run=${run}
        ></wc-workflow>
        <wc-workflow-timeline for="wf"></wc-workflow-timeline>
      </div>`,
    );
    const wf = wrapper.querySelector('wc-workflow') as Workflow;
    const timeline = wrapper.querySelector(
      'wc-workflow-timeline',
    ) as WorkflowTimeline;
    await settle(wf);
    await settle(timeline);
    const rows =
      timeline.shadowRoot?.querySelectorAll<HTMLElement>('.row') ?? [];
    // trigger, amount, cfo (skipped), mgr, items — queued steps are left out
    expect(rows.length).to.equal(5);
    expect(rows[3].classList.contains('st-success')).to.equal(true);
    rows[3].click();
    await settle(wf);
    expect(wf.selected).to.equal('mgr');
    await timeline.updateComplete;
    expect(rows[3].classList.contains('is-selected')).to.equal(true);
  });
});

describe('wc-workflow palette scrolling', () => {
  it('leaves wheel events over the palette to the palette', async () => {
    const many: WorkflowStepType[] = Array.from({ length: 30 }, (_, i) => ({
      kind: `k${i}`,
      type: 'action',
      headline: `Step ${i}`,
    }));
    const el = await fixture<Workflow>(
      html`<wc-workflow
        style="height: 600px"
        editable
        .value=${{ steps: [] }}
        .stepTypes=${many}
      ></wc-workflow>`,
    );
    await settle(el);
    (el.shadowRoot?.querySelector('.wf-gap .wf-plus') as HTMLElement).click();
    await el.updateComplete;
    const list = el.shadowRoot?.querySelector(
      '.wf-palette-list',
    ) as HTMLElement;
    const before = el.view;
    const wheel = new WheelEvent('wheel', {
      deltaY: 120,
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    list.dispatchEvent(wheel);
    expect(el.view).to.deep.equal(before);
    expect(wheel.defaultPrevented).to.equal(false);
  });
});

describe('formatDuration', () => {
  it('picks a readable unit', () => {
    expect(formatDuration(420, 'en')).to.equal('420 ms');
    expect(formatDuration(1200, 'en')).to.equal('1.2 sec');
    expect(formatDuration(250000, 'en')).to.equal('4 min 10 sec');
    expect(formatDuration(8040000, 'en')).to.equal('2 hr 14 min');
    expect(formatDuration(undefined, 'en')).to.equal('');
  });
});
