import { html, LitElement, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { observerSlotChangesWithCallback } from '@/__internal/utils/observe-slot-change.js';
import {
  dispatchActivationClick,
  isActivationClick,
} from '@/__internal/utils/dispatch-event-utils.js';
import { isLink } from '@/__internal/utils/is-link.js';
import { throttle } from '@/__internal/utils/throttle.js';
import styles from './chip.scss';
import sizeStyles from './chip-sizes.scss';
import { spread } from '@/__internal/directive/spread.js';
import { DISABLED_REASON_ID } from '@/button/ButtonConstants.js';
import IndividualComponent from '@/IndividualComponent.js';
import { mixinBaseButton } from '@/button/base-button/base-button.js';
import { mixinHyperlink } from '@/__internal/mixins/hyperlink.js';
import { mixinDelegatesAria } from '@/__internal/aria/delegate.js';
import { mixinElementInternals } from '@/__internal/mixins/element-internals.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';

/**
 * @label Chip
 * @tag wc-chip
 * @rawTag chip
 * @summary A compact button for an action, a filter or an entered value, with an optional icon and dismiss button.
 *
 * @overview
 * <p>A chip is a button, or a link when <code>href</code> is set. The default slot holds the label
 * and the <code>icon</code> slot a leading icon, which a check replaces while the chip is
 * <code>selected</code>. For a read-only status label use <code>wc-tag</code>; to lay chips out or
 * let the person pick from them use <code>wc-chip-set</code>.</p>
 * <p>With <code>selectable</code> the chip is a toggle (a filter chip) and its button gets
 * <code>aria-pressed</code> from <code>selected</code>. A selecting <code>wc-chip-set</code> sets
 * this and handles the selection; a standalone selectable chip does not toggle itself, so set
 * <code>selected</code> on <code>click</code>. <code>value</code> is what the chip set reports,
 * and defaults to the chip's text.</p>
 * <p><code>dismissible</code> adds a close button, labelled from Peacock's strings, that fires
 * <code>dismiss</code>; the chip does not remove itself. <code>disabled</code> turns the chip off;
 * <code>soft-disabled</code> with <code>disabled-reason</code> keeps it focusable and reads the
 * reason to screen readers. <code>skeleton</code> shows a placeholder while the content is not
 * known yet and ignores clicks. <code>tooltip</code> adds a tooltip and
 * <code>throttle-delay</code> throttles clicks.</p>
 * @tags display
 *
 * @fires {CustomEvent} dismiss - Dispatched when the dismiss button of a `dismissible` chip is clicked.
 *
 * @example
 * ```html
 * <wc-chip>Chip content</wc-chip>
 * ```
 */
@IndividualComponent
export class Chip extends mixinBaseButton(
  mixinHyperlink(mixinDelegatesAria(mixinElementInternals(LitElement))),
) {
  /** @nocollapse */ // eslint-disable-next-line
  static override shadowRootOptions: ShadowRootInit = {
    mode: 'open',
    delegatesFocus: true,
  };

  // Define styles (Lit handles Scoping via Shadow DOM by default)
  // You would typically import your tag.scss.js here or use the css tag
  static styles = [styles, sizeStyles];

  /** If true, the tag will have a close icon. */
  @property({ type: Boolean }) dismissible = false;

  /**
   * Additional ARIA attributes to pass to the inner button/anchor element.
   */
  @property({ reflect: true })
  configAria?: { [key: string]: any };

  /** True when the `icon` slot contains at least one node. */
  @state() private _hasIconSlotContent = false;

  /**
   * When true, renders the chip as a placeholder (a skeleton) while its content is not known yet,
   * and ignores clicks. It is a look, not a busy state: for a chip whose action is running, use
   * `soft-disabled` with a `disabled-reason`.
   */
  @property({ type: Boolean, reflect: true }) skeleton: boolean = false;

  /**
   * When true, the chip is in the selected/pressed state. Assistive technology hears it only on a
   * `selectable` chip (or a chip in a selecting `wc-chip-set`), as `aria-pressed`.
   */
  @property({ type: Boolean, reflect: true }) selected: boolean = false;

  /**
   * Makes the chip a toggle (a filter chip): its button gets `aria-pressed` from `selected`. A
   * `wc-chip-set` with `selectable` or `multiple` sets it on its chips and handles the selection;
   * a standalone selectable chip does not toggle itself, so the page sets `selected` on `click`.
   */
  @property({ type: Boolean, reflect: true }) selectable: boolean = false;

  /** The value a selecting `wc-chip-set` reports for this chip; defaults to its text. */
  @property({ type: String, reflect: true }) value: string = '';

  /**
   * Sets the delay for throttle in milliseconds. When null (default), no throttle is applied.
   */
  @property({ type: Number, attribute: 'throttle-delay' })
  throttleDelay?: number;

  /** Optional tooltip text displayed on hover. */
  @property() tooltip?: string;

  @query('.button') readonly buttonElement!: HTMLElement | null;

  /** Peacock's strings for the dismiss button label. */
  private readonly i18n = new I18nController(this);

  constructor() {
    super();
    this.addEventListener('click', this.__dispatchClickWithThrottle);
  }

  __dispatchClickWithThrottle: (event: MouseEvent | KeyboardEvent) => void =
    event => {
      this.__dispatchClick(event);
    };

  __dispatchClick = (event: MouseEvent | KeyboardEvent) => {
    // If the button is soft-disabled or a disabled link, we need to explicitly
    // prevent the click from propagating to other event listeners as well as
    // prevent the default action.
    if (this.softDisabled || (this.disabled && this.href) || this.skeleton) {
      event.stopImmediatePropagation();
      event.preventDefault();
      return;
    }

    if (!isActivationClick(event) || !this.buttonElement) {
      return;
    }

    this.focus();
    dispatchActivationClick(this.buttonElement);
  };

  __renderDisabledReason(softDisabled: boolean) {
    if (softDisabled)
      return html`<div
        id=${DISABLED_REASON_ID}
        role="tooltip"
        aria-label=${this.disabledReason}
        class="screen-reader-only"
      >
        ${this.disabledReason}
      </div>`;
    return nothing;
  }

  __renderTooltip() {
    if (this.tooltip) {
      return html`<wc-tooltip class="tooltip" for="button"
        >${this.tooltip}</wc-tooltip
      >`;
    }
    return nothing;
  }

  override focus() {
    this.buttonElement?.focus();
  }

  override blur() {
    this.buttonElement?.blur();
  }

  override firstUpdated() {
    if (typeof this.throttleDelay === 'number') {
      this.__dispatchClickWithThrottle = throttle(
        this.__dispatchClick,
        this.throttleDelay,
      );
    }
    observerSlotChangesWithCallback(
      this.renderRoot.querySelector('slot[name="icon"]'),
      hasContent => {
        this._hasIconSlotContent = hasContent;
        this.requestUpdate();
      },
    );
  }

  private _dismissClickHandler(e: MouseEvent) {
    e.stopPropagation();

    this.dispatchEvent(
      new CustomEvent('dismiss', { bubbles: true, composed: true }),
    );
  }

  private _renderCloseButton() {
    if (!this.dismissible) return nothing;

    return html`
      <button
        class="close-btn"
        @click=${this._dismissClickHandler}
        aria-label=${this.i18n.t('dismiss')}
        ?disabled=${this.disabled}
      >
        <wc-icon class="close-btn-icon" name="close"></wc-icon>
      </button>
    `;
  }

  render() {
    return html`
      <wc-focus-ring class="focus-ring" for="button"></wc-focus-ring>
      <wc-elevation class="elevation"></wc-elevation>
      <div class="background"></div>
      <div class="outline"></div>
      <wc-ripple class="ripple" for="button"></wc-ripple>

      ${this.renderChipElement()} ${this._renderCloseButton()}
      ${this.__renderTooltip()}
    `;
  }

  renderChipElement() {
    const cssClasses = {
      chip: true,
      button: true,
      selected: this.selected,
      dismissible: this.dismissible,
      'icon-slot-has-content': this._hasIconSlotContent,
    };

    if (!isLink(this)) {
      return html`<button
        class=${classMap(cssClasses)}
        id="button"
        aria-describedby=${ifDefined(
          this.softDisabled ? DISABLED_REASON_ID : undefined,
        )}
        aria-disabled=${this.softDisabled ? 'true' : nothing}
        aria-pressed=${this.selectable ? String(this.selected) : nothing}
        ?disabled=${this.disabled}
        ${spread(this.configAria)}
      >
        ${this.renderChipContent()}
      </button>`;
    }
    return html`<a
      class=${classMap(cssClasses)}
      id="button"
      href=${this.href}
      target=${this.target}
      tabindex=${this.disabled ? '-1' : '0'}
      role="button"
      aria-describedby=${ifDefined(
        this.softDisabled ? DISABLED_REASON_ID : undefined,
      )}
      aria-disabled=${this.softDisabled ? 'true' : nothing}
      aria-pressed=${this.selectable ? String(this.selected) : nothing}
      ${spread(this.configAria)}
    >
      ${this.renderChipContent()}
    </a>`;
  }

  renderChipContent() {
    return html`
      <div class="tag-content">
        <div class="icon-slot-container">
          ${this.selected
            ? html`<wc-icon class="selected-icon" name="check"></wc-icon>`
            : html`<slot name="icon"></slot>`}
        </div>
        <div class="label-container">
          <slot></slot>
        </div>
      </div>
    `;
  }
}
