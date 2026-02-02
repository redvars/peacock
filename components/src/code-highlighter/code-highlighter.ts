import { html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import styles from './code-highlighter.scss';
import { observerSlotChangesWithCallback } from '../utils.js';

/**
 * @label Code Highlighter
 * @tag p-code-highlighter
 * @rawTag code-highlighter
 *
 * @summary The code highlighter component is used to display code snippets with syntax highlighting.
 * @overview
 * <p>The <strong>Code Highlighter</strong> component allows you to display code snippets with syntax highlighting for various programming languages. It supports features like line numbers, code formatting, and a copy-to-clipboard button.</p>
 *
 * @cssprop --divider-color - Controls the color of the divider.
 * @cssprop --divider-padding - Controls the padding of the divider.
 *
 * @example
 * ```html
 * <p-divider style="width: 12rem;">or</p-divider>
 * ```
 * @tags display
 */
export class CodeHighlighter extends LitElement {
  static styles = [styles];

  @property({ type: Boolean, reflect: true }) vertical = false;

  @state()
  slotHasContent = false;

  firstUpdated() {
    observerSlotChangesWithCallback(
      this.renderRoot.querySelector('slot'),
      hasContent => {
        this.slotHasContent = hasContent;
        this.requestUpdate();
      },
    );
  }

  render() {
    return html`<div
      class=${classMap({
        divider: true,
        vertical: this.vertical,
        'slot-has-content': this.slotHasContent,
      })}
    >
      <div class="line"></div>
      <div class="slot-container">
        <slot></slot>
      </div>
      <div class="line"></div>
    </div>`;
  }

  #handleSlotChange(event: { target: any }) {
    const slot = event.target;
    // Check assignedElements length
    this.slotHasContent = slot.assignedNodes({ flatten: true }).length > 0;
  }
}
