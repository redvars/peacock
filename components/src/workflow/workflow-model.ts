/** Colour of a step's icon tile, from the theme's accent palettes. */
export type WorkflowAccent =
  | 'primary'
  | 'tertiary'
  | 'blue'
  | 'green'
  | 'orange'
  | 'purple'
  | 'red'
  | 'yellow'
  | 'neutral';

/** A label and value shown on a step card. `{{Step.output}}` in `value` renders as a data pill. */
export interface WorkflowField {
  label: string;
  value: string;
}

/** A value a step produces for later steps. */
export interface WorkflowOutput {
  name: string;
  type?: string;
}

/** A tool an AI agent step may call. */
export interface WorkflowTool {
  id: string;
  headline: string;
  icon?: string;
}

/** Who works on a human task. */
export interface WorkflowAssignee {
  name: string;
  src?: string;
}

// Steps nest steps, so these types refer to the union declared after them.
/* eslint-disable no-use-before-define */

interface WorkflowStepBase {
  /** Unique across the whole workflow. */
  id: string;
  /** The step's title. */
  headline?: string;
  /** A short second line, usually the kind of step ("HTTP request", "Approval"). */
  supportingText?: string;
  /** Material Symbols name for the icon tile. */
  icon?: string;
  accent?: WorkflowAccent;
  /** The step type's `kind`, for your own lookups. */
  kind?: string;
  /** Marks the step as needing attention; `errorText` says why. */
  invalid?: boolean;
  errorText?: string;
  /** Starts a branch or loop collapsed. */
  collapsed?: boolean;
  /** The step's data is pinned for testing: shown with a pin badge. */
  pinned?: boolean;
  /** Your own data, kept with the step. */
  data?: Record<string, unknown>;
}

export interface WorkflowActionStep extends WorkflowStepBase {
  type: 'action';
  fields?: WorkflowField[];
  outputs?: WorkflowOutput[];
  tools?: WorkflowTool[];
  assignee?: WorkflowAssignee;
  /** Steps that run when this step fails, drawn as a side path. */
  onError?: WorkflowStep[];
}

export interface WorkflowPath {
  id: string;
  /** Shown on the pill at the top of the path, for example "amount > 1,000" or "Otherwise". */
  label: string;
  /** The default path ("else"), shown in a quieter pill. */
  isDefault?: boolean;
  /** Your own condition, for example a `wc-condition-builder` value. */
  condition?: unknown;
  steps: WorkflowStep[];
}

export interface WorkflowBranchStep extends WorkflowStepBase {
  /** `branch` runs the first path whose condition holds; `parallel` runs every path and waits for all. */
  type: 'branch' | 'parallel';
  paths: WorkflowPath[];
}

export interface WorkflowLoopStep extends WorkflowStepBase {
  type: 'loop';
  mode?: 'for-each' | 'while' | 'until';
  /** What the loop goes over or tests, for example `{{Trigger.line_items}}`. */
  over?: string;
  steps: WorkflowStep[];
}

export interface WorkflowWaitStep extends WorkflowStepBase {
  type: 'wait';
  /** A time or event, for example "3 days" or "Approval received". */
  until?: string;
}

export interface WorkflowEndStep extends WorkflowStepBase {
  type: 'end';
}

export type WorkflowStep =
  | WorkflowActionStep
  | WorkflowBranchStep
  | WorkflowLoopStep
  | WorkflowWaitStep
  | WorkflowEndStep;

/* eslint-enable no-use-before-define */

export interface WorkflowValue {
  /** What starts the workflow, drawn first. */
  trigger?: WorkflowActionStep;
  steps: WorkflowStep[];
}

/** Where one step is in a run. */
export type WorkflowRunStepStatus =
  | 'queued'
  | 'running'
  | 'waiting'
  | 'paused'
  | 'success'
  | 'failed'
  | 'skipped'
  | 'canceled';

/** What happened to one step in a run. */
export interface WorkflowRunStep {
  status: WorkflowRunStepStatus;
  /** When the step started, in milliseconds (an epoch time or an offset from the run's start). */
  startedAt?: number;
  durationMs?: number;
  input?: unknown;
  output?: unknown;
  error?: { message: string; detail?: string };
  /** How many times the step has been tried. */
  attempts?: number;
  /** For a loop: what each iteration did, keyed by the ids of the steps inside. */
  iterations?: Record<string, WorkflowRunStep>[];
}

/** A run of the workflow, for debugging and run history. Your engine produces it; the component only shows it. */
export interface WorkflowRun {
  id: string;
  status: 'running' | 'paused' | 'success' | 'failed' | 'canceled';
  startedAt?: number;
  durationMs?: number;
  /** The step running now, or paused on. */
  current?: string;
  steps: Record<string, WorkflowRunStep>;
}

/** Whether a run step has been reached: it is running, waiting, paused or done. */
export function isReached(status: WorkflowRunStepStatus | undefined): boolean {
  return (
    status === 'running' ||
    status === 'waiting' ||
    status === 'paused' ||
    status === 'success' ||
    status === 'failed'
  );
}

/** An entry in the add-step palette. */
export interface WorkflowStepType {
  /** Your identifier, copied to the new step's `kind`. */
  kind: string;
  type: WorkflowStep['type'];
  headline: string;
  supportingText?: string;
  icon?: string;
  accent?: WorkflowAccent;
  /** Heading the entry is grouped under. */
  category?: string;
  /** Offered only when adding a trigger. */
  trigger?: boolean;
  /** Extra fields for new steps of this type, such as `fields` or `paths`. */
  defaults?: Partial<WorkflowStep>;
}

/** Where a list of steps lives: the main sequence, a branch path, a loop body or an error path. */
export type WorkflowListRef =
  | { kind: 'root' }
  | { kind: 'path'; stepId: string; pathId: string }
  | { kind: 'loop'; stepId: string }
  | { kind: 'error'; stepId: string };

/** Logic steps offered when `step-types` is not set. */
export const WORKFLOW_LOGIC_STEPS: WorkflowStepType[] = [
  {
    kind: 'branch',
    type: 'branch',
    headline: 'Branch',
    supportingText: 'If / else',
    icon: 'call_split',
    accent: 'orange',
    category: 'Logic',
  },
  {
    kind: 'parallel',
    type: 'parallel',
    headline: 'Parallel',
    supportingText: 'Run paths together',
    icon: 'alt_route',
    accent: 'orange',
    category: 'Logic',
  },
  {
    kind: 'loop',
    type: 'loop',
    headline: 'Loop',
    supportingText: 'For each item',
    icon: 'repeat',
    accent: 'purple',
    category: 'Logic',
  },
  {
    kind: 'wait',
    type: 'wait',
    headline: 'Wait',
    supportingText: 'Delay or event',
    icon: 'schedule',
    accent: 'yellow',
    category: 'Logic',
  },
  {
    kind: 'end',
    type: 'end',
    headline: 'End',
    icon: 'stop_circle',
    accent: 'neutral',
    category: 'Logic',
  },
];

export function listKey(ref: WorkflowListRef): string {
  switch (ref.kind) {
    case 'path':
      return `path:${ref.stepId}:${ref.pathId}`;
    case 'loop':
      return `loop:${ref.stepId}`;
    case 'error':
      return `error:${ref.stepId}`;
    default:
      return 'root';
  }
}

/** The lists of steps directly inside `step`, with their references. */
export function childLists(
  step: WorkflowStep,
): { ref: WorkflowListRef; steps: WorkflowStep[] }[] {
  if (step.type === 'branch' || step.type === 'parallel') {
    return step.paths.map(p => ({
      ref: { kind: 'path', stepId: step.id, pathId: p.id },
      steps: p.steps,
    }));
  }
  if (step.type === 'loop') {
    return [{ ref: { kind: 'loop', stepId: step.id }, steps: step.steps }];
  }
  if (step.type === 'action' && step.onError) {
    return [{ ref: { kind: 'error', stepId: step.id }, steps: step.onError }];
  }
  return [];
}

export interface WalkEntry {
  step: WorkflowStep;
  ref: WorkflowListRef;
  index: number;
  depth: number;
  parent?: WorkflowStep;
}

/** Visits every step in reading order: a block, then what is inside it, then what follows. */
export function walk(
  value: WorkflowValue,
  visit: (entry: WalkEntry) => void,
  options: { skip?: (step: WorkflowStep) => boolean } = {},
) {
  const visitList = (
    steps: WorkflowStep[],
    ref: WorkflowListRef,
    depth: number,
    parent?: WorkflowStep,
  ) => {
    steps.forEach((step, index) => {
      visit({ step, ref, index, depth, parent });
      if (!options.skip?.(step)) {
        for (const child of childLists(step)) {
          visitList(child.steps, child.ref, depth + 1, step);
        }
      }
    });
  };
  visitList(value.steps, { kind: 'root' }, 1);
}

export function findStep(
  value: WorkflowValue,
  id: string,
): WalkEntry | undefined {
  if (value.trigger?.id === id) {
    return { step: value.trigger, ref: { kind: 'root' }, index: -1, depth: 1 };
  }
  let found: WalkEntry | undefined;
  walk(value, entry => {
    if (!found && entry.step.id === id) found = entry;
  });
  return found;
}

export function getList(
  value: WorkflowValue,
  ref: WorkflowListRef,
): WorkflowStep[] | undefined {
  if (ref.kind === 'root') return value.steps;
  const owner = findStep(value, ref.stepId)?.step;
  if (!owner) return undefined;
  return childLists(owner).find(c => listKey(c.ref) === listKey(ref))?.steps;
}

/** Returns a new step list with `fn` applied to the list `ref` names, wherever it is nested. */
function mapLists(
  steps: WorkflowStep[],
  ref: WorkflowListRef,
  fn: (list: WorkflowStep[]) => WorkflowStep[],
): WorkflowStep[] {
  return steps.map(step => {
    if (ref.kind !== 'root' && step.id === ref.stepId) {
      if (
        ref.kind === 'path' &&
        (step.type === 'branch' || step.type === 'parallel')
      ) {
        return {
          ...step,
          paths: step.paths.map(p =>
            p.id === ref.pathId ? { ...p, steps: fn(p.steps) } : p,
          ),
        };
      }
      if (ref.kind === 'loop' && step.type === 'loop') {
        return { ...step, steps: fn(step.steps) };
      }
      if (ref.kind === 'error' && step.type === 'action') {
        return { ...step, onError: fn(step.onError ?? []) };
      }
    }
    if (step.type === 'branch' || step.type === 'parallel') {
      return {
        ...step,
        paths: step.paths.map(p => ({
          ...p,
          steps: mapLists(p.steps, ref, fn),
        })),
      };
    }
    if (step.type === 'loop')
      return { ...step, steps: mapLists(step.steps, ref, fn) };
    if (step.type === 'action' && step.onError) {
      return { ...step, onError: mapLists(step.onError, ref, fn) };
    }
    return step;
  });
}

export function updateList(
  value: WorkflowValue,
  ref: WorkflowListRef,
  fn: (list: WorkflowStep[]) => WorkflowStep[],
): WorkflowValue {
  if (ref.kind === 'root') return { ...value, steps: fn(value.steps) };
  return { ...value, steps: mapLists(value.steps, ref, fn) };
}

export function insertStep(
  value: WorkflowValue,
  ref: WorkflowListRef,
  index: number,
  step: WorkflowStep,
): WorkflowValue {
  return updateList(value, ref, list => [
    ...list.slice(0, index),
    step,
    ...list.slice(index),
  ]);
}

export function removeStep(value: WorkflowValue, id: string): WorkflowValue {
  if (value.trigger?.id === id) {
    const rest = { ...value };
    delete rest.trigger;
    return rest;
  }
  const found = findStep(value, id);
  if (!found) return value;
  return updateList(value, found.ref, list => list.filter(s => s.id !== id));
}

/** Moves a step to `index` in `ref`, where the index counts the list before the move. */
export function moveStep(
  value: WorkflowValue,
  id: string,
  ref: WorkflowListRef,
  index: number,
): WorkflowValue {
  const found = findStep(value, id);
  if (!found || found.index < 0) return value;
  let target = index;
  if (listKey(found.ref) === listKey(ref) && found.index < index) target -= 1;
  return insertStep(removeStep(value, id), ref, target, found.step);
}

export function replaceStep(
  value: WorkflowValue,
  id: string,
  fn: (step: WorkflowStep) => WorkflowStep,
): WorkflowValue {
  if (value.trigger?.id === id) {
    return { ...value, trigger: fn(value.trigger) as WorkflowActionStep };
  }
  const found = findStep(value, id);
  if (!found) return value;
  return updateList(value, found.ref, list =>
    list.map(s => (s.id === id ? fn(s) : s)),
  );
}

/** Whether `id` is `step` or somewhere inside it. */
export function contains(step: WorkflowStep, id: string): boolean {
  if (step.id === id) return true;
  return childLists(step).some(c => c.steps.some(s => contains(s, id)));
}

/** Every id used in the workflow. */
export function allIds(value: WorkflowValue): Set<string> {
  const ids = new Set<string>();
  if (value.trigger) ids.add(value.trigger.id);
  walk(value, ({ step }) => {
    ids.add(step.id);
    if (step.type === 'branch' || step.type === 'parallel') {
      for (const p of step.paths) ids.add(p.id);
    }
  });
  return ids;
}

export function uniqueId(base: string, taken: Set<string>): string {
  const clean = base.replace(/[^a-zA-Z0-9_-]+/g, '-') || 'step';
  if (!taken.has(clean)) return clean;
  let i = 2;
  while (taken.has(`${clean}-${i}`)) i += 1;
  return `${clean}-${i}`;
}

/** A deep copy of `step` with fresh ids for it, its paths and everything inside. */
export function cloneWithNewIds(
  step: WorkflowStep,
  taken: Set<string>,
): WorkflowStep {
  const fresh = (id: string) => {
    const next = uniqueId(`${id}-copy`, taken);
    taken.add(next);
    return next;
  };
  const cloneList = (steps: WorkflowStep[]) =>
    steps.map(s => cloneWithNewIds(s, taken));
  const id = fresh(step.id);
  if (step.type === 'branch' || step.type === 'parallel') {
    return {
      ...step,
      id,
      paths: step.paths.map(p => ({
        ...p,
        id: fresh(p.id),
        steps: cloneList(p.steps),
      })),
    };
  }
  if (step.type === 'loop')
    return { ...step, id, steps: cloneList(step.steps) };
  if (step.type === 'action' && step.onError) {
    return { ...step, id, onError: cloneList(step.onError) };
  }
  return { ...step, id };
}

/** Whether running a list of steps always stops before reaching what comes after it. */
export function listTerminates(steps: WorkflowStep[]): boolean {
  const last = steps[steps.length - 1];
  if (!last) return false;
  if (last.type === 'end') return true;
  if (last.type === 'branch' || last.type === 'parallel') {
    return (
      last.paths.length > 0 && last.paths.every(p => listTerminates(p.steps))
    );
  }
  return false;
}

/** Whether a block step stops the flow (every path ends). */
export function stepTerminates(step: WorkflowStep): boolean {
  return listTerminates([step]);
}

/** Counts the steps inside a block, for its collapsed summary. */
export function countInside(step: WorkflowStep): number {
  return childLists(step).reduce(
    (n, c) => n + c.steps.reduce((m, s) => m + 1 + countInside(s), 0),
    0,
  );
}

/** Builds a new step from a palette entry. */
export function createStep(
  type: WorkflowStepType,
  taken: Set<string>,
): WorkflowStep {
  const id = uniqueId(type.kind, taken);
  taken.add(id);
  const pathId = (n: number) => {
    const p = uniqueId(`${id}-path-${n}`, taken);
    taken.add(p);
    return p;
  };
  const base = {
    id,
    kind: type.kind,
    headline: type.headline,
    supportingText: type.supportingText,
    icon: type.icon,
    accent: type.accent,
  };
  let step: WorkflowStep;
  switch (type.type) {
    case 'branch':
      step = {
        ...base,
        type: 'branch',
        paths: [
          { id: pathId(1), label: 'If', steps: [] },
          { id: pathId(2), label: 'Otherwise', isDefault: true, steps: [] },
        ],
      };
      break;
    case 'parallel':
      step = {
        ...base,
        type: 'parallel',
        paths: [
          { id: pathId(1), label: 'Path 1', steps: [] },
          { id: pathId(2), label: 'Path 2', steps: [] },
        ],
      };
      break;
    case 'loop':
      step = { ...base, type: 'loop', mode: 'for-each', steps: [] };
      break;
    case 'wait':
      step = { ...base, type: 'wait' };
      break;
    case 'end':
      step = { ...base, type: 'end' };
      break;
    default:
      step = { ...base, type: 'action' };
  }
  return {
    ...step,
    ...(type.defaults ?? {}),
    id,
    type: step.type,
  } as WorkflowStep;
}
