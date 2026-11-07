import { html, LitElement, PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import IndividualComponent from '@/IndividualComponent.js';
import type { NavigationDrawerItem } from './navigation-drawer-item.js';
import styles from './navigation-drawer-group.scss';

/**
 * @label Navigation Drawer Group
 * @tag wc-navigation-drawer-group
 * @rawTag navigation-drawer-group
 *
 * @summary An expandable section of a navigation drawer.
 * @overview
 * <p>Groups <code>wc-navigation-drawer-item</code> destinations under a header that shows and hides
 * them, following the disclosure navigation pattern: the header is a button with
 * <code>aria-expanded</code> and <code>aria-controls</code>, and the items stay in the Tab order
 * while the group is expanded.</p>
 * <p>A group that holds the <code>current</code> item expands when it first renders. Groups can
 * nest.</p>
 *
 * @slot - The group's items, and nested groups.
 * @slot label - The header's label.
 * @slot icon - The header's leading icon.
 *
 * @fires {CustomEvent} open - Dispatched on the group when the user expands it. Does not bubble, so it is not mistaken for the drawer's own `open`.
 * @fires {CustomEvent<{reason: 'action'}>} close - Dispatched on the group when the user collapses it. Does not bubble.
 *
 * @example
 * ```html
 * <wc-navigation-drawer-group expanded>
 *   <wc-icon slot="icon" name="bar_chart"></wc-icon>
 *   <span slot="label">Analytics</span>
 *   <wc-navigation-drawer-item href="/overview" current>Overview</wc-navigation-drawer-item>
 *   <wc-navigation-drawer-item href="/reports">Reports</wc-navigation-drawer-item>
 * </wc-navigation-drawer-group>
 * ```
 * @tags navigation
 */
@IndividualComponent
export class NavigationDrawerGroup extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static override shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** Whether the group's items are shown. */
  @property({ type: Boolean, reflect: true }) expanded = false;

  /** Whether the header is disabled. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  // ── State ────────────────────────────────────────────────────────────────

  /** True when the `icon` slot has content. */
  @state() private hasIcon = false;

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('#header') readonly headerElement!: HTMLButtonElement | null;

  // ── Private fields ───────────────────────────────────────────────────────

  /** Whether the group has looked for a current item to expand towards. */
  private checkedForCurrent = false;

  // ── Lifecycle ────────────────────────────────────────────────────────────

  protected override willUpdate(changed: PropertyValues<this>) {
    super.willUpdate(changed);
    // Before the first render, so the group renders expanded straight away.
    if (!this.hasUpdated) this.expandTowardsCurrent();
  }

  // ── Public methods ───────────────────────────────────────────────────────

  override focus() {
    this.headerElement?.focus();
  }

  override blur() {
    this.headerElement?.blur();
  }

  /** Expands or collapses the group. */
  toggle(force?: boolean) {
    this.expanded = force ?? !this.expanded;
  }

  // ── Private methods ──────────────────────────────────────────────────────

  /** Expands once if the group holds the current item, so the current page is visible. */
  private expandTowardsCurrent() {
    if (this.checkedForCurrent) return;
    // Read the property too: `current` reflects only after the item's first update.
    const items = this.querySelectorAll<NavigationDrawerItem>(
      'wc-navigation-drawer-item',
    );
    if (
      Array.from(items).some(
        item => item.current || item.hasAttribute('current'),
      )
    ) {
      this.checkedForCurrent = true;
      this.expanded = true;
    }
  }

  private handleHeaderClick() {
    if (this.disabled) return;
    this.expanded = !this.expanded;
    this.dispatchEvent(
      new CustomEvent(this.expanded ? 'open' : 'close', {
        detail: this.expanded ? undefined : { reason: 'action' },
      }),
    );
  }

  private handleIconSlotChange(event: Event) {
    this.hasIcon =
      (event.target as HTMLSlotElement).assignedElements().length > 0;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    const classes = classMap({
      header: true,
      expanded: this.expanded,
      disabled: this.disabled,
      'has-icon': this.hasIcon,
    });

    return html`
      <button
        id="header"
        class=${classes}
        part="header"
        ?disabled=${this.disabled}
        aria-expanded=${this.expanded ? 'true' : 'false'}
        aria-controls="items"
        @click=${this.handleHeaderClick}
      >
        <wc-focus-ring class="focus-ring" for="header"></wc-focus-ring>
        <wc-ripple class="ripple" for="header"></wc-ripple>
        <span class="icon"
          ><slot name="icon" @slotchange=${this.handleIconSlotChange}></slot
        ></span>
        <span class="label"><slot name="label"></slot></span>
        <wc-icon
          class="expand-icon"
          name="keyboard_arrow_down"
          aria-hidden="true"
        ></wc-icon>
      </button>
      <div
        id="items"
        class="items"
        role="group"
        aria-labelledby="header"
        ?hidden=${!this.expanded}
      >
        <slot @slotchange=${this.expandTowardsCurrent}></slot>
      </div>
    `;
  }
}
