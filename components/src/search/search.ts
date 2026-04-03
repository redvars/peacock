import { LitElement, html, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { live } from 'lit/directives/live.js';
import IndividualComponent from '../IndividualComponent.js';
import styles from './search.scss';
import colorStyles from './search-colors.scss';
import { observerSlotChangesWithCallback } from '../utils.js';

/**
 * @label Search
 * @tag wc-search
 * @rawTag search
 *
 * @summary A Material 3 search bar for filtering and finding content.
 * @overview
 * <p>The search component provides a text input designed for search interactions.
 * It supports outlined and filled variants, an optional clear button, and leading/trailing icon slots.</p>
 *
 * @cssprop --search-container-shape - Border radius of the search bar. Defaults to full (pill shape).
 * @cssprop --search-container-color - Background color of the search container.
 * @cssprop --search-input-text-color - Color of the input text.
 * @cssprop --search-placeholder-color - Color of the placeholder text.
 * @cssprop --search-icon-color - Color of the leading and trailing icons.
 * @cssprop --search-outline-color - Border color for the outlined variant.
 * @cssprop --search-outline-width - Border width for the outlined variant.
 *
 * @fires {CustomEvent} input - Dispatched when the search value changes.
 * @fires {CustomEvent} change - Dispatched when the search input loses focus or Enter is pressed.
 * @fires {CustomEvent} clear - Dispatched when the clear button is activated.
 * @fires {CustomEvent} search - Dispatched when the user submits the search (presses Enter).
 *
 * @example
 * ```html
 * <wc-search placeholder="Search..."></wc-search>
 * ```
 * @tags form
 */
@IndividualComponent
export class Search extends LitElement {
  static styles = [styles, colorStyles];

  /**
   * Visual style variant.
   * Possible values: `"outlined"`, `"filled"`. Defaults to `"filled"`.
   */
  @property({ type: String, reflect: true })
  variant: 'outlined' | 'filled' = 'filled';

  /**
   * Placeholder text shown when the input is empty.
   */
  @property({ type: String })
  placeholder: string = 'Search';

  /**
   * Current search value.
   */
  @property({ type: String })
  value: string = '';

  /**
   * Whether the search bar is disabled.
   */
  @property({ type: Boolean, reflect: true })
  disabled: boolean = false;

  /**
   * Whether a clear button is shown when the input has a value.
   */
  @property({ type: Boolean })
  clearable: boolean = true;

  /**
   * Size of the search bar.
   * Possible values: `"sm"`, `"md"`, `"lg"`. Defaults to `"md"`.
   */
  @property({ type: String, reflect: true })
  size: 'sm' | 'md' | 'lg' = 'md';

  @state()
  private focused: boolean = false;

  @state()
  private leadingSlotHasContent: boolean = false;

  @query('.search-input')
  private inputElement?: HTMLInputElement;

  override firstUpdated() {
    observerSlotChangesWithCallback(
      this.renderRoot.querySelector('slot[name="leading"]'),
      hasContent => {
        this.leadingSlotHasContent = hasContent;
        this.requestUpdate();
      },
    );
  }

  /** Focuses the internal input element. */
  override focus() {
    this.inputElement?.focus();
  }

  /** Blurs the internal input element. */
  override blur() {
    this.inputElement?.blur();
  }

  private __handleInput(event: InputEvent) {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.dispatchEvent(
      new CustomEvent('input', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private __handleChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private __handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.dispatchEvent(
        new CustomEvent('search', {
          detail: { value: this.value },
          bubbles: true,
          composed: true,
        }),
      );
    }
    if (event.key === 'Escape') {
      this.__clearValue();
    }
  }

  private __handleFocus() {
    this.focused = true;
  }

  private __handleBlur() {
    this.focused = false;
  }

  private __clearValue() {
    this.value = '';
    this.inputElement?.focus();
    this.dispatchEvent(
      new CustomEvent('clear', {
        bubbles: true,
        composed: true,
      }),
    );
    this.dispatchEvent(
      new CustomEvent('input', {
        detail: { value: '' },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private __renderClearButton() {
    if (!this.clearable || !this.value) return nothing;

    return html`
      <button
        class="clear-button"
        aria-label="Clear search"
        tabindex="-1"
        @click=${this.__clearValue}
        ?disabled=${this.disabled}
      >
        <wc-icon name="close"></wc-icon>
      </button>
    `;
  }

  private __renderLeadingIcon() {
    return html`
      <div class="leading-icon ${this.leadingSlotHasContent ? 'has-slot' : ''}">
        <slot name="leading">
          <wc-icon name="search"></wc-icon>
        </slot>
      </div>
    `;
  }

  override render() {
    const cssClasses = {
      search: true,
      [`variant-${this.variant}`]: true,
      [`size-${this.size}`]: true,
      focused: this.focused,
      disabled: this.disabled,
      'has-value': !!this.value,
    };

    return html`
      <div class=${classMap(cssClasses)} role="search">
        <div class="background"></div>
        <div class="outline"></div>

        ${this.__renderLeadingIcon()}

        <input
          class="search-input"
          type="search"
          role="searchbox"
          .value=${live(this.value)}
          placeholder=${this.placeholder}
          ?disabled=${this.disabled}
          aria-label=${this.placeholder}
          @input=${this.__handleInput}
          @change=${this.__handleChange}
          @keydown=${this.__handleKeydown}
          @focus=${this.__handleFocus}
          @blur=${this.__handleBlur}
        />

        <div class="trailing-actions">
          ${this.__renderClearButton()}
          <slot name="trailing"></slot>
        </div>
      </div>
    `;
  }
}
