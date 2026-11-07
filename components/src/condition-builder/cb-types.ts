import type { CbGroupBase } from './cb-group-base.js';
import type { CbRule } from './cb-rule.js';

export type CbOperator = 'and' | 'or';

export interface CbRuleMoveDetail {
  rule: CbRule;
  from: HTMLElement | null;
  to: CbGroupBase;
  index: number;
}

export interface CbRuleRemoveDetail {
  rule: CbRule;
  group: HTMLElement | null;
}

/**
 * A rule in a condition builder's `value`.
 *
 * `element` is not enumerable, so `JSON.stringify(builder.value)` leaves it out.
 */
export interface CbRuleValue {
  type: 'rule';
  /** The rule element's `id`, or `''`. */
  id: string;
  /**
   * The rule's `value` property when it is set. Otherwise the values of the controls slotted
   * into the rule (its direct children with a `value` property): an object keyed by each
   * control's `name` when every one has a name, else an array in document order.
   */
  value: unknown;
  /** The rule element's `data-*` attributes, as `dataset` gives them. */
  data: Record<string, string>;
  /** The `wc-cb-rule` element. Not enumerable. */
  readonly element: CbRule;
}

/**
 * A group in a condition builder's `value`: the builder itself at the root, `wc-cb-group` below.
 *
 * `element` is not enumerable, so `JSON.stringify(builder.value)` leaves it out.
 */
export interface CbGroupValue {
  type: 'group';
  /** The group element's `id`, or `''`. */
  id: string;
  operator: CbOperator;
  /** The group's rules and nested groups, in order. */
  children: (CbGroupValue | CbRuleValue)[];
  /** The group element's `data-*` attributes, as `dataset` gives them. */
  data: Record<string, string>;
  /** The `wc-condition-builder` or `wc-cb-group` element. Not enumerable. */
  readonly element: CbGroupBase;
}

export type CbNodeValue = CbGroupValue | CbRuleValue;
