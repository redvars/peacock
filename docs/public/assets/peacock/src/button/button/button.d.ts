import { LitElement, nothing } from 'lit';
import type { ButtonSize, ButtonShape } from '../ButtonTypes.js';
export type { ButtonSize, ButtonLevel, ButtonShape, ButtonVariant, ButtonColor, } from '../ButtonTypes.js';
declare const Button_base: import("../../__internal/mixins/mixin.js").MixinReturn<import("../../__internal/mixins/mixin.js").MixinReturn<import("../../__internal/mixins/mixin.js").MixinReturn<import("../../__internal/mixins/mixin.js").MixinReturn<import("../../__internal/mixins/mixin.js").MixinReturn<(abstract new (...args: any[]) => import("../../__internal/mixins/element-internals.js").WithElementInternals) & typeof LitElement & import("../../__internal/mixins/form-associated.js").FormAssociatedConstructor, import("../../__internal/mixins/form-associated.js").FormAssociated>, import("../../__internal/mixins/form-submitter.js").FormSubmitter>>, import("../base-button/base-button.js").BaseButton>, import("../base-button/base-button.js").ButtonLevelAppearance>;
/**
 * @label Button
 * @tag wc-button
 * @rawTag button
 *
 * @summary A button with a text label that runs an action, such as saving a form or sending a message; it can also toggle.
 * @overview
 * <p><code>level</code> is a preset of <code>color</code> and <code>variant</code>: <code>primary</code> (primary, filled), <code>secondary</code> (surface, tonal), <code>tertiary</code> (primary, text) and <code>danger</code> (danger, filled). A <code>color</code> or <code>variant</code> you set wins over it.</p>
 * <p>Set <code>toggle</code> to make a toggle button: it renders <code>aria-pressed</code>, flips <code>selected</code> on each click and fires <code>change</code>. <code>selected</code> does nothing without <code>toggle</code>.</p>
 * <p>For a link that looks like a button, use <code>wc-link-button</code>.</p>
 *
 * @cssprop --button-container-shape - Defines the border radius of the button container shape.
 *
 * @cssprop --button-container-shape-start-start - Defines the start position of the button container shape.
 * @cssprop --button-container-shape-start-end - Defines the end position of the button container shape.
 * @cssprop --button-container-shape-end-start - Defines the start position of the button container shape.
 * @cssprop --button-container-shape-end-end - Defines the end position of the button container shape.
 *
 *
 * @cssprop --filled-button-container-color - Color of the filled button container.
 * @cssprop --filled-button-label-text-color - Text color of the filled button label.
 *
 * @cssprop --outlined-button-container-color - Color of the outlined button container.
 * @cssprop --outlined-button-label-text-color - Text color of the outlined button label.
 *
 * @cssprop --text-button-label-text-color - Text color of the text button label.
 *
 * @cssprop --tonal-button-container-color - Color of the tonal button container.
 * @cssprop --tonal-button-label-text-color - Text color of the tonal button label.
 *
 * @cssprop --elevated-button-container-color - Color of the elevated button container.
 * @cssprop --elevated-button-label-text-color - Text color of the elevated button label.
 *
 * @cssprop --neo-button-container-color - Color of the neo button container.
 * @cssprop --neo-button-label-text-color - Text color of the neo button label.
 *
 * @fires {MouseEvent} click - Dispatched when the button is clicked. Not dispatched while `loading`, `soft-disabled` or `skeleton`.
 * @fires {CustomEvent<{ selected: boolean }>} change - Dispatched by a `toggle` button after a click flips `selected`.
 *
 * @example
 * ```html
 * <wc-button>Button</wc-button>
 * ```
 * @tags display
 */
export declare class Button extends Button_base {
    /** @nocollapse */ static shadowRootOptions: ShadowRootInit;
    static styles: import("lit").CSSResultGroup[];
    /**
     * When `true`, the icon is placed after the label (trailing).
     * When `false` (default), the icon is placed before the label (leading).
     */
    trailingIcon: boolean;
    /**
     * Button size.
     * Possible values are `"xs"`, `"sm"`, `"md"`, `"lg"`, `"xl"`. Defaults to `"sm"`.
     */
    size: ButtonSize;
    /** Shape of the button container. */
    shape: ButtonShape;
    /** When true, renders the button as a placeholder skeleton while the page loads. */
    skeleton: boolean;
    /**
     * When true, the button is busy: it shows a spinner in place of its icon (or before the label),
     * sets `aria-busy="true"` and ignores clicks, like `soft-disabled`.
     */
    loading: boolean;
    /**
     * When true, the button is a toggle button: it renders `aria-pressed`, flips `selected` on click
     * and fires `change`.
     */
    toggle: boolean;
    /** The pressed state of a `toggle` button. Has no effect without `toggle`. */
    selected: boolean;
    /** Optional tooltip text displayed on hover. */
    tooltip?: string;
    private readonly buttonElement;
    /** Cleanup returned by observerSlotChangesWithCallback for the icon slot. */
    private __iconSlotCleanup;
    /** Cleanup returned by observerSlotChangesWithCallback for the label slot. */
    private __labelSlotCleanup;
    constructor();
    disconnectedCallback(): void;
    firstUpdated(changedProperties: Map<PropertyKey, unknown>): void;
    focus(): void;
    blur(): void;
    __dispatchClick: (event: MouseEvent | KeyboardEvent) => void;
    renderButtonElement(): import("lit-html").TemplateResult<1>;
    renderButtonContent(): import("lit-html").TemplateResult<1>;
    renderLoadingIndicator(): typeof nothing | import("lit-html").TemplateResult<1>;
    renderDisabledReason(softDisabled: boolean): typeof nothing | import("lit-html").TemplateResult<1>;
    renderTooltip(): typeof nothing | import("lit-html").TemplateResult<1>;
    render(): import("lit-html").TemplateResult<1>;
}
