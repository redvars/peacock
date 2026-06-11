import { LitElement } from 'lit';
/**
 * @label CB Predicate
 * @tag wc-cb-predicate
 * @rawTag cb-predicate
 * @summary A predicate container in a condition builder that can display conditions in horizontal or vertical layout with an optional logical operator divider.
 * @tags condition-builder
 *
 * @example
 * ```html
 * <wc-cb-predicate condition-operator="and" vertical>
 *   <wc-cb-compound-expression field-label="Age">
 *     <wc-cb-expression></wc-cb-expression>
 *   </wc-cb-compound-expression>
 * </wc-cb-predicate>
 * ```
 */
export declare class CbPredicate extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /** The logical operator shown between predicates ('and' or 'or'). */
    conditionOperator?: 'and' | 'or';
    /** Whether to render the predicate in vertical layout. */
    vertical: boolean;
    updated(): void;
    private __adjustSlotEndPadding;
    private __renderHorizontalOperator;
    private __renderVerticalOperator;
    render(): import("lit-html").TemplateResult<1>;
}
