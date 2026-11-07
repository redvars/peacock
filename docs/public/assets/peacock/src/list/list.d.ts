import { LitElement } from 'lit';
import { ListItem } from './list-item.js';
/**
 * @label List
 * @tag wc-list
 * @rawTag list
 *
 * @summary A vertical list of rows, such as contacts or settings; rows that act are reached with the arrow keys.
 * @overview
 * <p>A list shows rows of content. Rows that act (<code>actionable</code> or with an
 * <code>href</code>) form one tab stop: the Up and Down arrow keys move between them, Home and
 * End jump to the first and last, and disabled rows are skipped.</p>
 * <p>For a navigation list, mark the row of the page the person is on with
 * <code>current</code> (<code>aria-current</code>). To let the person choose items, use
 * <code>wc-listbox</code>.</p>
 *
 * @example
 * ```html
 * <wc-list>
 *   <wc-list-item href="/inbox" current>
 *     <wc-icon slot="start" name="inbox"></wc-icon>
 *     Inbox
 *     <span slot="trailing-supporting-text">24</span>
 *   </wc-list-item>
 *   <wc-list-item actionable>
 *     <wc-avatar slot="start" name="Ada Lovelace"></wc-avatar>
 *     Ada Lovelace
 *     <span slot="supporting-text">Software Engineer</span>
 *     <wc-icon slot="end" name="chevron_right"></wc-icon>
 *   </wc-list-item>
 * </wc-list>
 * ```
 * @tags display
 */
export declare class List extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    static Item: typeof ListItem;
    /**
     * `standard` rows sit on the surface; `segmented` rows each get a
     * surface-container fill, a small gap and rounded outer corners.
     */
    variant: 'standard' | 'segmented';
    /** One tab stop across the actionable rows, moved with Up/Down, Home and End. */
    private readonly roving;
    connectedCallback(): void;
    focus(options?: Parameters<HTMLElement['focus']>[0]): void;
    get items(): ListItem[];
    /** Only keys from this list's own rows, not from a nested list. */
    private __handleKeyDown;
    private __handleSlotChange;
    /** Marks each item first / middle / last / only, for the segmented shape. */
    private __syncPositions;
    render(): import("lit-html").TemplateResult<1>;
}
