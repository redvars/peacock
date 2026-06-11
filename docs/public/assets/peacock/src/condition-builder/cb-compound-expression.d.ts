import { LitElement } from 'lit';
/**
 * @label CB Compound Expression
 * @tag wc-cb-compound-expression
 * @rawTag cb-compound-expression
 * @summary A compound expression group in a condition builder that displays a field label, an optional condition operator divider, and slots for child expressions.
 * @tags condition-builder
 *
 * @example
 * ```html
 * <wc-cb-compound-expression field-label="Age" condition-operator="or">
 *   <wc-cb-expression>
 *     <wc-input placeholder="Enter value"></wc-input>
 *   </wc-cb-expression>
 * </wc-cb-compound-expression>
 * ```
 */
export declare class CbCompoundExpression extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /** The logical operator joining conditions in this group ('and' or 'or'). */
    conditionOperator?: 'and' | 'or';
    /** The field name for the compound expression. */
    fieldName: string;
    /** The display label for the field. */
    fieldLabel: string;
    updated(): void;
    private __adjustSlotEndPadding;
    private __renderOperatorDivider;
    render(): import("lit-html").TemplateResult<1>;
}
