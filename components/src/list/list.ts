import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import styles from './list.scss';
import { ListItem, type ListItemPosition } from './list-item.js';
import IndividualComponent from '@/IndividualComponent.js';
import { RovingFocusController } from '@/__internal/controllers/roving-focus-controller.js';

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
@IndividualComponent
export class List extends LitElement {
  // ── Static

  static styles = [styles];

  static Item = ListItem;

  // ── Properties

  /**
   * `standard` rows sit on the surface; `segmented` rows each get a
   * surface-container fill, a small gap and rounded outer corners.
   */
  @property({ type: String, reflect: true }) variant: 'standard' | 'segmented' =
    'standard';

  // ── Private fields

  /** One tab stop across the actionable rows, moved with Up/Down, Home and End. */
  private readonly roving = new RovingFocusController(this, {
    items: () => this.items,
    orientation: () => 'vertical',
    isFocusable: item => {
      const row = item as ListItem;
      return row.isClickable() && !row.disabled && !row.hidden;
    },
  });

  // ── Lifecycle

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'list');
  }

  // ── Public

  override focus(options?: Parameters<HTMLElement['focus']>[0]) {
    this.roving.sync();
    this.roving.activeItem?.focus(options);
  }

  get items(): ListItem[] {
    const slot = this.shadowRoot?.querySelector('slot');
    const elements = slot?.assignedElements({ flatten: true }) ?? [];
    return elements.filter(el => el instanceof ListItem) as ListItem[];
  }

  // ── Private

  /** Only keys from this list's own rows, not from a nested list. */
  private __handleKeyDown = (event: KeyboardEvent) => {
    const owner = event.composedPath().find(target => target instanceof List);
    if (owner !== this) return;
    this.roving.handleKeyDown(event);
  };

  private __handleSlotChange = () => {
    this.__syncPositions();
    this.roving.sync();
  };

  /** Marks each item first / middle / last / only, for the segmented shape. */
  private __syncPositions() {
    const { items } = this;
    const last = items.length - 1;
    items.forEach((item, index) => {
      let position: ListItemPosition = 'middle';
      if (last === 0) position = 'only';
      else if (index === 0) position = 'first';
      else if (index === last) position = 'last';
      // eslint-disable-next-line no-param-reassign
      item.listPosition = position;
    });
  }

  // ── Render

  render() {
    const cssClasses = {
      list: true,
      [`variant-${this.variant}`]: true,
    };

    return html`
      <div
        class=${classMap(cssClasses)}
        @keydown=${this.__handleKeyDown}
        @focusin=${this.roving.handleFocusIn}
      >
        <slot @slotchange=${this.__handleSlotChange}></slot>
      </div>
    `;
  }
}
