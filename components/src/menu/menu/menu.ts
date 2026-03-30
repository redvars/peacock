import { LitElement, html } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import type { Placement } from '@floating-ui/dom';
import styles from './menu.scss';
import { MenuItem } from '../menu-item/menu-item.js';
import { MenuSurfaceController } from './MenuSurfaceController.js';

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
 * <wc-menu>
 *   <wc-menu-item>Item 1</wc-menu-item>
 *   <wc-menu-item>Item 2</wc-menu-item>
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

  private readonly _surfaceController = new MenuSurfaceController(this);

  private _lastFocusedElement: HTMLElement | null = null;

  private _closeReason: CloseReason = { kind: 'programmatic' };

  connectedCallback() {
    // eslint-disable-next-line wc/guard-super-call
    super.connectedCallback();
    this.setAttribute('role', 'menu');

    this.addEventListener('keydown', this._onKeyDown);
    this.addEventListener('focusout', this._onFocusOut);
    this.addEventListener('menu-item-activate', this._onItemActivate);
    this.addEventListener('menu-item-request-close', this._onItemRequestClose);
    window.addEventListener('click', this._onWindowClick, { capture: true });
    this._syncAnchorAria();
  }

  disconnectedCallback() {
    this.removeEventListener('keydown', this._onKeyDown);
    this.removeEventListener('focusout', this._onFocusOut);
    this.removeEventListener('menu-item-activate', this._onItemActivate);
    this.removeEventListener(
      'menu-item-request-close',
      this._onItemRequestClose,
    );
    window.removeEventListener('click', this._onWindowClick, { capture: true });
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
    const enabledItems = this._enabledItems();
    if (!enabledItems.length) {
      this.activeIndex = -1;
      return;
    }

    if (this.activeIndex < 0 || this.activeIndex >= enabledItems.length) {
      this.activeIndex = 0;
    }

    for (let index = 0; index < enabledItems.length; index += 1) {
      const currentItem = enabledItems[index];
      currentItem.setMenuItemTabIndex(index === this.activeIndex ? 0 : -1);
      currentItem.selected = index === this.activeIndex;
    }
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

  private _onItemActivate = (event: Event) => {
    const customEvent = event as CustomEvent<{ item: MenuItem }>;
    const enabledItems = this._enabledItems();
    const nextIndex = enabledItems.indexOf(customEvent.detail.item);
    if (nextIndex >= 0) {
      this.activeIndex = nextIndex;
      this._syncRovingTabIndex();
    }
  };

  private _onItemRequestClose = (event: Event) => {
    const customEvent = event as CustomEvent<{
      reason: 'click-selection' | 'keydown';
      key?: string;
    }>;

    if (customEvent.defaultPrevented) {
      return;
    }

    if (customEvent.detail.reason === 'click-selection') {
      this.close({ kind: 'click-selection' });
      return;
    }

    this.close({ kind: 'keydown', key: customEvent.detail.key ?? 'Enter' });
  };

  private _onKeyDown = (event: KeyboardEvent) => {
    if (!this.open) {
      return;
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
      default:
        break;
    }
  };

  private _onWindowClick = (event: MouseEvent) => {
    if (!this.open || this.stayOpenOnOutsideClick) {
      return;
    }

    const path = event.composedPath();
    const anchorEl = this._resolveAnchorElement();
    const inMenuTree = path.some(
      target => target === this || (target instanceof Node && this.contains(target)),
    );

    if (inMenuTree || (anchorEl && path.includes(anchorEl))) {
      return;
    }

    this.close({ kind: 'outside-click' });
  };

  private _isWithinMenuTree(node: Node | null) {
    if (!node) {
      return false;
    }

    let current: Node | null = node;
    while (current) {
      if (current === this || this.contains(current)) {
        return true;
      }

      const root = current.getRootNode();
      if (root instanceof ShadowRoot) {
        current = root.host;
      } else {
        current = null;
      }
    }

    return false;
  }

  private _onFocusOut = (event: FocusEvent) => {
    if (!this.open || this.stayOpenOnFocusout) {
      return;
    }

    const next = event.relatedTarget;
    if (!next) {
      return;
    }

    if (next instanceof Node && this._isWithinMenuTree(next)) {
      return;
    }

    this.close({ kind: 'focusout' });
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

    this._surfaceController.start({
      reference: anchorEl,
      floating: this.menuListElement,
      placement: this.placement,
      offset: this.offset,
      strategy: 'fixed',
    });
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
        this._surfaceController.stop();

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

        if (!this.isSubmenu) {
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
        open: this.open,
        closed: !this.open,
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
