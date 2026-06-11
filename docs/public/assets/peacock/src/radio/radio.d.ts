import { LitElement } from 'lit';
export declare class Radio extends LitElement {
    private static readonly DIRECTION_NEXT;
    private static readonly DIRECTION_PREVIOUS;
    static styles: import("lit").CSSResultGroup[];
    /**
     * The input field name for grouping radios.
     */
    name: string;
    /**
     * The submitted value when this radio is selected.
     */
    value: string;
    /**
     * The radio label.
     */
    label: string;
    /**
     * Whether the radio is selected.
     */
    checked: boolean;
    /**
     * If true, required icon is shown. Defaults to `false`.
     */
    required: boolean;
    /**
     * If true, the radio is readonly. Defaults to `false`.
     */
    readonly: boolean;
    /**
     * If true, the user cannot interact with the radio. Defaults to `false`.
     */
    disabled: boolean;
    /**
     * Configuration object for aria attributes.
     */
    configAria: Record<string, string>;
    /** True while the radio container has keyboard focus. */
    private hasFocus;
    /** True while the user is actively pressing the radio (mouse/keyboard). */
    private isActive;
    /** True when slotted label content or `label` property is present. */
    private slotHasContent;
    /** True for the one radio in the group that should receive tab focus (roving tabindex). */
    private isGroupFocusTarget;
    private containerElement?;
    private nativeElement?;
    /** Captured `tabindex` attribute value forwarded to the inner container. */
    private tabindex?;
    connectedCallback(): void;
    disconnectedCallback(): void;
    firstUpdated(): void;
    updated(changedProps: Map<string, unknown>): void;
    private handleInitialAttributes;
    private windowMouseUp;
    private windowKeyUp;
    private mouseDownHandler;
    private keyDownHandler;
    private clickHandler;
    private blurHandler;
    private focusHandler;
    private selectRadio;
    private dispatchChange;
    private uncheckSiblings;
    private getGroupRadios;
    private isRadioEnabled;
    private updateGroupFocusTarget;
    private navigateGroup;
    /**
     * Sets focus on the radio.
     */
    focus(): void;
    /**
     * Removes focus from the radio.
     */
    blur(): void;
    render(): import("lit-html").TemplateResult<1>;
}
