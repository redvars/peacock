import { html, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { live } from 'lit/directives/live.js';
import IndividualComponent from '@/IndividualComponent.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import { AiController } from '@/__internal/ai/ai-controller.js';
import { sparkle } from '@/__internal/ai/sparkle.js';
import BaseInput, {
  type ControlValidity,
  nativeValidity,
} from '../input/BaseInput.js';
import styles from './search.scss';
import colorStyles from './search-colors.scss';

/** Reads `clearable="false"` as false, so the default-on button can be turned off in HTML. */
const clearableConverter = {
  fromAttribute: (value: string | null) => value !== null && value !== 'false',
  toAttribute: (value: boolean) => (value ? '' : 'false'),
};

/**
 * @label Search
 * @tag wc-search
 * @rawTag search
 *
 * @summary A search box with a search icon and a clear button, for finding or filtering content.
 * @overview
 * <p>Search has the field variants (<code>default</code>, <code>filled</code>, <code>outlined</code>), a
 * clear button, and <code>start</code>/<code>end</code> slots for icons and actions.</p>
 * <p><code>label</code> is the accessible name of the search box (it is not shown); without it the
 * placeholder names it.</p>
 * <p>The clear button is on by default (<code>clearable</code> is <code>true</code>), unlike on
 * fields, because a search box is cleared often; turn it off with <code>clearable="false"</code>
 * or <code>.clearable=${false}</code>. Escape clears the value too; when there is nothing to clear,
 * Escape is left to the page, so a dialog around the search still closes.</p>
 * <p>Search is form-associated: inside a <code>&lt;form&gt;</code> its <code>value</code> is
 * submitted under its <code>name</code>, and <code>form.reset()</code> restores the starting value.
 * It shows no validation message, so use <code>wc-input</code> for a search term that must be
 * validated.</p>
 * <p><b>Ask.</b> With <code>ask</code>, the box is also where people ask the assistant
 * (ADR-030002): an <strong>Ask</strong> button and Ctrl+Enter (⌘Enter) fire <code>ask</code> with
 * the text, while Enter still searches. <code>ask-placeholder</code> replaces the placeholder, such
 * as "Ask for something, or search apps and records". With AI off for the page, the box is a plain
 * search: no button, the usual placeholder, and no <code>ask</code>.</p>
 *
 * @slot start - Leading content; replaces the search icon.
 * @slot end - Trailing content, after the clear button.
 *
 * @cssprop --search-container-shape - Border radius of the search bar. Defaults to full (pill shape).
 * @cssprop --search-container-color - Background color of the search container.
 * @cssprop --search-input-text-color - Color of the input text.
 * @cssprop --search-placeholder-color - Color of the placeholder text.
 * @cssprop --search-icon-color - Color of the leading and trailing icons.
 * @cssprop --search-outline-color - Border color for the outlined variant.
 * @cssprop --search-outline-width - Border width for the outlined variant.
 *
 * @fires {CustomEvent<{value: string}>} input - Dispatched when the search value changes.
 * @fires {CustomEvent<{value: string}>} change - Dispatched when the value is committed: on blur, Enter, or when it is cleared.
 * @fires {CustomEvent} clear - Dispatched when the value is cleared with the clear button or Escape.
 * @fires {CustomEvent<{value: string}>} search - Dispatched when the user submits the search (presses Enter).
 * @fires {CustomEvent<{value: string}>} ask - With `ask`: the person pressed Ask or Ctrl+Enter (⌘Enter) to ask the assistant.
 *
 * @example
 * ```html
 * <wc-search label="Search products" placeholder="Search..."></wc-search>
 * ```
 * @tags form
 */
@IndividualComponent
export class Search extends BaseInput {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles, colorStyles];

  // ── Properties ───────────────────────────────────────────────────────────

  /**
   * Visual style, as on fields: `default` (a filled container), `filled` or `outlined`.
   * `default` and `filled` look the same.
   */
  @property({ type: String, reflect: true })
  variant: 'default' | 'filled' | 'outlined' = 'default';

  /** Accessible name of the search box; the placeholder names it when it is empty. */
  @property({ type: String })
  label = '';

  /**
   * Placeholder text shown when the input is empty. Defaults to Peacock's "Search".
   */
  @property({ type: String })
  placeholder: string = '';

  /**
   * Current search value.
   */
  @property({ type: String })
  value: string = '';

  /**
   * Whether a clear button is shown when the input has a value. On by default; set
   * `clearable="false"` to hide it.
   */
  @property({ converter: clearableConverter })
  clearable: boolean = true;

  /**
   * Size of the search bar.
   * Possible values: `"sm"`, `"md"`, `"lg"`. Defaults to `"md"`.
   */
  @property({ type: String, reflect: true })
  size: 'sm' | 'md' | 'lg' = 'md';

  /** Lets people ask the assistant from the box: an Ask button and Ctrl+Enter fire `ask`. */
  @property({ type: Boolean, reflect: true })
  ask = false;

  /** Placeholder while asking is offered, such as "Ask for something, or search apps and records". */
  @property({ type: String, attribute: 'ask-placeholder' })
  askPlaceholder = '';

  // ── State ────────────────────────────────────────────────────────────────

  @state()
  private focused: boolean = false;

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('.search-input')
  private inputElement?: HTMLInputElement;

  // ── Private fields ───────────────────────────────────────────────────────

  /** Peacock's strings for the placeholder and clear button. */
  private readonly i18n = new I18nController(this);

  private readonly ai = new AiController(this);

  /** Whether Ask is offered now: `ask`, and AI on for the page. */
  private get __asking(): boolean {
    return this.ask && this.ai.available;
  }

  // ── Public methods ───────────────────────────────────────────────────────

  override focus() {
    this.inputElement?.focus();
  }

  override blur() {
    this.inputElement?.blur();
  }

  // ── Protected methods ────────────────────────────────────────────────────

  protected override computeValidity(): ControlValidity {
    return this.inputElement
      ? nativeValidity(this.inputElement)
      : super.computeValidity();
  }

  protected override validityAnchor() {
    return this.inputElement;
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private __emit(type: 'input' | 'change' | 'search' | 'ask') {
    this.dispatchEvent(
      new CustomEvent(type, {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private __handleInput(event: InputEvent) {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    // Prevent the native input event from escaping in addition to our API event.
    event.stopPropagation();
    this.__emit('input');
  }

  private __handleChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    // Prevent the native change event from escaping in addition to our API event.
    event.stopPropagation();
    this.__emit('change');
  }

  private __handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      if (this.__asking) {
        event.preventDefault();
        this.__ask();
        return;
      }
    }
    if (event.key === 'Enter') {
      this.__emit('search');
    }
    if (event.key === 'Escape' && this.value && !this.readonly) {
      // Only take Escape when there is something to clear; otherwise a dialog may want it.
      event.preventDefault();
      event.stopPropagation();
      this.__clearValue();
    }
  }

  private __handleFocusChange = (event: FocusEvent) => {
    this.focused = event.type === 'focus';
  };

  private __clearValue() {
    this.value = '';
    this.inputElement?.focus();
    this.dispatchEvent(
      new CustomEvent('clear', {
        bubbles: true,
        composed: true,
      }),
    );
    this.__emit('input');
    this.__emit('change');
  }

  private __ask() {
    if (!this.value.trim() || this.disabled) return;
    this.__emit('ask');
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  private __renderAskButton() {
    if (!this.__asking) return nothing;
    return html`<button
      class="ask-button"
      type="button"
      aria-label=${this.i18n.t('searchAskLabel')}
      ?disabled=${this.disabled || !this.value.trim()}
      @click=${this.__ask}
    >
      ${sparkle}<span>${this.i18n.t('searchAsk')}</span>
    </button>`;
  }

  private __renderClearButton() {
    if (!this.clearable || !this.value || this.readonly) return nothing;

    return html`
      <button
        class="clear-button"
        aria-label=${this.i18n.t('clearSearch')}
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
      <div class="leading-icon">
        <slot name="start">
          <wc-icon name="search"></wc-icon>
        </slot>
      </div>
    `;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  override render() {
    // `default` keeps the filled look the search has always had.
    const variant = this.variant === 'outlined' ? 'outlined' : 'filled';
    const cssClasses = {
      search: true,
      [`variant-${variant}`]: true,
      [`size-${this.size}`]: true,
      focused: this.focused,
      disabled: this.disabled,
      'has-value': !!this.value,
    };

    const placeholder =
      (this.__asking && this.askPlaceholder) ||
      this.placeholder ||
      this.i18n.t('search');

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
          placeholder=${placeholder}
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
          ?required=${this.required}
          aria-label=${this.label || placeholder}
          @input=${this.__handleInput}
          @change=${this.__handleChange}
          @keydown=${this.__handleKeydown}
          @focus=${this.__handleFocusChange}
          @blur=${this.__handleFocusChange}
        />

        <div class="trailing-actions">
          ${this.__renderClearButton()}
          <slot name="end"></slot>
          ${this.__renderAskButton()}
        </div>
      </div>
    `;
  }
}
