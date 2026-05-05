import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './tab-panel.scss';
import IndividualComponent from '@/IndividualComponent.js';

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
@IndividualComponent
export class TabPanel extends LitElement {
  static styles = [styles];

  @property({ reflect: true }) value?: string;

  @property({ type: Boolean, reflect: true }) active = false;

  render() {
    return html`<slot></slot>`;
  }
}
