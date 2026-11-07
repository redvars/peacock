import { html } from 'lit';
import { state } from 'lit/decorators.js';
import { ClassInfo } from 'lit/directives/class-map.js';
import { observerSlotChangesWithCallback } from './utils/observe-slot-change.js';
import { NavigationItemBase } from './navigation-item-base.js';
import styles from '../navigation-rail/navigation-rail-item.scss';

/**
 * Shared layout of `wc-navigation-rail-item` and `wc-navigation-bar-item`: the icon inside the
 * active-indicator pill with the label below it, the `active-icon` slot and a badge on the icon.
 *
 * Not a component on its own: it is not registered and carries no `@IndividualComponent` marker.
 */
export abstract class IndicatorNavigationItem extends NavigationItemBase {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── State ────────────────────────────────────────────────────────────────

  /** True when the default slot contains label content. */
  @state() private hasLabel = false;

  /** True when the `active-icon` slot contains content. */
  @state() private hasActiveIcon = false;

  // ── Lifecycle ────────────────────────────────────────────────────────────

  protected override firstUpdated() {
    super.firstUpdated();

    observerSlotChangesWithCallback(
      this.renderRoot.querySelector('slot.label-slot'),
      hasContent => {
        this.hasLabel = hasContent;
      },
    );

    observerSlotChangesWithCallback(
      this.renderRoot.querySelector('slot.active-icon-slot'),
      hasContent => {
        this.hasActiveIcon = hasContent;
      },
    );
  }

  // ── Protected methods ────────────────────────────────────────────────────

  /** Whether the label is hidden (the rail's collapsed mode). */
  protected get labelHidden(): boolean {
    return false;
  }

  protected override itemClasses(): ClassInfo {
    return {
      'item-element': true,
      'has-label': this.hasLabel,
      'has-active-icon': this.hasActiveIcon,
    };
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  protected renderContent() {
    return html`
      <wc-focus-ring class="focus-ring" for="item"></wc-focus-ring>

      <div class="item-content">
        <div class="indicator">
          <wc-ripple class="ripple"></wc-ripple>
          <div class="icon-container">
            <slot name="active-icon" class="active-icon-slot"></slot>
            <slot name="icon" class="icon-slot"></slot>
          </div>
          ${this.renderBadge()}
        </div>
        <div class="label ${this.labelHidden ? 'hidden' : ''}">
          <slot class="label-slot"></slot>
        </div>
      </div>
    `;
  }
}
