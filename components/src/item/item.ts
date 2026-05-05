import { html, LitElement, nothing } from 'lit';
import { property, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import styles from './item.scss';
import NativeButtonMixin from '@/__internal/mixins/NativeButtonMixin.js';
import NativeHyperlinkMixin from '@/__internal/mixins/NativeHyperlinkMixin.js';
import {
  dispatchActivationClick,
  isActivationClick,
} from '@/__internal/utils/dispatch-event-utils.js';
import { isLink } from '@/__internal/utils/is-link.js';

/**
 * @label Item
 * @tag wc-item
 * @rawTag item
 *
 * @summary A Material 3 item with start, text and end slots.
 *
 * @example
 * ```html
 * <wc-item selected>
 *   <wc-icon slot="start" name="home"></wc-icon>
 *   <div slot="headline">Headline</div>
 *   <div slot="supporting-text">Supporting text</div>
 *   <div slot="trailing-supporting-text">Trailing</div>
 *   <wc-icon slot="end" name="chevron_right"></wc-icon>
 * </wc-item>
 * ```
 * @tags display
 */
export class Item extends NativeButtonMixin(NativeHyperlinkMixin(LitElement)) {
  static styles = [styles];

  static override get observedAttributes() {
    return [...super.observedAttributes, 'tabindex'];
  }

  private readonly __contentObserver = new MutationObserver(() => {
    this.requestUpdate();
  });

  private __capturedTabIndex?: string;

  private __isCapturingTabIndex = false;

  @property({ type: Boolean, reflect: true }) selected = false;

  @query('#item') readonly itemElement!: HTMLElement | null;

  private __handleSlotChange = () => {
    this.requestUpdate();
  };

  private __hasNamedSlot(...names: string[]) {
    return names.some(name =>
      Array.from(this.children).some(
        child => child.getAttribute('slot') === name,
      ),
    );
  }

  private __hasDefaultSlot() {
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

  constructor() {
    super();
    this.addEventListener('click', this.__dispatchClick);
  }

  connectedCallback() {
    // eslint-disable-next-line wc/guard-super-call
    super.connectedCallback();
    this.__captureHostTabIndex();

    this.__contentObserver.observe(this, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['slot'],
    });
  }

  disconnectedCallback() {
    this.__contentObserver.disconnect();
    super.disconnectedCallback();
  }

  override attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null,
  ) {
    if (name === 'tabindex') {
      if (!this.__isCapturingTabIndex && newValue != null) {
        this.__capturedTabIndex = newValue;
        this.__isCapturingTabIndex = true;
        this.removeAttribute('tabindex');
        this.__isCapturingTabIndex = false;
        this.requestUpdate();
      }

      return;
    }

    super.attributeChangedCallback(name, oldValue, newValue);
  }

  override focus() {
    this.itemElement?.focus();
  }

  override blur() {
    this.itemElement?.blur();
  }

  __dispatchClick = (event: MouseEvent | KeyboardEvent) => {
    if (this.softDisabled || (this.disabled && this.href)) {
      event.stopImmediatePropagation();
      event.preventDefault();
      return;
    }

    if (!isActivationClick(event) || !this.itemElement) {
      return;
    }

    this.focus();
    dispatchActivationClick(this.itemElement);
  };

  private __getForwardedAttribute(name: string) {
    return this.getAttribute(name) ?? undefined;
  }

  private __captureHostTabIndex() {
    const tabIndex = this.getAttribute('tabindex');

    if (tabIndex == null) {
      return;
    }

    this.__capturedTabIndex = tabIndex;
    this.__isCapturingTabIndex = true;
    this.removeAttribute('tabindex');
    this.__isCapturingTabIndex = false;
  }

  render() {
    const role = this.__getForwardedAttribute('role');
    const tabIndex = this.__capturedTabIndex;
    const ariaHasPopup = this.__getForwardedAttribute('aria-haspopup');
    const ariaControls = this.__getForwardedAttribute('aria-controls');
    const ariaExpanded = this.__getForwardedAttribute('aria-expanded');

    return html`
      <wc-focus-ring class="focus-ring" for="item"></wc-focus-ring>
      <div class="background"></div>
      <wc-ripple class="ripple" for="item"></wc-ripple>

      ${this.renderItemElement(
        role,
        tabIndex,
        ariaHasPopup,
        ariaControls,
        ariaExpanded,
      )}
    `;
  }

  renderItemElement(
    role: string | undefined,
    tabIndex: string | undefined,
    ariaHasPopup: string | undefined,
    ariaControls: string | undefined,
    ariaExpanded: string | undefined,
  ) {
    const isElementLink = isLink(this);

    const cssClasses: any = {
      item: true,
      'native-button': !isElementLink,
      'native-link': isElementLink,
      selected: this.selected,
      disabled: this.disabled || this.softDisabled,
    };

    if (!isLink(this)) {
      return html`
        <button
          id="item"
          class=${classMap(cssClasses)}
          type=${this.htmlType}
          role=${ifDefined(role)}
          tabindex=${ifDefined(tabIndex)}
          ?disabled=${this.disabled}
          ?aria-disabled=${this.softDisabled}
          aria-haspopup=${ifDefined(ariaHasPopup)}
          aria-controls=${ifDefined(ariaControls)}
          aria-expanded=${ifDefined(ariaExpanded)}
        >
          ${this.renderContent()}
        </button>
      `;
    }
    return html`
      <a
        id="item"
        class=${classMap(cssClasses)}
        href=${this.href}
        target=${this.target}
        rel=${ifDefined(this.rel)}
        download=${ifDefined(this.download)}
        role=${ifDefined(role)}
        tabindex=${ifDefined(tabIndex ?? (this.disabled ? '-1' : '0'))}
        aria-disabled=${String(this.disabled || this.softDisabled)}
        aria-haspopup=${ifDefined(ariaHasPopup)}
        aria-controls=${ifDefined(ariaControls)}
        aria-expanded=${ifDefined(ariaExpanded)}
      >
        ${this.renderContent()}
      </a>
    `;
  }

  renderContent() {
    const hasStart = this.__hasNamedSlot('start');
    const hasEnd = this.__hasNamedSlot('end');
    const hasOverline = this.__hasNamedSlot('overline');
    const hasHeadline = this.__hasNamedSlot('headline');
    const hasDefault = this.__hasDefaultSlot();
    const hasSupportingText = this.__hasNamedSlot('supporting-text');
    const hasTrailingSupportingText = this.__hasNamedSlot(
      'trailing-supporting-text',
    );

    return html`
      <div class="item-content">
        ${hasStart
          ? html`
              <div class="start">
                <slot
                  name="start"
                  @slotchange=${this.__handleSlotChange}
                ></slot>
              </div>
            `
          : nothing}
        <div class="content">
          ${hasOverline
            ? html`
                <div class="overline">
                  <slot
                    name="overline"
                    @slotchange=${this.__handleSlotChange}
                  ></slot>
                </div>
              `
            : nothing}
          ${hasHeadline || hasDefault
            ? html`
                <div class="headline-row">
                  ${hasHeadline || hasDefault
                    ? html`
                        <div class="headline">
                          ${hasHeadline
                            ? html`<slot
                                name="headline"
                                @slotchange=${this.__handleSlotChange}
                              ></slot>`
                            : nothing}
                          ${hasDefault
                            ? html`<slot
                                @slotchange=${this.__handleSlotChange}
                              ></slot>`
                            : nothing}
                        </div>
                      `
                    : nothing}
                </div>
              `
            : nothing}
          ${hasSupportingText
            ? html`
                <div class="supporting-text">
                  <slot
                    name="supporting-text"
                    @slotchange=${this.__handleSlotChange}
                  ></slot>
                </div>
              `
            : nothing}
        </div>
        ${hasTrailingSupportingText
          ? html`
              <div class="trailing-supporting-text">
                <slot
                  name="trailing-supporting-text"
                  @slotchange=${this.__handleSlotChange}
                ></slot>
              </div>
            `
          : nothing}
        ${hasEnd
          ? html`
              <div class="end">
                <slot name="end" @slotchange=${this.__handleSlotChange}></slot>
              </div>
            `
          : nothing}
      </div>
    `;
  }
}
