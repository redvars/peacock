import { html, LitElement } from "lit";
import { property, query, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import type { Placement } from "@floating-ui/dom";
import styles from "./menu.scss";
import { FloatingController } from "../../__internal/controllers/floating-controller.js";
import { MenuItem } from "../menu-item/menu-item.js";
import IndividualComponent from "@/IndividualComponent.js";

type CloseReason =
  | { kind: "click-selection" }
  | { kind: "keydown"; key: string }
  | { kind: "outside-click" }
  | { kind: "focusout" }
  | { kind: "programmatic" };

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
@IndividualComponent
export class Menu extends LitElement {
  static styles = [styles];

  static Item = MenuItem;

  /** Whether the menu is currently visible. */
  @property({ type: Boolean, reflect: true })
  open = false;

  /** Visual variant of the menu. `"vibrant"` applies stronger color emphasis. */
  @property({ type: String, reflect: true })
  variant: "standard" | "vibrant" = "standard";

  /** ID of the anchor element the menu is positioned relative to. */
  @property({ type: String })
  anchor = "";

  /** When true, renders the menu in a static preview state (always visible, no animation). */
  @property({ type: Boolean, reflect: true })
  preview = false;

  /** When true, the menu will not close when a click occurs outside it. */
  @property({ type: Boolean, attribute: "stay-open-on-outside-click" })
  stayOpenOnOutsideClick = false;

  /** When true, the menu will not close when focus leaves it. */
  @property({ type: Boolean, attribute: "stay-open-on-focusout" })
  stayOpenOnFocusout = false;

  /** Set to true when this menu is being used as a submenu inside another menu. */
  @property({ type: Boolean, attribute: "is-submenu" })
  isSubmenu = false;

  /** Floating UI placement of the menu relative to its anchor. */
  @property({ type: String })
  placement: Placement = "bottom-start";

  /** Distance in pixels between the menu and its anchor element. */
  @property({ type: Number })
  offset = 6;

  /** Index of the currently focused/active item within the enabled items list. */
  @state()
  private activeIndex = -1;

  @query(".menu")
  private readonly menuListElement!: HTMLElement;

  /** Direct reference to the anchor element; takes precedence over the `anchor` ID property. */
  anchorElement: HTMLElement | null = null;

  /** Controller managing floating-UI positioning. */
  private readonly _floatingController = new FloatingController(this, {
    trigger: "manual",
    closeOnClickOutside: false,
    strategy: "fixed",
    onOpenChange: (isOpen) => {
      if (isOpen || !this.open) {
        return;
      }

      this.close({ kind: "outside-click" });
    },
  });

  /** Element that had focus before the menu opened; restored on close. */
  private _lastFocusedElement: HTMLElement | null = null;

  /** Reason that triggered the most recent close, included in the `closed` event detail. */
  private _closeReason: CloseReason = { kind: "programmatic" };

  connectedCallback() {
    // eslint-disable-next-line wc/guard-super-call
    super.connectedCallback();
    this.setAttribute("role", "menu");

    this.addEventListener("keydown", this._onKeyDown);
    this.addEventListener("click", this._onClick);
    this._syncAnchorAria();
  }

  disconnectedCallback() {
    this.removeEventListener("keydown", this._onKeyDown);
    this.removeEventListener("click", this._onClick);
    this._floatingController.close();
    super.disconnectedCallback();
  }

  get items(): MenuItem[] {
    const slot = this.shadowRoot?.querySelector("slot");
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

    this._closeReason = { kind: "programmatic" };
    this.open = true;
  }

  close(reason: CloseReason = { kind: "programmatic" }) {
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
    if ("getElementById" in root) {
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

    anchorEl.setAttribute("aria-haspopup", "menu");
    anchorEl.setAttribute("aria-controls", this.id);
    anchorEl.setAttribute("aria-expanded", String(this.open));
  }

  private _enabledItems() {
    return this.items.filter((item) => !item.disabled);
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
    const sourceMenu = path.find((target) => target instanceof Menu);

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
        const ownedItem = ownedItems.find((item) => item === target);
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
      new CustomEvent("menu-item-activate", {
        bubbles: true,
        composed: true,
        detail: { item },
      }),
    );
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
    this._dispatchItemActivate(item);
    if (item.keepOpen) {
      return;
    }

    this.close({ kind: "click-selection" });
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
      case "ArrowDown":
        event.preventDefault();
        this._setActiveByOffset(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        this._setActiveByOffset(-1);
        break;
      case "Home":
        event.preventDefault();
        this._setBoundaryActive(0);
        break;
      case "End": {
        event.preventDefault();
        const last = Math.max(this._enabledItems().length - 1, 0);
        this._setBoundaryActive(last);
        break;
      }
      case "Escape":
        event.preventDefault();
        this.close({ kind: "keydown", key: "Escape" });
        break;
      case "Tab":
        this.close({ kind: "keydown", key: "Tab" });
        break;
      case "Enter":
      case " ": {
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
      strategy: "fixed",
      closeOnClickOutside: !this.stayOpenOnOutsideClick,
    });
    this._floatingController.setElements(anchorEl, this.menuListElement);
    this._floatingController.open();
  }

  protected override updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has("anchor") || changedProperties.has("open")) {
      this._syncAnchorAria();
    }

    if (changedProperties.has("open")) {
      if (this.open) {
        this._lastFocusedElement = document.activeElement as HTMLElement | null;
        this._syncRovingTabIndex();
        this.dispatchEvent(
          new CustomEvent("opened", {
            bubbles: true,
            composed: true,
          }),
        );

        this._applyPositioning();
      } else {
        this._floatingController.close();

        const reason = this._closeReason;
        this.dispatchEvent(
          new CustomEvent("close-menu", {
            bubbles: true,
            composed: true,
            detail: {
              reason,
              itemPath: [],
            },
          }),
        );
        this.dispatchEvent(
          new CustomEvent("closed", {
            bubbles: true,
            composed: true,
            detail: { reason },
          }),
        );

        const shouldRestoreFocus = reason.kind !== "keydown" ||
          reason.key !== "Tab";

        if (!this.isSubmenu && shouldRestoreFocus) {
          this._lastFocusedElement?.focus();
        }
      }
    }

    if (
      (changedProperties.has("open") ||
        changedProperties.has("anchor") ||
        changedProperties.has("placement") ||
        changedProperties.has("offset")) &&
      this.open
    ) {
      this._applyPositioning();
    }
  }

  render() {
    return html`
      <div
        class="${classMap({
          menu: true,
          open: !this.preview && this.open,
          closed: !this.preview && !this.open,
          preview: this.preview,
          [`variant-${this.variant}`]: true,
        })}"
        aria-hidden="${String(!this.open)}"
      >
        <div class="background"></div>

        <div class="menu-content">
          <slot @slotchange="${this._onSlotChange}"></slot>
        </div>
      </div>
    `;
  }
}
