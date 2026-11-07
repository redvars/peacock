import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './tab-panel.scss';
import IndividualComponent from '@/IndividualComponent.js';

/**
 * @label Tab Panel
 * @tag wc-tab-panel
 * @rawTag tab-panel
 *
 * @summary The content of one tab, shown while that tab is selected.
 * @overview
 * <p>The panel has <code>role="tabpanel"</code>;
 * inside a <code>wc-tab-group</code> it is labelled by its tab (<code>aria-labelledby</code>) and
 * shown while that tab is selected. It is focusable, so keyboard users reach the content right
 * after the tab list.</p>
 *
 * @example
 * ```html
 * <wc-tab-panel>Content for this tab</wc-tab-panel>
 * ```
 * @tags navigation
 */
@IndividualComponent
export class TabPanel extends LitElement {
  // ── Static

  static styles = [styles];

  // ── Properties

  /** Links the panel to the `wc-tab` with the same `value`. */
  @property({ reflect: true }) value?: string;

  /** Whether the panel is shown; set by `wc-tab-group` from the selected tab. */
  @property({ type: Boolean, reflect: true }) active = false;

  // ── Lifecycle

  override connectedCallback() {
    super.connectedCallback();
    if (!this.hasAttribute('role')) this.setAttribute('role', 'tabpanel');
    if (!this.hasAttribute('tabindex')) this.tabIndex = 0;
  }

  // ── Render

  render() {
    return html`<slot></slot>`;
  }
}
