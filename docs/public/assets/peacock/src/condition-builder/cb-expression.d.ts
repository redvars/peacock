import { LitElement } from 'lit';
/**
 * @label CB Expression
 * @tag wc-cb-expression
 * @rawTag cb-expression
 * @summary An expression row within a condition builder, containing an operator select and a slot for value inputs.
 * @tags condition-builder
 *
 * @example
 * ```html
 * <wc-cb-expression>
 *   <wc-input placeholder="Enter value"></wc-input>
 * </wc-cb-expression>
 * ```
 */
export declare class CbExpression extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /**
     * The list of operator options to display in the operator select.
     * Each item should have at least `label` and `value` properties.
     */
    operators: {
        label: string;
        value: string;
        icon?: string;
    }[];
    /** The currently selected operator value. */
    operatorValue: string;
    render(): import("lit-html").TemplateResult<1>;
}
