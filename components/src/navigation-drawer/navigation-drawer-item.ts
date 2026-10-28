import { html, LitElement, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import IndividualComponent from '@/IndividualComponent.js';
import styles from './navigation-drawer-item.scss';

/**
 * @label Navigation Drawer Item
 * @tag wc-navigation-drawer-item
 * @rawTag navigation-drawer-item
 *
 * @summary A destination in a navigation drawer.
 * @overview
 * <p>A full-width row with an optional icon, a label and an optional badge. The active item gets
 * the pill-shaped active indicator. With <code>href</code> it renders a link, otherwise a button.</p>
 *
 * @slot - The label.
 * @slot icon - Leading icon.
 * @slot badge - Trailing content, such as a count. Overrides the `badge` attribute.
 *
 * @example
 * ```html
 * <wc-navigation-drawer-item active badge="24">
 *   <wc-icon slot="icon" name="inbox"></wc-icon>
 *   Inbox
 * </wc-navigation-drawer-item>
 * ```
 * @tags navigation
 */
@IndividualComponent
export class NavigationDrawerItem extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** Whether this item is the current destination. */
  @property({ type: Boolean, reflect: true }) active = false;

  /** Whether this item is disabled. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /** If provided, the item renders as a link. */
  @property({ reflect: true }) href?: string;

  /** Link target. */
  @property() target: string = '_self';

  /** Identifies the item in the drawer's `change` event. */
  @property({ reflect: true }) value?: string;

  /** Short trailing text, such as an unread count. */
  @property() badge?: string;

  // ── State ────────────────────────────────────────────────────────────────

  /** True when the `icon` slot has content. */
  @state() private hasIcon = false;

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('.item') readonly itemElement!: HTMLElement | null;

  // ── Public methods ───────────────────────────────────────────────────────

  override focus() {
    this.itemElement?.focus();
  }

  override blur() {
    this.itemElement?.blur();
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private handleIconSlotChange(event: Event) {
    this.hasIcon =
      (event.target as HTMLSlotElement).assignedElements().length > 0;
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  private renderContent() {
    return html`
      <wc-focus-ring class="focus-ring" for="item"></wc-focus-ring>
      <wc-ripple class="ripple" for="item"></wc-ripple>
      <span class="icon"
        ><slot name="icon" @slotchange=${this.handleIconSlotChange}></slot
      ></span>
      <span class="label"><slot></slot></span>
      <span class="badge"
        ><slot name="badge">${this.badge ?? nothing}</slot></span
      >
    `;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    const classes = classMap({
      item: true,
      active: this.active,
      disabled: this.disabled,
      'has-icon': this.hasIcon,
    });

    if (this.href && !this.disabled) {
      return html`<a
        id="item"
        class=${classes}
        href=${this.href}
        target=${this.target}
        aria-current=${this.active ? 'page' : nothing}
        >${this.renderContent()}</a
      >`;
    }

    return html`<button
      id="item"
      class=${classes}
      ?disabled=${this.disabled}
      aria-current=${this.active ? 'page' : nothing}
    >
      ${this.renderContent()}
    </button>`;
  }
}
