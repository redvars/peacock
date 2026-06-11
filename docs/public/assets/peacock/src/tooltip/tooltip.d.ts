import { LitElement } from 'lit';
export type TooltipTrigger = 'hover' | 'focus' | 'click';
/**
 * @label Tooltip
 * @tag wc-tooltip
 * @rawTag tooltip
 * @summary Displays a tooltip for an element.
 * @tags display
 *
 * @example
 * ```html
 * <wc-tooltip preview>Tooltip</wc-tooltip>
 * ```
 */
export declare class Tooltip extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    content: string;
    /**
     * The ID of the element the tooltip should attach to.
     * If not provided, it defaults to the parent element.
     */
    for: string;
    trigger: string;
    open: boolean;
    variant: 'plain' | 'rich';
    preview: boolean;
    private _target;
    private _floating;
    private resolveTrigger;
    private detachListeners;
    _focusTarget?: HTMLElement;
    set forElement(value: HTMLElement | null);
    __getFocusTarget(): HTMLElement | null;
    private attachListeners;
    connectedCallback(): void;
    disconnectedCallback(): void;
    protected updated(changedProps: Map<string, any>): void;
    render(): import("lit-html").TemplateResult<1>;
    __renderPlainTooltip(): import("lit-html").TemplateResult<1>;
    __renderRichTooltip(): import("lit-html").TemplateResult<1>;
}
