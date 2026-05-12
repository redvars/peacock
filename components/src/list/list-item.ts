import { html, LitElement, nothing } from 'lit';
import { property, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import styles from './list-item.scss';
import { isLink } from '@/__internal/utils/is-link.js';
import {
  dispatchActivationClick,
  isActivationClick,
} from '@/__internal/utils/dispatch-event-utils.js';
import { ARIAMixinStrict } from '@/__internal/aria/aria.js';
import { mixinBaseButton } from '@/button/base-button/base-button.js';
import { mixinHyperlink } from '@/__internal/mixins/hyperlink.js';
import { mixinDelegatesAria } from '@/__internal/aria/delegate.js';
import { mixinElementInternals } from '@/__internal/mixins/element-internals.js';

/**
 * @label List Item
 * @tag wc-list-item
 * @rawTag list-item
 *
 * @summary A list item with leading, trailing and content slots.
 *
 * @example
 * ```html
 * <wc-list-item selected>
 *   <wc-icon slot="leading" name="person"></wc-icon>
 *   Profile
 *   <wc-icon slot="trailing" name="chevron_right"></wc-icon>
 * </wc-list-item>
 * ```
 * @tags display
 */
export class ListItem extends mixinBaseButton(
  mixinHyperlink(mixinDelegatesAria(mixinElementInternals(LitElement))),
) {
  // ── Static ───────────────────────────────────────────────────────────────

  /** @nocollapse */ // eslint-disable-next-line
  static override shadowRootOptions: ShadowRootInit = {
    mode: 'open',
    delegatesFocus: true,
  };

  static styles = [styles];

  @property({ type: Boolean, reflect: true }) selected = false;

  /** When true, renders the list-item in a loading skeleton state. */
  @property({ type: Boolean, reflect: true }) skeleton: boolean = false;

  @property({ type: Boolean, reflect: true })
  actionable: boolean = false;

  @query('#list-item') readonly itemElement!: HTMLElement | null;

  constructor() {
    super();
    this.addEventListener('click', this.__dispatchClickWithThrottle);
  }

  connectedCallback() {
    // eslint-disable-next-line wc/guard-super-call
    super.connectedCallback();

    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'listitem');
    }
  }

  override focus() {
    this.itemElement?.focus();
  }

  override blur() {
    this.itemElement?.blur();
  }

  __dispatchClick = (event: MouseEvent | KeyboardEvent) => {
    // If the button is soft-disabled or a disabled link, we need to explicitly
    // prevent the click from propagating to other event listeners as well as
    // prevent the default action.
    if (this.softDisabled || (this.disabled && this.href) || this.skeleton) {
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

  private __hasNamedSlot(...names: string[]) {
    return names.some(name =>
      Array.from(this.children).some(
        child => child.getAttribute('slot') === name,
      ),
    );
  }

  isClickable() {
    return this.actionable || isLink(this);
  }

  render() {
    const isElementLink = isLink(this);
    const clickable = this.isClickable();

    const cssClasses = {
      'list-item': true,
      'native-button': !isElementLink,
      'native-link': isElementLink,
    };

    // Needed for closure conformance
    const { ariaLabel } = this as ARIAMixinStrict;

    if (!clickable) {
      return html`
        <div
          id="list-item"
          class=${classMap(cssClasses)}
          aria-label="${ariaLabel || nothing}"
        >
          ${this.renderContent(clickable)}
        </div>
      `;
    }

    if (!isElementLink) {
      return html`
        <button
          id="list-item"
          class=${classMap(cssClasses)}
          ?disabled=${this.disabled}
          aria-label="${ariaLabel || nothing}"
          ?aria-disabled=${this.softDisabled}
          @click=${this.__dispatchClick}
        >
          ${this.renderContent(clickable)}
        </button>
      `;
    }

    return html`
      <a
        id="list-item"
        class=${classMap(cssClasses)}
        href=${this.href}
        target=${this.target}
        rel=${ifDefined(this.rel)}
        download=${ifDefined(this.download)}
        tabindex=${this.disabled ? '-1' : '0'}
        aria-disabled=${String(this.disabled || this.softDisabled)}
        @click=${this.__dispatchClick}
      >
        ${this.renderContent(clickable)}
      </a>
    `;
  }

  renderContent(clickable: boolean) {
    const hasLeading = this.__hasNamedSlot('leading');
    const hasTrailingSupportingText = this.__hasNamedSlot(
      'trailing-supporting-text',
    );
    const hasTrailing = this.__hasNamedSlot('trailing');

    return html`
      <wc-item class="list-item-content" ?inert=${clickable}>
        ${clickable
          ? html`<wc-focus-ring
                class="focus-ring"
                for="list-item"
                slot="container"
              ></wc-focus-ring>
              <div class="background" slot="container"></div>
              <wc-ripple
                class="ripple"
                for="list-item"
                slot="container"
              ></wc-ripple>
              <wc-skeleton class="skeleton" slot="container"></wc-skeleton> `
          : null}

        <slot name="leading" slot="start" ?hidden=${!hasLeading}></slot>
        <slot name="overline" slot="overline"></slot>
        <slot name="headline" slot="headline"></slot>
        <slot></slot>
        <slot name="supporting-text" slot="supporting-text"></slot>

        <slot
          name="trailing-supporting-text"
          slot="trailing-supporting-text"
          ?hidden=${!hasTrailingSupportingText}
        ></slot>
        <slot name="trailing" slot="end" ?hidden=${!hasTrailing}></slot>
      </wc-item>
    `;
  }
}
