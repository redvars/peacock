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
