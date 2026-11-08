import {
  html,
  nothing,
  render as renderTemplate,
  svg,
  type PropertyValues,
  type SVGTemplateResult,
  type TemplateResult,
} from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import IndividualComponent from '@/IndividualComponent.js';
import { DiagramCanvasElement } from '@/__internal/diagram/canvas-base.js';
import { roundedPath } from '@/__internal/diagram/geometry.js';
import { History } from '@/__internal/diagram/history.js';
import {
  animateOut,
  prefersReducedMotion,
} from '@/__internal/diagram/motion.js';
import type { DiagramOverview } from '@/__internal/diagram/host.js';
import type {
  DiagramRect,
  DiagramView,
  DiagramViewportDetail,
} from '@/__internal/diagram/types.js';
import type { Menu } from '@/menu/menu/menu.js';
import {
  WORKFLOW_LOGIC_STEPS,
  allIds,
  cloneWithNewIds,
  contains,
  countInside,
  createStep,
  findStep,
  getList,
  insertStep,
  isReached,
  listKey,
  listTerminates,
  moveStep,
  removeStep,
  replaceStep,
  stepTerminates,
  walk,
  type WorkflowActionStep,
  type WorkflowListRef,
  type WorkflowRun,
  type WorkflowRunStep,
  type WorkflowRunStepStatus,
  type WorkflowStep,
  type WorkflowStepType,
  type WorkflowValue,
} from './workflow-model.js';
import { formatDuration } from './workflow-format.js';
import styles from './workflow.scss';

export type {
  WorkflowAccent,
  WorkflowActionStep,
  WorkflowAssignee,
  WorkflowBranchStep,
  WorkflowEndStep,
  WorkflowField,
  WorkflowListRef,
  WorkflowLoopStep,
  WorkflowOutput,
  WorkflowPath,
  WorkflowRun,
  WorkflowRunStep,
  WorkflowRunStepStatus,
  WorkflowStep,
  WorkflowStepType,
  WorkflowTool,
  WorkflowValue,
  WorkflowWaitStep,
} from './workflow-model.js';

export { WORKFLOW_LOGIC_STEPS } from './workflow-model.js';

export type WorkflowDirection = 'vertical' | 'horizontal';

export type WorkflowMode = 'design' | 'debug' | 'history';

export type WorkflowDebugAction =
  | 'continue'
  | 'pause'
  | 'step-over'
  | 'step-into'
  | 'restart'
  | 'stop'
  | 'retry';

/** Detail of `debug-action`. `stepId` is set for `retry`. */
export interface WorkflowDebugActionDetail {
  action: WorkflowDebugAction;
  stepId?: string;
}

/** Detail of `breakpoint-toggle`. */
export interface WorkflowBreakpointDetail {
  id: string;
  enabled: boolean;
  breakpoints: string[];
}

/** Detail of `iteration-change`. */
export interface WorkflowIterationDetail {
  loopId: string;
  /** Zero-based. */
  index: number;
}

export type WorkflowDensity = 'compact' | 'standard' | 'expanded';

export type WorkflowChangeReason =
  | 'add'
  | 'remove'
  | 'move'
  | 'paste'
  | 'update'
  | 'undo'
  | 'redo';

/** Detail of `change`. */
export interface WorkflowChangeDetail {
  value: WorkflowValue;
  reason: WorkflowChangeReason;
}

/** Detail of `select`. */
export interface WorkflowSelectDetail {
  id: string;
  step: WorkflowStep;
}

/** Detail of `step-add`. */
export interface WorkflowStepAddDetail {
  stepType: WorkflowStepType;
  /** The list the step goes into, and where. */
  list: WorkflowListRef;
  index: number;
  /** Whether the step becomes the trigger. */
  trigger: boolean;
}

/** Detail of `delete`. */
export interface WorkflowDeleteDetail {
  ids: string[];
}

/** Detail of `viewport-change`. */
export type WorkflowViewportDetail = DiagramViewportDetail;

/** A step that needs attention. */
export interface WorkflowProblem {
  id: string;
  message: string;
}

interface Point {
  m: number;
  c: number;
}

/** Below this zoom a fitted workflow is hard to read, so it starts at its beginning instead. */
const MIN_FIT_ZOOM = 0.6;

/** Pointer travel, in screen pixels, before a press on a step becomes a drag. */
const DRAG_THRESHOLD = 5;

/** Screen pixels within which a dragged step snaps to a gap. */
const DROP_DISTANCE = 64;

const CORNER = 20;

const TRIGGER_GAP = '__trigger';

const DATA_PILL = /\{\{\s*([^}]+?)\s*\}\}/g;

/** Elements inside a card that handle their own pointer input. */
const INTERACTIVE =
  'button, a, input, select, textarea, wc-icon-button, wc-button, [contenteditable]';

/** Shared between workflows on a page, like the system clipboard. */
let clipboard: WorkflowStep | undefined;

/**
 * @label Workflow
 * @tag wc-workflow
 * @rawTag workflow
 * @summary A structured builder for business rules and processes: steps, branches that merge back, parallel paths, loops, error paths and ends.
 *
 * @overview
 * <p>Set <code>value</code> to a trigger and a list of steps. Steps are <code>action</code>,
 * <code>wait</code> and <code>end</code> cards, <code>branch</code> and <code>parallel</code> blocks whose
 * paths sit side by side and merge back below (a path that ends draws no merge), and
 * <code>loop</code> frames. An action's <code>onError</code> steps run as a side path. The layout is
 * automatic: top to bottom, or left to right with <code>direction="horizontal"</code>, joined by rounded
 * connectors.</p>
 * <p>Cards show a tinted icon, a headline and the kind of step, up to three <code>fields</code>
 * (<code>{{Step.output}}</code> in a value renders as a data pill), and a footer with outputs, tools or
 * an assignee. <code>density</code> shows less (<code>compact</code>) or everything
 * (<code>expanded</code>). Put your own card in <code>slot="step:&lt;id&gt;"</code>.</p>
 * <p>With <code>editable</code>, a "+" on every connector opens a searchable palette built from
 * <code>stepTypes</code>; <code>step-add</code> fires first and can be canceled to show your own dialog.
 * Drag a step to another "+" to move it, delete it with Delete, duplicate with Ctrl+D, copy and paste,
 * and undo with Ctrl+Z. Steps glide to their new places. Every edit fires <code>change</code> with the
 * new <code>value</code>; selecting a step fires <code>select</code>, for your inspector. Apply its edits
 * with <code>updateStep()</code>.</p>
 * <p>The canvas is infinite, like <code>wc-diagram</code>: pan, zoom, <code>start-position</code>,
 * <code>home()</code>, and the <code>controls</code> and <code>minimap</code> slots. Steps are a tree for
 * screen readers. Up and Down move through steps in reading order, Left and Right move between the
 * paths of a branch (in a horizontal workflow the keys swap), Insert opens the palette after the
 * focused step, Alt + Up or Down moves it, and Shift + Enter collapses or expands a block.</p>
 * <p><code>mode="debug"</code> and <code>mode="history"</code> show a <code>run</code> from your engine:
 * each card gets its status and duration, the path taken is drawn solid and paths not taken are
 * dashed, the running step pulses and a dot travels into each step the run reaches
 * (<code>follow</code> keeps it in view). A failed step shows its error with "Retry from here". In
 * debug mode a debug bar fires <code>debug-action</code> (Continue F5, Step over F10, Step into F11,
 * Restart, Stop Shift+F5), and the dot left of each card toggles a breakpoint (F9) and fires
 * <code>breakpoint-toggle</code>. A loop shows an iteration picker; the steps inside show the picked
 * iteration. History mode is read-only. Editing is off outside <code>design</code>. Pair it with
 * <code>wc-workflow-timeline</code> for a timeline of the run.</p>
 *
 * @example
 * ```html
 * <wc-workflow id="rule" editable style="height: 600px">
 *   <wc-diagram-controls slot="controls"></wc-diagram-controls>
 * </wc-workflow>
 * <script>
 *   document.getElementById('rule').value = {
 *     trigger: { id: 'created', type: 'action', headline: 'Expense created', icon: 'bolt' },
 *     steps: [
 *       {
 *         id: 'amount', type: 'branch', headline: 'Amount check',
 *         paths: [
 *           { id: 'big', label: 'amount > 1,000', steps: [{ id: 'approve', type: 'action', headline: 'Manager approval' }] },
 *           { id: 'small', label: 'Otherwise', isDefault: true, steps: [] }
 *         ]
 *       },
 *       { id: 'end', type: 'end' }
 *     ]
 *   };
 * </script>
 * ```
 *
 * @slot controls - A `wc-diagram-controls`, shown at the bottom start corner.
 * @slot minimap - A `wc-diagram-minimap`, shown at the bottom end corner.
 * @slot step:<id> - Custom content for the step with that id, in place of the built-in card.
 *
 * @fires {CustomEvent<WorkflowSelectDetail>} select - A step was chosen with a click, Enter or Space. Detail contains `{ id, step }`.
 * @fires {CustomEvent<WorkflowStepAddDetail>} step-add - Before a step from the palette is added. Cancel it to add the step your own way. Detail contains `{ stepType, list, index, trigger }`.
 * @fires {CustomEvent<WorkflowDeleteDetail>} delete - Before steps are removed. Cancel it to keep them. Detail contains `{ ids }`.
 * @fires {CustomEvent<WorkflowChangeDetail>} change - After every edit. Detail contains `{ value, reason }`.
 * @fires {CustomEvent<WorkflowViewportDetail>} viewport-change - Once per frame while the camera moves and once when it settles. Detail contains `{ x, y, zoom, settled }`.
 * @fires {CustomEvent<WorkflowDebugActionDetail>} debug-action - A debug bar button, a debug shortcut or "Retry from here" was used. Detail contains `{ action, stepId }`.
 * @fires {CustomEvent<WorkflowBreakpointDetail>} breakpoint-toggle - A breakpoint was set or cleared in debug mode. Detail contains `{ id, enabled, breakpoints }`.
 * @fires {CustomEvent<WorkflowIterationDetail>} iteration-change - A different loop iteration was picked. Detail contains `{ loopId, index }`.
 *
 * @cssprop --workflow-card-width - Width of a standard card. Defaults to 280px.
 * @cssprop --workflow-connector-color - Colour of connectors. Defaults to a mix of primary and outline-variant.
 * @cssprop --workflow-background - Canvas background. Defaults to surface-container-lowest.
 * @tags data
 */
@IndividualComponent
export class Workflow extends DiagramCanvasElement {
  // ── Static

  static styles = [styles];

  // ── Properties

  /** The workflow: a trigger and its steps. Replaced with a new object, never mutated, on every edit. */
  @property({ attribute: false })
  value: WorkflowValue = { steps: [] };

  /** Entries of the add-step palette. Defaults to the logic steps (branch, parallel, loop, wait, end). */
  @property({ attribute: false })
  stepTypes: WorkflowStepType[] = WORKFLOW_LOGIC_STEPS;

  /** Lays the workflow out top to bottom or left to right. */
  @property({ type: String, reflect: true })
  direction: WorkflowDirection = 'vertical';

  /** How much each card shows: the header only, up to three fields, or everything. */
  @property({ type: String, reflect: true })
  density: WorkflowDensity = 'standard';

  /** Id of the selected step. */
  @property({ type: String, reflect: true })
  selected = '';

  /**
   * `design` edits the workflow. `debug` shows a live `run` with a debug bar and breakpoints.
   * `history` replays a past `run`, read-only. Editing is off outside `design`.
   */
  @property({ type: String, reflect: true })
  mode: WorkflowMode = 'design';

  /** The run to show in `debug` and `history` modes. Your engine produces it. */
  @property({ attribute: false })
  run?: WorkflowRun;

  /** Ids of steps with a breakpoint, shown and toggled in `debug` mode. */
  @property({ attribute: false })
  breakpoints: string[] = [];

  /** Keeps the step that is running in view as the run moves. */
  @property({ type: Boolean })
  follow = false;

  // ── State

  @state()
  private _palette?: {
    ref: WorkflowListRef;
    index: number;
    trigger: boolean;
    x: number;
    y: number;
    query: string;
    active: number;
  };

  @state()
  private _collapsed = new Set<string>();

  @state()
  private _focusId = '';

  @state()
  private _hoverGap = '';

  @state()
  private _drag?: { id: string; x: number; y: number; target?: string };

  @state()
  private _menuFor = '';

  @state()
  private _announcement = '';

  /** The iteration shown for each loop, when the person picked one. */
  @state()
  private _iterations = new Map<string, number>();

  // ── Private fields

  @query('.wf-viewport')
  private readonly _viewportEl?: HTMLElement;

  @query('.wf-world')
  private readonly _worldEl?: HTMLElement;

  @query('.wf-root')
  private readonly _rootEl?: HTMLElement;

  @query('.wf-connectors')
  private readonly _connectorsEl?: SVGSVGElement;

  @query('wc-menu')
  private readonly _menu?: Menu;

  @query('.wf-tokens')
  private readonly _tokensEl?: SVGSVGElement;

  /** For each step, the loops it is inside, outermost first. */
  private loopParents = new Map<string, string[]>();

  /** Step statuses at the last render, to spot steps the run just reached. */
  private lastStatuses = new Map<string, WorkflowRunStepStatus>();

  private pendingTokens: string[] = [];

  private readonly history = new History<WorkflowValue>();

  private readonly handledKeys = new WeakSet<Event>();

  /** Gap keys to the list and index they insert at, from the last render. */
  private gaps = new Map<string, { ref: WorkflowListRef; index: number }>();

  private unreachable = new Set<string>();

  private seenCollapsed = new Set<string>();

  private connectorsDirty = true;

  private flipBefore?: Map<string, DOMRect>;

  private trackFrame = 0;

  private rootObserver?: ResizeObserver;

  private problemIndex = -1;

  private stepDrag?: {
    pointerId: number;
    startX: number;
    startY: number;
    id: string;
    element: HTMLElement;
    moved: boolean;
  };

  // ── Lifecycle

  disconnectedCallback() {
    super.disconnectedCallback();
    this.rootObserver?.disconnect();
    cancelAnimationFrame(this.trackFrame);
    this.endStepDrag(false);
  }

  protected willUpdate(changed: PropertyValues<this>) {
    super.willUpdate(changed);
    if (changed.has('value')) {
      this.syncCollapsed();
      this.unreachable = this.findUnreachable();
      this.loopParents = this.findLoopParents();
      if (this.selected && !findStep(this.value, this.selected))
        this.selected = '';
    }
    if (changed.has('run') || changed.has('mode')) this.trackRunChanges();
    if (
      changed.has('run') ||
      changed.has('mode') ||
      changed.has('breakpoints') ||
      changed.has('_iterations' as keyof Workflow) ||
      changed.has('value') ||
      changed.has('direction') ||
      changed.has('density') ||
      changed.has('editable') ||
      changed.has('readonly') ||
      changed.has('_collapsed' as keyof Workflow) ||
      changed.has('_hoverGap' as keyof Workflow) ||
      changed.has('_drag' as keyof Workflow) ||
      changed.has('selected')
    ) {
      this.connectorsDirty = true;
    }
  }

  protected firstUpdated() {
    if (typeof ResizeObserver !== 'undefined' && this._rootEl) {
      this.rootObserver = new ResizeObserver(() => {
        this.layoutConnectors();
        this.requestUpdate();
      });
      this.rootObserver.observe(this._rootEl);
    }
    document.fonts?.ready.then(() => {
      this.connectorsDirty = true;
      this.requestUpdate();
    });
  }

  protected updated(changed: PropertyValues<this>) {
    if (this.connectorsDirty) {
      this.connectorsDirty = false;
      this.layoutConnectors();
    }
    this.playFlip();
    if (this.pendingTokens.length) {
      this.animateTokens(this.pendingTokens);
      this.pendingTokens = [];
    }
    if (
      changed.has('run') &&
      this.follow &&
      this.mode !== 'design' &&
      this.run?.current
    ) {
      this.keepInView(this.run.current);
    }
    super.updated(changed);
  }

  // ── Debugging

  /** Whether editing is on: `editable`, not `readonly`, and in `design` mode. */
  private get editing(): boolean {
    return this.editable && !this.readonly && this.mode === 'design';
  }

  /** Whether step cards offer a menu (edit actions in design mode, pinning in debug mode). */
  private get hasMenu(): boolean {
    return this.editable && !this.readonly && this.mode !== 'history';
  }

  private findLoopParents(): Map<string, string[]> {
    const out = new Map<string, string[]>();
    const visitList = (steps: WorkflowStep[], loops: string[]) => {
      for (const step of steps) {
        out.set(step.id, loops);
        if (step.type === 'loop') visitList(step.steps, [...loops, step.id]);
        else if (step.type === 'branch' || step.type === 'parallel') {
          for (const p of step.paths) visitList(p.steps, loops);
        } else if (step.type === 'action' && step.onError) {
          visitList(step.onError, loops);
        }
      }
    };
    visitList(this.value.steps, []);
    return out;
  }

  /** The iteration a loop shows: the one picked, else the latest. */
  private iterationIndex(loopId: string, total: number): number {
    const picked = this._iterations.get(loopId);
    return picked !== undefined && picked < total ? picked : total - 1;
  }

  /** What the run did with a step, looking inside the shown iteration of each loop around it. */
  private runStep(id: string): WorkflowRunStep | undefined {
    const { run } = this;
    if (!run || this.mode === 'design') return undefined;
    let record = run.steps;
    for (const loopId of this.loopParents.get(id) ?? []) {
      const iterations = record[loopId]?.iterations;
      if (!iterations?.length) break;
      record =
        iterations[this.iterationIndex(loopId, iterations.length)] ?? record;
    }
    return record[id] ?? run.steps[id];
  }

  private statusLabel(
    status: WorkflowRunStepStatus | WorkflowRun['status'],
  ): string {
    const key = {
      queued: 'workflowStatusQueued',
      running: 'workflowStatusRunning',
      waiting: 'workflowStatusWaiting',
      paused: 'workflowStatusPaused',
      success: 'workflowStatusSuccess',
      failed: 'workflowStatusFailed',
      skipped: 'workflowStatusSkipped',
      canceled: 'workflowStatusCanceled',
    }[status] as Parameters<typeof this.i18n.t>[0];
    return this.i18n.t(key) as string;
  }

  /** Notes the steps the run has just reached, for the travelling token and announcements. */
  private trackRunChanges() {
    const next = new Map<string, WorkflowRunStepStatus>();
    const ids: string[] = [];
    if (this.value.trigger) ids.push(this.value.trigger.id);
    walk(this.value, ({ step }) => ids.push(step.id));
    const reached: string[] = [];
    let latest: { id: string; status: WorkflowRunStepStatus } | undefined;
    for (const id of ids) {
      const status = this.runStep(id)?.status;
      if (status) {
        next.set(id, status);
        const before = this.lastStatuses.get(id);
        if (before !== status) latest = { id, status };
        if (isReached(status) && !isReached(before) && this.lastStatuses.size) {
          reached.push(id);
        }
      }
    }
    if (latest && this.lastStatuses.size) {
      const step = findStep(this.value, latest.id)?.step;
      if (step) {
        this.announce(
          this.i18n.t('workflowStepStatus')(
            this.stepLabel(step),
            this.statusLabel(latest.status),
          ),
        );
      }
    }
    this.lastStatuses = next;
    this.pendingTokens = reached;
  }

  /** Sends a dot along the connector into each step the run just reached. */
  private animateTokens(ids: string[]) {
    const layer = this._tokensEl;
    const lines = this._connectorsEl;
    if (!layer || !lines || prefersReducedMotion()) return;
    for (const id of ids) {
      const path = lines.querySelector<SVGPathElement>(
        `path[data-to="${CSS.escape(id)}"]`,
      );
      if (path && typeof path.getTotalLength === 'function') {
        const length = path.getTotalLength();
        const halo = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'circle',
        );
        const dot = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'circle',
        );
        halo.setAttribute('class', 'wf-token-halo');
        halo.setAttribute('r', '12');
        dot.setAttribute('class', 'wf-token');
        dot.setAttribute('r', '5');
        layer.append(halo, dot);
        const start = performance.now();
        const duration = 520;
        const step = (now: number) => {
          const p = Math.min(1, (now - start) / duration);
          const eased = p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2;
          const point = path.getPointAtLength(length * eased);
          for (const c of [halo, dot]) {
            c.setAttribute('cx', String(point.x));
            c.setAttribute('cy', String(point.y));
          }
          if (p < 1) requestAnimationFrame(step);
          else {
            halo.remove();
            dot.remove();
          }
        };
        requestAnimationFrame(step);
      }
    }
  }

  private toggleBreakpoint(id: string) {
    const enabled = !this.breakpoints.includes(id);
    this.breakpoints = enabled
      ? [...this.breakpoints, id]
      : this.breakpoints.filter(b => b !== id);
    this.emit<WorkflowBreakpointDetail>('breakpoint-toggle', {
      id,
      enabled,
      breakpoints: this.breakpoints,
    });
  }

  private debugAction(action: WorkflowDebugAction, stepId?: string) {
    this.emit<WorkflowDebugActionDetail>('debug-action', { action, stepId });
  }

  private setIteration(loopId: string, index: number) {
    const next = new Map(this._iterations);
    next.set(loopId, index);
    this._iterations = next;
    this.emit<WorkflowIterationDetail>('iteration-change', { loopId, index });
  }

  /** How a loop's iteration went overall, for its tick. */
  private static iterationStatus(
    record: Record<string, WorkflowRunStep>,
  ): WorkflowRunStepStatus {
    const statuses = Object.values(record).map(r => r.status);
    if (statuses.includes('failed')) return 'failed';
    if (
      statuses.some(s => s === 'running' || s === 'paused' || s === 'waiting')
    ) {
      return 'running';
    }
    if (
      statuses.length &&
      statuses.every(s => s === 'success' || s === 'skipped')
    ) {
      return 'success';
    }
    return 'queued';
  }

  // ── Public API

  /** Whether `undo()` has something to undo. */
  get canUndo(): boolean {
    return this.history.canUndo;
  }

  /** Whether `redo()` has something to redo. */
  get canRedo(): boolean {
    return this.history.canRedo;
  }

  /** Steps that need attention: those marked `invalid`, and steps that can never run. */
  get problems(): WorkflowProblem[] {
    const out: WorkflowProblem[] = [];
    const visit = (step: WorkflowStep) => {
      if (step.invalid)
        out.push({ id: step.id, message: step.errorText ?? '' });
      else if (this.unreachable.has(step.id)) {
        out.push({ id: step.id, message: this.i18n.t('workflowUnreachable') });
      }
    };
    if (this.value.trigger) visit(this.value.trigger);
    walk(this.value, ({ step }) => visit(step));
    return out;
  }

  undo() {
    const previous = this.history.undo(this.value);
    if (previous) this.commit(previous, 'undo', false);
  }

  redo() {
    const next = this.history.redo(this.value);
    if (next) this.commit(next, 'redo', false);
  }

  /** Forgets the undo and redo history, for example after saving. */
  clearHistory() {
    this.history.clear();
    this.listeners.notify();
  }

  /** Changes a step, for example from an inspector. Records an undo step and fires `change`. */
  updateStep(id: string, patch: Partial<WorkflowStep>) {
    if (!findStep(this.value, id)) return;
    this.commit(
      replaceStep(
        this.value,
        id,
        step => ({ ...step, ...patch, id, type: step.type }) as WorkflowStep,
      ),
      'update',
    );
  }

  /** Removes a step and everything inside it, after a cancelable `delete` event. */
  removeStep(id: string) {
    const found = findStep(this.value, id);
    if (!found) return;
    if (!this.emit<WorkflowDeleteDetail>('delete', { ids: [id] }, true)) return;
    const neighbour = this.neighbourAfterRemoval(id);
    const el = this.cardElement(id)?.closest('.wf-item');
    animateOut(el ? [el] : [], () => {
      this.commit(removeStep(this.value, id), 'remove');
      this.announce(
        this.i18n.t('workflowStepRemoved')(this.stepLabel(found.step)),
      );
      if (this.selected === id) this.selected = '';
      if (neighbour) this.focusStep(neighbour);
    });
  }

  /** Moves keyboard focus to a step and pans it into view. */
  focusStep(id: string) {
    this._focusId = id;
    this.updateComplete.then(() => {
      const el = this.cardElement(id);
      el?.focus({ preventScroll: true });
      this.keepInView(id);
    });
  }

  /** Selects a step as a click would, fires `select`, and brings it into view. */
  selectStep(id: string) {
    const step = findStep(this.value, id)?.step;
    if (!step) return;
    this.select(step);
    this.focusStep(id);
  }

  collapse(id: string) {
    const next = new Set(this._collapsed);
    next.add(id);
    this._collapsed = next;
  }

  expand(id: string) {
    const next = new Set(this._collapsed);
    next.delete(id);
    this._collapsed = next;
  }

  // ── Canvas hooks

  protected viewportElement() {
    return this._viewportEl;
  }

  protected contentBounds(): DiagramRect | undefined {
    const root = this._rootEl;
    if (
      !root ||
      (!this.value.trigger && !this.value.steps.length && !this.editing)
    ) {
      return undefined;
    }
    return { x: 0, y: 0, width: root.offsetWidth, height: root.offsetHeight };
  }

  protected selectionRects(): DiagramRect[] {
    const r = this.selected ? this.itemRect(this.selected) : undefined;
    return r ? [r] : [];
  }

  protected itemRect(id: string): DiagramRect | undefined {
    const el = this.cardElement(id);
    return el ? this.rectOf(el) : undefined;
  }

  protected firstItemRect(): DiagramRect | undefined {
    const el = this._rootEl?.querySelector('[data-card-id], .wf-add-trigger');
    return el ? this.rectOf(el) : undefined;
  }

  protected overviewItems(): DiagramOverview['items'] {
    const root = this._rootEl;
    if (!root || !this._worldEl) return [];
    return Array.from(root.querySelectorAll<HTMLElement>('[data-card-id]')).map(
      el => ({
        ...this.rectOf(el),
        selected: el.dataset.cardId === this.selected,
      }),
    );
  }

  protected isBackground(target: EventTarget | null): boolean {
    const el = target as Element | null;
    if (!el) return false;
    if (el === this._viewportEl) return true;
    const cls = el.classList;
    return (
      !!cls &&
      [
        'wf-world',
        'wf-root',
        'wf-seq',
        'wf-paths',
        'wf-path',
        'wf-path-tail',
        'wf-gap',
        'wf-connectors',
        'wf-item',
        'wf-error-col',
        'wf-error-spacer',
      ].some(c => cls.contains(c))
    );
  }

  protected onBackgroundClick() {
    this._palette = undefined;
    this.selected = '';
  }

  /** Fits the workflow, or shows its start at 60% when fitting it all would be too small to read. */
  protected computeStartView(): DiagramView {
    if (this.startView || this.startPosition !== 'fit')
      return super.computeStartView();
    const bounds = this.contentBounds();
    if (!bounds) return super.computeStartView();
    const fitted = this.viewport.viewForRect(bounds, this.padding);
    if (fitted.zoom >= MIN_FIT_ZOOM) return fitted;
    const zoom = MIN_FIT_ZOOM;
    const { width, height } = this.viewport.size();
    return this.direction === 'vertical'
      ? {
          zoom,
          x: width / 2 - (bounds.x + bounds.width / 2) * zoom,
          y: this.padding - bounds.y * zoom,
        }
      : {
          zoom,
          x: this.padding - bounds.x * zoom,
          y: height / 2 - (bounds.y + bounds.height / 2) * zoom,
        };
  }

  // ── Private methods: data

  /** Records an undo step (unless restoring one), animates the change and fires `change`. */
  private commit(
    next: WorkflowValue,
    reason: WorkflowChangeReason,
    record = true,
  ) {
    if (record) this.history.push(this.value);
    this.captureFlip();
    this.value = next;
    this.emit<WorkflowChangeDetail>('change', { value: next, reason });
    this.listeners.notify();
  }

  private announce(message: string) {
    this._announcement = '';
    requestAnimationFrame(() => {
      this._announcement = message;
    });
  }

  private syncCollapsed() {
    const next = new Set(this._collapsed);
    let changed = false;
    const visit = (step: WorkflowStep) => {
      if (step.collapsed && !this.seenCollapsed.has(step.id)) {
        this.seenCollapsed.add(step.id);
        next.add(step.id);
        changed = true;
      }
    };
    walk(this.value, ({ step }) => visit(step));
    if (changed) this._collapsed = next;
  }

  /** Steps after a step that always ends the flow, in the same list. */
  private findUnreachable(): Set<string> {
    const out = new Set<string>();
    const visitList = (steps: WorkflowStep[], dead: boolean) => {
      let gone = dead;
      for (const step of steps) {
        if (gone) out.add(step.id);
        if (step.type === 'branch' || step.type === 'parallel') {
          for (const p of step.paths) visitList(p.steps, gone);
        } else if (step.type === 'loop') {
          visitList(step.steps, gone);
        } else if (step.type === 'action' && step.onError) {
          visitList(step.onError, gone);
        }
        if (stepTerminates(step)) gone = true;
      }
    };
    visitList(this.value.steps, false);
    return out;
  }

  private stepLabel(step: WorkflowStep): string {
    if (step.headline) return step.headline;
    if (step.type === 'end') return this.i18n.t('workflowEnd');
    return step.id;
  }

  private neighbourAfterRemoval(id: string): string | undefined {
    const found = findStep(this.value, id);
    if (!found || found.index < 0) return this.value.steps[0]?.id;
    const list = getList(this.value, found.ref) ?? [];
    return (
      list[found.index + 1]?.id ??
      list[found.index - 1]?.id ??
      (found.ref.kind === 'root' ? this.value.trigger?.id : found.ref.stepId)
    );
  }

  /** Steps in reading order, skipping what is inside collapsed blocks. */
  private navOrder(): string[] {
    const ids: string[] = [];
    if (this.value.trigger) ids.push(this.value.trigger.id);
    walk(this.value, ({ step }) => ids.push(step.id), {
      skip: step => this._collapsed.has(step.id),
    });
    return ids;
  }

  // ── Private methods: geometry

  private cardElement(id: string): HTMLElement | null {
    return (
      this._rootEl?.querySelector<HTMLElement>(
        `[data-card-id="${CSS.escape(id)}"]`,
      ) ?? null
    );
  }

  /** An element's box in canvas coordinates. */
  private rectOf(el: Element): DiagramRect {
    const world = this._worldEl;
    const { zoom } = this.viewport.view;
    const r = el.getBoundingClientRect();
    const w = world?.getBoundingClientRect();
    return {
      x: (r.left - (w?.left ?? 0)) / zoom,
      y: (r.top - (w?.top ?? 0)) / zoom,
      width: r.width / zoom,
      height: r.height / zoom,
    };
  }

  private keepInView(id: string) {
    const r = this.itemRect(id);
    if (!r) return;
    const v = this.viewport.visibleRect();
    const inside =
      r.x >= v.x &&
      r.y >= v.y &&
      r.x + r.width <= v.x + v.width &&
      r.y + r.height <= v.y + v.height;
    if (!inside) this.centerOn(r.x + r.width / 2, r.y + r.height / 2);
  }

  /** Draws every connector from the measured positions of cards, pills and joins. */
  private layoutConnectors() {
    const root = this._rootEl;
    const target = this._connectorsEl;
    if (!root || !target || !this._worldEl) return;
    const vertical = this.direction === 'vertical';
    const S = (r: DiagramRect) => (vertical ? r.y : r.x);
    const E = (r: DiagramRect) => (vertical ? r.y + r.height : r.x + r.width);
    const C = (r: DiagramRect) =>
      vertical ? r.x + r.width / 2 : r.y + r.height / 2;
    const CS = (r: DiagramRect) => (vertical ? r.x : r.y);
    const CE = (r: DiagramRect) => (vertical ? r.x + r.width : r.y + r.height);
    const MC = (r: DiagramRect) =>
      vertical ? r.y + r.height / 2 : r.x + r.width / 2;
    const P = (m: number, c: number) =>
      vertical ? { x: c, y: m } : { x: m, y: c };
    const q = (selector: string) => root.querySelector<HTMLElement>(selector);
    const rect = (el: Element) => this.rectOf(el);
    const paths: SVGTemplateResult[] = [];
    const { run } = this;
    const showRun = !!run && this.mode !== 'design';
    const finished =
      !!run && ['success', 'failed', 'canceled'].includes(run.status);
    // A connector is taken when the run reached the step it leads to (or, for a merge, when the
    // step it leaves succeeded), and not taken when that step was skipped or the run is over.
    const runClass = (to?: string, from?: string): string => {
      if (!showRun) return '';
      let status: WorkflowRunStepStatus | undefined;
      if (to) status = this.runStep(to)?.status;
      else if (from && this.runStep(from)?.status === 'success')
        status = 'success';
      if (isReached(status)) {
        return status === 'success' || status === 'failed'
          ? ' is-taken'
          : ' is-taken is-active';
      }
      if (status === 'skipped' || finished) return ' is-untaken';
      return '';
    };
    const line = (
      points: { x: number; y: number }[],
      cls: string,
      to?: string,
      from?: string,
    ) => {
      paths.push(
        svg`<path class=${cls + runClass(to, from)} data-to=${to ?? nothing} d=${roundedPath(points, CORNER)}></path>`,
      );
    };
    const link = (from: Point, to: Point, cls: string, toId?: string) => {
      if (Math.abs(from.c - to.c) < 0.5) {
        line([P(from.m, from.c), P(to.m, from.c)], cls, toId);
      } else {
        const mid = (from.m + to.m) / 2;
        line(
          [P(from.m, from.c), P(mid, from.c), P(mid, to.c), P(to.m, to.c)],
          cls,
          toId,
        );
      }
    };
    const gapClass = (ref: WorkflowListRef, index: number, extra = '') => {
      const key = `${listKey(ref)}#${index}`;
      return `wf-conn${extra}${this._hoverGap === key || this._drag?.target === key ? ' is-hover' : ''}`;
    };

    const walkList = (
      steps: WorkflowStep[],
      ref: WorkflowListRef,
      entry: Point | null,
      extra = '',
    ): Point | null => {
      let prev = entry;
      steps.forEach((step, index) => {
        const inEl = q(`[data-in-for="${CSS.escape(step.id)}"]`);
        if (!inEl) return;
        const r = rect(inEl);
        if (prev) {
          link(
            prev,
            { m: S(r), c: C(r) },
            gapClass(ref, index, extra),
            step.id,
          );
        }
        // walkList and layoutStep call each other for nested paths.
        // eslint-disable-next-line no-use-before-define
        prev = layoutStep(step, extra);
      });
      const trailing = q(
        `[data-gap="${CSS.escape(`${listKey(ref)}#${steps.length}`)}"] .wf-plus`,
      );
      if (prev && trailing) {
        const r = rect(trailing);
        link(
          prev,
          { m: S(r), c: C(r) },
          gapClass(ref, steps.length, `${extra} is-stub`),
        );
      }
      return prev;
    };

    const layoutStep = (step: WorkflowStep, extra: string): Point | null => {
      const card = q(`[data-card-id="${CSS.escape(step.id)}"]`);
      if (!card) return null;
      const cr = rect(card);
      if (step.type === 'end') return null;
      const collapsed = this._collapsed.has(step.id);
      if ((step.type === 'branch' || step.type === 'parallel') && !collapsed) {
        const rowEl = q(`[data-paths-for="${CSS.escape(step.id)}"]`);
        const joinEl = q(`[data-join-for="${CSS.escape(step.id)}"]`);
        const row = rowEl ? rect(rowEl) : cr;
        const join = joinEl ? rect(joinEl) : undefined;
        for (const p of step.paths) {
          const pillEl = q(`[data-pill="${CSS.escape(p.id)}"]`);
          if (pillEl) {
            const pr = rect(pillEl);
            const fork = (E(cr) + S(pr)) / 2;
            line(
              [
                P(E(cr), C(cr)),
                P(fork, C(cr)),
                P(fork, C(pr)),
                P(S(pr), C(pr)),
              ],
              `wf-conn${extra}`,
              p.steps[0]?.id,
            );
            const exit = walkList(
              p.steps,
              { kind: 'path', stepId: step.id, pathId: p.id },
              { m: E(pr), c: C(pr) },
              extra,
            );
            if (exit && join) {
              const merge = (E(row) + S(join)) / 2;
              line(
                [
                  P(exit.m, exit.c),
                  P(merge, exit.c),
                  P(merge, C(join)),
                  P(S(join), C(join)),
                ],
                `wf-conn${extra}`,
                undefined,
                p.steps[p.steps.length - 1]?.id,
              );
            }
          }
        }
        return join ? { m: E(join), c: C(join) } : null;
      }
      if (step.type === 'loop' && !collapsed) {
        const frameEl = q(`[data-loop-for="${CSS.escape(step.id)}"]`);
        if (!frameEl) return null;
        const fr = rect(frameEl);
        const exit = walkList(
          step.steps,
          { kind: 'loop', stepId: step.id },
          { m: E(cr), c: C(cr) },
          extra,
        );
        const firstEl = step.steps[0]
          ? q(`[data-in-for="${CSS.escape(step.steps[0].id)}"]`)
          : null;
        if (exit && firstEl) {
          const first = rect(firstEl);
          const lane = CS(fr) + 18;
          const bottom = Math.min(exit.m + 16, E(fr) - 10);
          const tipC = CS(first) - 2;
          line(
            [
              P(exit.m, exit.c),
              P(bottom, exit.c),
              P(bottom, lane),
              P(MC(first), lane),
              P(MC(first), tipC),
            ],
            `wf-conn wf-loop-back${extra}${
              showRun && (this.runStep(step.id)?.iterations?.length ?? 0) > 1
                ? ' is-taken'
                : ''
            }`,
          );
          const tip = P(MC(first), tipC);
          const arrow = vertical
            ? `M ${tip.x} ${tip.y} l -8 -4.5 l 0 9 z`
            : `M ${tip.x} ${tip.y} l -4.5 -8 l 9 0 z`;
          paths.push(svg`<path class="wf-arrow" d=${arrow}></path>`);
        }
        return { m: E(fr), c: C(fr) };
      }
      if (step.type === 'action' && step.onError) {
        const pillEl = q(`[data-error-pill="${CSS.escape(step.id)}"]`);
        if (pillEl) {
          const pr = rect(pillEl);
          line(
            [P(MC(cr), CE(cr)), P(MC(cr), C(pr)), P(S(pr), C(pr))],
            'wf-conn is-error',
            step.onError[0]?.id,
          );
          walkList(
            step.onError,
            { kind: 'error', stepId: step.id },
            { m: E(pr), c: C(pr) },
            ' is-error',
          );
        }
      }
      if (stepTerminates(step)) return null;
      return { m: E(cr), c: C(cr) };
    };

    const triggerEl = q('[data-trigger]');
    const entry = triggerEl
      ? { m: E(rect(triggerEl)), c: C(rect(triggerEl)) }
      : null;
    walkList(this.value.steps, { kind: 'root' }, entry);
    renderTemplate(svg`${paths}`, target);
  }

  /** Keeps connectors on their cards while cards glide. */
  private trackConnectors(duration: number) {
    cancelAnimationFrame(this.trackFrame);
    const until = performance.now() + duration;
    const step = () => {
      this.layoutConnectors();
      if (performance.now() < until)
        this.trackFrame = requestAnimationFrame(step);
    };
    this.trackFrame = requestAnimationFrame(step);
  }

  private captureFlip() {
    const root = this._rootEl;
    if (!root || prefersReducedMotion()) return;
    const before = new Map<string, DOMRect>();
    root.querySelectorAll<HTMLElement>('[data-flip]').forEach(el => {
      before.set(el.dataset.flip ?? '', el.getBoundingClientRect());
    });
    this.flipBefore = before;
  }

  /** Slides moved elements from where they were and pops in new ones. */
  private playFlip() {
    const before = this.flipBefore;
    const root = this._rootEl;
    this.flipBefore = undefined;
    if (!before || !root) return;
    const { zoom } = this.viewport.view;
    const moved = new Map<Element, { x: number; y: number }>();
    let animated = false;
    root.querySelectorAll<HTMLElement>('[data-flip]').forEach(el => {
      if (typeof el.animate !== 'function') return;
      const was = before.get(el.dataset.flip ?? '');
      const now = el.getBoundingClientRect();
      if (!was) {
        el.animate(
          [
            { opacity: 0, transform: 'scale(0.92)' },
            { opacity: 1, transform: 'none' },
          ],
          { duration: 260, easing: 'cubic-bezier(0.2, 0.9, 0.3, 1.2)' },
        );
        animated = true;
        return;
      }
      const total = {
        x: (was.left - now.left) / zoom,
        y: (was.top - now.top) / zoom,
      };
      moved.set(el, total);
      const parent = el.parentElement?.closest('[data-flip]');
      const inherited = (parent && moved.get(parent)) || { x: 0, y: 0 };
      const dx = total.x - inherited.x;
      const dy = total.y - inherited.y;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;
      el.animate(
        [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }],
        {
          duration: 320,
          easing: 'cubic-bezier(0.2, 0, 0, 1)',
        },
      );
      animated = true;
    });
    if (animated) this.trackConnectors(340);
  }

  // ── Private methods: palette

  private openPalette(
    ref: WorkflowListRef,
    index: number,
    anchor: Element | null,
    trigger = false,
  ) {
    const vp = this._viewportEl;
    if (!vp || !this.editing) return;
    const vr = vp.getBoundingClientRect();
    const ar = anchor?.getBoundingClientRect() ?? vr;
    const width = 300;
    const height = 380;
    const x = Math.max(
      8,
      Math.min(ar.right - vr.left + 12, vr.width - width - 8),
    );
    const y = Math.max(
      8,
      Math.min(ar.top - vr.top - 24, vr.height - height - 8),
    );
    this._palette = { ref, index, trigger, x, y, query: '', active: 0 };
    this.updateComplete.then(() => {
      this.renderRoot
        .querySelector<HTMLInputElement>('.wf-palette input')
        ?.focus();
    });
  }

  private closePalette(refocus = true) {
    const p = this._palette;
    this._palette = undefined;
    if (refocus && p) {
      const prev = getList(this.value, p.ref)?.[p.index - 1];
      if (prev) this.focusStep(prev.id);
      else this._viewportEl?.focus({ preventScroll: true });
    }
  }

  private paletteEntries(): WorkflowStepType[] {
    const p = this._palette;
    if (!p) return [];
    const needle = p.query.trim().toLowerCase();
    return this.stepTypes.filter(
      t =>
        !!t.trigger === p.trigger &&
        (!needle ||
          t.headline.toLowerCase().includes(needle) ||
          (t.supportingText ?? '').toLowerCase().includes(needle) ||
          (t.category ?? '').toLowerCase().includes(needle)),
    );
  }

  private choose(type: WorkflowStepType) {
    const p = this._palette;
    if (!p) return;
    this._palette = undefined;
    const allowed = this.emit<WorkflowStepAddDetail>(
      'step-add',
      { stepType: type, list: p.ref, index: p.index, trigger: p.trigger },
      true,
    );
    if (!allowed) return;
    const step = createStep(type, allIds(this.value));
    const next = p.trigger
      ? {
          ...this.value,
          trigger: { ...step, type: 'action' } as WorkflowActionStep,
        }
      : insertStep(this.value, p.ref, p.index, step);
    this.commit(next, 'add');
    this.selected = step.id;
    this.emit<WorkflowSelectDetail>('select', { id: step.id, step });
    this.announce(this.i18n.t('workflowStepAdded')(this.stepLabel(step)));
    this.focusStep(step.id);
  }

  private onPaletteKeyDown = (event: KeyboardEvent) => {
    const p = this._palette;
    if (!p) return;
    const entries = this.paletteEntries();
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      const count = Math.max(entries.length, 1);
      this._palette = { ...p, active: (p.active + delta + count) % count };
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const entry = entries[p.active];
      if (entry) this.choose(entry);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.closePalette();
    }
    event.stopPropagation();
    this.handledKeys.add(event);
  };

  // ── Private methods: keyboard

  private onCardKeyDown(event: KeyboardEvent, step: WorkflowStep) {
    if (event.target !== event.currentTarget) return;
    const handled = (fn: () => void) => {
      event.preventDefault();
      this.handledKeys.add(event);
      fn();
    };
    const vertical = this.direction === 'vertical';
    const mainNext = vertical ? 'ArrowDown' : 'ArrowRight';
    const mainPrev = vertical ? 'ArrowUp' : 'ArrowLeft';
    const crossNext = vertical ? 'ArrowRight' : 'ArrowDown';
    const crossPrev = vertical ? 'ArrowLeft' : 'ArrowUp';
    const order = this.navOrder();
    const at = order.indexOf(step.id);
    const isTrigger = this.value.trigger?.id === step.id;
    const { key } = event;
    if (key === 'Enter' && event.shiftKey && this.isBlock(step)) {
      handled(() =>
        this._collapsed.has(step.id)
          ? this.expand(step.id)
          : this.collapse(step.id),
      );
    } else if (key === 'Enter' || key === ' ') {
      handled(() => this.select(step));
    } else if (
      event.altKey &&
      (key === mainNext || key === mainPrev) &&
      this.editing &&
      !isTrigger
    ) {
      handled(() => this.nudge(step.id, key === mainNext ? 1 : -1));
    } else if (key === mainNext && order[at + 1]) {
      handled(() => this.focusStep(order[at + 1]));
    } else if (key === mainPrev && at > 0) {
      handled(() => this.focusStep(order[at - 1]));
    } else if (key === crossNext || key === crossPrev) {
      const target = this.crossTarget(step, key === crossNext ? 1 : -1);
      if (target) handled(() => this.focusStep(target));
    } else if (key === 'Home' && order[0]) {
      handled(() => this.focusStep(order[0]));
    } else if (key === 'End' && order.length) {
      handled(() => this.focusStep(order[order.length - 1]));
    } else if ((key === 'Delete' || key === 'Backspace') && this.editing) {
      handled(() => this.removeStep(step.id));
    } else if (key === 'Insert' && this.editing && !isTrigger) {
      handled(() => this.openPaletteAfter(step));
    } else if ((key === 'F10' && event.shiftKey) || key === 'ContextMenu') {
      if (this.hasMenu) {
        handled(() =>
          this.openMenu(step.id, event.currentTarget as HTMLElement),
        );
      }
    } else if (key === 'F9' && this.mode === 'debug' && step.type !== 'end') {
      handled(() => this.toggleBreakpoint(step.id));
    }
  }

  private onViewportKeyDown = (event: KeyboardEvent) => {
    if (event.defaultPrevented || this.handledKeys.has(event)) return;
    const origin = event.composedPath()[0];
    if (
      origin instanceof HTMLElement &&
      origin.matches('input, textarea, select, [contenteditable]')
    ) {
      return;
    }
    const mod = event.ctrlKey || event.metaKey;
    const key = event.key.toLowerCase();
    const run = (fn: () => void) => {
      event.preventDefault();
      fn();
    };
    if (mod && key === 'z' && this.editing)
      run(() => (event.shiftKey ? this.redo() : this.undo()));
    else if (mod && key === 'y' && this.editing) run(() => this.redo());
    else if (mod && key === 'c' && this.selected)
      run(() => this.copy(this.selected));
    else if (mod && key === 'v' && this.editing) run(() => this.paste());
    else if (mod && key === 'd' && this.editing && this.selected) {
      run(() => {
        this.copy(this.selected);
        this.paste();
      });
    } else if (key === 'escape') {
      run(() => {
        this._palette = undefined;
        this.selected = '';
      });
    } else if (this.mode === 'debug' && this.handleDebugKey(event)) {
      event.preventDefault();
    } else this.handleCanvasKey(event);
  };

  /** F5 continue or pause (Shift: stop, Ctrl+Shift: restart), F10 step over, F11 step into. */
  private handleDebugKey(event: KeyboardEvent): boolean {
    const mod = event.ctrlKey || event.metaKey;
    if (event.key === 'F5') {
      if (mod && event.shiftKey) this.debugAction('restart');
      else if (event.shiftKey) this.debugAction('stop');
      else
        this.debugAction(this.run?.status === 'running' ? 'pause' : 'continue');
      return true;
    }
    if (event.key === 'F10' && !event.shiftKey) {
      this.debugAction('step-over');
      return true;
    }
    if (event.key === 'F11') {
      this.debugAction('step-into');
      return true;
    }
    return false;
  }

  private crossTarget(step: WorkflowStep, delta: 1 | -1): string | undefined {
    const found = findStep(this.value, step.id);
    if (!found) return undefined;
    if (delta === 1 && step.type === 'action' && step.onError?.[0])
      return step.onError[0].id;
    if (found.ref.kind === 'error' && delta === -1) return found.ref.stepId;
    if (found.ref.kind !== 'path') return undefined;
    const { stepId, pathId } = found.ref;
    const owner = findStep(this.value, stepId)?.step;
    if (!owner || (owner.type !== 'branch' && owner.type !== 'parallel'))
      return undefined;
    const i = owner.paths.findIndex(p => p.id === pathId);
    const path = owner.paths[i + delta];
    if (!path?.steps.length) return undefined;
    return path.steps[Math.min(found.index, path.steps.length - 1)].id;
  }

  private nudge(id: string, delta: 1 | -1) {
    const found = findStep(this.value, id);
    if (!found || found.index < 0) return;
    const list = getList(this.value, found.ref) ?? [];
    const target = found.index + delta;
    if (target < 0 || target >= list.length) return;
    this.commit(
      moveStep(this.value, id, found.ref, delta === 1 ? target + 1 : target),
      'move',
    );
    this.announce(this.i18n.t('workflowStepMoved')(this.stepLabel(found.step)));
    this.focusStep(id);
  }

  private openPaletteAfter(step: WorkflowStep) {
    const found = findStep(this.value, step.id);
    if (!found) return;
    const ref = found.index < 0 ? { kind: 'root' as const } : found.ref;
    const index = found.index + 1;
    const gap = this._rootEl?.querySelector(
      `[data-gap="${CSS.escape(`${listKey(ref)}#${index}`)}"]`,
    );
    this.openPalette(ref, index, gap ?? this.cardElement(step.id));
  }

  private copy(id: string) {
    const step = findStep(this.value, id)?.step;
    if (step && step.id !== this.value.trigger?.id) clipboard = step;
  }

  private paste() {
    if (!clipboard) return;
    const step = cloneWithNewIds(clipboard, allIds(this.value));
    const found = this.selected
      ? findStep(this.value, this.selected)
      : undefined;
    const ref =
      found && found.index >= 0 ? found.ref : { kind: 'root' as const };
    // After the selected step; at the start when the trigger is selected; else at the end.
    let index = this.value.steps.length;
    if (found) index = found.index >= 0 ? found.index + 1 : 0;
    this.commit(insertStep(this.value, ref, index, step), 'paste');
    this.select(step);
    this.focusStep(step.id);
  }

  private select(step: WorkflowStep) {
    this.selected = step.id;
    this.emit<WorkflowSelectDetail>('select', { id: step.id, step });
  }

  private isBlock(step: WorkflowStep) {
    return (
      step.type === 'branch' || step.type === 'parallel' || step.type === 'loop'
    );
  }

  private nextProblem() {
    const { problems } = this;
    if (!problems.length) return;
    this.problemIndex = (this.problemIndex + 1) % problems.length;
    const { id } = problems[this.problemIndex];
    const step = findStep(this.value, id)?.step;
    if (step) this.select(step);
    this.zoomTo(id);
    this.focusStep(id);
  }

  // ── Private methods: menu

  private openMenu(id: string, anchor: HTMLElement) {
    const menu = this._menu;
    if (!menu) return;
    this._menuFor = id;
    menu.anchorElement = anchor;
    this.updateComplete.then(() => menu.show('first'));
  }

  private onMenuActivate = (event: Event) => {
    const item = (
      event as CustomEvent<{ item: HTMLElement & { value: string } }>
    ).detail?.item;
    const id = this._menuFor;
    if (!item || !id) return;
    if (item.value === 'duplicate') {
      this.copy(id);
      this.selected = id;
      this.paste();
    } else if (item.value === 'collapse') this.collapse(id);
    else if (item.value === 'expand') this.expand(id);
    else if (item.value === 'delete') this.removeStep(id);
    else if (item.value === 'pin') this.updateStep(id, { pinned: true });
    else if (item.value === 'unpin') this.updateStep(id, { pinned: false });
  };

  // ── Private methods: dragging steps

  private onCardPointerDown(event: PointerEvent, step: WorkflowStep) {
    if (event.button !== 0 || this.viewport.spaceHeld) return;
    const origin = event.composedPath()[0];
    if (origin instanceof Element && origin.closest(INTERACTIVE)) return;
    event.stopPropagation();
    const element = event.currentTarget as HTMLElement;
    element.focus({ preventScroll: true });
    this._focusId = step.id;
    this.stepDrag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      id: step.id,
      element,
      moved: false,
    };
    try {
      element.setPointerCapture(event.pointerId);
    } catch {
      // Synthetic pointers cannot be captured.
    }
    element.addEventListener('pointermove', this.onStepPointerMove);
    element.addEventListener('pointerup', this.onStepPointerUp);
    element.addEventListener('pointercancel', this.onStepPointerCancel);
  }

  private onStepPointerMove = (event: PointerEvent) => {
    const drag = this.stepDrag;
    if (!drag || event.pointerId !== drag.pointerId) return;
    const canMove = this.editing && drag.id !== this.value.trigger?.id;
    if (!canMove) return;
    if (
      !drag.moved &&
      Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) <
        DRAG_THRESHOLD
    ) {
      return;
    }
    drag.moved = true;
    const vr = this._viewportEl?.getBoundingClientRect();
    this._drag = {
      id: drag.id,
      x: event.clientX - (vr?.left ?? 0),
      y: event.clientY - (vr?.top ?? 0),
      target: this.dropTarget(drag.id, event.clientX, event.clientY),
    };
  };

  private onStepPointerUp = (event: PointerEvent) => {
    if (!this.stepDrag || event.pointerId !== this.stepDrag.pointerId) return;
    this.endStepDrag(true);
  };

  private onStepPointerCancel = () => {
    this.endStepDrag(false);
  };

  private endStepDrag(commit: boolean) {
    const drag = this.stepDrag;
    if (!drag) return;
    this.stepDrag = undefined;
    const target = this._drag?.target;
    this._drag = undefined;
    const { element } = drag;
    element.removeEventListener('pointermove', this.onStepPointerMove);
    element.removeEventListener('pointerup', this.onStepPointerUp);
    element.removeEventListener('pointercancel', this.onStepPointerCancel);
    try {
      if (element.hasPointerCapture(drag.pointerId))
        element.releasePointerCapture(drag.pointerId);
    } catch {
      // The pointer is already gone.
    }
    if (!commit) return;
    const step = findStep(this.value, drag.id)?.step;
    if (!step) return;
    if (!drag.moved) {
      this.select(step);
      return;
    }
    const gap = target ? this.gaps.get(target) : undefined;
    if (!gap) return;
    this.commit(moveStep(this.value, drag.id, gap.ref, gap.index), 'move');
    this.announce(this.i18n.t('workflowStepMoved')(this.stepLabel(step)));
  }

  /** The nearest gap the dragged step can drop into. */
  private dropTarget(
    id: string,
    clientX: number,
    clientY: number,
  ): string | undefined {
    const found = findStep(this.value, id);
    if (!found) return undefined;
    let best: { key: string; d: number } | undefined;
    for (const [key, gap] of this.gaps) {
      const owner =
        gap.ref.kind === 'root'
          ? undefined
          : findStep(this.value, gap.ref.stepId)?.step;
      const inside = owner ? contains(found.step, owner.id) : false;
      const same = listKey(gap.ref) === listKey(found.ref);
      const noOp =
        same && (gap.index === found.index || gap.index === found.index + 1);
      const el = this._rootEl?.querySelector(`[data-gap="${CSS.escape(key)}"]`);
      if (!inside && !noOp && el) {
        const r = el.getBoundingClientRect();
        const d = Math.hypot(
          clientX - (r.left + r.width / 2),
          clientY - (r.top + r.height / 2),
        );
        if (d < DROP_DISTANCE && (!best || d < best.d)) best = { key, d };
      }
    }
    return best?.key;
  }

  // ── Render helpers

  private renderValue(text: string) {
    const parts: (string | TemplateResult)[] = [];
    let last = 0;
    for (const match of text.matchAll(DATA_PILL)) {
      const index = match.index ?? 0;
      if (index > last) parts.push(text.slice(last, index));
      const ref = match[1];
      const source = ref.split('.')[0].trim();
      let icon = 'data_object';
      const { trigger } = this.value;
      if (
        trigger &&
        (source === 'Trigger' ||
          source === trigger.headline ||
          source === trigger.id)
      ) {
        icon = trigger.icon ?? 'bolt';
      } else {
        walk(this.value, ({ step }) => {
          if (step.headline === source || step.id === source)
            icon = step.icon ?? icon;
        });
      }
      parts.push(
        html`<span class="wf-ref"
          ><wc-icon name=${icon}></wc-icon>${ref.replace(/\./, ' · ')}</span
        >`,
      );
      last = index + match[0].length;
    }
    if (last < text.length) parts.push(text.slice(last));
    return parts;
  }

  private renderCardBody(step: WorkflowStep) {
    if (this.density === 'compact') return nothing;
    const limit = this.density === 'expanded' ? Infinity : 3;
    const rows: [string, string][] = [];
    if (step.type === 'action')
      rows.push(
        ...(step.fields ?? []).map(f => [f.label, f.value] as [string, string]),
      );
    if (step.type === 'wait' && step.until)
      rows.push([this.i18n.t('workflowUntil'), step.until]);
    const collapsed = this._collapsed.has(step.id) && this.isBlock(step);
    let pathCount = 1;
    if (step.type === 'branch' || step.type === 'parallel') {
      pathCount = step.paths.length;
    }
    const summary = collapsed
      ? this.i18n.t('workflowCollapsedSummary')(pathCount, countInside(step))
      : '';
    if (!rows.length && !summary) return nothing;
    return html`<div class="wf-card-body">
      ${summary ? html`<div class="wf-summary">${summary}</div>` : nothing}
      ${rows
        .slice(0, limit)
        .map(
          ([label, value]) =>
            html`<div class="wf-field">
              <span class="wf-field-label">${label}</span
              ><span class="wf-field-value">${this.renderValue(value)}</span>
            </div>`,
        )}
    </div>`;
  }

  private renderStatus(run: WorkflowRunStep) {
    const icon = {
      queued: 'schedule',
      running: 'progress_activity',
      waiting: 'hourglass_top',
      paused: 'pause_circle',
      success: 'check_circle',
      failed: 'error',
      skipped: 'block',
      canceled: 'cancel',
    }[run.status];
    const done = run.status === 'success' || run.status === 'failed';
    const text =
      done && run.durationMs !== undefined
        ? formatDuration(run.durationMs, this.i18n.locale)
        : this.statusLabel(run.status);
    return html`<span
      class=${`wf-status st-${run.status}`}
      title=${this.statusLabel(run.status)}
      ><wc-icon name=${icon}></wc-icon>${text}${run.attempts && run.attempts > 1
        ? html`<span class="wf-attempts">×${run.attempts}</span>`
        : nothing}</span
    >`;
  }

  private renderRunError(step: WorkflowStep, run: WorkflowRunStep | undefined) {
    if (!run || run.status !== 'failed' || !run.error) return nothing;
    return html`<div class="wf-run-error">
      <span
        class="wf-run-error-text"
        title=${run.error.detail ?? run.error.message}
        >${run.error.message}</span
      >
      ${this.mode === 'debug'
        ? html`<button
            class="wf-retry"
            type="button"
            tabindex="-1"
            @click=${() => this.debugAction('retry', step.id)}
          >
            <wc-icon name="replay"></wc-icon>${this.i18n.t(
              'workflowRetryFromHere',
            )}
          </button>`
        : nothing}
    </div>`;
  }

  /** The iteration picker in a loop's header: previous, "3 / 12", next and a tick per iteration. */
  private renderIterations(loopId: string) {
    const iterations = this.runStep(loopId)?.iterations;
    if (!iterations?.length) return nothing;
    const total = iterations.length;
    const index = this.iterationIndex(loopId, total);
    const ticks = total <= 24;
    return html`<div
      class="wf-iterations"
      role="group"
      aria-label=${this.i18n.t('workflowIteration')(index + 1, total)}
    >
      <wc-icon-button
        variant="text"
        shape="round"
        size="xs"
        aria-label=${this.i18n.t('workflowPreviousIteration')}
        ?disabled=${index === 0}
        @click=${() => this.setIteration(loopId, index - 1)}
        ><wc-icon name="chevron_left"></wc-icon
      ></wc-icon-button>
      <span class="wf-iteration-label"
        >${this.i18n.t('workflowIterationShort')(index + 1, total)}</span
      >
      <wc-icon-button
        variant="text"
        shape="round"
        size="xs"
        aria-label=${this.i18n.t('workflowNextIteration')}
        ?disabled=${index === total - 1}
        @click=${() => this.setIteration(loopId, index + 1)}
        ><wc-icon name="chevron_right"></wc-icon
      ></wc-icon-button>
      ${ticks
        ? html`<span class="wf-ticks">
            ${iterations.map(
              (record, i) =>
                html`<button
                  type="button"
                  tabindex="-1"
                  class=${classMap({
                    'wf-tick': true,
                    [`st-${Workflow.iterationStatus(record)}`]: true,
                    'is-current': i === index,
                  })}
                  aria-label=${this.i18n.t('workflowIteration')(i + 1, total)}
                  @click=${() => this.setIteration(loopId, i)}
                ></button>`,
            )}
          </span>`
        : nothing}
    </div>`;
  }

  private renderDebugBar() {
    const { run } = this;
    if (this.mode === 'history') {
      if (!run) return nothing;
      return html`<div class=${`wf-runbar st-${run.status}`} role="status">
        ${this.i18n.t('workflowRunSummary')(
          run.id,
          this.statusLabel(run.status),
          formatDuration(run.durationMs, this.i18n.locale),
        )}
      </div>`;
    }
    if (this.mode !== 'debug') return nothing;
    const finished =
      !run ||
      run.status === 'success' ||
      run.status === 'failed' ||
      run.status === 'canceled';
    const running = run?.status === 'running';
    const button = (
      action: WorkflowDebugAction,
      icon: string,
      label: string,
      disabled = false,
    ) =>
      html`<wc-icon-button
        shape="round"
        variant=${action === 'continue' || action === 'pause'
          ? 'filled'
          : 'tonal'}
        aria-label=${label}
        tooltip=${label}
        ?disabled=${disabled}
        @click=${() => this.debugAction(action)}
        ><wc-icon name=${icon}></wc-icon
      ></wc-icon-button>`;
    return html`<div
      class="wf-debugbar"
      role="toolbar"
      aria-label=${this.i18n.t('workflowDebugBar')}
    >
      ${run
        ? html`<span class=${`wf-run-status st-${run.status}`}
            >${this.statusLabel(run.status)}</span
          >`
        : nothing}
      ${running
        ? button('pause', 'pause', `${this.i18n.t('workflowPause')} (F5)`)
        : button(
            'continue',
            'play_arrow',
            `${this.i18n.t('workflowContinue')} (F5)`,
            finished && !!run,
          )}
      ${button(
        'step-over',
        'step_over',
        `${this.i18n.t('workflowStepOver')} (F10)`,
        finished,
      )}
      ${button(
        'step-into',
        'step_into',
        `${this.i18n.t('workflowStepInto')} (F11)`,
        finished,
      )}
      ${button(
        'restart',
        'restart_alt',
        `${this.i18n.t('workflowRestart')} (Ctrl+Shift+F5)`,
      )}
      ${button(
        'stop',
        'stop',
        `${this.i18n.t('workflowStop')} (Shift+F5)`,
        finished,
      )}
    </div>`;
  }

  private renderCardFooter(step: WorkflowStep) {
    if (this.density === 'compact' || step.type !== 'action') return nothing;
    const { outputs, tools, assignee } = step;
    if (!outputs?.length && !tools?.length && !assignee) return nothing;
    return html`<div class="wf-card-foot">
      ${assignee
        ? html`<span class="wf-assignee"
            ><wc-avatar
              size="sm"
              name=${assignee.name}
              src=${assignee.src ?? nothing}
            ></wc-avatar
            >${assignee.name}</span
          >`
        : nothing}
      ${outputs?.length
        ? html`<span class="wf-foot-label"
              >${this.i18n.t('workflowOutputs')}</span
            >${outputs.map(
              o =>
                html`<span class="wf-chip" title=${o.type ?? nothing}
                  >${o.name}</span
                >`,
            )}`
        : nothing}
      ${tools?.length
        ? tools.map(
            t =>
              html`<span class="wf-chip tool"
                ><wc-icon name=${t.icon ?? 'build'}></wc-icon
                >${t.headline}</span
              >`,
          )
        : nothing}
    </div>`;
  }

  private renderCard(
    step: WorkflowStep,
    ctx: {
      depth: number;
      index: number;
      size: number;
      inAnchor?: boolean;
      outAnchor?: boolean;
      trigger?: boolean;
    },
  ) {
    const selected = this.selected === step.id;
    const invalid = !!step.invalid || this.unreachable.has(step.id);
    const block = this.isBlock(step);
    const collapsed = block && this._collapsed.has(step.id);
    const accent = step.accent ?? this.defaultAccent(step, !!ctx.trigger);
    const focusId = this._focusId || this.navOrder()[0];
    const problem = invalid
      ? step.errorText || this.i18n.t('workflowUnreachable')
      : '';
    const run = this.runStep(step.id);
    const statusText = run ? this.statusLabel(run.status) : '';
    const label = [
      this.stepLabel(step),
      step.supportingText,
      statusText,
      problem,
    ]
      .filter(Boolean)
      .join(', ');
    const breakpoint = this.breakpoints.includes(step.id);
    return html`<div
      class=${classMap({
        'wf-card': true,
        [`accent-${accent}`]: true,
        'is-selected': selected,
        'is-invalid': invalid,
        'is-trigger': !!ctx.trigger,
        'is-dragging': this._drag?.id === step.id,
        [`st-${run?.status}`]: !!run,
        'is-current': !!run && this.run?.current === step.id,
      })}
      data-card-id=${step.id}
      data-flip=${`card:${step.id}`}
      data-in-for=${ctx.inAnchor === false ? nothing : step.id}
      data-out-for=${ctx.outAnchor === false ? nothing : step.id}
      ?data-trigger=${!!ctx.trigger}
      role="treeitem"
      aria-level=${ctx.depth}
      aria-setsize=${ctx.size}
      aria-posinset=${ctx.index + 1}
      aria-selected=${selected ? 'true' : 'false'}
      aria-expanded=${block ? String(!collapsed) : nothing}
      aria-label=${label}
      tabindex=${focusId === step.id ? '0' : '-1'}
      @pointerdown=${(e: PointerEvent) => this.onCardPointerDown(e, step)}
      @keydown=${(e: KeyboardEvent) => this.onCardKeyDown(e, step)}
      @focus=${() => {
        this._focusId = step.id;
      }}
    >
      ${this.mode === 'debug'
        ? html`<button
            class=${classMap({ 'wf-bp': true, 'is-on': breakpoint })}
            type="button"
            tabindex="-1"
            aria-pressed=${breakpoint ? 'true' : 'false'}
            aria-label=${this.i18n.t('workflowToggleBreakpoint')}
            title=${this.i18n.t('workflowBreakpoint')}
            @click=${() => this.toggleBreakpoint(step.id)}
          ></button>`
        : nothing}
      <slot name=${`step:${step.id}`}>
        <div class="wf-card-head">
          <span class="wf-tile"
            >${step.icon
              ? html`<wc-icon name=${step.icon}></wc-icon>`
              : nothing}</span
          >
          <span class="wf-names">
            <span class="wf-headline">${this.stepLabel(step)}</span>
            ${step.supportingText
              ? html`<span class="wf-kind">${step.supportingText}</span>`
              : nothing}
          </span>
          ${step.pinned
            ? html`<span class="wf-pin" title=${this.i18n.t('workflowPinned')}
                ><wc-icon name="keep"></wc-icon
              ></span>`
            : nothing}
          ${invalid && !run
            ? html`<span
                class="wf-badge"
                title=${step.errorText || this.i18n.t('workflowUnreachable')}
                ><wc-icon name="error"></wc-icon
              ></span>`
            : nothing}
          ${run ? this.renderStatus(run) : nothing}
          ${block
            ? html`<wc-icon-button
                class="wf-toggle"
                variant="text"
                shape="round"
                size="xs"
                tabindex="-1"
                aria-label=${this.i18n.t(
                  collapsed ? 'workflowExpand' : 'workflowCollapse',
                )}
                @click=${() =>
                  collapsed ? this.expand(step.id) : this.collapse(step.id)}
                ><wc-icon
                  name=${collapsed ? 'unfold_more' : 'unfold_less'}
                ></wc-icon
              ></wc-icon-button>`
            : nothing}
          ${this.hasMenu
            ? html`<wc-icon-button
                class="wf-more"
                variant="text"
                shape="round"
                size="xs"
                tabindex="-1"
                aria-label=${this.i18n.t('workflowMoreActions')}
                @click=${(e: Event) =>
                  this.openMenu(step.id, e.currentTarget as HTMLElement)}
                ><wc-icon name="more_vert"></wc-icon
              ></wc-icon-button>`
            : nothing}
        </div>
        ${this.renderCardBody(step)} ${this.renderRunError(step, run)}
        ${this.renderCardFooter(step)}
      </slot>
    </div>`;
  }

  private defaultAccent(step: WorkflowStep, trigger: boolean) {
    if (trigger) return 'primary';
    switch (step.type) {
      case 'branch':
      case 'parallel':
        return 'orange';
      case 'loop':
        return 'purple';
      case 'wait':
        return 'yellow';
      case 'end':
        return 'neutral';
      default:
        return 'blue';
    }
  }

  private renderGap(
    ref: WorkflowListRef,
    index: number,
    previous: WorkflowStep | undefined,
    owner?: WorkflowStep,
    trailing = false,
  ) {
    const key = `${listKey(ref)}#${index}`;
    this.gaps.set(key, { ref, index });
    const name = previous
      ? this.i18n.t('workflowAddStepAfter')(this.stepLabel(previous))
      : this.i18n.t('workflowAddStepIn')(
          owner ? this.stepLabel(owner) : this.i18n.t('workflowLabel'),
        );
    return html`<div
      class=${classMap({
        'wf-gap': true,
        'is-trailing': trailing,
        'is-drop': this._drag?.target === key,
      })}
      data-gap=${key}
    >
      ${this.editing
        ? html`<button
            class="wf-plus"
            type="button"
            tabindex="-1"
            aria-label=${name}
            title=${this.i18n.t('workflowAddStep')}
            @click=${(e: Event) =>
              this.openPalette(ref, index, e.currentTarget as Element)}
            @mouseenter=${() => {
              this._hoverGap = key;
            }}
            @mouseleave=${() => {
              if (this._hoverGap === key) this._hoverGap = '';
            }}
          >
            <wc-icon name="add"></wc-icon>
          </button>`
        : nothing}
    </div>`;
  }

  private renderList(
    steps: WorkflowStep[],
    ref: WorkflowListRef,
    depth: number,
    leading: boolean,
    owner?: WorkflowStep,
  ) {
    return html`<div class="wf-seq" role="group">
      ${this.renderItems(steps, ref, depth, leading, owner)}
    </div>`;
  }

  private renderItems(
    steps: WorkflowStep[],
    ref: WorkflowListRef,
    depth: number,
    leading: boolean,
    owner?: WorkflowStep,
  ) {
    const out: TemplateResult[] = [];
    steps.forEach((step, i) => {
      if (i > 0 || leading)
        out.push(this.renderGap(ref, i, steps[i - 1], owner));
      out.push(this.renderStep(step, i, steps.length, depth));
    });
    if (!listTerminates(steps) && this.editing) {
      out.push(
        this.renderGap(ref, steps.length, steps[steps.length - 1], owner, true),
      );
    }
    return out;
  }

  private renderStep(
    step: WorkflowStep,
    index: number,
    size: number,
    depth: number,
  ): TemplateResult {
    const ctx = { depth, index, size };
    const collapsed = this._collapsed.has(step.id);
    if (step.type === 'end') {
      const selected = this.selected === step.id;
      const focusId = this._focusId || this.navOrder()[0];
      const reached = this.runStep(step.id)?.status;
      return html`<div class="wf-item">
        <div
          class=${classMap({
            'wf-end': true,
            'is-selected': selected,
            'is-invalid': this.unreachable.has(step.id),
            [`st-${reached}`]: !!reached,
          })}
          data-card-id=${step.id}
          data-in-for=${step.id}
          data-flip=${`card:${step.id}`}
          role="treeitem"
          aria-label=${this.stepLabel(step)}
          aria-level=${depth}
          aria-setsize=${size}
          aria-posinset=${index + 1}
          aria-selected=${selected ? 'true' : 'false'}
          tabindex=${focusId === step.id ? '0' : '-1'}
          @pointerdown=${(e: PointerEvent) => this.onCardPointerDown(e, step)}
          @keydown=${(e: KeyboardEvent) => this.onCardKeyDown(e, step)}
          @focus=${() => {
            this._focusId = step.id;
          }}
        >
          <wc-icon name=${step.icon ?? 'stop_circle'}></wc-icon
          >${this.stepLabel(step)}
        </div>
      </div>`;
    }
    if ((step.type === 'branch' || step.type === 'parallel') && !collapsed) {
      const ends = stepTerminates(step);
      return html`<div
        class=${classMap({
          'wf-item': true,
          'wf-block': true,
          [step.type]: true,
        })}
      >
        ${this.renderCard(step, { ...ctx, outAnchor: false })}
        <div class="wf-paths" data-paths-for=${step.id}>
          ${step.paths.map(p => {
            const ref: WorkflowListRef = {
              kind: 'path',
              stepId: step.id,
              pathId: p.id,
            };
            return html`<div class="wf-path" role="group" aria-label=${p.label}>
              <div
                class=${classMap({
                  'wf-pill': true,
                  'is-default': !!p.isDefault,
                })}
                data-pill=${p.id}
                data-flip=${`pill:${p.id}`}
              >
                ${p.label}
              </div>
              ${this.renderList(p.steps, ref, depth + 1, true, step)}
              <div class="wf-path-tail"></div>
            </div>`;
          })}
        </div>
        ${ends
          ? nothing
          : html`<div
              class=${classMap({
                'wf-join': true,
                'is-bar': step.type === 'parallel',
              })}
              data-join-for=${step.id}
              data-out-for=${step.id}
              data-flip=${`join:${step.id}`}
            >
              ${step.type === 'parallel'
                ? html`<span>${this.i18n.t('workflowWaitForAll')}</span>`
                : nothing}
            </div>`}
      </div>`;
    }
    if (step.type === 'loop' && !collapsed) {
      const mode = {
        'for-each': this.i18n.t('workflowLoopForEach'),
        while: this.i18n.t('workflowLoopWhile'),
        until: this.i18n.t('workflowLoopUntil'),
      }[step.mode ?? 'for-each'];
      return html`<div
        class="wf-item wf-block wf-loop"
        data-loop-for=${step.id}
        data-in-for=${step.id}
        data-out-for=${step.id}
        data-flip=${`loop:${step.id}`}
      >
        <div class="wf-loop-head">
          ${this.renderCard(
            { ...step, supportingText: step.supportingText ?? mode },
            { ...ctx, inAnchor: false, outAnchor: false },
          )}
          ${step.over
            ? html`<span class="wf-loop-over"
                >${this.renderValue(step.over)}</span
              >`
            : nothing}
          ${this.renderIterations(step.id)}
        </div>
        ${this.renderList(
          step.steps,
          { kind: 'loop', stepId: step.id },
          depth + 1,
          true,
          step,
        )}
      </div>`;
    }
    const card = this.renderCard(step, ctx);
    if (step.type === 'action' && step.onError) {
      return html`<div class="wf-item wf-has-error">
        <div class="wf-error-spacer"></div>
        ${card}
        <div class="wf-error-col">
          <div
            class="wf-pill is-error"
            data-error-pill=${step.id}
            data-flip=${`err:${step.id}`}
          >
            ${this.i18n.t('workflowOnError')}
          </div>
          ${this.renderList(
            step.onError,
            { kind: 'error', stepId: step.id },
            depth + 1,
            true,
            step,
          )}
        </div>
      </div>`;
    }
    return html`<div class="wf-item">${card}</div>`;
  }

  private renderPalette() {
    const p = this._palette;
    if (!p) return nothing;
    const entries = this.paletteEntries();
    const groups = new Map<
      string,
      { entry: WorkflowStepType; index: number }[]
    >();
    entries.forEach((entry, index) => {
      const name = entry.category ?? '';
      if (!groups.has(name)) groups.set(name, []);
      groups.get(name)?.push({ entry, index });
    });
    const activeId = entries[p.active] ? `wf-option-${p.active}` : '';
    return html`<div
      class="wf-palette"
      data-diagram-overlay
      role="dialog"
      aria-label=${this.i18n.t(
        p.trigger ? 'workflowAddTrigger' : 'workflowAddStep',
      )}
      style="left: ${p.x}px; top: ${p.y}px;"
      @pointerdown=${(e: Event) => e.stopPropagation()}
    >
      <label class="wf-palette-search">
        <wc-icon name="search"></wc-icon>
        <input
          type="search"
          role="combobox"
          aria-expanded="true"
          aria-controls="wf-palette-list"
          aria-activedescendant=${activeId || nothing}
          placeholder=${this.i18n.t('workflowSearchSteps')}
          aria-label=${this.i18n.t('workflowSearchSteps')}
          .value=${p.query}
          @input=${(e: Event) => {
            this._palette = {
              ...p,
              query: (e.target as HTMLInputElement).value,
              active: 0,
            };
          }}
          @keydown=${this.onPaletteKeyDown}
        />
      </label>
      <div
        class="wf-palette-list"
        id="wf-palette-list"
        role="listbox"
        aria-label=${this.i18n.t('workflowAddStep')}
      >
        ${entries.length
          ? [...groups].map(
              ([name, items]) =>
                html`<div
                  class="wf-palette-group"
                  role="group"
                  aria-label=${name || nothing}
                >
                  ${name
                    ? html`<div class="wf-palette-heading" aria-hidden="true">
                        ${name}
                      </div>`
                    : nothing}
                  ${items.map(
                    ({ entry, index }) =>
                      html`<div
                        id=${`wf-option-${index}`}
                        class=${classMap({
                          'wf-option': true,
                          'is-active': index === p.active,
                        })}
                        role="option"
                        aria-selected=${index === p.active ? 'true' : 'false'}
                        @click=${() => this.choose(entry)}
                        @keydown=${this.onPaletteKeyDown}
                        @pointermove=${() => {
                          if (this._palette && this._palette.active !== index)
                            this._palette = { ...this._palette, active: index };
                        }}
                      >
                        <span
                          class=${`wf-tile accent-${entry.accent ?? this.defaultAccent({ id: '', type: entry.type } as WorkflowStep, !!entry.trigger)}`}
                          >${entry.icon
                            ? html`<wc-icon name=${entry.icon}></wc-icon>`
                            : nothing}</span
                        >
                        <span class="wf-option-text">
                          <span class="wf-option-title">${entry.headline}</span>
                          ${entry.supportingText
                            ? html`<span class="wf-option-sub"
                                >${entry.supportingText}</span
                              >`
                            : nothing}
                        </span>
                      </div>`,
                  )}
                </div>`,
            )
          : html`<div class="wf-palette-empty">
              ${this.i18n.t('workflowNoSteps')}
            </div>`}
      </div>
    </div>`;
  }

  private renderMenu() {
    const step = this._menuFor
      ? findStep(this.value, this._menuFor)?.step
      : undefined;
    const block = step ? this.isBlock(step) : false;
    const collapsed = step ? this._collapsed.has(step.id) : false;
    const isTrigger = step?.id === this.value.trigger?.id;
    const pin = html`<wc-menu-item value=${step?.pinned ? 'unpin' : 'pin'}
      ><wc-icon slot="start" name="keep"></wc-icon>${this.i18n.t(
        step?.pinned ? 'workflowUnpinData' : 'workflowPinData',
      )}</wc-menu-item
    >`;
    if (!this.editing) {
      return html`<wc-menu
        placement="bottom-end"
        @menu-item-activate=${this.onMenuActivate}
      >
        ${pin}
      </wc-menu>`;
    }
    return html`<wc-menu
      placement="bottom-end"
      @menu-item-activate=${this.onMenuActivate}
    >
      ${pin}
      ${isTrigger
        ? nothing
        : html`<wc-menu-item value="duplicate"
            ><wc-icon slot="start" name="content_copy"></wc-icon>${this.i18n.t(
              'workflowDuplicate',
            )}<span slot="trailing-supporting-text">Ctrl+D</span></wc-menu-item
          >`}
      ${block
        ? html`<wc-menu-item value=${collapsed ? 'expand' : 'collapse'}
            ><wc-icon
              slot="start"
              name=${collapsed ? 'unfold_more' : 'unfold_less'}
            ></wc-icon
            >${this.i18n.t(
              collapsed ? 'workflowExpand' : 'workflowCollapse',
            )}</wc-menu-item
          >`
        : nothing}
      <wc-menu-item value="delete"
        ><wc-icon slot="start" name="delete"></wc-icon>${this.i18n.t(
          'workflowDelete',
        )}<span slot="trailing-supporting-text">Del</span></wc-menu-item
      >
    </wc-menu>`;
  }

  private renderDragGhost() {
    const drag = this._drag;
    if (!drag) return nothing;
    const step = findStep(this.value, drag.id)?.step;
    if (!step) return nothing;
    return html`<div
      class="wf-ghost"
      style="left: ${drag.x}px; top: ${drag.y}px;"
    >
      ${step.icon
        ? html`<wc-icon name=${step.icon}></wc-icon>`
        : nothing}${this.stepLabel(step)}
    </div>`;
  }

  /** The trigger card, or a button to add one while editing. */
  private renderTrigger() {
    const { trigger } = this.value;
    if (trigger) {
      return html`<div class="wf-item">
        ${this.renderCard(trigger, {
          depth: 1,
          index: 0,
          size: 1,
          trigger: true,
        })}
      </div>`;
    }
    if (!this.editing) return nothing;
    return html`<div class="wf-item">
      <button
        class="wf-add-trigger"
        type="button"
        data-trigger
        data-flip=${TRIGGER_GAP}
        @click=${(e: Event) =>
          this.openPalette(
            { kind: 'root' },
            0,
            e.currentTarget as Element,
            true,
          )}
      >
        <wc-icon name="bolt"></wc-icon>${this.i18n.t('workflowAddTrigger')}
      </button>
    </div>`;
  }

  // ── Render

  protected render() {
    const { x, y, zoom } = this.viewport.view;
    this.gaps = new Map();
    const { trigger } = this.value;
    const { problems } = this;
    return html`
      <div
        class=${classMap({
          'wf-viewport': true,
          'is-panning': this.viewport.panning,
          'is-space': this.viewport.spaceHeld,
          'is-dragging': !!this._drag,
        })}
        tabindex="0"
        role="region"
        aria-label=${this.label || this.i18n.t('workflowLabel')}
        aria-describedby="instructions"
        style=${this.gridStyle()}
        @keydown=${this.onViewportKeyDown}
        @pointerdown=${() => {
          if (this._palette) this._palette = undefined;
        }}
      >
        <div
          class="wf-world"
          style="transform: translate(${x}px, ${y}px) scale(${zoom});"
        >
          <svg
            class="wf-connectors"
            width="1"
            height="1"
            aria-hidden="true"
          ></svg>
          <div
            class=${classMap({
              'wf-root': true,
              [this.direction]: true,
              [`density-${this.density}`]: true,
            })}
            role="tree"
            aria-label=${this.label || this.i18n.t('workflowLabel')}
          >
            <div class="wf-seq" role="group">
              ${this.renderTrigger()}
              ${this.renderItems(
                this.value.steps,
                { kind: 'root' },
                1,
                !!trigger || this.editing,
              )}
            </div>
          </div>
          <svg class="wf-tokens" width="1" height="1" aria-hidden="true"></svg>
        </div>
        ${this.renderDebugBar()}
        ${problems.length && this.mode === 'design'
          ? html`<button
              class="wf-problems"
              type="button"
              @click=${() => this.nextProblem()}
            >
              <wc-icon name="error"></wc-icon>${this.i18n.t('workflowProblems')(
                problems.length,
              )}
            </button>`
          : nothing}
        ${this.renderPalette()} ${this.renderDragGhost()}
        ${this.renderBackToContent()}
        <div class="slot-controls"><slot name="controls"></slot></div>
        <div class="slot-minimap"><slot name="minimap"></slot></div>
        <div id="instructions" hidden>
          ${this.i18n.t('diagramInstructions')}
        </div>
        <div class="sr-only" aria-live="polite">${this._announcement}</div>
        ${this.renderMenu()}
      </div>
    `;
  }
}

// The connector layer is measured after each render, so a second update is expected.
Workflow.disableWarning?.('change-in-update');
