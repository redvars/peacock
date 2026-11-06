import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './breadcrumb.scss';
import { BreadcrumbItem } from '../breadcrumb-item/breadcrumb-item.js';
import IndividualComponent from '@/IndividualComponent.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';

/**
 * @label Breadcrumb
 * @tag wc-breadcrumb
 * @rawTag breadcrumb
 * @summary A breadcrumb is a secondary navigation scheme that reveals the user's location in a website or web application.
 * @overview
 *  - Breadcrumbs provide a trail for users to follow back to the starting or entry point.
 *  - They help users understand their current location within the site hierarchy.
 *  - Follows WCAG 2.1 guidelines for accessible navigation landmarks.
 * @tags navigation
 *
 * @example
 * ```html
 * <wc-breadcrumb label="Breadcrumb">
 *   <wc-breadcrumb-item href="#">Home</wc-breadcrumb-item>
 *   <wc-breadcrumb-item href="#">Category</wc-breadcrumb-item>
 *   <wc-breadcrumb-item active>Current Page</wc-breadcrumb-item>
 * </wc-breadcrumb>
 * ```
 */
@IndividualComponent
export class Breadcrumb extends LitElement {
  static styles = [styles];

  static Item = BreadcrumbItem;

  /**
   * Accessible label for the breadcrumb navigation landmark. Defaults to Peacock's `breadcrumb` string.
   */
  @property({ type: String }) label = '';

  /** Peacock's strings for the default landmark label. */
  private readonly i18n = new I18nController(this);

  render() {
    return html`<nav
      aria-label=${this.label || this.i18n.t('breadcrumb')}
      class="breadcrumb"
    >
      <ol>
        <slot></slot>
      </ol>
    </nav>`;
  }
}
