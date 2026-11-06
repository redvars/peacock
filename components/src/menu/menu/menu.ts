import { html, LitElement, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import type { Placement } from '@floating-ui/dom';
import styles from './menu.scss';
import { FloatingController } from '../../__internal/controllers/floating-controller.js';
import { MenuItem } from '../menu-item/menu-item.js';
import IndividualComponent from '@/IndividualComponent.js';

export type MenuCloseReason =
  | { kind: 'click-selection' }
  | { kind: 'keydown'; key: string }
  | { kind: 'outside-click' }
  | { kind: 'programmatic' };

/** Which item receives focus when the menu opens or `focus()` is called. */
export type MenuFocusTarget = 'active' | 'first' | 'last';

/** Time after the last typed character before the typeahead buffer resets. */
const TYPEAHEAD_RESET_MS = 500;

/** Fallback for removing the menu from the top layer when no transitionend arrives. */
const EXIT_FALLBACK_MS = 300;

const POSITION_ATTRIBUTES = [
  'data-position-first',
  'data-position-last',
  'data-position-after-divider',
  'data-position-before-divider',
] as const;

/**
 * @label Menu
 * @tag wc-menu
 * @rawTag menu
 * @summary A temporary surface that shows a list of actions or choices.
 * @overview
 * <p>A menu opens next to an anchor element, in the browser's top layer, so it shows above dialogs,
 * sticky headers and any parent with <code>overflow: hidden</code>. Items are <code>wc-menu-item</code>
 * elements; a <code>wc-divider</code> separates groups and a <code>wc-sub-menu</code> nests a menu.</p>
 * <p>Keyboard: when the menu opens, focus moves to the selected item or the first enabled one. Arrow
 * Up/Down move with wrap-around, Home/End jump to the ends, typing a letter jumps to the next item
 * starting with it, Enter/Space activate, Escape closes and returns focus to the trigger, Tab closes.</p>
 *
 * @cssprop --menu-container-color - Background of the standard menu surface.
 * @cssprop --menu-item-label-color - Text color of the items.
 * @cssprop --menu-item-icon-color - Color of leading and trailing icons.
 * @cssprop --menu-item-selected-container-color - Background of selected items.
 * @cssprop --menu-item-selected-label-color - Text and icon color of selected items.
 * @cssprop --menu-max-height - Maximum height before the menu scrolls. Defaults to `20rem`; the menu never grows past the viewport.
 * @cssprop --menu-min-width - Minimum width of the menu. Defaults to `112px`.
 * @cssprop --menu-width - Width of the menu. Defaults to `max-content`.
 *
 * @fires {CustomEvent} opened - Dispatched on the menu after it opens. Does not bubble.
 * @fires {CustomEvent<{reason: MenuCloseReason}>} closed - Dispatched on the menu after it closes. Does not bubble.
 * @fires {CustomEvent<{item: MenuItem}>} menu-item-activate - Dispatched when an item is activated.
 *
 * @example
 * ```html
 * <wc-menu preview>
 *   <wc-menu-item>Item 1</wc-menu-item>
 *   <wc-menu-item selected>Item 2</wc-menu-item>
 * </wc-menu>
 * ```
 * @tags navigation
 */
@IndividualComponent
export class Menu extends LitElement {
  static styles = [styles];

  static Item = MenuItem;

  /** Whether the menu is currently visible. */
  @property({ type: Boolean, reflect: true })
  open = false;

  /**
   * Visual variant.
   * `"standard"` is one elevated surface; dividers are hairlines.
   * `"expressive"` splits the menu into separate rounded segments at each `wc-divider`.
   */
  @property({ type: String, reflect: true })
  variant: 'standard' | 'expressive' = 'standard';

  /** ID of the anchor element the menu is positioned relative to. */
  @property({ type: String })
  anchor = '';

  /** When true, renders the menu in a static preview state (always visible, in the page flow). */
  @property({ type: Boolean, reflect: true })
  preview = false;

  /** When true, the menu will not close when a click occurs outside it. */
  @property({ type: Boolean, attribute: 'stay-open-on-outside-click' })
  stayOpenOnOutsideClick = false;

  /** When true, opening the menu leaves focus where it is instead of moving it to an item. */
  @property({ type: Boolean, attribute: 'no-autofocus' })
  noAutofocus = false;

  /** Set to true when this menu is being used as a submenu inside another menu. */
  @property({ type: Boolean, attribute: 'is-submenu' })
  isSubmenu = false;

  /** Floating UI placement of the menu relative to its anchor. */
  @property({ type: String })
  placement: Placement = 'bottom-start';

  /** Distance in pixels between the menu and its anchor element. */
  @property({ type: Number })
  offset = 4;

  /** Index of the currently focused/active item within the enabled items list. */
  @state()
  private activeIndex = -1;

  @query('.menu')
  private readonly menuListElement!: HTMLElement | null;

  /** Direct reference to the anchor element; takes precedence over the `anchor` ID property. */
  anchorElement: HTMLElement | null = null;

  /** Controller managing floating-UI positioning. */
  private readonly _floatingController = new FloatingController(this, {
    trigger: 'manual',
    closeOnClickOutside: false,
    strategy: 'fixed',
    fitViewport: true,
    viewportPadding: 8,
    onOpenChange: isOpen => {
      if (isOpen || !this.open) {
        return;
      }

      this.close({ kind: 'outside-click' });
    },
  });

  /** Element that had focus before the menu opened; restored on close. */
  private _lastFocusedElement: HTMLElement | null = null;

  /** Reason that triggered the most recent close, included in the `closed` event detail. */
  private _closeReason: MenuCloseReason = { kind: 'programmatic' };

  /** Item to focus when the menu opens; set by `show()`. */
  private _openFocus: MenuFocusTarget = 'active';

  private _typeaheadBuffer = '';

  private _typeaheadTimer?: number;

  private _exitTimer?: number;

  /** Elements that carry `data-position-*` attributes from the last sync. */
  private _positionedElements: HTMLElement[] = [];

  connectedCallback() {
    // eslint-disable-next-line wc/guard-super-call
    super.connectedCallback();
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'menu');
    }

    this.addEventListener('keydown', this._onKeyDown);
    this.addEventListener('click', this._onClick);
    this._syncAnchorAria();
  }

  disconnectedCallback() {
    this.removeEventListener('keydown', this._onKeyDown);
    this.removeEventListener('click', this._onClick);
    window.clearTimeout(this._typeaheadTimer);
    window.clearTimeout(this._exitTimer);
    this._floatingController.close();
    super.disconnectedCallback();
  }

  /** The items this menu owns: slotted `wc-menu-item`s (and subclasses) and the items of slotted `wc-sub-menu`s. */
  get items(): MenuItem[] {
    const items: MenuItem[] = [];
    for (const element of this._slottedElements()) {
      const item = this._resolveItem(element);
      if (item) {
        items.push(item);
      }
    }

    return items;
  }

  /** Opens the menu. `focusTarget` picks the item that receives focus. */
  show(focusTarget: MenuFocusTarget = 'active') {
    this._openFocus = focusTarget;
    if (this.open) {
      this.focus(focusTarget);
      return;
    }

    this._closeReason = { kind: 'programmatic' };
    this.open = true;
  }

  close(reason: MenuCloseReason = { kind: 'programmatic' }) {
    if (!this.open) {
      return;
    }

    this._closeReason = reason;
    this.open = false;
  }

  /** Opens the menu when it is closed and closes it when it is open. */
  toggle() {
    if (this.open) {
      this.close();
    } else {
      this.show();
    }
  }

  /** Focuses an item: the selected or last active one (`"active"`), the first or the last. */
  // eslint-disable-next-line no-undef
  override focus(target: MenuFocusTarget | FocusOptions = 'active') {
    const enabledItems = this._enabledItems();
    if (!enabledItems.length) {
      return;
    }

    let index: number;
    if (target === 'first') {
      index = 0;
    } else if (target === 'last') {
      index = enabledItems.length - 1;
    } else {
      const selectedIndex = enabledItems.findIndex(item => item.selected);
      if (selectedIndex >= 0) {
        index = selectedIndex;
      } else if (
        this.activeIndex >= 0 &&
        this.activeIndex < enabledItems.length
      ) {
        index = this.activeIndex;
      } else {
        index = 0;
      }
    }

    this.activeIndex = index;
    this._syncRovingTabIndex();
    enabledItems[index]?.focus();
  }

  private _slottedElements(): Element[] {
    const slot = this.shadowRoot?.querySelector('slot');
    return slot?.assignedElements({ flatten: true }) ?? [];
  }

  /** The item that represents a slotted element: the element itself or the item of a `wc-sub-menu`. */
  private _resolveItem(element: Element): MenuItem | null {
    if (element instanceof MenuItem) {
      return element;
    }

    const maybeItem = (element as { item?: unknown }).item;
    return maybeItem instanceof MenuItem ? maybeItem : null;
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
    // Only an anchor given by ID is in the same tree as the menu, so aria-controls can point at it.
    // Components that pass anchorElement manage their own trigger ARIA.
    if (this.anchorElement || !this.anchor) {
      return;
    }

    const anchorEl = this._resolveAnchorElement();
    if (!anchorEl) {
      return;
    }

    if (!this.id) {
      this.id = `wc-menu-${Math.random().toString(36).slice(2, 9)}`;
    }

    anchorEl.setAttribute('aria-haspopup', this.getAttribute('role') ?? 'menu');
    anchorEl.setAttribute('aria-controls', this.id);
    anchorEl.setAttribute('aria-expanded', String(this.open));
  }

  private _enabledItems() {
    return this.items.filter(item => !item.disabled && !item.hidden);
  }

  /** Re-reads the items after they change (for example when a select filters its options). */
  syncItems() {
    this._syncRovingTabIndex();
    this._syncLayout();
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
      const selectedIndex = enabledItems.findIndex(item => item.selected);
      this.activeIndex = Math.max(selectedIndex, 0);
    }

    enabledItems[this.activeIndex].tabIndex = 0;
  }

  private _setActiveByOffset(offset: 1 | -1) {
    const enabledItems = this._enabledItems();
    if (!enabledItems.length) {
      return;
    }

    if (this.activeIndex < 0) {
      this.activeIndex = offset === 1 ? 0 : enabledItems.length - 1;
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

  private _isEventFromThisMenu(event: Event) {
    const path = event.composedPath();
    const sourceMenu = path.find(target => target instanceof Menu);

    return sourceMenu === this;
  }

  private _ownedItemFromEvent(event: Event) {
    if (!this._isEventFromThisMenu(event)) {
      return null;
    }

    const path = event.composedPath();
    const ownedItems = this.items;

    for (const target of path) {
      if (target instanceof MenuItem) {
        const ownedItem = ownedItems.find(item => item === target);
        if (ownedItem) {
          return ownedItem;
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

  private _dispatchItemActivate(item: MenuItem) {
    this.dispatchEvent(
      new CustomEvent('menu-item-activate', {
        bubbles: true,
        composed: true,
        detail: { item },
      }),
    );
  }

  /** Moves focus to the next item whose label starts with the typed characters. */
  private _typeahead(key: string) {
    window.clearTimeout(this._typeaheadTimer);
    this._typeaheadTimer = window.setTimeout(() => {
      this._typeaheadBuffer = '';
    }, TYPEAHEAD_RESET_MS);

    const enabledItems = this._enabledItems();
    if (!enabledItems.length) {
      return;
    }

    const repeated =
      this._typeaheadBuffer.length > 0 &&
      [...this._typeaheadBuffer].every(char => char === key.toLowerCase());
    this._typeaheadBuffer += key.toLowerCase();
    // Typing the same letter again cycles through the items that start with it.
    const prefix = repeated ? key.toLowerCase() : this._typeaheadBuffer;
    const start = Math.max(this.activeIndex, 0);
    const count = enabledItems.length;
    const firstOffset = prefix.length === 1 ? 1 : 0;

    for (let step = firstOffset; step < count + firstOffset; step += 1) {
      const index = (start + step) % count;
      if (enabledItems[index].typeaheadText.startsWith(prefix)) {
        this._setBoundaryActive(index);
        return;
      }
    }
  }

  private _onClick = (event: Event) => {
    if (!this.open) {
      return;
    }

    const item = this._ownedItemFromEvent(event);
    if (!item || item.disabled || item.softDisabled) {
      return;
    }

    this._setActiveItem(item);
    this._dispatchItemActivate(item);
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
        const activeItem = this._getActiveItem();
        if (!activeItem) {
          return;
        }

        activeItem.click();
        break;
      }
      default:
        if (
          event.key.length === 1 &&
          !event.ctrlKey &&
          !event.metaKey &&
          !event.altKey
        ) {
          this._typeahead(event.key);
        }
        break;
    }
  };

  private _onSlotChange = () => {
    this._syncRovingTabIndex();
    this._syncLayout();
  };

  /** Sets `has-icons` and, for the expressive variant, the segment position attributes. */
  private _syncLayout() {
    const elements = this._slottedElements();

    this.toggleAttribute(
      'has-icons',
      this.items.some(item => item.hasStartContent),
    );

    for (const el of this._positionedElements) {
      for (const name of POSITION_ATTRIBUTES) {
        el.removeAttribute(name);
      }
    }
    this._positionedElements = [];

    if (this.variant !== 'expressive') {
      return;
    }

    const isDivider = (el: Element) =>
      el.tagName.toLowerCase() === 'wc-divider';
    const mark = (
      el: Element | undefined,
      name: (typeof POSITION_ATTRIBUTES)[number],
    ) => {
      if (!el) {
        return;
      }

      // Set the attribute on the item itself (not a wrapping wc-sub-menu) so it styles its own host.
      const target = this._resolveItem(el) ?? el;
      if (target instanceof HTMLElement) {
        target.setAttribute(name, '');
        this._positionedElements.push(target);
      }
    };

    const entries = elements.filter(el => !isDivider(el));
    mark(entries[0], 'data-position-first');
    mark(entries[entries.length - 1], 'data-position-last');

    elements.forEach((el, index) => {
      if (!isDivider(el)) {
        return;
      }

      const previous = elements
        .slice(0, index)
        .reverse()
        .find(candidate => !isDivider(candidate));
      const next = elements
        .slice(index + 1)
        .find(candidate => !isDivider(candidate));
      mark(previous, 'data-position-before-divider');
      mark(next, 'data-position-after-divider');
    });
  }

  /** Shows the menu surface in the top layer, or hides it there once the exit transition ends. */
  private _syncLayer() {
    const layer = this.menuListElement;
    if (
      !layer ||
      typeof layer.showPopover !== 'function' ||
      !layer.hasAttribute('popover')
    ) {
      return;
    }

    window.clearTimeout(this._exitTimer);
    const showing = layer.matches(':popover-open');

    if (this.open && this.isConnected) {
      if (!showing) {
        layer.showPopover();
      }
      return;
    }

    if (!showing) {
      return;
    }

    const controller = new AbortController();
    const hide = () => {
      window.clearTimeout(this._exitTimer);
      controller.abort();
      if (!this.open && layer.matches(':popover-open')) {
        layer.hidePopover();
      }
    };
    layer.addEventListener(
      'transitionend',
      (event: TransitionEvent) => {
        if (event.target === layer && event.propertyName === 'opacity') {
          hide();
        }
      },
      { signal: controller.signal },
    );
    this._exitTimer = window.setTimeout(hide, EXIT_FALLBACK_MS);
  }

  private _applyPositioning() {
    if (!this.open || !this.menuListElement || this.preview) {
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
      closeOnClickOutside: !this.stayOpenOnOutsideClick,
    });
    this._floatingController.setElements(anchorEl, this.menuListElement);
    this._floatingController.open();
  }

  protected override updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('anchor') || changedProperties.has('open')) {
      this._syncAnchorAria();
    }

    if (changedProperties.has('variant')) {
      this._syncLayout();
    }

    if (changedProperties.has('open')) {
      this._syncLayer();

      if (this.open) {
        this._lastFocusedElement = this._deepActiveElement();
        this._syncRovingTabIndex();
        this._syncLayout();
        this._applyPositioning();

        if (!this.noAutofocus && !this.preview) {
          this.focus(this._openFocus);
        }
        this._openFocus = 'active';

        this.dispatchEvent(new CustomEvent('opened'));
      } else if (changedProperties.get('open') === true) {
        this._floatingController.close();

        const reason = this._closeReason;
        this.dispatchEvent(new CustomEvent('closed', { detail: { reason } }));

        const shouldRestoreFocus =
          reason.kind !== 'outside-click' &&
          !(reason.kind === 'keydown' && reason.key === 'Tab');

        if (!this.isSubmenu && shouldRestoreFocus && this._focusIsInside()) {
          this._lastFocusedElement?.focus();
        }
        this._lastFocusedElement = null;
      }
    }

    if (
      (changedProperties.has('anchor') ||
        changedProperties.has('placement') ||
        changedProperties.has('offset')) &&
      !changedProperties.has('open') &&
      this.open
    ) {
      this._applyPositioning();
    }
  }

  /** The focused element, looking through open shadow roots. */
  private _deepActiveElement(): HTMLElement | null {
    let active: Element | null = document.activeElement;
    while (active?.shadowRoot?.activeElement) {
      active = active.shadowRoot.activeElement;
    }
    return active instanceof HTMLElement ? active : null;
  }

  /** Whether focus is in this menu (or nowhere), so restoring it does not steal focus from elsewhere. */
  private _focusIsInside() {
    const active = document.activeElement;
    if (!active || active === document.body) {
      return true;
    }

    return (
      active === this ||
      this.contains(active) ||
      this.shadowRoot?.contains(active) === true
    );
  }

  render() {
    return html`
      <div
        class="${classMap({
          menu: true,
          open: !this.preview && this.open,
          closed: !this.preview && !this.open,
          preview: this.preview,
        })}"
        popover=${this.preview ? nothing : 'manual'}
        part="surface"
      >
        <wc-elevation class="elevation"></wc-elevation>
        <div class="menu-content">
          <slot @slotchange="${this._onSlotChange}"></slot>
        </div>
      </div>
    `;
  }
}
