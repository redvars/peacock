import { html, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { observerSlotChangesWithCallback } from '@/__utils/observe-slot-change.js';
import { dispatchActivationClick, isActivationClick } from '@/__utils/dispatch-event-utils.js';
import styles from './chip.scss';
import sizeStyles from './chip-sizes.scss';
import { spread } from '@/__directive/spread.js';
import { BaseButton } from '@/button/BaseButton.js';

/**
 * @label Chip
 * @tag wc-chip
 * @rawTag chip
 * @summary Chip component for displaying compact information with optional actions.
 * @tags display
 *
 * @example
 * ```html
 * <wc-chip>Chip content</wc-chip>
 * ```
 */
export class Chip extends BaseButton {
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

  @state() private _hasIconSlotContent = false;

  @state() private _isPressed = false;

  override focus() {
    this.buttonElement?.focus();
  }

  override blur() {
    this.buttonElement?.blur();
  }

  override firstUpdated() {
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
    const detail = { value: this.value || this.textContent?.trim() };

    // Custom Event: tag--dismiss
    this.dispatchEvent(
      new CustomEvent('tag--dismiss', {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
  }


  private _renderCloseButton() {
    if (!this.dismissible) return nothing;

    return html`
      <button
        class="close-btn"
        @click=${this._dismissClickHandler}
        aria-label="Dismiss"
      >
        <wc-icon class="close-btn-icon" name="close"></wc-icon>
      </button>
    `;
  }

  

  render() {
    const cssClasses = {
      chip: true,
      button: true,
      selected: this.selected,
      dismissible: this.dismissible,
      pressed: this._isPressed,
      'icon-slot-has-content': this._hasIconSlotContent,
    };

     if (!this.__isLink()) {
        return html`<button
            class=${classMap(cssClasses)}
            id="button"
            type=${this.htmlType}
            @click=${this.__dispatchClickWithThrottle}
            @mousedown=${this.__handlePress}
            @keydown=${this.__handlePress}
            @keyup=${this.__handlePress}
  
            aria-describedby=${ifDefined(this.softDisabled ? BaseButton.DISABLED_REASON_ID : undefined)}
            ?aria-disabled=${this.softDisabled}
  
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
          
          @click=${this.__dispatchClick}
          @mousedown=${this.__handlePress}
          @keydown=${this.__handlePress}
          @keyup=${this.__handlePress}
          role="button"
  
          aria-describedby=${ifDefined(this.softDisabled ? BaseButton.DISABLED_REASON_ID : undefined)}
          ?aria-disabled=${this.softDisabled}
  
          ${spread(this.configAria)}
        >
          ${this.renderChipContent()}
        </a>`;
    }

  renderChipContent() {
    return html`
      <wc-focus-ring class="focus-ring" for="button"></wc-focus-ring>
      <wc-elevation class="elevation"></wc-elevation>
      <div class="background"></div>
      <div class="outline"></div>
      <wc-ripple class="ripple"></wc-ripple>
      <div class="tag-content">

        <div class="icon-slot-container">
          ${this.selected
            ? html`<wc-icon class="selected-icon" name="check"></wc-icon>`
            : html`<slot name="icon"></slot>`}
        </div>
        <div class="label-container">
          <slot></slot>
        </div> 
        
        ${this._renderCloseButton()}
      </div>
    `;
  }
}
