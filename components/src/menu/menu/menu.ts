import { LitElement, html } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import type { Placement } from '@floating-ui/dom';
import styles from './menu.scss';
import { FloatingController } from '../../__controllers/floating-controller.js';
import { MenuItem } from '../menu-item/menu-item.js';

type CloseReason =
  | { kind: 'click-selection' }
  | { kind: 'keydown'; key: string }
  | { kind: 'outside-click' }
  | { kind: 'focusout' }
  | { kind: 'programmatic' };

/**
 * @label Menu
 * @tag wc-menu
 * @rawTag menu
 * @summary A list of menu items.
 * @tags navigation
 *
 * @example
 * ```html
 * <wc-menu preview>
 *   <wc-menu-item>Item 1</wc-menu-item>
 *   <wc-menu-item selected>Item 2</wc-menu-item>
 * </wc-menu>
 * ```
 */
export class Menu extends LitElement {
  static styles = [styles];

  static Item = MenuItem;

  @property({ type: Boolean, reflect: true }) open = false;

  @property({ type: String, reflect: true }) variant: 'standard' | 'vibrant' =
    'standard';

  @property({ type: String }) anchor = '';

  @property({ type: Boolean, reflect: true }) preview = false;

  @property({ type: Boolean, attribute: 'stay-open-on-outside-click' })
  stayOpenOnOutsideClick = false;

  @property({ type: Boolean, attribute: 'stay-open-on-focusout' })
  stayOpenOnFocusout = false;

  @property({ type: Boolean, attribute: 'is-submenu' }) isSubmenu = false;

  @property({ type: String }) placement: Placement = 'bottom-start';

  @property({ type: Number }) offset = 6;

  @state() private activeIndex = -1;

  @query('.menu') private readonly menuListElement!: HTMLElement;

  anchorElement: HTMLElement | null = null;

  private readonly _floatingController = new FloatingController(this, {
    trigger: 'manual',
    closeOnClickOutside: false,
    strategy: 'fixed',
    onOpenChange: (isOpen) => {
      if (isOpen || !this.open) {
        return;
      }

      this.close({ kind: 'outside-click' });
    },
  });

  private _lastFocusedElement: HTMLElement | null = null;

  private _closeReason: CloseReason = { kind: 'programmatic' };

  connectedCallback() {
    // eslint-disable-next-line wc/guard-super-call
    super.connectedCallback();
    this.setAttribute('role', 'menu');

    // this.addEventListener('keydown', this._onKeyDown);
    // this.addEventListener('click', this._onClick);
    this._syncAnchorAria();
  }

  disconnectedCallback() {
    // this.removeEventListener('keydown', this._onKeyDown);
    // this.removeEventListener('click', this._onClick);
    this._floatingController.close();
    super.disconnectedCallback();
  }

  get items(): MenuItem[] {
    const slot = this.shadowRoot?.querySelector('slot');
    const elements = slot?.assignedElements({ flatten: true }) ?? [];
    const items: MenuItem[] = [];

    for (const element of elements) {
      if (element instanceof MenuItem) {
        items.push(element);
      } else {
        const maybeItem = (element as { item?: unknown }).item;
        if (maybeItem instanceof MenuItem) {
          items.push(maybeItem);
        }
      }
    }

    return items;
  }

  show() {
    if (this.open) {
      return;
    }

    this._closeReason = { kind: 'programmatic' };
    this.open = true;
  }

  close(reason: CloseReason = { kind: 'programmatic' }) {
    if (!this.open) {
      return;
    }

    this._closeReason = reason;
    this.open = false;
  }

  override focus() {
    const target = this._getActiveItem() ?? this._getFirstEnabledItem();
    target?.focus();
  }

  private _resolveAnchorElement() {
    if (this.anchorElement) {
      return this.anchorElement;
    }

    if (!this.anchor) {
      return null;
    }

    const root = this.getRootNode() as Document | ShadowRoot;
    if ('getElementById' in root) {
      return root.getElementById(this.anchor);
    }

    return document.getElementById(this.anchor);
  }

  private _syncAnchorAria() {
    const anchorEl = this._resolveAnchorElement();
    if (!anchorEl) {
      return;
    }

    if (!this.id) {
      this.id = `wc-menu-${Math.random().toString(36).slice(2, 9)}`;
    }

    anchorEl.setAttribute('aria-haspopup', 'menu');
    anchorEl.setAttribute('aria-controls', this.id);
    anchorEl.setAttribute('aria-expanded', String(this.open));
  }

  private _enabledItems() {
    return this.items.filter(item => !item.disabled);
  }

  private _syncRovingTabIndex() {
    const ownedItems = this.items;
    const enabledItems = this._enabledItems();
    for (const item of ownedItems) {
      item.tabIndex = -1;
    }

    if (!enabledItems.length) {
      this.activeIndex = -1;
      return;
    }

    if (this.activeIndex < 0 || this.activeIndex >= enabledItems.length) {
      this.activeIndex = 0;
    }

    enabledItems[this.activeIndex].tabIndex = 0;
  }

  private _setActiveByOffset(offset: 1 | -1) {
    const enabledItems = this._enabledItems();
    if (!enabledItems.length) {
      return;
    }

    if (this.activeIndex < 0) {
      this.activeIndex = 0;
    } else {
      const count = enabledItems.length;
      this.activeIndex = (this.activeIndex + offset + count) % count;
    }

    this._syncRovingTabIndex();
    enabledItems[this.activeIndex]?.focus();
  }

  private _setBoundaryActive(index: number) {
    const enabledItems = this._enabledItems();
    if (!enabledItems.length) {
      return;
    }

    this.activeIndex = index;
    this._syncRovingTabIndex();
    enabledItems[this.activeIndex]?.focus();
  }

  private _getActiveItem() {
    const enabledItems = this._enabledItems();
    if (!enabledItems.length || this.activeIndex < 0) {
      return null;
    }

    return enabledItems[this.activeIndex] ?? null;
  }

  private _getFirstEnabledItem() {
    return this._enabledItems()[0] ?? null;
  }

  private _isEventFromThisMenu(event: Event) {
    const path = event.composedPath();
    const sourceMenu = path.find(
      target =>
        target instanceof HTMLElement &&
        target.tagName.toLowerCase() === 'wc-menu',
    );

    return sourceMenu === this;
  }

  private _ownedItemFromEvent(event: Event) {
    if (!this._isEventFromThisMenu(event)) {
      return null;
    }

    const path = event.composedPath();
    const ownedItems = this.items;

    for (const target of path) {
      if (target instanceof HTMLElement) {
        if (target.tagName.toLowerCase() === 'wc-menu-item') {
          const ownedItem = ownedItems.find(item => item === target);
          if (ownedItem) {
            return ownedItem;
          }
        }
      }
    }

    return null;
  }

  private _setActiveItem(item: MenuItem) {
    const enabledItems = this._enabledItems();
    const nextIndex = enabledItems.indexOf(item);
    if (nextIndex < 0) {
      return;
    }

    this.activeIndex = nextIndex;
    this._syncRovingTabIndex();
  }

  private _onClick = (event: Event) => {
    if (!this.open) {
      return;
    }

    const item = this._ownedItemFromEvent(event);
    if (!item) {
      return;
    }

    this._setActiveItem(item);
    if (item.keepOpen) {
      return;
    }

    this.close({ kind: 'click-selection' });
  };

  private _onKeyDown = (event: KeyboardEvent) => {
    if (!this.open) {
      return;
    }

    if (!this._isEventFromThisMenu(event)) {
      return;
    }

    const eventItem = this._ownedItemFromEvent(event);
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
      case 'End': {
        event.preventDefault();
        const last = Math.max(this._enabledItems().length - 1, 0);
        this._setBoundaryActive(last);
        break;
      }
      case 'Escape':
        event.preventDefault();
        this.close({ kind: 'keydown', key: 'Escape' });
        break;
      case 'Tab':
        this.close({ kind: 'keydown', key: 'Tab' });
        break;
      case 'Enter':
      case ' ': {
        event.preventDefault();
        const activeItem = this._getActiveItem() ?? this._getFirstEnabledItem();
        if (!activeItem) {
          return;
        }

        this._setActiveItem(activeItem);
        activeItem.click();
        break;
      }
      default:
        break;
    }
  };



  private _onSlotChange = () => {
    this._syncRovingTabIndex();
  };

  private _applyPositioning() {
    if (!this.open || !this.menuListElement) {
      return;
    }

    const anchorEl = this._resolveAnchorElement();
    if (!anchorEl) {
      return;
    }

    this._floatingController.setOptions({
      placement: this.placement,
      offset: this.offset,
      strategy: 'fixed',
      // closeOnClickOutside: !this.stayOpenOnOutsideClick,
      closeOnClickOutside: false,
    });
    this._floatingController.setElements(anchorEl, this.menuListElement);
    this._floatingController.open();
  }

  protected override updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('anchor') || changedProperties.has('open')) {
      this._syncAnchorAria();
    }

    if (changedProperties.has('open')) {
      if (this.open) {
        this._lastFocusedElement = document.activeElement as HTMLElement | null;
        this._syncRovingTabIndex();
        this.dispatchEvent(
          new CustomEvent('opened', {
            bubbles: true,
            composed: true,
          }),
        );

        this._applyPositioning();
      } else {
        this._floatingController.close();

        const reason = this._closeReason;
        this.dispatchEvent(
          new CustomEvent('close-menu', {
            bubbles: true,
            composed: true,
            detail: {
              reason,
              itemPath: [],
            },
          }),
        );
        this.dispatchEvent(
          new CustomEvent('closed', {
            bubbles: true,
            composed: true,
            detail: { reason },
          }),
        );

        const shouldRestoreFocus =
          reason.kind !== 'keydown' || reason.key !== 'Tab';

        if (!this.isSubmenu && shouldRestoreFocus) {
          this._lastFocusedElement?.focus();
        }
      }
    }

    if (
      (changedProperties.has('open') ||
        changedProperties.has('anchor') ||
        changedProperties.has('placement') ||
        changedProperties.has('offset')) &&
      this.open
    ) {
      this._applyPositioning();
    }
  }

  render() {
    return html`<div
      class=${classMap({
        'menu': true,
        open: !this.preview && this.open,
        closed: !this.preview && !this.open,
        preview: this.preview,
        [`variant-${this.variant}`]: true,
      })}
      aria-hidden=${String(!this.open)}
    >
      <div class="background"></div>
      <wc-elevation class="elevation"></wc-elevation>

      <div class="menu-content">
        <slot @slotchange=${this._onSlotChange}></slot>
      </div>
    </div>`;
  }
}
