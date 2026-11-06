import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import styles from './badge.scss';
import IndividualComponent from '@/IndividualComponent.js';

/**
 * @label Badge
 * @tag wc-badge
 * @rawTag badge
 * @summary The badge component is used to display a small amount of information to the user.
 * @overview
 * <p>A badge shows a count, or with <code>dot</code> (or no <code>value</code>) a small dot. A
 * number above <code>max</code> (default 99) shows as <code>99+</code>.</p>
 * <p>A dot alone means nothing to a screen reader, so it is hidden from assistive technology
 * unless it has a <code>label</code>. Give a count a <code>label</code> such as "3 unread
 * messages" when the number alone is not enough. When the badge sits on an icon button, put the
 * full meaning in the button's <code>aria-label</code> instead (for example "Inbox, 3 unread") and
 * leave the badge without a label.</p>
 * <p><code>intent</code> (<code>info</code>, <code>success</code>, <code>warning</code>,
 * <code>danger</code>) sets its color; without it the badge uses the theme's badge color.</p>
 *
 * @cssprop --badge-color - Controls the color of the badge.
 * @cssprop --badge-text-color - Controls the color of the count.
 *
 * @example
 * ```html
 * <wc-badge value="1"></wc-badge>
 * <wc-badge value="120" label="120 unread messages"></wc-badge>
 * <wc-badge dot intent="success"></wc-badge>
 * ```
 * @tags display
 */
@IndividualComponent
export class Badge extends LitElement {
  static styles = [styles];

  /**
   * The value to display in the badge.
   */
  @property({ type: String }) value: string = '';

  /** The largest number shown; a larger numeric `value` shows as `max+`. Defaults to `99`. */
  @property({ type: Number }) max = 99;

  /** Shows a small dot without the value. */
  @property({ type: Boolean, reflect: true }) dot = false;

  /** The accessible name, read instead of the visible value (for example "3 unread messages"). */
  @property({ type: String }) label?: string;

  /** What the badge means: `info`, `success`, `warning` or `danger`. */
  @property({ type: String, reflect: true }) intent?:
    | 'info'
    | 'success'
    | 'warning'
    | 'danger';

  /** The text the badge shows: the value, capped at `max+` when it is a number. */
  get displayValue(): string {
    if (this.dot || !this.value) return '';
    const trimmed = this.value.trim();
    const count = Number(trimmed);
    if (
      trimmed !== '' &&
      Number.isFinite(count) &&
      Number.isFinite(this.max) &&
      count > this.max
    ) {
      return `${this.max}+`;
    }
    return this.value;
  }

  render() {
    const shown = this.displayValue;
    const decorative = !shown && !this.label;
    return html`<div
      class=${classMap({
        badge: true,
        'has-value': !!shown,
      })}
      role=${this.label ? 'img' : nothing}
      aria-label=${this.label || nothing}
      aria-hidden=${decorative ? 'true' : nothing}
    >
      ${shown}
    </div>`;
  }
}
