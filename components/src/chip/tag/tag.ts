import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import IndividualComponent from '@/IndividualComponent.js';
import styles from './tag.scss';
import colorStyles from './tag-colors.scss';
import sizeStyles from './tag-sizes.scss';

/** What a tag means; it picks the matching color role. */
export type TagIntent = 'info' | 'success' | 'warning' | 'danger';

/** Decorative hues for tags that carry no meaning, such as categories. */
export type TagAccent =
  | 'blue'
  | 'green'
  | 'red'
  | 'yellow'
  | 'orange'
  | 'purple';

/**
 * @label Tag
 * @tag wc-tag
 * @rawTag tag
 * @summary A read-only label for a status or a value.
 * @overview
 * <p>A tag shows a status or a value; it has no action of its own. Use <code>intent</code>
 * (<code>info</code>, <code>success</code>, <code>warning</code>, <code>danger</code>) when the
 * tag means something, and <code>accent</code> for a decorative hue (categories, labels). For a
 * removable or selectable item use <code>wc-chip</code>.</p>
 *
 * @example
 * ```html
 * <wc-tag intent="danger">Failed</wc-tag>
 * <wc-tag accent="purple">Design</wc-tag>
 * ```
 */
@IndividualComponent
export class Tag extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles, colorStyles, sizeStyles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** Visual style. */
  @property({ reflect: true }) variant:
    | 'elevated'
    | 'filled'
    | 'tonal'
    | 'outlined' = 'tonal';

  /** What the tag means: `info`, `success`, `warning` or `danger`. Takes precedence over `accent`. */
  @property({ type: String, reflect: true }) intent?: TagIntent;

  /** A decorative hue for tags without meaning: `blue`, `green`, `red`, `yellow`, `orange`, `purple`. */
  @property({ type: String, reflect: true }) accent?: TagAccent;

  /** Tag size. Possible values are `"sm"`, `"md"`, `"lg"`. Defaults to `"md"`. */
  @property({ reflect: true }) size?: 'sm' | 'md' | 'lg' = 'md';

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    const { intent } = this;
    const accent = intent ? undefined : this.accent;
    const classes = {
      tag: true,
      [`intent-${intent}`]: !!intent,
      [`accent-${accent}`]: !!accent,
      [`variant-${this.variant}`]: true,
      [`size-${this.size}`]: true,
    };

    return html`
      <div class="${classMap(classes)}">
        <wc-elevation class="elevation"></wc-elevation>
        <div class="background"></div>
        <div class="outline"></div>

        <div class="tag-content">
          <slot name="icon"></slot>

          <div class="slot-content">
            <slot></slot>
          </div>
        </div>
      </div>
    `;
  }
}
