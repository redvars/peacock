import { LitElement, nothing, type PropertyValues } from 'lit';
import type { ButtonShape, ButtonSize } from '@/button/ButtonTypes.js';
declare const IconButton_base: import("../../__internal/mixins/mixin.js").MixinReturn<import("../../__internal/mixins/mixin.js").MixinReturn<import("../../__internal/mixins/mixin.js").MixinReturn<import("../../__internal/mixins/mixin.js").MixinReturn<import("../../__internal/mixins/mixin.js").MixinReturn<import("../../__internal/mixins/mixin.js").MixinReturn<(abstract new (...args: any[]) => import("@/__internal/mixins/element-internals.js").WithElementInternals) & typeof LitElement & import("@/__internal/mixins/form-associated.js").FormAssociatedConstructor, import("@/__internal/mixins/form-associated.js").FormAssociated>, import("@/__internal/mixins/form-submitter.js").FormSubmitter>>, import("@/__internal/mixins/hyperlink.js").Hyperlink>, import("../base-button/base-button.js").BaseButton>, import("../base-button/base-button.js").ButtonLevelAppearance>;
/**
 * @label Icon Button
 * @tag wc-icon-button
 * @rawTag icon-button
 *
 * @summary A button that shows only an icon, for compact actions such as close or more options; it can also toggle.
 *
 * @overview
 * <p>An icon button has no visible text, so give it an <code>aria-label</code>. Without one, its <code>tooltip</code> text is used as the accessible name; with neither, a warning is logged once.</p>
 * <p><code>level</code> is a preset of <code>color</code> and <code>variant</code>, the same as on <code>wc-button</code>. Set <code>toggle</code> for a toggle button with <code>aria-pressed</code>; <code>selected</code> does nothing without it. Link mode (<code>href</code>) stays supported, for toolbar links.</p>
 *
 * @cssprop --button-container-shape: Defines the border radius of the button container shape.
 *
 * @cssprop --button-container-shape-start-start: Defines the start position of the button container shape.
 * @cssprop --button-container-shape-start-end: Defines the end position of the button container shape.
 * @cssprop --button-container-shape-end-start: Defines the start position of the button container shape.
 * @cssprop --button-container-shape-end-end: Defines the end position of the button container shape.
 *
 *
 * @cssprop --filled-button-container-color: Color of the filled button container.
 * @cssprop --filled-button-label-text-color: Text color of the filled button label.
 *
 * @cssprop --outlined-button-container-color: Color of the outlined button container.
 * @cssprop --outlined-button-label-text-color: Text color of the outlined button label.
 *
 * @cssprop --text-button-label-text-color: Text color of the text button label.
 *
 * @cssprop --tonal-button-container-color: Color of the tonal button container.
 * @cssprop --tonal-button-label-text-color: Text color of the tonal button label.
 *
 * @cssprop --elevated-button-container-color: Color of the elevated button container.
 * @cssprop --elevated-button-label-text-color: Text color of the elevated button label.
 *
 * @cssprop --neo-button-container-color: Color of the neo button container.
 * @cssprop --neo-button-label-text-color: Text color of the neo button label.
 *
 * @fires {MouseEvent} click - Dispatched when the button is clicked. Not dispatched while `loading`, `soft-disabled` or `skeleton`.
 * @fires {CustomEvent<{ selected: boolean }>} change - Dispatched by a `toggle` button after a click flips `selected`.
 *
 * @example
 * ```html
 * <wc-icon-button aria-label="Home"><wc-icon name="home"></wc-icon></wc-icon-button>
 * ```
 * @tags display
 */
export declare class IconButton extends IconButton_base {
    /** @nocollapse */ static shadowRootOptions: ShadowRootInit;
    static styles: import("lit").CSSResultGroup[];
    /**
     * Button size.
     * Possible values are `"xs"`, `"sm"`, `"md"`, `"lg"`, `"xl"`. Defaults to `"sm"`.
     */
    size: ButtonSize;
    /** Shape of the button container. */
    shape?: ButtonShape;
    /** When true, renders the button as a placeholder skeleton while the page loads. */
    skeleton: boolean;
    /**
     * When true, the button is busy: it shows a spinner in place of its icon, sets
     * `aria-busy="true"` and ignores clicks, like `soft-disabled`.
     */
    loading: boolean;
    /**
     * When true, the button is a toggle button: it renders `aria-pressed`, flips `selected` on click
     * and fires `change`.
     */
    toggle: boolean;
    /** The pressed state of a `toggle` button. Has no effect without `toggle`. */
    selected: boolean;
    /**
     * Tooltip text displayed on hover. Also the accessible name when no `aria-label` is set.
     */
    tooltip?: string;
    readonly buttonElement: HTMLElement | null;
    constructor();
    firstUpdated(changedProperties: PropertyValues<this>): void;
    focus(): void;
    blur(): void;
    __dispatchClick: (event: MouseEvent | KeyboardEvent) => void;
    renderDisabledReason(softDisabled: boolean): typeof nothing | import("lit-html").TemplateResult<1>;
    renderTooltip(): typeof nothing | import("lit-html").TemplateResult<1>;
    renderLoadingIndicator(): typeof nothing | import("lit-html").TemplateResult<1>;
    renderButtonContent(): import("lit-html").TemplateResult<1>;
    renderButtonElement(): import("lit-html").TemplateResult<1>;
    render(): import("lit-html").TemplateResult<1>;
}
export {};
