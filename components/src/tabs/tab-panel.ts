import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './tab-panel.scss';

/**
 * @label Tab Panel
 * @tag wc-tab-panel
 * @rawTag tab-panel
 *
 * @summary Content panel for tabs.
 * @overview
 * <p>TabPanel contains the content associated with a tab.</p>
 *
 * @example
 * ```html
 * <wc-tab-panel>Content for this tab</wc-tab-panel>
 * ```
 * @tags navigation
 */
export class TabPanel extends LitElement {
  static styles = [styles];

  @property({ reflect: true }) value?: string;

  // Set the role when the component is created
  connectedCallback() {
    super.connectedCallback();
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'tabpanel');
    }
    
    // Accessibility tip: panels should usually be focusable if they contain content
    if (!this.hasAttribute('tabindex')) {
      this.setAttribute('tabindex', '0');
    }
  }

  render() {
    return html`<slot></slot>`;
  }
}
