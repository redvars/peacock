import { html, LitElement } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import { spread } from '@/__directive/spread.js';

import styles from './radio.scss';

/**
 * @label Radio
 * @tag wc-radio
 * @rawTag radio
 * @summary Allows selection of a single option from a set.
 * @overview
 * <p>Radio buttons follow the Material Design 3 specifications with clear focus, hover, and selected states.</p>
 *
 * @cssprop --radio-size: Size of the outer radio circle.
 * @cssprop --radio-dot-size: Size of the inner dot when selected.
 * @cssprop --radio-selected-color: Color of the radio when selected.
 * @cssprop --radio-unselected-color: Color of the radio outline when unselected.
 * @cssprop --radio-state-layer-size: Size of the state layer for touch target.
 * @cssprop --radio-disabled-opacity: Opacity applied when the radio is disabled.
 *
 * @fires {CustomEvent} change - Dispatched when the radio selection changes.
 * @fires {CustomEvent} blur - Dispatched when the radio loses focus.
 * @fires {CustomEvent} focus - Dispatched when the radio receives focus.
 *
 * @example
 * ```html
 * <wc-radio name="fruits" value="apple" label="Apple"></wc-radio>
 * ```
 * @tags input, form
 */
type RadioDirection = 1 | -1;

export class Radio extends LitElement {
  private static readonly DIRECTION_NEXT: RadioDirection = 1;
  private static readonly DIRECTION_PREVIOUS: RadioDirection = -1;

  static styles = [styles];

  /**
   * The input field name for grouping radios.
   */
  @property({ type: String })
  name: string = '';

  /**
   * The submitted value when this radio is selected.
   */
  @property({ type: String })
  value: string = '';

  /**
   * The radio label.
   */
  @property({ type: String })
  label: string = '';

  /**
   * Whether the radio is selected.
   */
  @property({ type: Boolean, reflect: true })
  checked: boolean = false;

  /**
   * If true, required icon is shown. Defaults to `false`.
   */
  @property({ type: Boolean, reflect: true })
  required: boolean = false;

  /**
   * If true, the radio is readonly. Defaults to `false`.
   */
  @property({ type: Boolean, reflect: true })
  readonly: boolean = false;

  /**
   * If true, the user cannot interact with the radio. Defaults to `false`.
   */
  @property({ type: Boolean, reflect: true })
  disabled: boolean = false;

  /**
   * Configuration object for aria attributes.
   */
  @property({ type: Object })
  configAria: Record<string, string> = {};

  @state()
  private hasFocus = false;

  @state()
  private isActive = false;

  @state()
  private slotHasContent = false;

  @state()
  private isGroupFocusTarget = false;

  @query('.container')
  private containerElement?: HTMLElement;

  @query('.input-native')
  private nativeElement?: HTMLInputElement;

  private tabindex?: number;

  connectedCallback() {
    super.connectedCallback();
    this.handleInitialAttributes();
    window.addEventListener('mouseup', this.windowMouseUp);
    window.addEventListener('keyup', this.windowKeyUp);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('mouseup', this.windowMouseUp);
    window.removeEventListener('keyup', this.windowKeyUp);
  }

  firstUpdated() {
    this.slotHasContent = this.hasChildNodes() || !!this.label;
    this.updateGroupFocusTarget();
  }

  updated(changedProps: Map<string, unknown>) {
    if (changedProps.has('label')) {
      this.slotHasContent = this.hasChildNodes() || !!this.label;
    }

    if (changedProps.has('checked') && this.checked) {
      this.uncheckSiblings();
    }

    if (changedProps.has('checked') || changedProps.has('name')) {
      this.updateGroupFocusTarget();
    }
  }

  private handleInitialAttributes() {
    if (this.hasAttribute('tabindex')) {
      const attrValue = this.getAttribute('tabindex');
      if (attrValue !== null) {
        this.tabindex = parseInt(attrValue, 10);
      }
      this.removeAttribute('tabindex');
    }

    Array.from(this.attributes).forEach(attr => {
      if (attr.name.startsWith('aria-')) {
        this.configAria[attr.name] = attr.value;
        this.removeAttribute(attr.name);
      }
    });
  }

  private windowMouseUp = () => {
    if (this.isActive) {
      this.isActive = false;
    }
  };

  private windowKeyUp = (evt: KeyboardEvent) => {
    if (this.isActive && evt.key === ' ') {
      evt.preventDefault();
      this.isActive = false;
    }
  };

  private mouseDownHandler = () => {
    this.isActive = true;
  };

  private keyDownHandler = (evt: KeyboardEvent) => {
    if (evt.key === ' ') {
      evt.preventDefault();
      this.isActive = true;
      this.selectRadio(evt);
    } else if (evt.key === 'ArrowRight' || evt.key === 'ArrowDown') {
      evt.preventDefault();
      this.navigateGroup(Radio.DIRECTION_NEXT);
    } else if (evt.key === 'ArrowLeft' || evt.key === 'ArrowUp') {
      evt.preventDefault();
      this.navigateGroup(Radio.DIRECTION_PREVIOUS);
    }
  };

  private clickHandler = (ev: MouseEvent | KeyboardEvent) => {
    this.selectRadio(ev);
  };

  private blurHandler = (ev: FocusEvent) => {
    this.hasFocus = false;
    this.dispatchEvent(
      new CustomEvent('blur', {
        detail: ev,
        bubbles: true,
        composed: true,
      }),
    );
  };

  private focusHandler = (ev: FocusEvent) => {
    this.hasFocus = true;
    this.dispatchEvent(
      new CustomEvent('focus', {
        detail: ev,
        bubbles: true,
        composed: true,
      }),
    );
  };

  private selectRadio(ev?: Event) {
    if (this.disabled || this.readonly) return;

    if (!this.checked) {
      this.checked = true;
      this.uncheckSiblings();
      this.dispatchChange(ev);
    }

    this.containerElement?.focus();
  }

  private dispatchChange(ev?: Event) {
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: { value: this.value, checked: this.checked, originalEvent: ev },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private uncheckSiblings() {
    if (!this.name || !this.checked) return;
    const radios = this.getGroupRadios();

    radios.forEach(radio => {
      if (radio === this) return;
      radio.checked = false;
    });
  }

  private getGroupRadios(): Radio[] {
    if (!this.name) return [this];
    const scopeRoot = this.closest('form') ?? document;
    return Array.from(
      scopeRoot.querySelectorAll<Radio>(`wc-radio[name="${this.name}"]`),
    );
  }

  private isRadioEnabled(radio: Radio) {
    return !radio.disabled && !radio.readonly;
  }

  private updateGroupFocusTarget() {
    const group = this.getGroupRadios();
    if (!group.length) return;

    const enabledGroup = group.filter(radio => this.isRadioEnabled(radio));
    if (!enabledGroup.length) {
      group.forEach(radio => {
        radio.isGroupFocusTarget = false;
      });
      return;
    }

    const target =
      enabledGroup.find(radio => radio.checked) || enabledGroup[0];

    group.forEach(radio => {
      radio.isGroupFocusTarget = radio === target;
    });
  }

  private navigateGroup(direction: RadioDirection) {
    const group = this.getGroupRadios().filter(radio =>
      this.isRadioEnabled(radio),
    );
    if (!group.length) return;

    const currentIndex = group.indexOf(this);
    const startIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex = (startIndex + direction + group.length) % group.length;
    const target = group[nextIndex];

    target.selectRadio();
    target.containerElement?.focus();
  }

  /**
   * Sets focus on the radio.
   */
  focus() {
    this.containerElement?.focus();
  }

  /**
   * Removes focus from the radio.
   */
  blur() {
    this.containerElement?.blur();
  }

  render() {
    const cssClasses = {
      radio: true,
      'state-checked': this.checked,
      'has-focus': this.hasFocus,
      active: this.isActive,
      disabled: this.disabled,
      readonly: this.readonly,
      required: this.required,
      'has-content': this.slotHasContent,
    };

    return html`
      <label class=${classMap(cssClasses)}>
        <div
          class="container"
          tabindex=${this.isGroupFocusTarget
            ? this.tabindex !== undefined
              ? this.tabindex
              : 0
            : -1}
          role="radio"
          aria-disabled=${this.disabled}
          aria-required=${this.required}
          aria-checked=${this.checked}
          @click=${this.clickHandler}
          @mousedown=${this.mouseDownHandler}
          @keydown=${this.keyDownHandler}
          @blur=${this.blurHandler}
          @focus=${this.focusHandler}
          ${spread(this.configAria)}
        >
          <div class="state-layer"></div>
          <div class="outer-circle"></div>
          <div class="inner-circle"></div>
        </div>

        <input
          type="radio"
          class="input-native"
          name=${this.name}
          .value=${this.value}
          .checked=${this.checked}
          aria-hidden="true"
          ?required=${this.required}
          ?disabled=${this.disabled}
          tabindex="-1"
        />

        ${this.label
          ? html`<div class="label">${this.label}</div>`
          : html`<div class="label slot-container"><slot></slot></div>`}
      </label>
    `;
  }
}
