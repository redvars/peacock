import { LitElement, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import styles from './list.scss';
import { ListItem } from './list-item.js';
import IndividualComponent from '@/IndividualComponent.js';

/**
 * @label List
 * @tag wc-list
 * @rawTag list
 *
 * @summary A list container for one or more list items.
 *
 * @example
 * ```html
 * <wc-list>
 *   <wc-list-item>
 *     <wc-icon slot="leading" name="inbox"></wc-icon>
 *     Inbox
 *     <span slot="trailing">24</span>
 *   </wc-list-item>
 *    <wc-list-item>
 *       <wc-avatar slot="leading" name="Shivaji Varma"></wc-avatar>
 *        Shivaji Varma
 *       <span slot="supporting-text">Software Engineer</span>
 *       <span slot="trailing-supporting-text">7</span>
 *       <wc-icon slot="trailing" name="chevron_right"></wc-icon>
 *     </wc-list-item>
 * </wc-list>
 * ```
 * @tags display
 */
@IndividualComponent
export class List extends LitElement {
  static styles = [styles];

  static Item = ListItem;

  /**  */
  @property({ type: String, reflect: true }) variant: 'standard' | 'segmented' =
    'standard';

  /** Index of the currently active item within the clickable items list. */
  @state() private activeIndex = -1;

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'list');
    this.addEventListener('keydown', this._onKeyDown);
    this.addEventListener('click', this._onClick);
  }

  disconnectedCallback() {
    this.removeEventListener('keydown', this._onKeyDown);
    this.removeEventListener('click', this._onClick);
    super.disconnectedCallback();
  }

  override focus() {
    const target = this._getActiveItem() ?? this._getFirstClickableItem();
    target?.focus();
  }

  // ── Items ─────────────────────────────────────────────────────────────────

  get items(): ListItem[] {
    const slot = this.shadowRoot?.querySelector('slot');
    const elements = slot?.assignedElements({ flatten: true }) ?? [];
    return elements.filter(el => el instanceof ListItem) as ListItem[];
  }

  private _clickableItems() {
    return this.items.filter(item => item.isClickable());
  }

  // ── Roving tabindex ───────────────────────────────────────────────────────

  private _syncRovingTabIndex() {
    const allItems = this.items;
    const clickable = this._clickableItems();

    for (const item of allItems) {
      item.tabIndex = -1;
    }

    if (!clickable.length) {
      this.activeIndex = -1;
      return;
    }

    if (this.activeIndex < 0 || this.activeIndex >= clickable.length) {
      this.activeIndex = 0;
    }

    clickable[this.activeIndex].tabIndex = 0;
  }

  private _setActiveByOffset(offset: 1 | -1) {
    const clickable = this._clickableItems();
    if (!clickable.length) return;

    if (this.activeIndex < 0) {
      this.activeIndex = 0;
    } else {
      const count = clickable.length;
      this.activeIndex = (this.activeIndex + offset + count) % count;
    }

    this._syncRovingTabIndex();
    clickable[this.activeIndex]?.focus();
  }

  private _setBoundaryActive(index: number) {
    const clickable = this._clickableItems();
    if (!clickable.length) return;

    this.activeIndex = index;
    this._syncRovingTabIndex();
    clickable[this.activeIndex]?.focus();
  }

  private _getActiveItem() {
    const clickable = this._clickableItems();
    if (!clickable.length || this.activeIndex < 0) return null;
    return clickable[this.activeIndex] ?? null;
  }

  private _getFirstClickableItem() {
    return this._clickableItems()[0] ?? null;
  }

  // ── Event helpers ─────────────────────────────────────────────────────────

  private _isEventFromThisList(event: Event) {
    const path = event.composedPath();
    const sourceList = path.find(target => target instanceof List);
    return sourceList === this;
  }

  private _clickableItemFromEvent(event: Event) {
    if (!this._isEventFromThisList(event)) return null;
    const path = event.composedPath();
    const clickable = this._clickableItems();
    for (const target of path) {
      if (target instanceof ListItem) {
        const owned = clickable.find(item => item === target);
        if (owned) return owned;
      }
    }
    return null;
  }

  private _setActiveItem(item: ListItem) {
    const clickable = this._clickableItems();
    const nextIndex = clickable.indexOf(item);
    if (nextIndex < 0) return;
    this.activeIndex = nextIndex;
    this._syncRovingTabIndex();
  }

  // ── Handlers ──────────────────────────────────────────────────────────────

  private _onKeyDown = (event: KeyboardEvent) => {
    if (!this._isEventFromThisList(event)) return;

    const eventItem = this._clickableItemFromEvent(event);
    if (eventItem) {
      this._setActiveItem(eventItem);
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this._setActiveByOffset(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this._setActiveByOffset(-1);
        break;
      case 'Home':
        event.preventDefault();
        this._setBoundaryActive(0);
        break;
      case 'End':
        event.preventDefault();
        this._setBoundaryActive(Math.max(this._clickableItems().length - 1, 0));
        break;
      default:
        break;
    }
  };

  private _onClick = (event: Event) => {
    const item = this._clickableItemFromEvent(event);
    if (!item) return;
    this._setActiveItem(item);
  };

  private _onSlotChange = () => {
    this._syncRovingTabIndex();
  };

  render() {
    const cssClasses = {
      list: true,
      [`variant-${this.variant}`]: true,
    };

    return html`
      <div class=${classMap(cssClasses)}>
        <slot @slotchange=${this._onSlotChange}></slot>
      </div>
    `;
  }
}
