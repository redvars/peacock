import { LitElement, html, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import IndividualComponent from '@/IndividualComponent.js';
import styles from './banner.scss';

type BannerVariant = 'note' | 'info' | 'success' | 'warning' | 'error';

const VARIANT_LABELS: Record<BannerVariant, string> = {
  note: 'Note',
  info: 'Info',
  success: 'Success',
  warning: 'Warning',
  error: 'Error',
};

const VARIANT_ICONS: Record<BannerVariant, string> = {
  note: 'star',
  info: 'info',
  success: 'check_circle',
  warning: 'warning',
  error: 'error',
};

/**
 * @label Banner
 * @tag wc-banner
 * @rawTag banner
 * @summary Banners show short, prominent contextual messages with optional icon and description.
 *
 * @cssprop --banner-container-color - Background color of the banner container.
 * @cssprop --banner-label-text-color - Label text color.
 * @cssprop --banner-description-text-color - Description text color.
 * @cssprop --banner-icon-color - Icon color.
 * @cssprop --banner-border-radius - Border radius of the banner surface.
 *
 * @example
 * ```html
 * <wc-banner variant="note" description="Use semantic roles that preserve a 3:1 contrast ratio."></wc-banner>
 * ```
 * @tags display, feedback
 */
@IndividualComponent
export class Banner extends LitElement {
  static styles = [styles];

  /**
   * Visual intent of the banner.
   */
  @property({ type: String, reflect: true })
  variant: BannerVariant = 'note';

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
      <div class=${classMap({ 'banner': true, [this.variant]: true })} role="status" aria-live="polite">
        <div class="banner-icon" aria-hidden="true">
          <slot name="icon">
            <wc-icon name=${this.resolvedIcon}></wc-icon>
          </slot>
        </div>

        <div class=${classMap({ 'banner-content': true, [this.variant]: true })}>
          <div class="banner-label">
            <slot name="label">${this.resolvedLabel}:</slot>
          </div>

          <div class="banner-description">
            <slot>${this.description || nothing}</slot>
          </div>
        </div>
      </div>
    `;
  }
}
