import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import IndividualComponent from '@/IndividualComponent.js';
import styles from './button-group.scss';
import { Button, ButtonColor } from '../button/button.js';
import { IconButton } from '../icon-button/icon-button.js';

/**
 * @label Button Group
 * @tag wc-button-group
 * @rawTag button-group
 *
 * @summary Group a series of buttons together on a single line with the button group, and super-power.

 * @example
 * ```html
 * <wc-button-group connected="true">
 *  <wc-icon-button toggle="true" shaped="wide">
 *    <wc-icon name="format_bold"></wc-icon>
 *  </wc-icon-button>
 *  <wc-icon-button toggle="true" shaped="wide">
 *    <wc-icon name="format_italic"></wc-icon>
 *  </wc-icon-button>
 *  <wc-icon-button toggle="true" shaped="wide">
 *    <wc-icon name="format_underlined"></wc-icon>
 *  </wc-icon-button>
 * </wc-button-group>
 * ```
 *
 * @tags controls
 */
@IndividualComponent
class ButtonGroup extends LitElement {
  // Lit prefers CSS-in-JS for better performance and scoping.
  // If you prefer keeping the SCSS file, you'll need a build tool (like Vite or Webpack)
  // that can import .scss files as lit-css.
  static styles = [styles];

  static Button = Button;

  static IconButton = IconButton;

  /**
   * Button size.
   * Possible values are `"sm"`, `"md"`, `"lg"`. Defaults to `"md"`.
   */
  @property({ reflect: true }) size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'sm';

  /**
   * Layout variant of the button group.
   * `"standard"` shows buttons with a small gap between them.
   * `"connected"` places buttons with a 2px gap;
   * rounded outer corners and middle buttons keep standard rounded corners.
   * Defaults to `"standard"`.
   */
  @property({ type: Boolean, reflect: true }) connected = false;

  /**
   * Color applied to all buttons in the group.
   * Possible values are `"primary"`, `"success"`, `"danger"`, `"warning"`, `"surface"`, `"on-surface"`.
   */
  @property({ reflect: true }) color?: ButtonColor;

  /**
   * Visual style applied to all buttons in the group.
   * Possible values are `"filled"`, `"tonal"`, `"outlined"`.
   */
  @property({ attribute: 'variant', reflect: true }) variant?:
    | 'filled'
    | 'tonal'
    | 'outlined';

  override updated() {
    this._syncButtonProperties();
  }

  private _getSlottedElements(): HTMLElement[] {
    const slot = this.shadowRoot?.querySelector('slot');
    return (slot?.assignedElements({ flatten: true }) ?? []) as HTMLElement[];
  }

  private _syncButtonProperties() {
    const children = this._getSlottedElements();
    children.forEach((child, index) => {
      ['color', 'variant', 'toggle', 'size'].forEach(prop => {
        // @ts-ignore
        if (this[prop] && prop in child) {
          // @ts-ignore
          (child as any)[prop] = this[prop];
        }
      });
    });
  }

  render() {
    return html`
      <slot @slotchange=${() => this._syncButtonProperties()}></slot>
    `;
  }
}

export default ButtonGroup;
