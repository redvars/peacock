import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { when } from 'lit/directives/when.js';
import IndividualComponent from '@/IndividualComponent.js';
import styles from './button.scss';
import { throttle } from '@/__utils/throttle.js';
import { spread } from '@/__directive/spread.js';
import { isLink } from '@/__utils/is-link.js';
import { observerSlotChangesWithCallback } from '@/__utils/observe-slot-change.js';
import NativeButtonMixin from '@/__mixins/NativeButtonMixin.js';
import NativeHyperlinkMixin from '@/__mixins/NativeHyperlinkMixin.js';
import { GroupButtonInterface } from '@/button/GroupButtonInterface.js';
import {
  dispatchActivationClick,
  isActivationClick,
} from '@/__utils/dispatch-event-utils.js';
import { DISABLED_REASON_ID } from '@/button/ButtonConstants.js';

/**
 * @label Button
 * @tag wc-button
 * @rawTag button
 *
 * @summary Buttons help people initiate actions, from sending an email, to sharing a document, to liking a post.
 * @overview
 * <p>Buttons are clickable elements that are used to trigger actions. They communicate calls to action to the user and allow users to interact with pages in a variety of ways. Button labels express what action will occur when the user interacts with it.</p>
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
 * @fires {MouseEvent} click - Dispatched when the button is clicked.
 *
 * @example
 * ```html
 * <wc-button>Button</wc-button>
 * ```
 * @tags display
 */
@IndividualComponent
export class Button
  extends NativeButtonMixin(NativeHyperlinkMixin(LitElement))
  implements GroupButtonInterface
{
  static override styles = [styles];

  /**
   * Icon alignment.
   * Possible values are `"start"`, `"end"`. Defaults to `"end"`.
   */
  @property({ type: Boolean, reflect: true, attribute: 'trailing-icon' })
  trailingIcon = false;

  /**
   * Button size.
   * Possible values are `"xs"`, `"sm"`, `"md"`, `"lg"`, `"xl"`. Defaults to `"sm"`.
   */
  @property({ reflect: true }) size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'sm';

  /**
   * Type is preset of color and variant. Type will be only applied.
   *
   */
  @property({ type: String }) type?: 'primary' | 'secondary' | 'tertiary';

  @property({ type: String, reflect: true }) shape: 'round' | 'square' =
    'square';

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
  @property({ reflect: true }) variant:
    | 'elevated'
    | 'filled'
    | 'tonal'
    | 'outlined'
    | 'text'
    | 'neo' = 'filled';

  /**
   * Defines the primary color of the button. This can be set to predefined color names to apply specific color themes.
   */
  @property({ reflect: true }) color:
    | 'primary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'surface'
    | 'on-surface' = 'primary';

  /**
   * Additional ARIA attributes to pass to the inner button/anchor element.
   */
  @property({ reflect: true })
  configAria?: { [key: string]: any };

  override focus() {
    this.getControl()?.focus();
  }

  override blur() {
    this.getControl()?.blur();
  }

  override firstUpdated() {
    if (this.throttleDelay !== null) {
      this.__dispatchClickWithThrottle = throttle(
        this.__dispatchClick,
        this.throttleDelay,
      );
    }

    this.__convertTypeToVariantAndColor();
    // Initialize slot presence tracking for smooth transitions when label/icon are added/removed
    const iconSlot = this.renderRoot.querySelector(
      'slot[name="icon"]',
    ) as HTMLSlotElement | null;
    const labelSlot = this.renderRoot.querySelector(
      'slot.label',
    ) as HTMLSlotElement | null;

    // Use MutationObserver-based helper so we react to content/character changes
    if (iconSlot) {
      this.__iconSlotCleanup = observerSlotChangesWithCallback(
        iconSlot,
        has => {
          this.toggleAttribute('has-icon', has);
        },
      );
    }

    if (labelSlot) {
      this.__labelSlotCleanup = observerSlotChangesWithCallback(
        labelSlot,
        has => {
          this.toggleAttribute('has-label', has);
        },
      );
    }
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

      ${this.renderButtonElement()} ${this.__renderTooltip()}
    `;
  }

  renderButtonElement() {
    const isElementLink = isLink(this);

    const cssClasses: any = {
      button: true,
      'native-button': !isElementLink,
      'native-link': isElementLink,
      'trailing-icon': this.trailingIcon,
    };

    if (isElementLink) {
      return html`<a
        class=${classMap(cssClasses)}
        id="link"
        href=${this.href}
        target=${this.target}
        tabindex=${this.disabled ? '-1' : '0'}
        role="button"
        aria-describedby=${ifDefined(
          this.softDisabled ? DISABLED_REASON_ID : undefined,
        )}
        ?aria-disabled=${this.softDisabled}
        ${spread(this.configAria)}
      >
        ${this.renderButtonContent()}
      </a>`;
    }
    return html`<button
        class=${classMap(cssClasses)}
        id="button"
        type=${this.htmlType}
        aria-describedby=${ifDefined(
          this.softDisabled ? DISABLED_REASON_ID : undefined,
        )}
        ?aria-disabled=${this.softDisabled}
        ?disabled=${this.disabled}
        ${spread(this.configAria)}
      >
        ${this.renderButtonContent()}
      </button>
      ${this.__renderTooltip()}`;
  }

  renderButtonContent() {
    return html` <slot class="icon-slot" name="icon"></slot>
      <slot class="label"></slot>
      <div class="touch"></div>

      ${this.__renderDisabledReason(this.softDisabled)}`;
  }

  @property({ type: Boolean, reflect: true }) skeleton: boolean = false;

  @property({ type: Boolean, reflect: true }) toggle: boolean = false;

  @property({ type: Boolean, reflect: true }) selected: boolean = false;

  /**
   * Sets the delay for throttle in milliseconds. When null (default), no throttle is applied.
   */
  @property() throttleDelay: number | null = null;

  @property() tooltip?: string;

  /**
   * States
   */
  @property({ type: Boolean, reflect: true })
  pressed = false;

  // Query the internal control (button or link) on demand instead of
  // keeping a persistent query reference.

  // cleanup functions returned by observerSlotChangesWithCallback
  private __iconSlotCleanup: (() => void) | null = null;

  private __labelSlotCleanup: (() => void) | null = null;

  constructor() {
    super();
    this.addEventListener('click', this.__dispatchClickWithThrottle);
  }

  override connectedCallback() {
    super.connectedCallback();
  }

  override disconnectedCallback() {
    // disconnect slot observers first to avoid callbacks during teardown
    try {
      this.__iconSlotCleanup?.();
    } catch (e) {
      /* ignore */
    }
    try {
      this.__labelSlotCleanup?.();
    } catch (e) {
      /* ignore */
    }

    super.disconnectedCallback();
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

    const control = this.getControl();

    if (!isActivationClick(event) || !control) {
      return;
    }

    this.focus();
    dispatchActivationClick(control);
  };

  private getControl(): HTMLElement | null {
    return (
      (this.renderRoot?.querySelector('#button') as HTMLElement | null) ??
      (this.renderRoot?.querySelector('#link') as HTMLElement | null)
    );
  }

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
      const buttonId = isLink(this) ? 'link' : 'button';
      return html`<wc-tooltip class="tooltip" for=${buttonId}
        >${this.tooltip}</wc-tooltip
      >`;
    }
    return nothing;
  }
}
