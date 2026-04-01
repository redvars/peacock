import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import IndividualComponent from 'src/IndividualComponent.js';
import styles from './button-group.scss';
import { Button } from '../button/button.js';
import { IconButton } from '../icon-button/icon-button.js';
import { BaseButton } from '../BaseButton.js';

/**
 * @label Button Group
 * @tag wc-button-group
 * @rawTag button-group
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
@IndividualComponent
export class ButtonGroup extends LitElement {
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
  @property() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'sm';

  /**
   * Layout variant of the button group.
   * `"standard"` shows buttons with a small gap between them.
   * `"connected"` joins buttons together without a gap, sharing edges.
   * Defaults to `"standard"`.
   */
  @property({ reflect: true }) variant: 'standard' | 'connected' = 'standard';

  /**
   * Color applied to all buttons in the group.
   * Possible values are `"primary"`, `"success"`, `"danger"`, `"warning"`, `"light"`, `"dark"`.
   */
  @property({ reflect: true }) color?: 'primary' | 'success' | 'danger' | 'warning' | 'light' | 'dark';

  /**
   * Visual style applied to all buttons in the group.
   * Possible values are `"filled"`, `"tonal"`, `"outlined"`.
   */
  @property({ attribute: 'button-variant', reflect: true }) buttonVariant?: 'filled' | 'tonal' | 'outlined';

  override updated() {
    this._syncChildren();
  }

  private _getSlottedElements(): HTMLElement[] {
    const slot = this.shadowRoot?.querySelector('slot');
    return (slot?.assignedElements({ flatten: true }) ?? []) as HTMLElement[];
  }

  private _syncChildren() {
    const children = this._getSlottedElements();
    children.forEach((child, index) => {
      const isFirst = index === 0;
      const isLast = index === children.length - 1;
      const isOnly = children.length === 1;

      if (this.color && 'color' in child) {
        (child as BaseButton).color = this.color;
      }

      if (this.buttonVariant && 'variant' in child) {
        (child as BaseButton).variant = this.buttonVariant;
      }

      if (this.variant === 'connected') {
        child.style.setProperty('--button-container-shape-variant', 'initial');
        if (isOnly) {
          child.style.setProperty('--button-container-shape', 'var(--shape-corner-full)');
          child.style.removeProperty('--button-container-shape-start-start');
          child.style.removeProperty('--button-container-shape-end-start');
          child.style.removeProperty('--button-container-shape-start-end');
          child.style.removeProperty('--button-container-shape-end-end');
        } else if (isFirst) {
          child.style.removeProperty('--button-container-shape');
          child.style.setProperty('--button-container-shape-start-start', 'var(--shape-corner-full)');
          child.style.setProperty('--button-container-shape-end-start', 'var(--shape-corner-full)');
          child.style.setProperty('--button-container-shape-start-end', '0');
          child.style.setProperty('--button-container-shape-end-end', '0');
        } else if (isLast) {
          child.style.removeProperty('--button-container-shape');
          child.style.setProperty('--button-container-shape-start-start', '0');
          child.style.setProperty('--button-container-shape-end-start', '0');
          child.style.setProperty('--button-container-shape-start-end', 'var(--shape-corner-full)');
          child.style.setProperty('--button-container-shape-end-end', 'var(--shape-corner-full)');
        } else {
          child.style.setProperty('--button-container-shape', '0');
          child.style.removeProperty('--button-container-shape-start-start');
          child.style.removeProperty('--button-container-shape-end-start');
          child.style.removeProperty('--button-container-shape-start-end');
          child.style.removeProperty('--button-container-shape-end-end');
        }
      } else {
        child.style.removeProperty('--button-container-shape');
        child.style.removeProperty('--button-container-shape-start-start');
        child.style.removeProperty('--button-container-shape-end-start');
        child.style.removeProperty('--button-container-shape-start-end');
        child.style.removeProperty('--button-container-shape-end-end');
        child.style.removeProperty('--button-container-shape-variant');
      }
    });
  }

  render() {
    const cssClasses = {
      'button-group': true,
      [`size-${this.size}`]: true,
      [`variant-${this.variant}`]: true,
    };
    return html`
      <div class=${classMap(cssClasses)}>
        <slot @slotchange=${() => this._syncChildren()}></slot>
      </div>
    `;
  }
}
