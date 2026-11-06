import { html, LitElement, nothing, type TemplateResult } from 'lit';
import { property, query } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { classMap } from 'lit/directives/class-map.js';
import styles from './menu-item.scss';
import NativeButtonMixin from '@/__internal/mixins/NativeButtonMixin.js';
import NativeHyperlinkMixin from '@/__internal/mixins/NativeHyperlinkMixin.js';
import { isLink } from '@/__internal/utils/is-link.js';
import IndividualComponent from '@/IndividualComponent.js';

/**
 * @label Menu Item
 * @tag wc-menu-item
 * @rawTag menu-item
 * @summary An item in a menu list.
 * @overview
 * <p>A menu item is a button, or a link when it has an <code>href</code>. A selected item shows a
 * check mark at the end; an item with a submenu shows a chevron. Put an icon in the
 * <code>start</code> slot; the menu lines up the labels of items without one.</p>
 *
 * @slot - The label.
 * @slot start - Leading icon or avatar.
 * @slot end - Trailing icon or content; replaces the selected check mark.
 * @slot supporting-text - A second line under the label.
 * @slot trailing-supporting-text - Short trailing text, such as a keyboard shortcut.
 * @slot overline - A line above the label.
 * @slot headline - Alternative to the default slot for the label.
 *
 * @cssprop --menu-item-icon-size - Size of leading and trailing icons. Defaults to `1.25rem`.
 *
 * @example
 * ```html
 * <wc-menu-item>Menu Item</wc-menu-item>
 * ```
 * @tags navigation
 */
@IndividualComponent
export class MenuItem extends NativeButtonMixin(
  NativeHyperlinkMixin(LitElement),
) {
  static styles = [styles];

  /** The value associated with this menu item, used to identify it on selection. */
  @property({ type: String })
  value = '';

  /** Whether this menu item is currently selected. Selected items show a check mark. */
  @property({ type: Boolean, reflect: true })
  selected = false;

  /** When true, the menu stays open after this item is activated. */
  @property({ type: Boolean, attribute: 'keep-open' })
  keepOpen = false;

  /** When true, indicates this item has an associated submenu and shows a chevron. */
  @property({ type: Boolean, attribute: 'has-submenu', reflect: true })
  hasSubmenu = false;

  /** Whether the associated submenu is currently open. */
  @property({ type: Boolean, attribute: 'submenu-open', reflect: true })
  submenuOpen = false;

  @query('#menu-item')
  readonly itemElement!: HTMLElement | null;

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

  /** Whether the item shows something in its leading column. */
  get hasStartContent() {
    return this._hasNamedSlot('start') || this.renderStart() !== nothing;
  }

  /** Lower-cased label text the menu matches typed characters against. */
  get typeaheadText() {
    return Array.from(this.childNodes)
      .filter(
        node =>
          node.nodeType === Node.TEXT_NODE ||
          (node instanceof Element &&
            (!node.hasAttribute('slot') ||
              node.getAttribute('slot') === 'headline')),
      )
      .map(node => node.textContent ?? '')
      .join('')
      .trim()
      .toLowerCase();
  }

  override focus() {
    this.itemElement?.focus();
  }

  override blur() {
    this.itemElement?.blur();
  }

  /** ARIA role of the inner control. */
  protected get itemRole() {
    return 'menuitem';
  }

  /** ARIA state of the inner control, such as `aria-selected` for options. */
  protected get itemAriaSelected(): string | undefined {
    return undefined;
  }

  /** Built-in leading content shown when the `start` slot is empty. */
  protected renderStart(): TemplateResult | typeof nothing {
    return nothing;
  }

  /** Built-in trailing content shown when the `end` slot is empty. */
  protected renderEnd(): TemplateResult | typeof nothing {
    if (this.hasSubmenu) {
      return html`<wc-icon
        class="indicator submenu-indicator"
        name="chevron_right"
        aria-hidden="true"
      ></wc-icon>`;
    }

    if (this.selected) {
      return html`<wc-icon
        class="indicator check-indicator"
        name="check"
        aria-hidden="true"
      ></wc-icon>`;
    }

    return nothing;
  }

  protected override updated() {
    // wc-item reads which named slots it has in its own render; tell it when ours change.
    this.renderRoot.querySelector<LitElement>('wc-item')?.requestUpdate();
  }

  private _hasNamedSlot(...names: string[]) {
    return names.some(name =>
      Array.from(this.children).some(
        child => child.getAttribute('slot') === name,
      ),
    );
  }

  render() {
    const isElementLink = isLink(this);
    const controls = this.getAttribute('aria-controls');

    const cssClasses = {
      'menu-item': true,
      'native-button': !isElementLink,
      'native-link': isElementLink,
    };

    if (isElementLink) {
      return html`
        <a
          id="menu-item"
          class="${classMap(cssClasses)}"
          role="${this.itemRole}"
          href="${ifDefined(this.href)}"
          target="${this.target}"
          ?rel="${this.rel}"
          ?download="${this.download}"
          tabindex="${this.disabled ? '-1' : String(this.tabIndex)}"
          aria-selected="${ifDefined(this.itemAriaSelected)}"
          aria-current="${this.selected && this.itemRole === 'menuitem'
            ? 'true'
            : nothing}"
          aria-disabled="${this.disabled || this.softDisabled
            ? 'true'
            : nothing}"
          aria-haspopup="${this.hasSubmenu ? 'menu' : nothing}"
          aria-controls="${ifDefined(
            this.hasSubmenu && controls ? controls : undefined,
          )}"
          aria-expanded="${ifDefined(
            this.hasSubmenu ? String(this.submenuOpen) : undefined,
          )}"
        >
          ${this.renderContent()}
        </a>
      `;
    }

    return html`
      <button
        id="menu-item"
        class="${classMap(cssClasses)}"
        role="${this.itemRole}"
        type="${this.htmlType}"
        ?disabled="${this.disabled}"
        tabindex="${String(this.tabIndex)}"
        aria-selected="${ifDefined(this.itemAriaSelected)}"
        aria-disabled="${this.softDisabled ? 'true' : nothing}"
        aria-haspopup="${this.hasSubmenu ? 'menu' : nothing}"
        aria-controls="${ifDefined(
          this.hasSubmenu && controls ? controls : undefined,
        )}"
        aria-expanded="${ifDefined(
          this.hasSubmenu ? String(this.submenuOpen) : undefined,
        )}"
      >
        ${this.renderContent()}
      </button>
    `;
  }

  renderContent() {
    const hasStartSlot = this._hasNamedSlot('start');
    const builtInStart = hasStartSlot ? nothing : this.renderStart();
    const hasEndSlot = this._hasNamedSlot('end');
    const builtInEnd = hasEndSlot ? nothing : this.renderEnd();
    const hasStart = hasStartSlot || builtInStart !== nothing;

    let start: TemplateResult | typeof nothing = nothing;
    if (hasStartSlot) {
      start = html`<slot name="start" slot="start"></slot>`;
    } else if (builtInStart !== nothing) {
      start = html`<span class="built-in" slot="start">${builtInStart}</span>`;
    }

    let end: TemplateResult | typeof nothing = nothing;
    if (hasEndSlot) {
      end = html`<slot name="end" slot="end"></slot>`;
    } else if (builtInEnd !== nothing) {
      end = html`<span class="built-in" slot="end">${builtInEnd}</span>`;
    }

    return html`
      <div class="menu-item-backdrop-background"></div>
      <wc-elevation class="menu-item-backdrop-elevation"></wc-elevation>

      <wc-item
        class="${classMap({
          'menu-item-content': true,
          'no-start': !hasStart,
        })}"
      >
        <wc-focus-ring
          class="focus-ring"
          for="menu-item"
          slot="container"
        ></wc-focus-ring>
        <div class="background" slot="container"></div>
        <wc-ripple class="ripple" for="menu-item" slot="container"></wc-ripple>

        ${start}
        ${this._hasNamedSlot('overline')
          ? html`<slot name="overline" slot="overline"></slot>`
          : nothing}
        ${this._hasNamedSlot('headline')
          ? html`<slot name="headline" slot="headline"></slot>`
          : nothing}
        <slot></slot>
        ${this._hasNamedSlot('supporting-text')
          ? html`<slot name="supporting-text" slot="supporting-text"></slot>`
          : nothing}
        ${this._hasNamedSlot('trailing-supporting-text')
          ? html`<slot
              name="trailing-supporting-text"
              slot="trailing-supporting-text"
            ></slot>`
          : nothing}
        ${end}
      </wc-item>
    `;
  }
}
