import { i, _ as __decorate, I as IndividualComponent, A, b } from './IndividualComponent-BK7XZjE2.js';
import { n } from './property-B2TG3KEE.js';
import { r } from './state-BCeDVCI9.js';
import { e } from './query-CHb9Ft_d.js';
import { e as e$1 } from './class-map-NDIkZErE.js';
import { l } from './live-D_5OfuGD.js';
import { I as I18nController } from './i18n-controller-CH4e9sju.js';
import { A as AiController } from './ai-controller-DR_Tg0sN.js';
import { s as sparkle } from './sparkle-BmtM0vbq.js';
import { B as BaseInput, n as nativeValidity } from './BaseInput-CTOcQ_Y1.js';
import './base-Cl6v8-BZ.js';
import './directive-ZPhl09Yt.js';
import './directive-helpers-Bx3mu42O.js';
import './strings-o6v6Hrmn.js';
import './locale-DEsJZCQG.js';
import './element-internals-QME0yEz4.js';
import './form-associated-BHbg72PG.js';
import './suggestion-controller-BKMbUhgq.js';

var css_248z$1 = i`* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

.screen-reader-only {
  position: absolute !important;
  inline-size: 1px !important;
  block-size: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip-path: inset(50%) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

[hidden] {
  display: none !important;
}

@media (forced-colors: active) {
  .selected,
  [aria-selected=true],
  [aria-pressed=true],
  [aria-checked=true],
  [aria-current]:not([aria-current=false]) {
    outline: 2px solid Highlight;
    outline-offset: -2px;
  }
  .disabled,
  [aria-disabled=true] {
    color: GrayText;
  }
}
:host {
  display: block;
  --search-container-shape: var(--shape-corner-full);
  --search-container-shape-start-start: unset;
  --search-container-shape-start-end: unset;
  --search-container-shape-end-start: unset;
  --search-container-shape-end-end: unset;
}

.search {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  gap: 0.25rem;
  --_container-shape-start-start: var(
    --search-container-shape-start-start,
    var(--search-container-shape)
  );
  --_container-shape-start-end: var(
    --search-container-shape-start-end,
    var(--search-container-shape)
  );
  --_container-shape-end-start: var(
    --search-container-shape-end-start,
    var(--search-container-shape)
  );
  --_container-shape-end-end: var(
    --search-container-shape-end-end,
    var(--search-container-shape)
  );
  border-start-start-radius: var(--_container-shape-start-start);
  border-start-end-radius: var(--_container-shape-start-end);
  border-end-start-radius: var(--_container-shape-end-start);
  border-end-end-radius: var(--_container-shape-end-end);
  padding-inline: 1rem;
  /* size-md default */
  --_height: 3.5rem;
  --icon-size: 1.25rem;
}
.search.size-sm {
  --_height: 2.5rem;
  padding-inline: 0.75rem;
  --icon-size: 1rem;
}
.search.size-lg {
  --_height: 4rem;
  padding-inline: 1.25rem;
  --icon-size: 1.5rem;
}
.search {
  min-height: var(--_height);
}

/* Background layer */
.background {
  position: absolute;
  inset: 0;
  background-color: var(--_container-color);
  border-start-start-radius: var(--_container-shape-start-start);
  border-start-end-radius: var(--_container-shape-start-end);
  border-end-start-radius: var(--_container-shape-end-start);
  border-end-end-radius: var(--_container-shape-end-end);
  pointer-events: none;
  z-index: 0;
}

/* Outline layer (outlined variant) */
.outline {
  display: none;
  position: absolute;
  inset: 0;
  border: var(--_outline-width, 0.0675rem) solid var(--_outline-color);
  border-start-start-radius: var(--_container-shape-start-start);
  border-start-end-radius: var(--_container-shape-start-end);
  border-end-start-radius: var(--_container-shape-end-start);
  border-end-end-radius: var(--_container-shape-end-end);
  pointer-events: none;
  z-index: 1;
}

/* Input element */
.search-input {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  outline: none;
  padding: 0;
  margin: 0;
  z-index: 1;
  position: relative;
  color: var(--_input-text-color);
  caret-color: var(--_caret-color, var(--color-primary));
  font-family: var(--typography-body-large-font-family);
  font-size: var(--typography-body-large-font-size);
  font-weight: var(--typography-body-large-font-weight);
  line-height: var(--typography-body-large-line-height);
  letter-spacing: var(--typography-body-large-letter-spacing);
}
.search-input::placeholder {
  color: var(--_placeholder-color);
}
.search-input {
  /* Remove browser default search input styling */
}
.search-input::-webkit-search-cancel-button, .search-input::-webkit-search-decoration {
  appearance: none;
  display: none;
}

/* Leading icon area */
.leading-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  z-index: 1;
  position: relative;
  color: var(--_icon-color);
  --icon-color: var(--_icon-color);
  margin-inline-end: 0.5rem;
}

/* Trailing actions area (clear button + trailing slot) */
.trailing-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
  z-index: 1;
  position: relative;
  color: var(--_icon-color);
  --icon-color: var(--_icon-color);
}

/* Clear button */
.ask-button {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-050, 0.25rem);
  block-size: 2rem;
  padding-inline: var(--spacing-100, 0.5rem) var(--spacing-150, 0.75rem);
  color: var(--color-on-primary-container);
  font: inherit;
  cursor: pointer;
  background: var(--color-primary-container);
  border: none;
  border-radius: var(--shape-corner-full);
  font-family: var(--typography-label-large-font-family);
  font-size: var(--typography-label-large-font-size);
  font-weight: var(--typography-label-large-font-weight);
  line-height: var(--typography-label-large-line-height);
  letter-spacing: var(--typography-label-large-letter-spacing);
}
.ask-button .sparkle {
  inline-size: 1rem;
  block-size: 1rem;
  fill: currentColor;
}
.ask-button:disabled {
  cursor: default;
  opacity: 0.6;
}
.ask-button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.size-sm .ask-button {
  block-size: 1.75rem;
}

.clear-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  color: var(--_icon-color);
  --icon-color: var(--_icon-color);
  outline: none;
  transition: background-color 150ms;
}
.clear-button:hover:not([disabled]) {
  background-color: color-mix(in srgb, var(--_icon-color) 8%, transparent);
}
.clear-button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 1px;
}
.clear-button[disabled] {
  cursor: default;
  opacity: 0.38;
  pointer-events: none;
}

/* ---- Variants ---- */
.search.variant-filled {
  --_container-color: var(--search-container-color);
  --_input-text-color: var(--search-input-text-color);
  --_placeholder-color: var(--search-placeholder-color);
  --_icon-color: var(--search-icon-color);
}
.search.variant-filled.focused {
  --_outline-color: var(--color-primary);
}
.search.variant-filled.focused .outline {
  display: block;
  border-width: 2px;
}

.search.variant-outlined {
  --_container-color: var(--search-outlined-container-color);
  --_input-text-color: var(--search-outlined-input-text-color);
  --_placeholder-color: var(--search-outlined-placeholder-color);
  --_icon-color: var(--search-outlined-icon-color);
  --_outline-color: var(--search-outline-color);
}
.search.variant-outlined .outline {
  display: block;
}
.search.variant-outlined.focused {
  --_outline-color: var(--color-primary);
}
.search.variant-outlined.focused .outline {
  border-width: 2px;
}

/* ---- Disabled state ---- */
.search.disabled {
  pointer-events: none;
  opacity: 0.38;
}
.search.disabled .search-input {
  cursor: not-allowed;
}`;

var css_248z = i`:host {
  /* Filled variant tokens */
  --search-container-color: var(--color-surface-container-high);
  --search-input-text-color: var(--color-on-surface);
  --search-placeholder-color: var(--color-on-surface-variant);
  --search-icon-color: var(--color-on-surface-variant);
  /* Outlined variant tokens */
  --search-outlined-container-color: var(--color-surface);
  --search-outlined-input-text-color: var(--color-on-surface);
  --search-outlined-placeholder-color: var(--color-on-surface-variant);
  --search-outlined-icon-color: var(--color-on-surface-variant);
  --search-outline-color: var(--color-outline);
}`;

/** Reads `clearable="false"` as false, so the default-on button can be turned off in HTML. */
const clearableConverter = {
    fromAttribute: (value) => value !== null && value !== 'false',
    toAttribute: (value) => (value ? '' : 'false'),
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
let Search = class Search extends BaseInput {
    constructor() {
        // ── Static ───────────────────────────────────────────────────────────────
        super(...arguments);
        // ── Properties ───────────────────────────────────────────────────────────
        /**
         * Visual style, as on fields: `default` (a filled container), `filled` or `outlined`.
         * `default` and `filled` look the same.
         */
        this.variant = 'default';
        /** Accessible name of the search box; the placeholder names it when it is empty. */
        this.label = '';
        /**
         * Placeholder text shown when the input is empty. Defaults to Peacock's "Search".
         */
        this.placeholder = '';
        /**
         * Current search value.
         */
        this.value = '';
        /**
         * Whether a clear button is shown when the input has a value. On by default; set
         * `clearable="false"` to hide it.
         */
        this.clearable = true;
        /**
         * Size of the search bar.
         * Possible values: `"sm"`, `"md"`, `"lg"`. Defaults to `"md"`.
         */
        this.size = 'md';
        /** Lets people ask the assistant from the box: an Ask button and Ctrl+Enter fire `ask`. */
        this.ask = false;
        /** Placeholder while asking is offered, such as "Ask for something, or search apps and records". */
        this.askPlaceholder = '';
        // ── State ────────────────────────────────────────────────────────────────
        this.focused = false;
        // ── Private fields ───────────────────────────────────────────────────────
        /** Peacock's strings for the placeholder and clear button. */
        this.i18n = new I18nController(this);
        this.ai = new AiController(this);
        this.__handleFocusChange = (event) => {
            this.focused = event.type === 'focus';
        };
    }
    /** Whether Ask is offered now: `ask`, and AI on for the page. */
    get __asking() {
        return this.ask && this.ai.available;
    }
    // ── Public methods ───────────────────────────────────────────────────────
    focus() {
        this.inputElement?.focus();
    }
    blur() {
        this.inputElement?.blur();
    }
    // ── Protected methods ────────────────────────────────────────────────────
    computeValidity() {
        return this.inputElement
            ? nativeValidity(this.inputElement)
            : super.computeValidity();
    }
    validityAnchor() {
        return this.inputElement;
    }
    // ── Private methods ──────────────────────────────────────────────────────
    __emit(type) {
        this.dispatchEvent(new CustomEvent(type, {
            detail: { value: this.value },
            bubbles: true,
            composed: true,
        }));
    }
    __handleInput(event) {
        const input = event.target;
        this.value = input.value;
        // Prevent the native input event from escaping in addition to our API event.
        event.stopPropagation();
        this.__emit('input');
    }
    __handleChange(event) {
        const input = event.target;
        this.value = input.value;
        // Prevent the native change event from escaping in addition to our API event.
        event.stopPropagation();
        this.__emit('change');
    }
    __handleKeydown(event) {
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
    __clearValue() {
        this.value = '';
        this.inputElement?.focus();
        this.dispatchEvent(new CustomEvent('clear', {
            bubbles: true,
            composed: true,
        }));
        this.__emit('input');
        this.__emit('change');
    }
    __ask() {
        if (!this.value.trim() || this.disabled)
            return;
        this.__emit('ask');
    }
    // ── Render helpers ───────────────────────────────────────────────────────
    __renderAskButton() {
        if (!this.__asking)
            return A;
        return b `<button
      class="ask-button"
      type="button"
      aria-label=${this.i18n.t('searchAskLabel')}
      ?disabled=${this.disabled || !this.value.trim()}
      @click=${this.__ask}
    >
      ${sparkle}<span>${this.i18n.t('searchAsk')}</span>
    </button>`;
    }
    __renderClearButton() {
        if (!this.clearable || !this.value || this.readonly)
            return A;
        return b `
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
    __renderLeadingIcon() {
        return b `
      <div class="leading-icon">
        <slot name="start">
          <wc-icon name="search"></wc-icon>
        </slot>
      </div>
    `;
    }
    // ── Render ───────────────────────────────────────────────────────────────
    render() {
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
        const placeholder = (this.__asking && this.askPlaceholder) ||
            this.placeholder ||
            this.i18n.t('search');
        return b `
      <div class=${e$1(cssClasses)} role="search">
        <div class="background"></div>
        <div class="outline"></div>

        ${this.__renderLeadingIcon()}

        <input
          class="search-input"
          type="search"
          role="searchbox"
          .value=${l(this.value)}
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
};
Search.styles = [css_248z$1, css_248z];
__decorate([
    n({ type: String, reflect: true })
], Search.prototype, "variant", void 0);
__decorate([
    n({ type: String })
], Search.prototype, "label", void 0);
__decorate([
    n({ type: String })
], Search.prototype, "placeholder", void 0);
__decorate([
    n({ type: String })
], Search.prototype, "value", void 0);
__decorate([
    n({ converter: clearableConverter })
], Search.prototype, "clearable", void 0);
__decorate([
    n({ type: String, reflect: true })
], Search.prototype, "size", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Search.prototype, "ask", void 0);
__decorate([
    n({ type: String, attribute: 'ask-placeholder' })
], Search.prototype, "askPlaceholder", void 0);
__decorate([
    r()
], Search.prototype, "focused", void 0);
__decorate([
    e('.search-input')
], Search.prototype, "inputElement", void 0);
Search = __decorate([
    IndividualComponent
], Search);

export { Search };
//# sourceMappingURL=search.js.map
