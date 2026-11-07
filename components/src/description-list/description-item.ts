import { html, LitElement, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';

import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import IndividualComponent from '@/IndividualComponent.js';

import styles from './description-item.scss';

/**
 * @label Description Item
 * @tag wc-description-item
 * @rawTag description-item
 *
 * @summary One label and its value in a description list.
 * @overview
 * <p>Description item is one entry of a <code>wc-description-list</code>: a <code>label</code>
 * ("Status") and its value in the default slot ("Active"). It renders a real
 * <code>&lt;dl&gt;</code> with one <code>&lt;dt&gt;</code> and one <code>&lt;dd&gt;</code>, so a
 * screen reader reads the label as the term and the slotted content as its definition.</p>
 * <p>An item without a value shows a dash, read as "Not set". The <code>actions</code> slot holds
 * small controls for the value, such as a copy or edit button. <code>span</code> makes the item
 * take a whole row of a multi-column list.</p>
 *
 * @slot - The value.
 * @slot actions - Controls for the value, such as a copy or edit icon button.
 *
 * @example
 * ```html
 * <wc-description-item label="Owner">Ana Lima</wc-description-item>
 * ```
 * @tags display
 */
@IndividualComponent
export class DescriptionItem extends LitElement {
  // ── Static

  static styles = [styles];

  // ── Properties

  /** The term, for example "Status". */
  @property({ type: String }) label = '';

  /** Takes a whole row of a multi-column list, for long values such as a description. */
  @property({ type: Boolean, reflect: true }) span = false;

  // ── State

  /** Whether the default slot holds an element or text that is not only white space. */
  @state() private hasValue = false;

  /** Whether the actions slot holds anything. */
  @state() private hasActions = false;

  // ── Private fields

  private readonly i18n = new I18nController(this);

  // ── Private methods

  private handleValueSlotChange(event: Event) {
    const slot = event.target as HTMLSlotElement;
    this.hasValue = slot
      .assignedNodes({ flatten: true })
      .some(
        node =>
          node.nodeType === Node.ELEMENT_NODE ||
          (node.nodeType === Node.TEXT_NODE && !!node.textContent?.trim()),
      );
  }

  private handleActionsSlotChange(event: Event) {
    const slot = event.target as HTMLSlotElement;
    this.hasActions = slot.assignedElements({ flatten: true }).length > 0;
  }

  // ── Render

  render() {
    // One `<dl>` per item: a `<dl>` cannot wrap slotted children across the shadow boundary, and
    // a term with its definition in the same tree is what screen readers pair up.
    return html`
      <dl class="item">
        <dt class="label">${this.label}</dt>
        <dd class="value">
          <span class="content">
            <slot @slotchange=${this.handleValueSlotChange}></slot>
            ${this.hasValue
              ? nothing
              : html`<span class="empty" aria-hidden="true">—</span
                  ><span class="screen-reader-only"
                    >${this.i18n.t('notSet')}</span
                  >`}
          </span>
          <span class="actions" ?hidden=${!this.hasActions}>
            <slot
              name="actions"
              @slotchange=${this.handleActionsSlotChange}
            ></slot>
          </span>
        </dd>
      </dl>
    `;
  }
}
