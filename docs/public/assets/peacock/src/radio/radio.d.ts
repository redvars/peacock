import { type PropertyValues } from 'lit';
import ToggleBase from '@/__internal/toggle-base.js';
import type { ControlValidity } from '@/input/BaseInput.js';
/**
 * @label Radio
 * @tag wc-radio
 * @rawTag radio
 * @summary A round button for choosing one option from a set; radios that share a name form a group.
 * @overview
 * <p>Radios that share a <code>name</code> form a group. Wrap them in <code>wc-radio-group</code> to get a
 * group label and a single <code>change</code> event for the whole set.</p>
 * <p>The radio is form-associated: the checked radio submits its <code>value</code> under its <code>name</code>.
 * When any radio of a group is <code>required</code>, the group blocks form submission until one is checked.</p>
 *
 * @cssprop --radio-size: Size of the outer radio circle.
 * @cssprop --radio-dot-size: Size of the inner dot when selected.
 * @cssprop --radio-selected-color: Color of the radio when selected.
 * @cssprop --radio-unselected-color: Color of the radio outline when unselected.
 * @cssprop --radio-state-layer-size: Size of the state layer for touch target.
 * @cssprop --radio-disabled-opacity: Opacity applied when the radio is disabled.
 *
 * @fires {CustomEvent<{checked: boolean, value: string, originalEvent?: Event}>} change - Dispatched when the radio is selected.
 *
 * @example
 * ```html
 * <wc-radio name="fruits" value="apple" label="Apple"></wc-radio>
 * ```
 * @tags input, form
 */
export declare class Radio extends ToggleBase {
    private static readonly DIRECTION_NEXT;
    private static readonly DIRECTION_PREVIOUS;
    static styles: import("lit").CSSResultGroup[];
    /** True for the one radio in the group that should receive tab focus (roving tabindex). */
    private isGroupFocusTarget;
    protected firstUpdated(): void;
    protected updated(changed: PropertyValues<this>): void;
    /** A radio submits nothing but its `value`; there is no `"on"` default to show. */
    protected get defaultToggleValue(): string;
    /** Invalid while any radio of the group is required and none is checked. */
    protected computeValidity(): ControlValidity;
    private keyDownHandler;
    private clickHandler;
    private selectRadio;
    private uncheckSiblings;
    private getGroupRadios;
    private static isRadioEnabled;
    private updateGroupFocusTarget;
    private navigateGroup;
    render(): import("lit-html").TemplateResult<1>;
}
