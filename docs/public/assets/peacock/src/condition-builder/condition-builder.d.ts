import type { PeacockStrings } from '../__internal/i18n/strings.js';
import { CbGroupBase } from './cb-group-base.js';
/** `detail` of `describe`: the person's sentence and the provider's answer for it. */
export interface ConditionBuilderDescribeDetail {
    text: string;
    value: unknown;
}
/**
 * @label Condition Builder
 * @tag wc-condition-builder
 * @rawTag condition-builder
 * @summary A query builder for composing filter conditions from rules and nested groups joined by And/Or.
 * @overview
 * <p>The condition builder is the root group of a query. It holds rules (<code>wc-cb-rule</code>) and bordered nested groups (<code>wc-cb-group</code>), each joined by a bracket with an And/Or pill.</p>
 * <ul>
 *   <li>Click the pill to switch a group between And and Or.</li>
 *   <li>Drag a rule by its handle to reorder it or move it between groups.</li>
 *   <li>Without a mouse, focus a rule's handle: ArrowUp and ArrowDown move it within its group, ArrowRight moves it into the group beside it and ArrowLeft out of its group. Each move is announced.</li>
 *   <li>Removing, moving and switching are built in; adding rules and groups is up to you, since only you know what a new rule contains. Listen for <code>add-rule</code> and <code>add-group</code>, which nested groups fire too; <code>detail.group</code> is the group to add to.</li>
 *   <li><code>disabled</code> and <code>readonly</code> apply to every group and rule inside: the add, remove and drag controls are hidden and the operator is locked. Disable or lock the slotted controls yourself.</li>
 * </ul>
 * <p><code>value</code> (read-only) returns the query as a tree, ready for <code>JSON.stringify()</code>:</p>
 * <pre><code>{
 *   type: 'group', id, operator: 'and' | 'or', data,
 *   children: [
 *     { type: 'rule', id, value, data },
 *     { type: 'group', id, operator, data, children: [...] }
 *   ]
 * }</code></pre>
 * <p><code>id</code> is the element's id, <code>data</code> its <code>data-*</code> attributes. A rule's <code>value</code> is the rule's own <code>value</code> property when set, else the values of the controls slotted into it: an object keyed by <code>name</code> when every control has a name, else an array. Each node also has a non-enumerable <code>element</code>, the element it came from, which <code>JSON.stringify()</code> leaves out.</p>
 * <p><b>Describe the condition.</b> With a provider that offers <code>parse</code> (ADR-030002), a
 * box above the footer takes a sentence, such as "P1 incidents with no assignment group for over 30
 * minutes". The provider gets it with <code>target: 'condition-builder'</code> and the fields in
 * <code>ai-schema</code> (never record values), and its answer arrives as <code>describe</code>.
 * Build the rules from it as you build any rule, with <code>suggested</code> on each
 * <code>wc-cb-rule</code>: they show a Suggested badge until the person changes them, and removing
 * one discards it. <code>no-ai</code> turns the box off.</p>
 * @tags condition-builder
 *
 * @fires {CustomEvent<{operator: 'and' | 'or'}>} operator-change - Dispatched when the user picks a different operator, on this or a nested group.
 * @fires {CustomEvent<{rule: CbRule, from: HTMLElement | null, to: HTMLElement, index: number}>} rule-move - Dispatched before a rule is moved. Cancelable: unless prevented, the target group moves the rule.
 * @fires {CustomEvent<{rule: CbRule, group: HTMLElement | null}>} rule-remove - Dispatched when a rule's remove button is clicked. Cancelable: unless prevented, the rule removes itself.
 * @fires {CustomEvent<{group: HTMLElement}>} add-rule - Dispatched when "Add rule" (or a nested group's "Add condition") is clicked.
 * @fires {CustomEvent<{group: HTMLElement}>} add-group - Dispatched when "Add inner group" is clicked, on this or a nested group.
 * @fires {CustomEvent<ConditionBuilderDescribeDetail>} describe - The provider turned the person's sentence into conditions; build the rules from `detail.value`, marked `suggested`.
 *
 * @slot - Rules (`wc-cb-rule`) and groups (`wc-cb-group`).
 * @slot actions - Replaces the default "Add rule" and "Add inner group" buttons. Hidden while disabled or read-only.
 * @slot actions-end - Actions aligned to the end of the footer, such as a "Run query" button.
 *
 * @example
 * ```html
 * <wc-condition-builder operator="and">
 *   <wc-cb-rule>
 *     <wc-input placeholder="Value"></wc-input>
 *   </wc-cb-rule>
 *   <wc-cb-group operator="or">
 *     <wc-cb-rule>
 *       <wc-input placeholder="Value"></wc-input>
 *     </wc-cb-rule>
 *     <wc-cb-rule>
 *       <wc-input placeholder="Value"></wc-input>
 *     </wc-cb-rule>
 *   </wc-cb-group>
 *   <wc-button slot="actions-end">Run query</wc-button>
 * </wc-condition-builder>
 * ```
 */
export declare class ConditionBuilder extends CbGroupBase {
    static styles: import("lit").CSSResultGroup[];
    /** Overrides Peacock's strings for this instance only. */
    strings?: Partial<PeacockStrings>;
    /**
     * The fields a rule can use, sent to the provider with a described condition, such as
     * `[{ key: 'priority', label: 'Priority', options: [...] }]`. Never record values.
     */
    aiSchema: unknown;
    /** Turns off Describe the condition, even when the page's AI offers it. */
    noAi: boolean;
    private readonly ai;
    private describe;
    private onDescribeKey;
    private renderDescribe;
    protected renderFooter(): import("lit-html").TemplateResult<1>;
}
