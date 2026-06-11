import { LitElement, nothing } from 'lit';
import type { ButtonColor, ButtonLevel, ButtonShape, ButtonSize, ButtonVariant } from '@/button/ButtonTypes.js';
declare const IconButton_base: import("../../__internal/mixins/mixin.js").MixinReturn<import("../../__internal/mixins/mixin.js").MixinReturn<import("../../__internal/mixins/mixin.js").MixinReturn<import("../../__internal/mixins/mixin.js").MixinReturn<import("../../__internal/mixins/mixin.js").MixinReturn<(abstract new (...args: any[]) => import("@/__internal/mixins/element-internals.js").WithElementInternals) & typeof LitElement & import("@/__internal/mixins/form-associated.js").FormAssociatedConstructor, import("@/__internal/mixins/form-associated.js").FormAssociated>, import("@/__internal/mixins/form-submitter.js").FormSubmitter>>, import("@/__internal/mixins/hyperlink.js").Hyperlink>, import("../base-button/base-button.js").BaseButton>;
/**
 * @label Icon Button
 * @tag wc-icon-button
 * @rawTag icon-button
 *
 * @summary Icon buttons allow users to take actions, and make choices, with a single tap.
 *
 * @overview
 * <p>Icon buttons are clickable elements that are used to trigger actions. They communicate calls to action to the user and allow users to interact with pages in a variety of ways. IconButton labels express what action will occur when the user interacts with it.</p>
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
 * @fires {CustomEvent} button:click - Dispatched when the button is clicked.
 *
 * @example
 * ```html
 * <wc-icon-button><wc-icon name="home"></wc-icon></wc-icon-button>
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
    /**
     * Type is preset of color and variant. Type will be only applied.
     *
     */
    level?: ButtonLevel;
    /** Shape of the button container. */
    shape?: ButtonShape;
    /**
     * The visual style of the button.
     *
     *  Possible variant values:
     * `"filled"` is a filled button.
     * `"outlined"` is an outlined button.
     * `"text"` is a transparent button.
     * `"tonal"` is a light color button.
     * `"elevated"` is elevated button
     */
    variant: ButtonVariant;
    /**
     * Defines the primary color of the button. This can be set to predefined color names to apply specific color themes.
     */
    color: ButtonColor;
    /** When true, renders the button in a loading skeleton state. */
    skeleton: boolean;
    /** When true, the button acts as a toggle. Use with `selected`. */
    toggle: boolean;
    /** When true (and `toggle` is set), the button is in the selected/pressed state. */
    selected: boolean;
    /** Optional tooltip text displayed on hover. */
    tooltip?: string;
    readonly buttonElement: HTMLElement | null;
    constructor();
    __dispatchClick: (event: MouseEvent | KeyboardEvent) => void;
    focus(): void;
    blur(): void;
    firstUpdated(changedProperties: Map<PropertyKey, unknown>): void;
    __convertTypeToVariantAndColor(): void;
    renderDisabledReason(softDisabled: boolean): typeof nothing | import("lit-html").TemplateResult<1>;
    renderTooltip(): typeof nothing | import("lit-html").TemplateResult<1>;
    renderButtonContent(): import("lit-html").TemplateResult<1>;
    renderButtonElement(): import("lit-html").TemplateResult<1>;
    render(): import("lit-html").TemplateResult<1>;
}
export {};
