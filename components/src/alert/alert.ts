import { LitElement, html, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import IndividualComponent from '@/IndividualComponent.js';
import styles from './alert.scss';

type AlertVariant = 'note' | 'info' | 'success' | 'warning' | 'error';

const VARIANT_LABELS: Record<AlertVariant, string> = {
  note: 'Note',
  info: 'Info',
  success: 'Success',
  warning: 'Warning',
  error: 'Error',
};

const VARIANT_ICONS: Record<AlertVariant, string> = {
  note: 'star',
  info: 'info',
  success: 'check_circle',
  warning: 'warning',
  error: 'error',
};

/**
 * @label Alert
 * @tag wc-alert
 * @rawTag alert
 * @summary Alerts show short, prominent contextual messages with optional icon and description.
 *
 * @cssprop --alert-container-color - Background color of the alert container.
 * @cssprop --alert-label-text-color - Label text color.
 * @cssprop --alert-description-text-color - Description text color.
 * @cssprop --alert-icon-color - Icon color.
 * @cssprop --alert-border-radius - Border radius of the alert surface.
 *
 * @example
 * ```html
 * <wc-alert variant="note" description="Use semantic roles that preserve a 3:1 contrast ratio."></wc-alert>
 * ```
 * @tags display, feedback
 */
@IndividualComponent
export class Alert extends LitElement {
  static styles = [styles];

  /**
   * Visual intent of the alert.
   */
  @property({ type: String, reflect: true })
  variant: AlertVariant = 'note';

  /**
   * Optional explicit label text. Falls back to a variant-based label.
   */
  @property({ type: String })
  label?: string;

  /**
   * Optional explicit icon name. Falls back to a variant-based icon.
   */
  @property({ type: String })
  icon?: string;

  /**
   * Optional description text when a default slot is not provided.
   */
  @property({ type: String })
  description = '';

  private get resolvedLabel() {
    return this.label || VARIANT_LABELS[this.variant];
  }

  private get resolvedIcon() {
    return this.icon || VARIANT_ICONS[this.variant];
  }

  render() {
    return html`
      <div class=${classMap({ 'alert': true, [this.variant]: true })} role="status" aria-live="polite">
        <div class="alert-icon" aria-hidden="true">
          <slot name="icon">
            <wc-icon name=${this.resolvedIcon}></wc-icon>
          </slot>
        </div>

        <div class=${classMap({ 'alert-content': true, [this.variant]: true })}>
          <div class="alert-label">
            <slot name="label">${this.resolvedLabel}:</slot>
          </div>

          <div class="alert-description">
            <slot>${this.description || nothing}</slot>
          </div>
        </div>
      </div>
    `;
  }
}
