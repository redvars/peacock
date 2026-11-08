import { html, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';

import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import { isRtl } from '@/__internal/i18n/locale.js';
import {
  type FormRestoreState,
  type FormValue,
  getFormValue,
} from '@/__internal/mixins/form-associated.js';
import type { Size } from '@/__internal/utils/size.js';
import IndividualComponent from '@/IndividualComponent.js';

import BaseInput, { type ControlValidity } from '../input/BaseInput.js';
import styles from './rating.scss';

/** `detail` of `input` and `change`. */
export interface RatingChangeDetail {
  value: number;
}

let ratingCount = 0;

/**
 * @label Rating
 * @tag wc-rating
 * @rawTag rating
 *
 * @summary A star rating: pick how many stars, or show an average such as 4.3 out of 5.
 * @overview
 * <p>Rating lets the person pick a score from 1 to <code>max</code> (5 by default) by clicking a
 * star or with the keyboard. Pointing at the stars previews the score; nothing changes until the
 * click. With <code>precision="0.5"</code> the left half of a star (the right half in right-to-left
 * layouts) picks a half star. With <code>clearable</code>, choosing the current score again clears
 * it.</p>
 * <p>It is one keyboard stop that follows the WAI-ARIA slider pattern: the arrow keys change the
 * score by one step (mirrored in right-to-left layouts), Home and End go to the lowest and highest
 * score, and the digit keys pick that many stars. Screen readers hear "3 out of 5".</p>
 * <p><code>readonly</code> turns it into a display, for example a product's average review: any
 * value is drawn with a partly filled star, and it is a single image named "Rated 4.3 out of 5".
 * Inside a <code>&lt;form&gt;</code> the score is submitted under <code>name</code>; no score submits
 * nothing, and <code>required</code> blocks submission until one is picked.</p>
 * <p>The stars are Material Symbols: <code>icon</code> names the empty shape and
 * <code>&lt;icon&gt;-fill</code> the filled one, so any symbol with a fill variant works
 * (<code>favorite</code>, <code>thumb_up</code>).</p>
 *
 * @fires {CustomEvent<{value: number}>} input - Dispatched when the person picks a score (not while previewing).
 * @fires {CustomEvent<{value: number}>} change - Dispatched with `input`, when the person picks a score. `0` means cleared.
 *
 * @cssprop --rating-filled-color - Color of filled stars.
 * @cssprop --rating-empty-color - Color of empty stars.
 * @cssprop --rating-icon-size - Size of one star; overrides `size`.
 *
 * @example
 * ```html
 * <wc-rating label="Your rating" name="rating"></wc-rating>
 * ```
 * @example
 * ```html
 * <wc-rating label="Average" readonly value="4.3"></wc-rating>
 * ```
 * @tags input, form
 */
@IndividualComponent
export class Rating extends BaseInput {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────
  // `name` and `disabled` come from mixinFormAssociated; `readonly` and `required` from BaseInput.

  /** The score; `0` for none. Read-only ratings show any value, others snap to `precision`. */
  @property({ type: Number })
  value = 0;

  /** Number of stars, the highest score. */
  @property({ type: Number })
  max = 5;

  /** Step of the score: `1` for whole stars, `0.5` for half stars. */
  @property({ type: Number })
  precision: 1 | 0.5 = 1;

  /** Choosing the current score again, or going below the lowest, clears it to `0`. */
  @property({ type: Boolean })
  clearable = false;

  /** Label shown above the stars; also their accessible name. */
  @property({ type: String })
  label = '';

  /** Help text shown below the stars. */
  @property({ type: String, attribute: 'helper-text' })
  helperText = '';

  /** Shows the rating in its error state with `error-text`. */
  @property({ type: Boolean, reflect: true })
  error = false;

  /** Error message shown below the rating while `error` is set; replaces the help text. */
  @property({ type: String, attribute: 'error-text' })
  errorText = '';

  /** Size of the stars: `sm` (default), `md` or `lg`. */
  @property({ type: String, reflect: true })
  size: Size = 'sm';

  /** Material Symbols name of the empty star; `<icon>-fill` is the filled one. */
  @property({ type: String })
  icon = 'star';

  /** Locale for the spoken numbers; defaults to the nearest `lang`. */
  @property({ type: String })
  locale?: string;

  // ── State ────────────────────────────────────────────────────────────────

  /** The score under the pointer, previewed until it leaves or clicks. */
  @state() private hoverValue?: number;

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('.stars') private starsElement?: HTMLElement;

  // ── Private fields ───────────────────────────────────────────────────────

  private readonly idPrefix = `wc-rating-${(ratingCount += 1)}`;

  /** Peacock's strings for the value text. */
  private readonly i18n = new I18nController(this);

  // ── Public methods ───────────────────────────────────────────────────────

  override focus() {
    this.starsElement?.focus();
  }

  override blur() {
    this.starsElement?.blur();
  }

  // ── Protected methods ────────────────────────────────────────────────────

  protected override computeValidity(): ControlValidity {
    if (this.required && !(this.value > 0) && !this.disabled) {
      return {
        flags: { valueMissing: true },
        message: this.valueMissingText(),
      };
    }
    return { flags: {}, message: '' };
  }

  protected override valueMissingText(): string {
    return this.i18n.t('valueMissingRating');
  }

  protected override validityAnchor() {
    return this.starsElement ?? undefined;
  }

  override [getFormValue](): FormValue | null {
    return this.value > 0 ? String(this.value) : null;
  }

  protected override parseRestoreState(restored: FormRestoreState): unknown {
    const value = typeof restored === 'string' ? Number(restored) : 0;
    return Number.isFinite(value) ? value : 0;
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private get step(): number {
    return Number(this.precision) === 0.5 ? 0.5 : 1;
  }

  private get starCount(): number {
    const max = Math.floor(Number(this.max));
    return Number.isFinite(max) && max > 0 ? max : 5;
  }

  private get isInteractive(): boolean {
    return !this.disabled && !this.readonly;
  }

  /** The value clamped to the stars, and in interactive mode snapped to the step. */
  private get shownValue(): number {
    const value = Math.min(
      this.starCount,
      Math.max(0, Number(this.value) || 0),
    );
    if (this.readonly) return value;
    return Math.round(value / this.step) * this.step;
  }

  private format(value: number): string {
    return new Intl.NumberFormat(this.i18n.locale, {
      maximumFractionDigits: 1,
    }).format(value);
  }

  private valueText(value: number): string {
    if (!(value > 0)) return this.i18n.t('ratingNoValue');
    return this.i18n.t('ratingValueText')(
      this.format(value),
      this.format(this.starCount),
    );
  }

  /** Sets the score from the person's action and fires `input` and `change`. */
  private commit(value: number) {
    if (!this.isInteractive || value === this.shownValue) return;
    this.value = value;
    for (const type of ['input', 'change']) {
      this.dispatchEvent(
        new CustomEvent<RatingChangeDetail>(type, {
          detail: { value },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  /** The score a pointer at `event` over star `index` would pick. */
  private pointerValue(event: PointerEvent | MouseEvent, index: number) {
    if (this.step === 1) return index + 1;
    const star = event.currentTarget as HTMLElement;
    const rect = star.getBoundingClientRect();
    const offset = isRtl(this)
      ? rect.right - event.clientX
      : event.clientX - rect.left;
    return offset < rect.width / 2 ? index + 0.5 : index + 1;
  }

  private handleStarPointerMove(event: PointerEvent, index: number) {
    if (!this.isInteractive) return;
    this.hoverValue = this.pointerValue(event, index);
  }

  private handlePointerLeave() {
    this.hoverValue = undefined;
  }

  private handleStarClick(event: MouseEvent, index: number) {
    if (!this.isInteractive) return;
    const value = this.pointerValue(event, index);
    this.hoverValue = undefined;
    this.commit(this.clearable && value === this.shownValue ? 0 : value);
  }

  private handleKeyDown(event: KeyboardEvent) {
    if (!this.isInteractive) return;
    const { step } = this;
    const current = this.shownValue;
    // Without `clearable`, the keys cannot go back to no score once there is one.
    const lowest = this.clearable || current === 0 ? 0 : step;
    const rtl = isRtl(this);
    let next: number | undefined;
    switch (event.key) {
      case 'ArrowUp':
        next = current + step;
        break;
      case 'ArrowDown':
        next = current - step;
        break;
      case 'ArrowRight':
        next = rtl ? current - step : current + step;
        break;
      case 'ArrowLeft':
        next = rtl ? current + step : current - step;
        break;
      case 'Home':
        next = lowest;
        break;
      case 'End':
        next = this.starCount;
        break;
      default:
        if (/^[0-9]$/.test(event.key) && !event.ctrlKey && !event.metaKey) {
          const digit = Number(event.key);
          if (digit <= this.starCount) next = digit;
        }
    }
    if (next === undefined) return;
    event.preventDefault();
    this.commit(Math.min(this.starCount, Math.max(lowest, next)));
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  private renderStar(index: number, shown: number) {
    const fill = Math.min(1, Math.max(0, shown - index));
    // The keyboard is handled by the slider around the stars; a star is only a pointer target.
    // eslint-disable-next-line lit-a11y/click-events-have-key-events
    return html`<span
      class=${classMap({ star: true, filled: fill === 1 })}
      style=${styleMap({ '--_fill': `${fill * 100}%` })}
      @pointermove=${(event: PointerEvent) =>
        this.handleStarPointerMove(event, index)}
      @click=${(event: MouseEvent) => this.handleStarClick(event, index)}
    >
      <wc-icon class="empty-icon" name=${this.icon}></wc-icon>
      <span class="fill"
        ><wc-icon class="filled-icon" name=${`${this.icon}-fill`}></wc-icon
      ></span>
    </span>`;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    const labelId = `${this.idPrefix}-label`;
    const descriptionId = `${this.idPrefix}-description`;
    const errorText = this.error ? this.errorText : this.validationText;
    const description = errorText || this.helperText;
    const shown = this.hoverValue ?? this.shownValue;
    const name = this.label || this.i18n.t('ratingLabel');
    const stars = Array.from({ length: this.starCount }, (_, index) =>
      this.renderStar(index, shown),
    );

    const display = this.readonly
      ? html`<div
          class="stars"
          role="img"
          aria-label=${this.i18n.t('ratingReadonly')(
            this.format(this.shownValue),
            this.format(this.starCount),
          )}
          aria-describedby=${description ? descriptionId : nothing}
        >
          ${stars}
        </div>`
      : html`<div
          class="stars"
          role="slider"
          tabindex=${this.disabled ? '-1' : '0'}
          aria-label=${this.label ? nothing : name}
          aria-labelledby=${this.label ? labelId : nothing}
          aria-describedby=${description ? descriptionId : nothing}
          aria-valuemin="0"
          aria-valuemax=${this.starCount}
          aria-valuenow=${this.shownValue}
          aria-valuetext=${this.valueText(this.shownValue)}
          aria-invalid=${errorText || this.error ? 'true' : nothing}
          aria-disabled=${this.disabled ? 'true' : nothing}
          @keydown=${this.handleKeyDown}
          @pointerleave=${this.handlePointerLeave}
        >
          ${stars}
        </div>`;

    return html`
      <div
        class=${classMap({
          rating: true,
          disabled: this.disabled,
          readonly: this.readonly,
          previewing: this.hoverValue !== undefined,
          'has-error': this.error || !!errorText,
        })}
      >
        ${this.label
          ? html`<div class="label" id=${labelId}>
              ${this.label}${this.required && !this.readonly
                ? html`<span class="required" aria-hidden="true">*</span>`
                : nothing}
            </div>`
          : nothing}
        ${display}
        ${description
          ? html`<div class="helper" id=${descriptionId}>${description}</div>`
          : nothing}
      </div>
    `;
  }
}
