import { LitElement, nothing } from 'lit';
/**
 * @label Field
 * @tag wc-field
 * @rawTag field
 *
 * @summary The box around a form control, with its label, required mark, helper, error or warning text and a character count.
 * @overview
 * <p>The field draws the frame of a form control: the label with a required mark, the bordered
 * box with <code>field-start</code> and <code>field-end</code> slots, and a footer with helper,
 * error or warning text and a character count. Wrap a custom control in it to match the
 * built-in fields.</p>
 * <p>The <code>default</code> variant fills its box with <code>surface-container-lowest</code>, so it
 * stands out on cards and dialogs as well as on the page. <code>outlined</code> has no fill (the
 * outline alone marks it) and <code>filled</code> uses <code>surface-container-highest</code>, as in
 * Material 3. Disabled follows M3: the text at 38%, the outline at 12% and a 4% fill. Read-only
 * keeps the label and value at full contrast in a faint box, so it reads as information.</p>
 * <p>The <code>outlined</code> variant is the M3 outlined text field: its label rests inside the
 * empty field and, on focus or with a value, floats into a notch in the outline's top edge. The
 * outline is drawn in parts (start, notch, end), so the notch needs no background and the field
 * works on any surface. The outline is 1px, 2px while focused.</p>
 *
 * @cssprop --field-container-color - The box's fill. Defaults to `surface-container-lowest` (default variant), `surface-container-highest` (filled) or none (outlined).
 * @cssprop --field-outline-width - The outline's resting width. Defaults to 1px on the outlined variant.
 * @cssprop --field-label-rest-top - Where the outlined label's resting line is centred, from the top of the box. Defaults to the middle; multi-line fields set it to their first line.
 *
 * @example
 * ```html
 * <wc-field label="Name" required>
 *   some text
 * </wc-field>
 * ```
 * @tags form
 */
export declare class Field extends LitElement {
    static shadowRootOptions: ShadowRootInit;
    static styles: import("lit").CSSResultGroup[];
    /** Label text shown above the field input. */
    label: string;
    /** When true, marks the field as required and shows a required indicator. */
    required: boolean;
    /** When true, the field and its slotted input are disabled. */
    disabled: boolean;
    /** When true, the field and its slotted input are read-only. */
    readonly: boolean;
    /** When true, renders the field in a loading skeleton state. */
    skeleton: boolean;
    /** Helper/hint text shown in the field footer. */
    helperText: string;
    /** When true, the field is in an error state and `errorText` is shown. */
    error: boolean;
    /** Error message displayed when `error` is true. */
    errorText: string;
    /** When true, the field is in a warning state and `warningText` is shown. */
    warning: boolean;
    /** Warning message displayed when `warning` is true. */
    warningText: string;
    /** Character / word count string displayed at the trailing end of the footer. */
    textCount: string;
    /** When true, applies focused styling (controlled externally by the slotted input). */
    focused: boolean;
    /** When true, applies populated styling (controlled externally by the slotted input). */
    populated: boolean;
    /** Visual variant of the field container. */
    variant: 'filled' | 'outlined' | 'default';
    /**
     * Height of the field box: `sm` (2.5rem, the default, the same as a default button), `md`
     * (3.5rem) or `lg` (4rem). `data-density` on an ancestor shortens it further.
     */
    size: 'sm' | 'md' | 'lg';
    /** Reference to the host input element; used to forward click-on-label focus. */
    host?: HTMLElement;
    /** True when the `field-start` slot contains at least one node. */
    slotStartHasContent: boolean;
    /** True when the `field-end` slot contains at least one node. */
    slotEndHasContent: boolean;
    /** The bordered field container; used to anchor popups such as a select menu. */
    readonly fieldBodyElement: HTMLElement | null;
    /** The box the control sits in, between the leading and trailing content. */
    private readonly __inputWrapper;
    /** Watches the field and its control box, so the outlined label rests where the text starts. */
    private __resizeObserver?;
    connectedCallback(): void;
    disconnectedCallback(): void;
    firstUpdated(): void;
    __handleClick(): void;
    /**
     * Starts watching the field body and the control box. The outlined label rests over the
     * control's text and floats into the outline's notch; the text's start moves with leading
     * content such as an icon, so its inset is measured and handed to the styles.
     */
    private __observeInputBox;
    /** Hands the control box's inline insets to the styles as `--_input-start` and `--_input-end`. */
    private __measureInputBox;
    /** The label text and required mark, shared by the outlined label and its notch. */
    __renderLabelText(): import("lit-html").TemplateResult<1>;
    /**
     * The outline. The outlined variant builds it from parts, as Material 3 does: a start segment,
     * a notch as wide as the floating label whose top edge opens while the label floats, and an
     * end segment that takes the remaining width. The label floats into the notch, so the
     * outline needs no background behind the label and works on any surface.
     */
    __renderOutline(): import("lit-html").TemplateResult<1>;
    /** The outlined label: resting over the empty control, floating in the notch otherwise. */
    __renderOutlinedLabel(): typeof nothing | import("lit-html").TemplateResult<1>;
    __renderFieldHeader(): typeof nothing | import("lit-html").TemplateResult<1>;
    __renderFieldFooter(): typeof nothing | import("lit-html").TemplateResult<1>;
    __renderHelperText(): typeof nothing | import("lit-html").TemplateResult<1>;
    __renderWordCount(): typeof nothing | import("lit-html").TemplateResult<1>;
    render(): import("lit-html").TemplateResult<1>;
}
