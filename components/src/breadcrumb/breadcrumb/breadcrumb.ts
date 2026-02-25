import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './breadcrumb.scss';

/**
 * @label Breadcrumb
 * @tag base-breadcrumb
 * @rawTag breadcrumb
 *
 * @summary A breadcrumb is a secondary navigation scheme that reveals the user's location in a website or web application.
 * @overview
 *  - Breadcrumbs provide a trail for users to follow back to the starting or entry point.
 *  - They help users understand their current location within the site hierarchy.
 *  - Follows WCAG 2.1 guidelines for accessible navigation landmarks.
 *
 * @example
 * ```html
 * <base-breadcrumb label="Breadcrumb">
 *   <breadcrumb-item href="#">Home</breadcrumb-item>
 *   <breadcrumb-item href="#">Category</breadcrumb-item>
 *   <breadcrumb-item active>Current Page</breadcrumb-item>
 * </base-breadcrumb>
 * ```
 * @tags navigation
 */
export class Breadcrumb extends LitElement {
  static styles = [styles];

  /**
   * Accessible label for the breadcrumb navigation landmark.
   * @default "Breadcrumb"
   */
  @property({ type: String }) label = 'Breadcrumb';

  render() {
    return html`<nav aria-label=${this.label} class="breadcrumb">
      <ol>
        <slot></slot>
      </ol>
    </nav>`;
  }
}
