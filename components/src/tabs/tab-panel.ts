import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './tab-panel.scss';

/**
 * @label Tab Panel
 * @tag wc-tab-panel
 * @rawTag tab-panel
 * @parentRawTag tab-group
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

  render() {
    return html`<slot></slot>`;
  }
}
