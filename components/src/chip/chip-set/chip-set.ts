import { html, LitElement } from 'lit';
import styles from './chip-set.scss';

/**
 * @label Chip Set
 * @tag wc-chip-set
 * @rawTag chip-set
 * @summary A layout container for wrapping chips.
 * @tags layout
 *
 * @example
 * ```html
 * <wc-chip-set>
 *   <wc-chip>One</wc-chip>
 *   <wc-chip>Two</wc-chip>
 * </wc-chip-set>
 * ```
 */
export class ChipSet extends LitElement {
  static styles = [styles];

  override render() {
    return html`<slot></slot>`;
  }
}