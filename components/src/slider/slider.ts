import { html, nothing, type PropertyValues } from 'lit';
import { property, state, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import type { FormRestoreState } from '@/__internal/mixins/form-associated.js';
import { deprecate } from '@/__internal/utils/deprecate.js';
import type { Size } from '@/__internal/utils/size.js';
import BaseInput, { type ControlValidity } from '../input/BaseInput.js';
import sliderStyles from './slider.scss';
import IndividualComponent from '@/IndividualComponent.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';

let sliderCount = 0;

/** Where the slider shows its value: on the thumb while it is used, after the track, or not. */
export type SliderValueLabel = 'thumb' | 'end' | 'none';

/**
 * @label Slider
 * @tag wc-slider
 * @rawTag slider
 *
 * @summary Sliders allow users to make selections from a range of values.
 * @overview
 * <p>The slider is form-associated: its <code>value</code> is submitted under its <code>name</code>,
 * and <code>form.reset()</code> restores the starting value. Without a <code>value</code> it starts
 * at the middle of <code>min</code>–<code>max</code>, like a native range input.</p>
 * <p><code>label</code> is shown above the track, as on fields, and names the thumb; without it the
 * thumb is named "Slider". <code>value-text</code> (the <code>valueText</code> property) formats
 * the value for <code>aria-valuetext</code> and the visible value, for example
 * <code>v =&gt; `${v}%`</code>.</p>
 * <p><code>required</code> does not apply: a slider always has a value. <code>readonly</code> keeps
 * it focusable but its value cannot change.</p>
 * <p>Keyboard: the arrows move one step (ten with Shift), Page Up and Page Down move ten steps,
 * Home and End go to <code>min</code> and <code>max</code>.</p>
 * <p>Deprecated: <code>labeled</code> and <code>show-value</code> still work until 4.0; use
 * <code>value-label="thumb"</code>, <code>"end"</code> or <code>"none"</code>.</p>
 *
 * @fires {CustomEvent<{value: number}>} input - Dispatched when the slider value changes during interaction.
 * @fires {CustomEvent<{value: number}>} change - Dispatched when the slider interaction ends.
 *
 * @example
 * ```html
 * <wc-slider label="Volume" min="0" max="100" value="50"></wc-slider>
 * ```
 * @tags input, form
 */
@IndividualComponent
export class Slider extends BaseInput {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [sliderStyles];

  // ── Properties ───────────────────────────────────────────────────────────
  // `name` and `disabled` come from mixinFormAssociated; `readonly` and `required` from BaseInput.

  /**
   * The minimum value of the slider.
   */
  @property({ type: Number }) min = 0;

  /**
   * The maximum value of the slider.
   */
  @property({ type: Number }) max = 100;

  /**
   * The current value of the slider. Defaults to the middle of `min`–`max`.
   */
  @property({ type: Number })
  get value(): number {
    return this.explicitValue ?? this.snapToStep((this.min + this.max) / 2);
  }

  set value(value: number | undefined | null) {
    const old = this.value;
    this.explicitValue =
      value === undefined || value === null || Number.isNaN(Number(value))
        ? undefined
        : Number(value);
    this.requestUpdate('value', old);
  }

  /**
   * The step increment for the slider.
   */
  @property({ type: Number }) step = 1;

  /** Label shown above the slider; also the thumb's accessible name. */
  @property({ type: String }) label = '';

  /** Help text shown below the slider. */
  @property({ type: String, attribute: 'helper-text' }) helperText = '';

  /** Shows the slider in its error state with `error-text`. */
  @property({ type: Boolean, reflect: true }) error = false;

  @property({ type: String, attribute: 'error-text' }) errorText = '';

  /** Size of the track and thumb: `sm` (default), `md` or `lg`. */
  @property({ type: String, reflect: true }) size: Size = 'sm';

  /**
   * Where the value shows: `thumb` (on the thumb while it is used; the default), `end` (after the
   * track) or `none`.
   */
  @property({ type: String, attribute: 'value-label' })
  valueLabel?: SliderValueLabel;

  /** Formats the value for `aria-valuetext` and the visible value. */
  @property({ attribute: false })
  valueText?: (value: number) => string;

  /**
   * Whether to show the value on the thumb. Defaults to true.
   * @deprecated Use `value-label="thumb"` or `value-label="none"`.
   */
  @property({ type: Boolean }) labeled?: boolean;

  /**
   * Whether to show the current value beside the slider.
   * @deprecated Use `value-label="end"`.
   */
  @property({ type: Boolean, attribute: 'show-value' }) showValue?: boolean;

  // ── State ────────────────────────────────────────────────────────────────

  /** True while the user is actively dragging the thumb. */
  @state() private isDragging = false;

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('.slider-container') private container!: HTMLElement;

  @query('.thumb') private thumbElement!: HTMLElement;

  // ── Private fields ───────────────────────────────────────────────────────

  /** The value set by the consumer or the person; `undefined` means the midpoint. */
  private explicitValue?: number;

  /** Whether a value was given when first connected; reset returns to the midpoint otherwise. */
  private startedWithValue?: boolean;

  private readonly idPrefix = `wc-slider-${(sliderCount += 1)}`;

  /** Peacock's strings for the thumb label. */
  private readonly i18n = new I18nController(this);

  // ── Lifecycle ────────────────────────────────────────────────────────────

  override connectedCallback() {
    this.startedWithValue ??= this.explicitValue !== undefined;
    super.connectedCallback();
  }

  protected override willUpdate(changed: PropertyValues<this>) {
    super.willUpdate(changed);
    if (changed.has('labeled') && this.labeled !== undefined) {
      deprecate('wc-slider', '`labeled`', '`value-label="thumb"`');
    }
    if (changed.has('showValue') && this.showValue !== undefined) {
      deprecate('wc-slider', '`show-value`', '`value-label="end"`');
    }
  }

  // ── Public methods ───────────────────────────────────────────────────────

  override focus() {
    this.thumbElement?.focus();
  }

  override blur() {
    this.thumbElement?.blur();
  }

  // ── Form association ─────────────────────────────────────────────────────

  override formResetCallback() {
    super.formResetCallback();
    if (!this.startedWithValue) this.value = undefined;
  }

  protected override parseRestoreState(restored: FormRestoreState): unknown {
    const value = Number(restored);
    return typeof restored === 'string' && !Number.isNaN(value)
      ? value
      : this.value;
  }

  // ── Protected methods ────────────────────────────────────────────────────

  /** A slider always has a value in range, so only `setCustomValidity()` makes it invalid. */
  protected override computeValidity(): ControlValidity {
    return { flags: {}, message: '' };
  }

  protected override validityAnchor() {
    return this.thumbElement;
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private get isInteractive(): boolean {
    return !this.disabled && !this.readonly;
  }

  /** Where the value shows, from `value-label` or the deprecated `labeled`/`show-value`. */
  private get valuePlacement(): { thumb: boolean; end: boolean } {
    if (this.valueLabel) {
      return {
        thumb: this.valueLabel === 'thumb',
        end: this.valueLabel === 'end',
      };
    }
    return { thumb: this.labeled ?? true, end: this.showValue ?? false };
  }

  private formatValue(value: number): string {
    return this.valueText ? this.valueText(value) : String(value);
  }

  private emit(type: 'input' | 'change') {
    this.dispatchEvent(
      new CustomEvent(type, {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleInput(event: MouseEvent | TouchEvent) {
    if (!this.isInteractive) return;

    const rect = this.container.getBoundingClientRect();
    const clientX =
      'touches' in event
        ? event.touches[0].clientX
        : (event as MouseEvent).clientX;

    // Calculate percentage relative to track width
    let percentage = (clientX - rect.left) / rect.width;
    percentage = Math.max(0, Math.min(1, percentage));

    const rawValue = this.min + percentage * (this.max - this.min);
    const steppedValue = this.snapToStep(rawValue);

    const oldValue = this.value;
    this.value = Math.max(this.min, Math.min(this.max, steppedValue));

    if (oldValue !== this.value) this.emit('input');
  }

  private onMouseDown(e: MouseEvent | TouchEvent) {
    if (!this.isInteractive) return;

    e.preventDefault();
    this.isDragging = true;

    // Add dragging class for CSS state
    this.container.classList.add('dragging');
    this.thumbElement.classList.add('dragging');

    this.handleInput(e);

    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('touchmove', this.onMouseMove, { passive: false });
    window.addEventListener('touchend', this.onMouseUp);
    window.addEventListener('touchcancel', this.onMouseUp);
  }

  private onMouseMove = (e: MouseEvent | TouchEvent) => {
    if (this.isDragging) {
      e.preventDefault();
      this.handleInput(e);
    }
  };

  private onMouseUp = () => {
    if (!this.isDragging) return;

    this.isDragging = false;
    this.container.classList.remove('dragging');
    this.thumbElement.classList.remove('dragging');

    this.emit('change');

    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('touchmove', this.onMouseMove);
    window.removeEventListener('touchend', this.onMouseUp);
    window.removeEventListener('touchcancel', this.onMouseUp);
  };

  /**
   * Rounds a value to the nearest step counted from `min`, like a native range input, so a slider
   * with `min="1" step="5"` lands on 1, 6, 11. Rounds away float noise from fractional steps.
   */
  private snapToStep(raw: number): number {
    if (!(this.step > 0)) return raw;
    const stepped =
      this.min + Math.round((raw - this.min) / this.step) * this.step;
    const decimals = Math.max(
      (String(this.step).split('.')[1] ?? '').length,
      (String(this.min).split('.')[1] ?? '').length,
    );
    return Number(stepped.toFixed(decimals));
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (!this.isInteractive) return;

    const increment = e.shiftKey ? this.step * 10 : this.step;
    const page = this.step * 10;
    const current = this.value;
    let newValue = current;

    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      newValue = Math.min(this.max, current + increment);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      newValue = Math.max(this.min, current - increment);
    } else if (e.key === 'PageUp') {
      newValue = Math.min(this.max, current + page);
    } else if (e.key === 'PageDown') {
      newValue = Math.max(this.min, current - page);
    } else if (e.key === 'Home') {
      newValue = this.min;
    } else if (e.key === 'End') {
      newValue = this.max;
    } else {
      return;
    }
    e.preventDefault();

    if (newValue !== current) {
      this.value = newValue;
      this.emit('input');
      this.emit('change');
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    const { value } = this;
    const range = this.max - this.min;
    const percentage = range > 0 ? ((value - this.min) / range) * 100 : 0;
    const placement = this.valuePlacement;
    const formatted = this.formatValue(value);
    const labelId = `${this.idPrefix}-label`;
    const descriptionId = `${this.idPrefix}-description`;
    const errorText = this.error ? this.errorText : this.validationText;
    const invalid = this.error || !!errorText;
    const description = errorText || this.helperText;

    return html`
      <div
        class=${classMap({
          wrapper: true,
          [`size-${this.size}`]: true,
          disabled: this.disabled,
          readonly: this.readonly,
          error: invalid,
        })}
      >
        ${this.label
          ? html`<div class="label" id=${labelId}>${this.label}</div>`
          : nothing}
        <div class="slider ${placement.end ? 'with-value' : ''}">
          <div
            class="slider-container ${this.disabled ? 'disabled' : ''}"
            @mousedown=${this.onMouseDown}
            @touchstart=${this.onMouseDown}
          >
            <div class="track">
              <div
                class="track-active"
                style=${styleMap({ width: `${percentage}%` })}
              ></div>
            </div>

            <div
              class="thumb"
              role="slider"
              aria-label=${this.label ? nothing : this.i18n.t('slider')}
              aria-labelledby=${this.label ? labelId : nothing}
              aria-describedby=${description ? descriptionId : nothing}
              tabindex="${this.disabled ? -1 : 0}"
              aria-valuemin=${this.min}
              aria-valuemax=${this.max}
              aria-valuenow=${value}
              aria-valuetext=${this.valueText ? formatted : nothing}
              aria-disabled=${this.disabled ? 'true' : nothing}
              aria-readonly=${this.readonly ? 'true' : nothing}
              aria-invalid=${invalid ? 'true' : nothing}
              style=${styleMap({
                left: `calc(${percentage}% - var(--thumb-half))`,
              })}
              @keydown=${this.handleKeyDown}
            >
              ${placement.thumb
                ? html`<div class="value-label">${formatted}</div>`
                : ''}
            </div>
          </div>

          ${placement.end
            ? html`<output class="value-display" aria-hidden="true"
                >${formatted}</output
              >`
            : ''}
        </div>
        ${description
          ? html`<div class="helper" id=${descriptionId}>${description}</div>`
          : nothing}
      </div>
    `;
  }
}
