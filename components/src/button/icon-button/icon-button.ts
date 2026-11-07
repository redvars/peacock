import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { when } from 'lit/directives/when.js';
import styles from './icon-button.scss';
import { isLink } from '@/__internal/utils/is-link.js';
import {
  dispatchActivationClick,
  isActivationClick,
} from '@/__internal/utils/dispatch-event-utils.js';
import { DISABLED_REASON_ID } from '@/button/ButtonConstants.js';
import IndividualComponent from '@/IndividualComponent.js';
import {
  iconButtonLabel,
  mixinBaseButton,
  mixinButtonLevel,
  toggleButtonSelected,
  warnIfUnnamed,
} from '../base-button/base-button.js';
import { mixinHyperlink } from '@/__internal/mixins/hyperlink.js';
import { mixinDelegatesAria } from '@/__internal/aria/delegate.js';
import { mixinFormSubmitter } from '@/__internal/mixins/form-submitter.js';
import { mixinFormAssociated } from '@/__internal/mixins/form-associated.js';
import { mixinElementInternals } from '@/__internal/mixins/element-internals.js';
import { ARIAMixinStrict } from '@/__internal/aria/aria.js';
import type { ButtonShape, ButtonSize } from '@/button/ButtonTypes.js';

/**
 * @label Icon Button
 * @tag wc-icon-button
 * @rawTag icon-button
 *
 * @summary A button that shows only an icon, for compact actions such as close or more options; it can also toggle.
 *
 * @overview
 * <p>An icon button has no visible text, so give it an <code>aria-label</code>. Without one, its <code>tooltip</code> text is used as the accessible name; with neither, a warning is logged once.</p>
 * <p><code>level</code> is a preset of <code>color</code> and <code>variant</code>, the same as on <code>wc-button</code>. Set <code>toggle</code> for a toggle button with <code>aria-pressed</code>; <code>selected</code> does nothing without it. Link mode (<code>href</code>) stays supported, for toolbar links.</p>
 *
 * @cssprop --button-container-shape: Defines the border radius of the button container shape.
 *
 * @cssprop --button-container-shape-start-start: Defines the start position of the button container shape.
 * @cssprop --button-container-shape-start-end: Defines the end position of the button container shape.
 * @cssprop --button-container-shape-end-start: Defines the start position of the button container shape.
 * @cssprop --button-container-shape-end-end: Defines the end position of the button container shape.
 *
 *
 * @cssprop --filled-button-container-color: Color of the filled button container.
 * @cssprop --filled-button-label-text-color: Text color of the filled button label.
 *
 * @cssprop --outlined-button-container-color: Color of the outlined button container.
 * @cssprop --outlined-button-label-text-color: Text color of the outlined button label.
 *
 * @cssprop --text-button-label-text-color: Text color of the text button label.
 *
 * @cssprop --tonal-button-container-color: Color of the tonal button container.
 * @cssprop --tonal-button-label-text-color: Text color of the tonal button label.
 *
 * @cssprop --elevated-button-container-color: Color of the elevated button container.
 * @cssprop --elevated-button-label-text-color: Text color of the elevated button label.
 *
 * @cssprop --neo-button-container-color: Color of the neo button container.
 * @cssprop --neo-button-label-text-color: Text color of the neo button label.
 *
 * @fires {MouseEvent} click - Dispatched when the button is clicked. Not dispatched while `loading`, `soft-disabled` or `skeleton`.
 * @fires {CustomEvent<{ selected: boolean }>} change - Dispatched by a `toggle` button after a click flips `selected`.
 *
 * @example
 * ```html
 * <wc-icon-button aria-label="Home"><wc-icon name="home"></wc-icon></wc-icon-button>
 * ```
 * @tags display
 */
@IndividualComponent
export class IconButton extends mixinButtonLevel(
  mixinBaseButton(
    mixinHyperlink(
      mixinDelegatesAria(
        mixinFormSubmitter(
          mixinFormAssociated(mixinElementInternals(LitElement)),
        ),
      ),
    ),
  ),
) {
  // ── Static ───────────────────────────────────────────────────────────────

  /** @nocollapse */ // eslint-disable-next-line
  static override shadowRootOptions: ShadowRootInit = {
    mode: 'open',
    delegatesFocus: true,
  };

  static override styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /**
   * Button size.
   * Possible values are `"xs"`, `"sm"`, `"md"`, `"lg"`, `"xl"`. Defaults to `"sm"`.
   */
  @property({ reflect: true }) size: ButtonSize = 'sm';

  /** Shape of the button container. */
  @property({ type: String, reflect: true }) shape?: ButtonShape = 'square';

  /** When true, renders the button as a placeholder skeleton while the page loads. */
  @property({ type: Boolean, reflect: true }) skeleton: boolean = false;

  /**
   * When true, the button is busy: it shows a spinner in place of its icon, sets
   * `aria-busy="true"` and ignores clicks, like `soft-disabled`.
   */
  @property({ type: Boolean, reflect: true }) loading: boolean = false;

  /**
   * When true, the button is a toggle button: it renders `aria-pressed`, flips `selected` on click
   * and fires `change`.
   */
  @property({ type: Boolean, reflect: true }) toggle: boolean = false;

  /** The pressed state of a `toggle` button. Has no effect without `toggle`. */
  @property({ type: Boolean, reflect: true }) selected: boolean = false;

  /**
   * Tooltip text displayed on hover. Also the accessible name when no `aria-label` is set.
   */
  @property() tooltip?: string;

  // ── Queries ───────────────────────────────────────────────────────────────

  @query('.button') readonly buttonElement!: HTMLElement | null;

  // ── Constructor ───────────────────────────────────────────────────────────

  constructor() {
    super();
    this.addEventListener('click', this.__dispatchClickWithThrottle);
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  override firstUpdated(changedProperties: PropertyValues<this>) {
    super.firstUpdated(changedProperties);
    warnIfUnnamed(this, (this as ARIAMixinStrict).ariaLabel, this.tooltip);
  }

  // ── Public methods ────────────────────────────────────────────────────────

  override focus() {
    this.buttonElement?.focus();
  }

  override blur() {
    this.buttonElement?.blur();
  }

  // ── Private methods ───────────────────────────────────────────────────────

  __dispatchClick = (event: MouseEvent | KeyboardEvent) => {
    // If the button is soft-disabled, loading or a disabled link, we need to
    // explicitly prevent the click from propagating to other event listeners
    // as well as prevent the default action.
    if (
      this.softDisabled ||
      this.loading ||
      (this.disabled && this.href) ||
      this.skeleton
    ) {
      event.stopImmediatePropagation();
      event.preventDefault();
      return;
    }

    // Each activation reaches this listener once: either the inner button's
    // click bubbling out, or a click fired at the host and forwarded below.
    if (!isLink(this)) toggleButtonSelected(this);

    if (!isActivationClick(event) || !this.buttonElement) {
      return;
    }

    this.focus();
    dispatchActivationClick(this.buttonElement);
  };

  // ── Render helpers ────────────────────────────────────────────────────────

  renderDisabledReason(softDisabled: boolean) {
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

  renderTooltip() {
    if (this.tooltip) {
      const buttonId = isLink(this) ? 'link' : 'button';
      return html`<wc-tooltip class="tooltip" for=${buttonId}
        >${this.tooltip}</wc-tooltip
      >`;
    }
    return nothing;
  }

  renderLoadingIndicator() {
    if (!this.loading) return nothing;
    return html`<wc-circular-progress
      class="loading-indicator"
      indeterminate
      aria-hidden="true"
    ></wc-circular-progress>`;
  }

  renderButtonContent() {
    return html`
      ${this.renderLoadingIndicator()}
      <slot class="icon-slot"></slot>
      <div class="touch"></div>
      ${this.renderDisabledReason(this.softDisabled)}
    `;
  }

  renderButtonElement() {
    const isElementLink = isLink(this);
    const { ariaLabel, ariaHasPopup, ariaExpanded } = this as ARIAMixinStrict;
    const label = iconButtonLabel(ariaLabel, this.tooltip);

    const cssClasses = {
      button: true,
      'native-button': !isElementLink,
      'native-link': isElementLink,
    };

    if (!isElementLink) {
      return html`<button
        class=${classMap(cssClasses)}
        id="button"
        aria-label="${label || nothing}"
        aria-haspopup="${ariaHasPopup || nothing}"
        aria-expanded="${ariaExpanded || nothing}"
        aria-describedby=${ifDefined(
          this.softDisabled ? DISABLED_REASON_ID : undefined,
        )}
        aria-disabled=${this.softDisabled ? 'true' : nothing}
        aria-pressed=${this.toggle ? String(this.selected) : nothing}
        aria-busy=${this.loading ? 'true' : nothing}
        ?disabled=${this.disabled}
      >
        ${this.renderButtonContent()}
      </button>`;
    }
    return html`<a
      class=${classMap(cssClasses)}
      id="link"
      href=${this.href}
      target=${this.target}
      rel=${this.rel || nothing}
      download=${this.download || nothing}
      tabindex=${this.disabled ? '-1' : '0'}
      aria-label="${label || nothing}"
      aria-haspopup="${ariaHasPopup || nothing}"
      aria-expanded="${ariaExpanded || nothing}"
      aria-describedby=${ifDefined(
        this.softDisabled ? DISABLED_REASON_ID : undefined,
      )}
      aria-disabled=${this.softDisabled ? 'true' : nothing}
      aria-busy=${this.loading ? 'true' : nothing}
    >
      ${this.renderButtonContent()}
    </a>`;
  }

  // ── Render ────────────────────────────────────────────────────────────────

  override render() {
    const buttonId = isLink(this) ? 'link' : 'button';

    return html`
      <wc-focus-ring class="focus-ring" for=${buttonId}></wc-focus-ring>
      <wc-elevation class="elevation"></wc-elevation>
      ${when(
        this.variant === 'neo',
        () => html`<div class="neo-background"></div>`,
      )}
      <div class="background"></div>
      ${when(
        this.variant === 'outlined' || this.variant === 'neo',
        () => html`<div class="outline"></div>`,
      )}
      <wc-ripple class="ripple" for=${buttonId}></wc-ripple>
      <wc-skeleton class="skeleton"></wc-skeleton>

      ${this.renderButtonElement()} ${this.renderTooltip()}
    `;
  }
}
