import { html, LitElement, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import styles from './accordion-item.scss';
import IndividualComponent from '@/IndividualComponent.js';

/**
 * @label Accordion Item
 * @tag wc-accordion-item
 * @rawTag accordion-item
 * @summary An expansion panel with a header that reveals or hides associated content.
 *
 * @slot - The body content revealed when the panel is expanded.
 * @slot heading - The panel title. Renders as `body-large` text.
 * @slot description - Optional subtitle rendered below the title. Renders as `body-small` text.
 * @slot header-actions - Actions (e.g. icon buttons) placed at the trailing end of the header, before the toggle icon.
 *
 * @part header - The header `<button>` element.
 * @part title - The title text container.
 * @part description - The description text container.
 * @part content - The expandable content region wrapper.
 *
 * @fires {CustomEvent<{ open: boolean }>} accordion-item-toggle - Fired when the panel is expanded or collapsed.
 *
 * @example
 * ```html
 * <wc-accordion-item>
 *   <span slot="heading">Personal information</span>
 *   <span slot="description">Fill in your details</span>
 *   <p>Content goes here.</p>
 * </wc-accordion-item>
 * ```
 * @tags display
 */
@IndividualComponent
export class AccordionItem extends LitElement {
  static styles = [styles];

  #id = crypto.randomUUID();

  /**
   * Whether the user cannot interact with the panel.
   */
  @property({ type: Boolean, reflect: true })
  disabled: boolean = false;

  /**
   * Whether the panel is expanded.
   */
  @property({ type: Boolean, reflect: true })
  open: boolean = false;

  /**
   * Whether to hide the expand/collapse toggle indicator icon.
   */
  @property({ type: Boolean, reflect: true, attribute: 'hide-toggle' })
  hideToggle: boolean = false;

  /** True when the `description` slot contains at least one non-empty node. */
  @state()
  private _hasDescriptionSlot = false;

  /** True when the `heading` slot contains at least one non-empty node. */
  @state()
  private _hasHeadingSlot = false;

  @query('.header-button')
  private readonly buttonElement!: HTMLElement | null;

  override focus() {
    this.buttonElement?.focus();
  }

  override blur() {
    this.buttonElement?.blur();
  }

  private _handleToggle() {
    if (this.disabled) return;
    this.open = !this.open;
    this.dispatchEvent(
      new CustomEvent('accordion-item-toggle', {
        bubbles: true,
        composed: true,
        detail: { open: this.open },
      }),
    );
  }

  private static _onSlotChange(e: Event, setter: (v: boolean) => void) {
    const slot = e.target as HTMLSlotElement;
    const nodes = slot.assignedNodes({ flatten: true });
    setter(
      nodes.some(n =>
        n.nodeType === Node.TEXT_NODE
          ? (n.textContent?.trim() ?? '') !== ''
          : true,
      ),
    );
  }

  private _renderToggleIcon() {
    if (this.hideToggle) return nothing;
    return html`<wc-icon
      class="toggle-icon"
      name="keyboard_arrow_down"
      aria-hidden="true"
    ></wc-icon>`;
  }

  render() {
    return html`
      <div
        class=${classMap({
          'expansion-panel': true,
          open: this.open,
          disabled: this.disabled,
        })}
      >
        <button
          id=${`panel-header-${this.#id}`}
          part="header"
          class="header-button"
          tabindex=${this.disabled ? '-1' : '0'}
          aria-controls=${`panel-content-${this.#id}`}
          aria-disabled=${this.disabled}
          aria-expanded=${this.open}
          ?disabled=${this.disabled}
          @click=${this._handleToggle}
        >
          ${this._renderToggleIcon()}
          <div class="header-content">
            <span class="header-label">
              <span part="title" class="panel-title">
                <slot
                  name="heading"
                  @slotchange=${(e: Event) =>
                    AccordionItem._onSlotChange(e, v => {
                      this._hasHeadingSlot = v;
                    })}
                ></slot>
              </span>
              <span
                part="description"
                class="panel-description"
                ?hidden=${!this._hasDescriptionSlot}
              >
                <slot
                  name="description"
                  @slotchange=${(e: Event) =>
                    AccordionItem._onSlotChange(e, v => {
                      this._hasDescriptionSlot = v;
                    })}
                ></slot>
              </span>
            </span>
            <slot name="header-actions" class="header-actions"></slot>
          </div>
        </button>
        <div
          id=${`panel-content-${this.#id}`}
          part="content"
          class="panel-content"
          role="region"
          aria-labelledby=${`panel-header-${this.#id}`}
        >
          <div class="content-inner">
            <slot></slot>
          </div>
        </div>
      </div>
    `;
  }
}
