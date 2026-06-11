import { E, A, i as i$1, _ as __decorate, I as IndividualComponent, a as i$2, b } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { r as r$1 } from './state-DkTK9EGF.js';
import { e as e$1 } from './query-CHb9Ft_d.js';
import { e as e$2 } from './class-map-DG7CA1et.js';
import { e, i, t } from './directive-ZPhl09Yt.js';
import { o as observerSlotChangesWithCallback } from './observe-slot-change-DPxaZrZF.js';
import './base-Cl6v8-BZ.js';

/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const r=o=>void 0===o.strings,m={},p=(o,t=m)=>o._$AH=t;

/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const l=e(class extends i{constructor(r$1){if(super(r$1),r$1.type!==t.PROPERTY&&r$1.type!==t.ATTRIBUTE&&r$1.type!==t.BOOLEAN_ATTRIBUTE)throw Error("The `live` directive is not allowed on child or event bindings");if(!r(r$1))throw Error("`live` bindings can only contain a single expression")}render(r){return r}update(i,[t$1]){if(t$1===E||t$1===A)return t$1;const o=i.element,l=i.name;if(i.type===t.PROPERTY){if(t$1===o[l])return E}else if(i.type===t.BOOLEAN_ATTRIBUTE){if(!!t$1===o.hasAttribute(l))return E}else if(i.type===t.ATTRIBUTE&&o.getAttribute(l)===t$1+"")return E;return p(i),t$1}});

var css_248z$1 = i$1`* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

.screen-reader-only {
  display: none !important;
}

[hidden] {
  display: none !important;
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
  --_container-shape-start-start: var(--search-container-shape-start-start, var(--search-container-shape));
  --_container-shape-start-end: var(--search-container-shape-start-end, var(--search-container-shape));
  --_container-shape-end-start: var(--search-container-shape-end-start, var(--search-container-shape));
  --_container-shape-end-end: var(--search-container-shape-end-end, var(--search-container-shape));
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

var css_248z = i$1`:host {
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

/**
 * @label Search
 * @tag wc-search
 * @rawTag search
 *
 * @summary A search bar for filtering and finding content.
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
let Search = class Search extends i$2 {
    constructor() {
        super(...arguments);
        /**
         * Visual style variant.
         * Possible values: `"outlined"`, `"filled"`. Defaults to `"filled"`.
         */
        this.variant = 'filled';
        /**
         * Placeholder text shown when the input is empty.
         */
        this.placeholder = 'Search';
        /**
         * Current search value.
         */
        this.value = '';
        /**
         * Whether the search bar is disabled.
         */
        this.disabled = false;
        /**
         * Whether a clear button is shown when the input has a value.
         */
        this.clearable = true;
        /**
         * Size of the search bar.
         * Possible values: `"sm"`, `"md"`, `"lg"`. Defaults to `"md"`.
         */
        this.size = 'md';
        this.focused = false;
        this.leadingSlotHasContent = false;
        this.__handleFocusChange = (event) => {
            this.focused = event.type === 'focus';
        };
    }
    firstUpdated() {
        observerSlotChangesWithCallback(this.renderRoot.querySelector('slot[name="leading"]'), hasContent => {
            this.leadingSlotHasContent = hasContent;
            this.requestUpdate();
        });
    }
    async focus() {
        await Promise.all([
            customElements.whenDefined('wc-input'),
            customElements.whenDefined('wc-field'),
        ]);
        await this.updateComplete;
        this.inputElement?.focus();
    }
    __handleInput(event) {
        const input = event.target;
        this.value = input.value;
        // Prevent the native input event from escaping in addition to our API event.
        event.stopPropagation();
        this.dispatchEvent(new CustomEvent('input', {
            detail: { value: this.value },
            bubbles: true,
            composed: true,
        }));
    }
    __handleChange(event) {
        const input = event.target;
        this.value = input.value;
        // Prevent the native change event from escaping in addition to our API event.
        event.stopPropagation();
        this.dispatchEvent(new CustomEvent('change', {
            detail: { value: this.value },
            bubbles: true,
            composed: true,
        }));
    }
    __handleKeydown(event) {
        if (event.key === 'Enter') {
            this.dispatchEvent(new CustomEvent('search', {
                detail: { value: this.value },
                bubbles: true,
                composed: true,
            }));
        }
        if (event.key === 'Escape') {
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
        this.dispatchEvent(new CustomEvent('input', {
            detail: { value: '' },
            bubbles: true,
            composed: true,
        }));
    }
    __renderClearButton() {
        if (!this.clearable || !this.value)
            return A;
        return b `
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
    __renderLeadingIcon() {
        return b `
      <div class="leading-icon ${this.leadingSlotHasContent ? 'has-slot' : ''}">
        <slot name="leading">
          <wc-icon name="search"></wc-icon>
        </slot>
      </div>
    `;
    }
    render() {
        const cssClasses = {
            search: true,
            [`variant-${this.variant}`]: true,
            [`size-${this.size}`]: true,
            focused: this.focused,
            disabled: this.disabled,
            'has-value': !!this.value,
        };
        return b `
      <div class=${e$2(cssClasses)} role="search">
        <div class="background"></div>
        <div class="outline"></div>

        ${this.__renderLeadingIcon()}

        <input
          class="search-input"
          type="search"
          role="searchbox"
          .value=${l(this.value)}
          placeholder=${this.placeholder}
          ?disabled=${this.disabled}
          aria-label=${this.placeholder}
          @input=${this.__handleInput}
          @change=${this.__handleChange}
          @keydown=${this.__handleKeydown}
          @focus=${this.__handleFocusChange}
          @blur=${this.__handleFocusChange}
        />

        <div class="trailing-actions">
          ${this.__renderClearButton()}
          <slot name="trailing"></slot>
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
], Search.prototype, "placeholder", void 0);
__decorate([
    n({ type: String })
], Search.prototype, "value", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Search.prototype, "disabled", void 0);
__decorate([
    n({ type: Boolean })
], Search.prototype, "clearable", void 0);
__decorate([
    n({ type: String, reflect: true })
], Search.prototype, "size", void 0);
__decorate([
    r$1()
], Search.prototype, "focused", void 0);
__decorate([
    r$1()
], Search.prototype, "leadingSlotHasContent", void 0);
__decorate([
    e$1('.search-input')
], Search.prototype, "inputElement", void 0);
Search = __decorate([
    IndividualComponent
], Search);

export { Search };
//# sourceMappingURL=search.js.map
