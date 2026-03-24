import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import PeacockComponent from 'src/PeacockComponent.js';
import styles from './button-group.scss';

/**
 * @label Button Group
 * @tag button-group
 * @rawTag wc-button-group
 *
 * @summary Group a series of buttons together on a single line with the button group, and super-power.

 * @example
 * ```html
 * <wc-button-group>
 *  <wc-icon-button name="home"></wc-icon-button>
 *  <wc-icon-button name="alarm"></wc-icon-button>
 * </wc-button-group>
 * ```
 *
 * @tags controls
 */
@PeacockComponent
export class ButtonGroup extends LitElement {
  // Lit prefers CSS-in-JS for better performance and scoping.
  // If you prefer keeping the SCSS file, you'll need a build tool (like Vite or Webpack)
  // that can import .scss files as lit-css.
  static styles = [styles];

  /**
   * Button size.
   * Possible values are `"sm"`, `"md"`, `"lg"`. Defaults to `"md"`.
   */
  @property() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'sm';

  render() {
    const cssClasses = {
      'button-group': true,
      [`size-${this.size}`]: true,
    };
    return html`
      <div class=${classMap(cssClasses)}>
        <slot></slot>
      </div>
    `;
  }
}
