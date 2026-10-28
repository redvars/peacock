import type { CbRule } from './cb-rule.js';

/**
 * The rule currently being dragged. `DataTransfer` cannot carry element
 * references, so rules publish themselves here on `dragstart` and groups read
 * it on `dragover` / `drop`.
 */
let activeRule: CbRule | null = null;

/** Clears the drop indicator of the group the pointer is currently over. */
let clearDropTarget: (() => void) | null = null;

export function getActiveRule(): CbRule | null {
  return activeRule;
}

export function setActiveRule(rule: CbRule | null) {
  activeRule = rule;
}

/**
 * Makes `clear` the current drop target's cleanup, running the previous one
 * so only one group shows a drop indicator at a time. Pass `null` to clear.
 */
export function claimDropTarget(clear: (() => void) | null) {
  if (clearDropTarget && clearDropTarget !== clear) clearDropTarget();
  clearDropTarget = clear;
}

/** Clears the drop target if `clear` still owns it. */
export function releaseDropTarget(clear: () => void) {
  if (clearDropTarget !== clear) return;
  clear();
  clearDropTarget = null;
}
