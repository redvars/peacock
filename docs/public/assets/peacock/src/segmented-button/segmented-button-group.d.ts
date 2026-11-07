import { LitElement, type PropertyValues } from 'lit';
import { type FormRestoreState, type FormValue, getFormValue } from '@/__internal/mixins/form-associated.js';
import type { Size } from '@/__internal/utils/size.js';
import { SegmentedButton } from './segmented-button.js';
declare const SegmentedButtonGroup_base: import("../__internal/mixins/mixin.js").MixinReturn<(abstract new (...args: any[]) => import("@/__internal/mixins/element-internals.js").WithElementInternals) & typeof LitElement & import("@/__internal/mixins/form-associated.js").FormAssociatedConstructor, import("@/__internal/mixins/form-associated.js").FormAssociated>;
/**
 * @label Segmented Button Group
 * @tag wc-segmented-button-group
 * @rawTag segmented-button-group
 * @summary A row of joined buttons for choosing one option, or several, such as a view or a sort order.
 * @overview
 * <p>By default one segment is selected at a time: the group is a <code>radiogroup</code> of
 * <code>radio</code> segments, with one tab stop and the arrow keys (and Home/End) moving the
 * selection. <code>nullable</code> lets the selected segment be clicked again to leave nothing
 * selected. Use <code>multiple</code> to let segments toggle independently: the group is then a
 * <code>group</code> of toggle buttons with <code>aria-pressed</code>.</p>
 * <p>Read or set the selection with <code>value</code> (single) or <code>values</code>
 * (<code>multiple</code>); a segment's value is its <code>value</code>, else its text. Without a
 * value set, the group adopts the segments marked <code>selected</code>. Nothing selected is
 * <code>''</code>.</p>
 * <p>The group is form-associated: it submits the selected value under <code>name</code> (one entry
 * per value with <code>multiple</code>), and <code>form.reset()</code> restores the starting
 * selection. <code>disabled</code> disables every segment.</p>
 *
 * @cssprop --segmented-button-group-shape: Border-radius of the group container.
 *
 * @fires {CustomEvent<{value: string, values: string[]}>} change - Dispatched when the person changes the selection. `value` is the first selected value, `''` when none. The segments' own `change` events are swallowed.
 *
 * @example
 * ```html
 * <wc-segmented-button-group label="View" name="view" value="week">
 *   <wc-segmented-button value="day">Day</wc-segmented-button>
 *   <wc-segmented-button value="week">Week</wc-segmented-button>
 *   <wc-segmented-button value="month">Month</wc-segmented-button>
 * </wc-segmented-button-group>
 * ```
 *
 * @tags controls
 */
export declare class SegmentedButtonGroup extends SegmentedButtonGroup_base {
    static styles: import("lit").CSSResultGroup[];
    static SegmentedButton: typeof SegmentedButton;
    /** When true, segments toggle independently and the group has several `values`. */
    multiple: boolean;
    /**
     * When true, in single-select mode the currently selected segment can be
     * deselected by clicking it again (allowing an empty selection).
     * Defaults to `false`.
     */
    nullable: boolean;
    /** The selected value in single-select mode (the first selected one with `multiple`); `''` for none. */
    get value(): string;
    set value(value: string);
    /** The selected values; with `multiple`, all of them, in segment order. */
    get values(): string[];
    set values(values: string[]);
    /** Accessible name of the group. */
    label: string;
    /** Height of the segments: `sm` (2.5rem, default), `md` (3.5rem) or `lg` (4rem). */
    size: Size;
    /** The selection set through `value` or `values`; read only once `valuesSet` is true. */
    private selectedValues;
    /**
     * Whether the consumer set `value` or `values`. Until then the segments' own `selected` is the
     * selection, so markup (or a template binding `?selected`) keeps driving it.
     */
    private valuesSet;
    private hasAdopted;
    /** The selection when first adopted; `form.reset()` returns to it. */
    private defaultValues;
    /** Segments the group disabled, so re-enabling leaves segments disabled on their own alone. */
    private readonly disabledByGroup;
    connectedCallback(): void;
    disconnectedCallback(): void;
    protected updated(changed: PropertyValues<this>): void;
    [getFormValue](): FormValue | null;
    formResetCallback(): void;
    formStateRestoreCallback(state: FormRestoreState | null): void;
    /**
     * The selection: what the consumer set, else the selected segments. The form mixin reads it
     * from the base constructor, before the fields are initialised.
     */
    private get current();
    private _getSegments;
    private _enabledSegments;
    /** Pushes the selection, the role, the roving tabindex and `disabled` down to the segments. */
    private _syncSegments;
    /**
     * Handles a segment's own `change` on the way down (capture phase) and swallows it, so
     * listeners on the group and above see only the group's `change`.
     */
    private _onSegmentChange;
    /** Selects (or toggles, with `multiple`) a segment and fires `change` when the selection moved. */
    private _activate;
    /** Single select: the arrows, Home and End move the selection, like a radio group. */
    private _onKeyDown;
    render(): import("lit-html").TemplateResult<1>;
}
export {};
