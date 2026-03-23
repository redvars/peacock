import { LitElement, html, css } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';

/**
 * @label Menu
 * @tag wc-base-menu
 * @rawTag base-menu
 * @summary A dropdown menu component.
 * @tags navigation
 *
 * @example
 * ```html
 * <wc-base-menu>
 *   <wc-menu-list>
 *     <wc-menu-item>Item 1</wc-menu-item>
 *   </wc-menu-list>
 * </wc-base-menu>
 * ```
 */
export class Menu extends LitElement {
  @property({ type: Boolean, reflect: true }) open = false;

  // Position: 'bottom-start' | 'bottom-end' | etc. (Simplified here to generic dropdown)
  @property({ type: String }) align = 'start';

  @query('.menu-wrapper') menuWrapper!: HTMLElement;

  private _boundClickOutside: (e: MouseEvent) => void;

  constructor() {
    super();
    this._boundClickOutside = this._handleClickOutside.bind(this);
  }

  connectedCallback() {
    // eslint-disable-next-line wc/guard-super-call
    super.connectedCallback();
    window.addEventListener('click', this._boundClickOutside);
    // Listen for menu-item clicks bubbling up
    this.addEventListener('click', this._handleItemClick);
  }

  disconnectedCallback() {
    // eslint-disable-next-line wc/guard-super-call
    super.disconnectedCallback();
    window.removeEventListener('click', this._boundClickOutside);
    this.removeEventListener('click', this._handleItemClick);
  }

  private _handleClickOutside(e: MouseEvent) {
    if (!this.open) return;

    const path = e.composedPath();
    if (!path.includes(this)) {
      this.open = false;
    }
  }

  private _handleItemClick(e: Event) {
    const target = e.target as HTMLElement;
    // Check if the clicked element is a menu-item
    if (target.tagName.toLowerCase() === 'menu-item') {
      // Dispatch custom event with value
      const value = (target as any).value;
      this.dispatchEvent(
        new CustomEvent('menu-selected', {
          detail: { value },
          bubbles: true,
          composed: true,
        }),
      );

      this.open = false;
    }
  }

  private _toggleMenu(e: Event) {
    e.stopPropagation(); // Prevent immediate closing via window listener
    this.open = !this.open;
  }

  static styles = css`
    :host {
      display: inline-block;
      position: relative;
    }

    .trigger {
      cursor: pointer;
      display: inline-block;
    }

    .menu-wrapper {
      position: absolute;
      top: 100%;
      z-index: 10;
      opacity: 0;
      transform: scale(0.95);
      transform-origin: top left;
      transition:
        opacity 0.1s ease-out,
        transform 0.1s ease-out;
      pointer-events: none; /* Prevent clicking when hidden */
      margin-top: 4px; /* Slight gap */
    }

    :host([open]) .menu-wrapper {
      opacity: 1;
      transform: scale(1);
      pointer-events: auto;
    }

    /* Alignment logic */
    :host([align='end']) .menu-wrapper {
      right: 0;
      transform-origin: top right;
    }
    :host([align='start']) .menu-wrapper {
      left: 0;
      transform-origin: top left;
    }
  `;

  render() {
    return html`
      <div class="trigger" @click="${this._toggleMenu}">
        <slot name="trigger"></slot>
      </div>

      <div class="menu-wrapper">
        <!-- We expect a menu-list to be passed here -->
        <slot></slot>
      </div>
    `;
  }
}
