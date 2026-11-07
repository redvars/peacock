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
 * @summary A trail of links that shows where the current page sits in the site and leads back up it.
 * @overview
 * <ul>
 * <li>Breadcrumbs provide a trail for users to follow back to the starting or entry point.</li>
 * <li>They help users understand their current location within the site hierarchy.</li>
 * <li>Follows WCAG 2.1 guidelines for accessible navigation landmarks: the breadcrumb is a
 * <code>&lt;nav&gt;</code> landmark named by <code>label</code> (by default Peacock's
 * <code>breadcrumb</code> string) holding an ordered list, and each
 * <code>wc-breadcrumb-item</code> is one of its list items.</li>
 * <li>Mark the page the user is on with <code>current</code> on its item: it renders as text with
 * <code>aria-current="page"</code>.</li>
 * </ul>
 * @tags navigation
 *
 * @example
 * ```html
 * <wc-breadcrumb label="Breadcrumb">
 *   <wc-breadcrumb-item href="#">Home</wc-breadcrumb-item>
 *   <wc-breadcrumb-item href="#">Category</wc-breadcrumb-item>
 *   <wc-breadcrumb-item current>Current Page</wc-breadcrumb-item>
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
      <ol itemscope itemtype="https://schema.org/BreadcrumbList">
        <slot></slot>
      </ol>
    </nav>`;
  }
}
