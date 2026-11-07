import { html, LitElement, nothing } from 'lit';
import { property, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import IndividualComponent from '@/IndividualComponent.js';
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

/** Where a list item sits among its sibling items; set by `wc-list`. */
export type ListItemPosition = 'first' | 'middle' | 'last' | 'only';

/**
 * @label List Item
 * @tag wc-list-item
 * @rawTag list-item
 *
 * @summary One row of a list, with a label, optional text above and below it, and leading and trailing content.
 *
 * @slot - The item's label.
 * @slot start - Leading content, such as an icon or avatar.
 * @slot end - Trailing content, such as an icon.
 * @slot overline - Text above the label.
 * @slot headline - The label, as an alternative to the default slot.
 * @slot supporting-text - Text below the label.
 * @slot trailing-supporting-text - Short text before the `end` slot, such as a count.
 *
 * @cssprop --list-item-container-color - Row background.
 * @cssprop --list-item-label-text-color - Label color.
 * @cssprop --list-item-icon-color - Color of the `start` and `end` content.
 * @cssprop --list-item-state-color - Hover and press state layer color.
 * @cssprop --list-item-selected-container-color - Row background when current.
 * @cssprop --list-item-selected-label-text-color - Label color when current.
 * @cssprop --list-item-selected-icon-color - `start` and `end` color when current.
 * @cssprop --list-item-container-shape - Corner radius of the row.
 * @cssprop --list-item-outer-container-shape - Corner radius of the outer corners of the first and last rows (set by `wc-list` in the segmented variant).
 *
 * @overview
 * <p>Use <code>current</code> for the row of the current page in a navigation list, or
 * <code>wc-listbox</code> to let the person choose items.</p>
 *
 * @example
 * ```html
 * <wc-list-item href="/profile" current>
 *   <wc-icon slot="start" name="person"></wc-icon>
 *   Profile
 *   <wc-icon slot="end" name="chevron_right"></wc-icon>
 * </wc-list-item>
 * ```
 * @tags display
 */
@IndividualComponent
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

  // ── Properties ───────────────────────────────────────────────────────────

  /**
   * Marks the row of the current page or location in a navigation list: `aria-current="page"`
   * on a link row, `aria-current="true"` otherwise.
   */
  @property({ type: Boolean, reflect: true }) current = false;

  /**
   * When true, renders the list-item as a placeholder (a skeleton) while its content is not known
   * yet, and ignores clicks. It is a look, not a busy state (which components spell `loading`).
   */
  @property({ type: Boolean, reflect: true }) skeleton: boolean = false;

  /** Renders the row as a button, with hover, press and focus states. */
  @property({ type: Boolean, reflect: true })
  actionable: boolean = false;

  /**
   * Where the item sits among its siblings. `wc-list` sets this; the segmented
   * variant rounds the outer corners of the first and last rows with it.
   */
  @property({ type: String, reflect: true, attribute: 'list-position' })
  listPosition?: ListItemPosition;

  // ── Queries ───────────────────────────────────────────────────────────────

  @query('#list-item') readonly itemElement!: HTMLElement | null;

  // ── Private fields ────────────────────────────────────────────────────────

  /** Re-renders when slotted children are added, removed or re-slotted. */
  private readonly _contentObserver = new MutationObserver(() => {
    this.requestUpdate();
  });

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

    this._contentObserver.observe(this, {
      childList: true,
      attributes: true,
      subtree: true,
      attributeFilter: ['slot'],
    });
  }

  disconnectedCallback() {
    this._contentObserver.disconnect();
    super.disconnectedCallback();
  }

  protected override updated() {
    // wc-item shows its start / end columns from its own light children (our
    // slot elements), which it does not observe; nudge it when ours change.
    this.renderRoot.querySelector<LitElement>('wc-item')?.requestUpdate();
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
    let ariaCurrent: 'page' | 'true' | typeof nothing = nothing;
    if (this.current) ariaCurrent = isElementLink ? 'page' : 'true';

    if (!clickable) {
      return html`
        <div
          id="list-item"
          class=${classMap(cssClasses)}
          aria-label="${ariaLabel || nothing}"
          aria-current=${ariaCurrent}
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
          aria-disabled=${this.softDisabled ? 'true' : nothing}
          aria-current=${ariaCurrent}
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
        rel=${this.rel || nothing}
        download=${this.download || nothing}
        tabindex=${this.disabled ? '-1' : '0'}
        aria-disabled=${String(this.disabled || this.softDisabled)}
        aria-current=${ariaCurrent}
        @click=${this.__dispatchClick}
      >
        ${this.renderContent(clickable)}
      </a>
    `;
  }

  renderContent(clickable: boolean) {
    // The start and end slots are rendered only when used so an empty start or
    // end column does not take up space.
    const hasStart = this.__hasNamedSlot('start');
    const hasEnd = this.__hasNamedSlot('end');
    const hasTrailingSupportingText = this.__hasNamedSlot(
      'trailing-supporting-text',
    );

    return html`
      <wc-item class="list-item-content" ?inert=${clickable}>
        <div class="background" slot="container"></div>
        ${clickable
          ? html`<wc-focus-ring
                class="focus-ring"
                for="list-item"
                slot="container"
              ></wc-focus-ring>
              <wc-ripple
                class="ripple"
                for="list-item"
                slot="container"
              ></wc-ripple>`
          : nothing}
        <wc-skeleton class="skeleton" slot="container"></wc-skeleton>

        ${hasStart
          ? html`<slot class="icon-slot" name="start" slot="start"></slot>`
          : nothing}
        <slot name="overline" slot="overline"></slot>
        <slot name="headline" slot="headline"></slot>
        <slot></slot>
        <slot name="supporting-text" slot="supporting-text"></slot>
        ${hasTrailingSupportingText
          ? html`<slot
              name="trailing-supporting-text"
              slot="trailing-supporting-text"
            ></slot>`
          : nothing}
        ${hasEnd
          ? html`<slot class="icon-slot" name="end" slot="end"></slot>`
          : nothing}
      </wc-item>
    `;
  }
}
