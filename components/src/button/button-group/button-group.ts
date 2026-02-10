import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import styles from './button-group.scss';

/**
 * @label Button Group
 * @tag p-button-group
 * @rawTag button-group
 *
 * @summary Group a series of buttons together on a single line with the button group, and super-power.

 * @example
 * ```html
 * <p-button-group>
 *  <p-button><p-icon name="home" slot="icon"></p-icon></p-button>
 *  <p-button><p-icon name="close" slot="icon"></p-icon></p-button>
 * </p-button-group>
 * ```
 *
 * @tags controls
 */
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
