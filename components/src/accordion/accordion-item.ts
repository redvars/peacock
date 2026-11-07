import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import styles from './accordion-item.scss';
import IndividualComponent from '@/IndividualComponent.js';

/** What changed an accordion item's `open` state. */
export type AccordionItemReason = 'action' | 'api';

/**
 * @label Accordion Item
 * @tag wc-accordion-item
 * @rawTag accordion-item
 * @summary An expansion panel with a header that reveals or hides associated content.
 *
 * @overview
 * <p>Use it on its own, or several inside a <code>wc-accordion</code>, which moves focus between
 * their headers and can keep a single panel open.</p>
 * <p>The header is a button with <code>aria-expanded</code> that controls the content, a region
 * labelled by the header. Clicking it, or pressing Enter or Space on it, toggles
 * <code>open</code>. The <code>heading</code> slot holds the title and <code>description</code> an
 * optional subtitle. Buttons in the <code>header-actions</code> slot sit next to the header
 * button, not inside it, so they stay reachable by keyboard.</p>
 * <p><code>open</code> fires after the panel expands and <code>close</code> after it collapses, with
 * <code>reason: 'action'</code> when the person used the header and <code>'api'</code> when
 * <code>open</code> was set, including by <code>show()</code>, <code>hide()</code> and
 * <code>toggle()</code>. Neither fires for a panel that starts open. <code>disabled</code> stops
 * the header responding, and <code>hide-toggle</code> hides the arrow icon.</p>
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
 * @fires {CustomEvent<{ reason: 'action' | 'api' }>} open - Fired after the panel expands: `reason` is `'action'` when the person used the header, `'api'` when `open` was set (including by a single-panel `wc-accordion` closing the others).
 * @fires {CustomEvent<{ reason: 'action' | 'api' }>} close - Fired after the panel collapses, with the same `reason`.
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
  // ── Static

  static styles = [styles];

  // ── Properties

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

  // ── State

  /** True when the `description` slot contains at least one non-empty node. */
  @state()
  private _hasDescriptionSlot = false;

  // ── Queries

  /** The header button; `wc-accordion` moves focus between these. */
  @query('.header-button')
  readonly headerButton!: HTMLButtonElement | null;

  // ── Private fields

  #id = crypto.randomUUID();

  /** Why `open` is changing: set to `'action'` by the header button, `'api'` otherwise. */
  #reason: AccordionItemReason = 'api';

  // ── Lifecycle

  protected override updated(changed: PropertyValues<this>) {
    super.updated(changed);
    // Not on the first render: an item that starts open has not opened.
    if (changed.has('open') && changed.get('open') !== undefined) {
      const detail = { reason: this.#reason };
      this.#reason = 'api';
      this.dispatchEvent(
        new CustomEvent(this.open ? 'open' : 'close', {
          bubbles: true,
          composed: true,
          detail,
        }),
      );
    }
  }

  // ── Public

  override focus(options?: Parameters<HTMLElement['focus']>[0]) {
    this.headerButton?.focus(options);
  }

  override blur() {
    this.headerButton?.blur();
  }

  /** Expands the panel. */
  show() {
    this.open = true;
  }

  /** Collapses the panel. */
  hide() {
    this.open = false;
  }

  /** Expands the panel when collapsed, and collapses it when expanded. */
  toggle() {
    this.open = !this.open;
  }

  // ── Private

  private _handleToggle() {
    if (this.disabled) return;
    this.#reason = 'action';
    this.open = !this.open;
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
        <!-- The header actions sit next to the button, not inside it: interactive content inside a
             button is invalid and unreachable by keyboard. The button's state layer still covers
             the whole header, so a click anywhere but an action toggles the panel. -->
        <div part="header" class="header">
          <button
            id=${`panel-header-${this.#id}`}
            class="header-button"
            aria-controls=${`panel-content-${this.#id}`}
            aria-disabled=${this.disabled}
            aria-expanded=${this.open}
            ?disabled=${this.disabled}
            @click=${this._handleToggle}
          >
            <span class="header-label">
              <span part="title" class="panel-title">
                <slot name="heading"></slot>
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
          </button>
          <div class="header-actions">
            <slot name="header-actions"></slot>
          </div>
          ${this._renderToggleIcon()}
        </div>
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
