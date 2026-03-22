import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './tab-panel.scss';

export class TabPanel extends LitElement {
  static styles = [styles];

  @property({ reflect: true }) value?: string;

  render() {
    return html`<slot></slot>`;
  }
}
