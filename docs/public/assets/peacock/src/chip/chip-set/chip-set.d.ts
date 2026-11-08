import { type PropertyValues } from 'lit';
import BaseInput, { type ControlValidity } from '../../input/BaseInput.js';
import { type FormValue, getFormValue } from '../../__internal/mixins/form-associated.js';
import type { Chip } from '../chip/chip.js';
/** Detail of the chip set `change` event; `values` is set with `multiple`. */
export interface ChipSetChangeDetail {
    value: string;
    values?: string[];
}
/**
 * @label Chip Set
 * @tag wc-chip-set
 * @rawTag chip-set
 * @summary A group of chips: a wrapping layout, or a filter-chip group the person selects from.
 * @overview
 * <p>Without options the chip set only lays its chips out, wrapping them onto new lines.</p>
 * <p>With <code>selectable</code> it becomes a filter-chip group: a click, Space or Enter on a
 * chip selects it (and again clears it), and <code>value</code> holds the chosen chip's
 * <code>value</code> (or its text). Add <code>multiple</code> to select several; then
 * <code>value</code> is a comma-separated list and <code>values</code> the array. Each change
 * fires <code>change</code> with <code>{ value, values? }</code>.</p>
 * <p>A selecting chip set is one tab stop with <code>role="group"</code>; the arrow keys move
 * between chips (wrapping, mirrored in right-to-left), Home and End jump to the first and last,
 * and every chip is a toggle button with <code>aria-pressed</code>. Name the group with
 * <code>label</code>.</p>
 * <p>It is a form control: it submits <code>value</code> under <code>name</code> (one entry per
 * value with <code>multiple</code>), and <code>required</code> blocks submission until a chip is
 * selected.</p>
 *
 * @slot - `wc-chip` elements.
 *
 * @cssprop --chip-set-gap - Space between chips.
 *
 * @fires {CustomEvent<{value: string, values?: string[]}>} change - Dispatched when the person changes the selection. `values` is set with `multiple`.
 *
 * @example
 * ```html
 * <wc-chip-set>
 *   <wc-chip>One</wc-chip>
 *   <wc-chip>Two</wc-chip>
 * </wc-chip-set>
 * ```
 *
 * @example
 * ```html
 * <wc-chip-set label="Status" selectable multiple value="open">
 *   <wc-chip value="open">Open</wc-chip>
 *   <wc-chip value="closed">Closed</wc-chip>
 *   <wc-chip value="draft">Draft</wc-chip>
 * </wc-chip-set>
 * ```
 * @tags form
 */
export declare class ChipSet extends BaseInput {
    static styles: import("lit").CSSResultGroup[];
    /**
     * The selected chip's value. With `multiple`, a comma-separated list of values (use `values`),
     * so chip values must not contain commas.
     */
    value: string;
    /** Turns the chip set into a filter-chip group whose chips the person selects. */
    selectable: boolean;
    /** Whether the person can select several chips. Implies `selectable`. */
    multiple: boolean;
    /** The accessible name of the group, when no `aria-label` or `aria-labelledby` is set. */
    label: string;
    private readonly roving;
    /** Chips this set made `selectable`, so it can undo that when it stops selecting. */
    private readonly __madeSelectable;
    protected updated(changed: PropertyValues<this>): void;
    /** The chips, in order. */
    get chips(): Chip[];
    /**
     * The selected values, kept in sync with `value`. Without `multiple` it holds at most one
     * value. The form gets one entry per value.
     */
    get values(): string[];
    set values(next: string[]);
    focus(options?: Parameters<HTMLElement['focus']>[0]): void;
    [getFormValue](): FormValue | null;
    protected computeValidity(): ControlValidity;
    protected valueMissingText(): string;
    protected validityAnchor(): HTMLElement | undefined;
    /** Whether the set selects chips (`selectable` or `multiple`). */
    private get __selecting();
    /** Whether the person may change the selection now. */
    private get __interactive();
    private __toggleAria;
    /** Pushes `selected` and `selectable` onto the chips, and the tab stop. */
    private __syncChips;
    /** Values sorted in the order of their chips, so `value` does not depend on click order. */
    private __inChipOrder;
    /** Toggles `chip`: with `multiple` alongside the others, otherwise in place of them. */
    private __toggle;
    private __commit;
    private __chipFromEvent;
    private __handleClick;
    private __handleKeyDown;
    private __handleSlotChange;
    render(): import("lit-html").TemplateResult<1>;
}
