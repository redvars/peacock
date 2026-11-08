import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import IndividualComponent from '@/IndividualComponent.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import { DiagramCanvasLink } from '@/__internal/diagram/canvas-link.js';
import {
  walk,
  type WorkflowRun,
  type WorkflowRunStep,
  type WorkflowRunStepStatus,
  type WorkflowStep,
  type WorkflowValue,
} from '@/workflow/workflow-model.js';
import { formatDuration } from '@/workflow/workflow-format.js';
import styles from './workflow-timeline.scss';

/** The parts of `wc-workflow` the timeline reads, without importing the component. */
interface WorkflowSource {
  value: WorkflowValue;
  run?: WorkflowRun;
  selected: string;
  selectStep(id: string): void;
}

interface Row {
  id: string;
  label: string;
  icon?: string;
  depth: number;
  run: WorkflowRunStep;
  start: number;
  end: number;
}

const STATUS_KEYS: Record<WorkflowRunStepStatus, string> = {
  queued: 'workflowStatusQueued',
  running: 'workflowStatusRunning',
  waiting: 'workflowStatusWaiting',
  paused: 'workflowStatusPaused',
  success: 'workflowStatusSuccess',
  failed: 'workflowStatusFailed',
  skipped: 'workflowStatusSkipped',
  canceled: 'workflowStatusCanceled',
};

function isWorkflow(el: unknown): el is WorkflowSource {
  return (
    !!el &&
    typeof (el as WorkflowSource).selectStep === 'function' &&
    'value' in (el as object)
  );
}

/**
 * @label Workflow timeline
 * @tag wc-workflow-timeline
 * @rawTag workflow-timeline
 * @summary The steps of a workflow run as bars on a shared time scale, in step with a `wc-workflow`.
 *
 * @overview
 * <p>Set <code>for</code> to the id of a <code>wc-workflow</code> in debug or history mode: the timeline
 * shows its <code>run</code>, follows its selection, and selects a step in the workflow when a row is
 * clicked. Without a workflow, set <code>value</code> and <code>run</code> yourself.</p>
 * <p>Each step that ran is a row with its name, a bar from when it started to when it finished
 * (running steps grow to now), coloured by status, and its duration. Steps without a
 * <code>startedAt</code> are laid end to end in reading order.</p>
 *
 * @example
 * ```html
 * <wc-workflow id="rule" mode="history"></wc-workflow>
 * <wc-workflow-timeline for="rule"></wc-workflow-timeline>
 * ```
 * @tags data
 */
@IndividualComponent
export class WorkflowTimeline extends LitElement {
  // ── Static

  static styles = [styles];

  // ── Properties

  /** Id of the `wc-workflow` to show. */
  @property({ type: String })
  for = '';

  /** The workflow, when the timeline is not linked to a `wc-workflow`. */
  @property({ attribute: false })
  value?: WorkflowValue;

  /** The run, when the timeline is not linked to a `wc-workflow`. */
  @property({ attribute: false })
  run?: WorkflowRun;

  /** The accessible name and heading. Defaults to "Run timeline". */
  @property({ type: String })
  label = '';

  // ── Private fields

  private readonly i18n = new I18nController(this);

  private readonly link = new DiagramCanvasLink(this, {
    forId: () => this.for,
    onSync: () => this.requestUpdate(),
  });

  // ── Lifecycle

  protected updated(changed: Map<string, unknown>) {
    if (changed.has('for') && changed.get('for') !== undefined)
      this.link.attach();
  }

  // ── Private methods

  private get source(): {
    value?: WorkflowValue;
    run?: WorkflowRun;
    selected: string;
  } {
    const linked = this.link.canvas;
    if (isWorkflow(linked)) {
      return {
        value: linked.value,
        run: linked.run,
        selected: linked.selected,
      };
    }
    return { value: this.value, run: this.run, selected: '' };
  }

  private rows(): Row[] {
    const { value, run } = this.source;
    if (!value || !run) return [];
    const steps: { step: WorkflowStep; depth: number }[] = [];
    if (value.trigger) steps.push({ step: value.trigger, depth: 1 });
    walk(value, ({ step, depth }) => steps.push({ step, depth }));
    const now = Date.now();
    let cursor = 0;
    const rows: Row[] = [];
    for (const { step, depth } of steps) {
      const r = run.steps[step.id];
      if (r && r.status !== 'queued') {
        const live =
          r.status === 'running' ||
          r.status === 'waiting' ||
          r.status === 'paused';
        const start = r.startedAt ?? cursor;
        let duration = r.durationMs ?? 0;
        if (live && r.startedAt !== undefined && r.startedAt > 1e11) {
          duration = Math.max(duration, now - r.startedAt);
        }
        rows.push({
          id: step.id,
          label:
            step.headline ??
            (step.type === 'end' ? this.i18n.t('workflowEnd') : step.id),
          icon: step.icon,
          depth,
          run: r,
          start,
          end: start + duration,
        });
        cursor = Math.max(cursor, start + duration);
      }
    }
    return rows;
  }

  private select(id: string) {
    const linked = this.link.canvas;
    if (isWorkflow(linked)) linked.selectStep(id);
  }

  // ── Render

  protected render() {
    const rows = this.rows();
    const { run, selected } = this.source;
    const t0 = Math.min(...rows.map(r => r.start));
    const t1 = Math.max(...rows.map(r => r.end));
    const span = Math.max(t1 - t0, 1);
    const heading = this.label || this.i18n.t('workflowRunTimeline');
    return html`<section class="timeline" aria-label=${heading}>
      <header class="head">
        <span class="title">${heading}</span>
        ${run?.durationMs !== undefined
          ? html`<span class="total"
              >${formatDuration(run.durationMs, this.i18n.locale)}</span
            >`
          : nothing}
      </header>
      <div class="rows" role="list">
        ${rows.map(row => {
          const left = ((row.start - t0) / span) * 100;
          const width = Math.max(((row.end - row.start) / span) * 100, 0.6);
          const status = this.i18n.t(
            STATUS_KEYS[row.run.status] as 'workflowStatusQueued',
          );
          const duration = formatDuration(row.run.durationMs, this.i18n.locale);
          return html`<div role="listitem">
            <button
              type="button"
              class=${classMap({
                row: true,
                [`st-${row.run.status}`]: true,
                'is-selected': selected === row.id,
              })}
              aria-label=${[row.label, status, duration]
                .filter(Boolean)
                .join(', ')}
              aria-current=${selected === row.id ? 'true' : 'false'}
              @click=${() => this.select(row.id)}
            >
              <span
                class="name"
                style="padding-inline-start: ${(row.depth - 1) * 12}px"
              >
                ${row.icon
                  ? html`<wc-icon name=${row.icon}></wc-icon>`
                  : nothing}<span class="label">${row.label}</span>
              </span>
              <span class="track"
                ><span
                  class="bar"
                  style="left: ${left}%; width: ${width}%"
                ></span
              ></span>
              <span class="duration">${duration || status}</span>
            </button>
          </div>`;
        })}
      </div>
    </section>`;
  }
}
