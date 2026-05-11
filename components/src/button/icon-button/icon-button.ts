import { html, LitElement, nothing } from 'lit';
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
import { mixinBaseButton } from '../base-button/base-button.js';
import { mixinHyperlink } from '@/__internal/mixins/hyperlink.js';
import { mixinDelegatesAria } from '@/__internal/aria/delegate.js';
import { mixinFormSubmitter } from '@/__internal/mixins/form-submitter.js';
import { mixinFormAssociated } from '@/__internal/mixins/form-associated.js';
import { mixinElementInternals } from '@/__internal/mixins/element-internals.js';
import { ARIAMixinStrict } from '@/__internal/aria/aria.js';
import type {
  ButtonColor,
  ButtonLevel,
  ButtonShape,
  ButtonSize,
  ButtonVariant,
} from '@/button/ButtonTypes.js';

/**
 * @label Icon Button
 * @tag wc-icon-button
 * @rawTag icon-button
 *
 * @summary Icon buttons allow users to take actions, and make choices, with a single tap.
 *
 * @overview
 * <p>Icon buttons are clickable elements that are used to trigger actions. They communicate calls to action to the user and allow users to interact with pages in a variety of ways. IconButton labels express what action will occur when the user interacts with it.</p>
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
 * @fires {CustomEvent} button:click - Dispatched when the button is clicked.
 *
 * @example
 * ```html
 * <wc-icon-button><wc-icon name="home"></wc-icon></wc-icon-button>
 * ```
 * @tags display
 */
@IndividualComponent
export class IconButton extends mixinBaseButton(
  mixinHyperlink(
    mixinDelegatesAria(
      mixinFormSubmitter(
        mixinFormAssociated(mixinElementInternals(LitElement)),
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

  /**
   * Button size.
   * Possible values are `"xs"`, `"sm"`, `"md"`, `"lg"`, `"xl"`. Defaults to `"sm"`.
   */
  @property({ reflect: true }) size: ButtonSize = 'sm';

  /**
   * Type is preset of color and variant. Type will be only applied.
   *
   */
  @property({ type: String }) level?: ButtonLevel;

  /** Shape of the button container. */
  @property({ type: String, reflect: true }) shape?: ButtonShape = 'square';

  /**
   * The visual style of the button.
   *
   *  Possible variant values:
   * `"filled"` is a filled button.
   * `"outlined"` is an outlined button.
   * `"text"` is a transparent button.
   * `"tonal"` is a light color button.
   * `"elevated"` is elevated button
   */
  @property({ reflect: true }) variant: ButtonVariant = 'filled';

  /**
   * Defines the primary color of the button. This can be set to predefined color names to apply specific color themes.
   */
  @property({ reflect: true }) color: ButtonColor = 'primary';

  /** When true, renders the button in a loading skeleton state. */
  @property({ type: Boolean, reflect: true }) skeleton: boolean = false;

  /** When true, the button acts as a toggle. Use with `selected`. */
  @property({ type: Boolean, reflect: true }) toggle: boolean = false;

  /** When true (and `toggle` is set), the button is in the selected/pressed state. */
  @property({ type: Boolean, reflect: true }) selected: boolean = false;

  /** Optional tooltip text displayed on hover. */
  @property() tooltip?: string;

  @query('.button') readonly buttonElement!: HTMLElement | null;

  constructor() {
    super();
    this.addEventListener('click', this.__dispatchClickWithThrottle);
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

    if (!isActivationClick(event) || !this.buttonElement) {
      return;
    }

    this.focus();
    dispatchActivationClick(this.buttonElement);
  };

  override focus() {
    this.buttonElement?.focus();
  }

  override blur() {
    this.buttonElement?.blur();
  }

  override firstUpdated(changedProperties: Map<PropertyKey, unknown>) {
    super.firstUpdated(changedProperties);
    this.__convertTypeToVariantAndColor();
  }

  __convertTypeToVariantAndColor() {
    if (this.type === 'primary') {
      this.color = 'primary';
      this.variant = 'filled';
    } else if (this.type === 'secondary') {
      this.color = 'surface';
      this.variant = 'filled';
    } else if (this.type === 'tertiary') {
      this.color = 'primary';
      this.variant = 'text';
    } else if (this.type === 'danger') {
      this.color = 'danger';
      this.variant = 'filled';
    }
  }

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

  renderButtonContent() {
    return html`
      <slot class="icon-slot"></slot>
      <div class="touch"></div>
      ${this.renderDisabledReason(this.softDisabled)}
    `;
  }

  renderButtonElement() {
    const isElementLink = isLink(this);
    const { ariaLabel, ariaHasPopup, ariaExpanded } = this as ARIAMixinStrict;

    const cssClasses = {
      button: true,
      'native-button': !isElementLink,
      'native-link': isElementLink,
    };

    if (!isLink(this)) {
      return html`<button
        class=${classMap(cssClasses)}
        id="button"
        aria-label="${ariaLabel || nothing}"
        aria-haspopup="${ariaHasPopup || nothing}"
        aria-expanded="${ariaExpanded || nothing}"
        aria-describedby=${ifDefined(
          this.softDisabled ? DISABLED_REASON_ID : undefined,
        )}
        ?aria-disabled=${this.softDisabled}
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
      tabindex=${this.disabled ? '-1' : '0'}
      aria-label="${ariaLabel || nothing}"
      aria-haspopup="${ariaHasPopup || nothing}"
      aria-expanded="${ariaExpanded || nothing}"
      aria-describedby=${ifDefined(
        this.softDisabled ? DISABLED_REASON_ID : undefined,
      )}
      ?aria-disabled=${this.softDisabled}
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
      <wc-ripple class="ripple" for="button"></wc-ripple>
      <wc-skeleton class="skeleton"></wc-skeleton>

      ${this.renderButtonElement()} ${this.renderTooltip()}
    `;
  }
}
