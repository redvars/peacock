import { LitElement, html, nothing, PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { dispatchActivationClick, isActivationClick } from '../__utils/dispatch-event-utils.js';
import { observerSlotChangesWithCallback } from '@/__utils/observe-slot-change.js';
import { throttle } from '@/__utils/throttle.js';
import IndividualComponent from '@/IndividualComponent.js';
import styles from './card.scss';
import colorStyles from './card-colors.scss';

type CardVariant = 'elevated' | 'filled' | 'outlined';

/**
 * @label Card
 * @tag wc-card
 * @rawTag card
 * @summary A Material 3 inspired card surface for grouping related content.
 * @cssprop --card-padding - Inner padding for the card container. Defaults to 1rem.
 * @cssprop --card-shape - Corner radius for the card container. Defaults to a large radius.
 * @cssprop --card-gap - Gap between slotted children.
 *
 * @example
 * ```html
 * <wc-card variant="outlined">
 *   <h3>Title</h3>
 *   <p>Supportive text</p>
 * </wc-card>
 * ```
 */
@IndividualComponent
export class Card extends LitElement {
  static styles = [styles, colorStyles];

  #id = crypto.randomUUID();

  @property({ type: String, reflect: true })
  variant: CardVariant = 'elevated';

  @property({ type: Boolean, reflect: true })
  disabled: boolean = false;

  @property({ type: Boolean, reflect: true })
  actionable: boolean = false;

  /**
  * If button is disabled, the reason why it is disabled.
  */
  @property({ attribute: 'disabled-reason' })
  disabledReason: string = '';

  /**
   * Hyperlink to navigate to on click.
   */
  @property({ reflect: true }) href?: string;

  /**
   * Sets or retrieves the window or frame at which to target content.
   */
  @property() target: string = '_self';


  /**
   * Sets the delay for throttle in milliseconds. Defaults to 200 milliseconds.
   */
  @property() throttleDelay = 200;

  /**
   * States
   */
  @state()
  isPressed = false;

  @state()
  private slotHasContent = false;


  @query('.card') readonly cardElement!: HTMLElement | null;

  @query('slot') readonly contentSlot!: HTMLSlotElement | null;

  #tabindex?: number = 0;

  #slottedTabIndexMap = new WeakMap<HTMLElement, string | null>();

  override firstUpdated() {
    this.__dispatchClickWithThrottle = throttle(
      this.__dispatchClick,
      this.throttleDelay,
    );
    observerSlotChangesWithCallback(
      this.renderRoot.querySelector('slot'),
      hasContent => {
        this.slotHasContent = hasContent;
        this.__syncSlottedChildrenTabIndex();
        this.requestUpdate();
      },
    );
    this.__syncSlottedChildrenTabIndex();
  }

  override updated(changedProperties: PropertyValues<this>) {
    if (changedProperties.has('actionable') || changedProperties.has('href')) {
      this.__syncSlottedChildrenTabIndex();
    }
  }

  __syncSlottedChildrenTabIndex() {
    if (!this.contentSlot) return;

    const shouldDisableTabbing = this.actionable || this.__isLink();
    const assignedChildren = this.contentSlot.assignedElements({ flatten: true });

    assignedChildren.forEach(node => {
      if (!(node instanceof HTMLElement)) return;

      if (shouldDisableTabbing) {
        if (!this.#slottedTabIndexMap.has(node)) {
          this.#slottedTabIndexMap.set(node, node.getAttribute('tabindex'));
        }

        if (node.getAttribute('tabindex') !== '-1') {
          node.setAttribute('tabindex', '-1');
        }
        return;
      }

      const originalTabIndex = this.#slottedTabIndexMap.get(node);
      if (originalTabIndex === null) {
        if (node.hasAttribute('tabindex')) {
          node.removeAttribute('tabindex');
        }
      } else if (originalTabIndex !== undefined) {
        if (node.getAttribute('tabindex') !== originalTabIndex) {
          node.setAttribute('tabindex', originalTabIndex);
        }
      }

      this.#slottedTabIndexMap.delete(node);
    });
  }

  __dispatchClickWithThrottle: (event: MouseEvent | KeyboardEvent) => void =
    event => {
      this.__dispatchClick(event);
    };

  __dispatchClick = (event: MouseEvent | KeyboardEvent) => {
    // If the button is soft-disabled or a disabled link, we need to explicitly
    // prevent the click from propagating to other event listeners as well as
    // prevent the default action.
    if (this.disabled && this.href) {
      event.stopImmediatePropagation();
      event.preventDefault();
      return;
    }

    if (!isActivationClick(event) || !this.cardElement) {
      return;
    }

    this.focus();
    dispatchActivationClick(this.cardElement);
  };

  __isLink() {
    return !!this.href;
  }

  __getDisabledReasonID() {
    return this.disabled && this.disabledReason
      ? `disabled-reason-${this.#id}`
      : nothing;
  }

  __renderDisabledReason() {
    const disabledReasonID = this.__getDisabledReasonID();
    if (disabledReasonID)
      return html`<div
        id="disabled-reason-${this.#id}"
        role="tooltip"
        aria-label=${this.disabledReason}
        class="screen-reader-only"
      >
        ${this.disabledReason}
      </div>`;
    return nothing;
  }

  __handlePress = (event: KeyboardEvent | MouseEvent) => {
    if (this.disabled) return;
    if (
      event instanceof KeyboardEvent &&
      event.type === 'keydown' &&
      (event.key === 'Enter' || event.key === ' ')
    ) {
      this.isPressed = true;
    } else if (event.type === 'mousedown') {
      this.isPressed = true;
    } else {
      this.isPressed = false;
    }
  };




  render() {

    const isLink = this.__isLink();

    const cssClasses = {
      card: true,
      'card-element': true,
      [`variant-${this.variant}`]: true,
      actionable: (this.actionable && !this.disabled) || isLink,
      disabled: this.disabled,
      pressed: this.isPressed,
      'has-content': this.slotHasContent,
    };

    if (!this.actionable && !isLink) {
      return html`<div
              class=${classMap(cssClasses)}
              id="card"
              >
              ${this.renderCardContent()}
            </div>`;
    }

    if (!isLink) {
      return html`<button
              class=${classMap(cssClasses)}
              id="card"
              tabindex=${this.#tabindex}
              @click=${this.__dispatchClickWithThrottle}
              @mousedown=${this.__handlePress}
              @keydown=${this.__handlePress}
              @keyup=${this.__handlePress}
              ?aria-describedby=${this.__getDisabledReasonID()}
              aria-disabled=${`${this.disabled}`}
              ?disabled=${this.disabled}
            >
              ${this.renderCardContent()}
            </button>`;
    }
    return html`<a
            class=${classMap(cssClasses)}
            id="card"
            tabindex=${this.#tabindex}
            href=${this.href}
            target=${this.target}
              @click=${this.__dispatchClickWithThrottle}
            @mousedown=${this.__handlePress}
            @keydown=${this.__handlePress}
            @keyup=${this.__handlePress}
            role="button"
            ?aria-describedby=${this.__getDisabledReasonID()}
            aria-disabled=${`${this.disabled}`}
          >
            ${this.renderCardContent()}
          </a>`;
  }

  renderCardContent() {
    return html`
    <wc-focus-ring class="focus-ring" .forElement=${this.cardElement}></wc-focus-ring>
      <wc-elevation class="elevation"></wc-elevation>
      <div class="background"></div>
      <div class="outline"></div>
      <wc-ripple class="ripple"></wc-ripple> 

      <div class="card-content">

        <div class="slot-container">
          <slot @slotchange=${this.__syncSlottedChildrenTabIndex}></slot>
        </div>

      </div>
      `;
  }
}
