import { html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styles } from './badge.css.js';

export class Badge extends LitElement {
  static styles = [styles];

  @property({ type: String, reflect: true }) name: string = '';

  @property({ type: String, reflect: true }) src?: string;

  @state()
  slotHasContent = false;

  render() {
    return html`<div
      class=${classMap({ badge: true, 'has-content': this.slotHasContent })}
    >
      <slot @slotchange=${this.#handleSlotChange}></slot>
    </div>`;
  }

  #handleSlotChange(event: { target: any }) {
    const slot = event.target;
    // Check assignedElements length
    this.slotHasContent = slot.assignedElements().length > 0;
  }
}
