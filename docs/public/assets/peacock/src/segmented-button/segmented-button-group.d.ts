import { LitElement } from 'lit';
import { SegmentedButton } from './segmented-button.js';
/**
 * @label Segmented Button Group
 * @tag wc-segmented-button-group
 * @rawTag segmented-button-group
 * @summary A container for segmented buttons.
 * @overview
 * <p>Segmented buttons help people select options, switch views, or sort elements. They follow the specification.</p>
 * <p>Use <code>multi-select</code> to allow more than one segment to be selected at a time. By default only one segment can be active (single-select).</p>
 *
 * @cssprop --segmented-button-group-shape: Border-radius of the group container.
 *
 * @fires {CustomEvent} change - Dispatched when the selection changes. Detail contains <code>{ value, values }</code>.
 *
 * @example
 * ```html
 * <wc-segmented-button-group>
 *   <wc-segmented-button value="day">Day</wc-segmented-button>
 *   <wc-segmented-button value="week" selected>Week</wc-segmented-button>
 *   <wc-segmented-button value="month">Month</wc-segmented-button>
 * </wc-segmented-button-group>
 * ```
 *
 * @tags controls
 */
export declare class SegmentedButtonGroup extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    static SegmentedButton: typeof SegmentedButton;
    /**
     * When true, multiple segments can be selected simultaneously.
     * Defaults to single-select mode.
     */
    multiSelect: boolean;
    /**
     * When true, in single-select mode the currently selected segment can be
     * deselected by clicking it again (allowing an empty selection).
     * Defaults to `false`.
     */
    nullable: boolean;
    connectedCallback(): void;
    disconnectedCallback(): void;
    private _getSegments;
    private _onSegmentChange;
    render(): import("lit-html").TemplateResult<1>;
}
