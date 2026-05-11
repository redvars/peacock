import { html, LitElement, nothing } from 'lit';
import { property, query } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import styles from './menu-item.scss';
import colorStyles from './menu-item-colors.scss';
import NativeButtonMixin from '@/__internal/mixins/NativeButtonMixin.js';
import NativeHyperlinkMixin from '@/__internal/mixins/NativeHyperlinkMixin.js';
import { Item } from '@/item/item.js';
import IndividualComponent from '@/IndividualComponent.js';

/**
 * @label Menu Item
 * @tag wc-menu-item
 * @rawTag menu-item
 * @summary An item in a menu list.
 * @tags navigation
 *
 * @example
 * ```html
 * <wc-menu-item>Menu Item</wc-menu-item>
 * ```
 */
@IndividualComponent
export class MenuItem extends NativeButtonMixin(
  NativeHyperlinkMixin(LitElement),
) {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles, colorStyles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** The value associated with this menu item, used to identify it on selection. */
  @property({ type: String }) value = '';

  /** Whether this menu item is currently selected/highlighted. */
  @property({ type: Boolean, reflect: true }) selected = false;

  /** When true, the menu stays open after this item is activated. */
  @property({ type: Boolean, attribute: 'keep-open' }) keepOpen = false;

  /** When true, indicates this item has an associated submenu. */
  @property({ type: Boolean, attribute: 'has-submenu' }) hasSubmenu = false;

  /** Whether the associated submenu is currently open. */
  @property({ type: Boolean, attribute: 'submenu-open' }) submenuOpen = false;

  /** Visual variant of the menu item. */
  @property({ type: String, reflect: true }) variant: 'standard' | 'vibrant' =
    'standard';

  // ── Queries ───────────────────────────────────────────────────────────────

  @query('wc-item') readonly itemElement!: Item | null;

  // ── Private fields ────────────────────────────────────────────────────────

  /** MutationObserver that triggers re-render when slotted content changes. */
  private readonly _contentObserver = new MutationObserver(() => {
    this.requestUpdate();
  });

  /** Roving tabindex value managed by the parent Menu. */
  private _rovingTabIndex = -1;

  connectedCallback() {
    // eslint-disable-next-line wc/guard-super-call
    super.connectedCallback();
    this._contentObserver.observe(this, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['slot'],
    });
  }

  disconnectedCallback() {
    this._contentObserver.disconnect();
    super.disconnectedCallback();
  }

  override get tabIndex() {
    return this._rovingTabIndex;
  }

  override set tabIndex(value: number) {
    this._rovingTabIndex = value;
    this.requestUpdate();
  }

  override focus() {
    this.itemElement?.focus();
  }

  override blur() {
    this.itemElement?.blur();
  }

  private _hasNamedSlot(...names: string[]) {
    return names.some(name =>
      Array.from(this.children).some(
        child => child.getAttribute('slot') === name,
      ),
    );
  }

  private _hasDefaultSlot() {
    return Array.from(this.childNodes).some(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        return Boolean(node.textContent?.trim());
      }

      return (
        node.nodeType === Node.ELEMENT_NODE &&
        !(node as Element).hasAttribute('slot')
      );
    });
  }

  render() {
    const controls = this.getAttribute('aria-controls');

    return html`
      <wc-item
        id="menu-item"
        class="menu-item"
        role="menuitem"
        tabindex=${String(this.tabIndex)}
        ?selected=${this.selected}
        ?disabled=${this.disabled}
        .softDisabled=${this.softDisabled}
        .htmlType=${this.htmlType}
        .href=${this.href}
        .target=${this.target}
        .rel=${this.rel}
        .download=${this.download}
        aria-haspopup=${this.hasSubmenu ? 'menu' : nothing}
        aria-controls=${ifDefined(
          this.hasSubmenu && controls ? controls : undefined,
        )}
        aria-expanded=${ifDefined(
          this.hasSubmenu ? String(this.submenuOpen) : undefined,
        )}
      >
        <wc-focus-ring
          class="focus-ring"
          for="menu-item"
          slot="container"
        ></wc-focus-ring>
        <div class="background" slot="container"></div>
        <wc-ripple class="ripple" for="menu-item" slot="container"></wc-ripple>

        ${this.renderContent()}
      </wc-item>
    `;
  }

  renderContent() {
    return html`
      <slot name="start" slot="start"></slot>
      <slot name="overline" slot="overline"></slot>
      <slot name="headline" slot="headline"></slot>
      <slot></slot>
      <slot name="supporting-text" slot="supporting-text"></slot>
      <slot
        name="trailing-supporting-text"
        slot="trailing-supporting-text"
      ></slot>
      <slot name="end" slot="end"></slot>
    `;
  }
}
