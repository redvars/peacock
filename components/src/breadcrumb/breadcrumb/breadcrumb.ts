import { html, LitElement } from 'lit';
import { property, queryAssignedElements } from 'lit/decorators.js';
import styles from './breadcrumb.scss';
import type { BreadcrumbItem } from '../breadcrumb-item/breadcrumb-item.js';

/**
 * @label Breadcrumb
 * @tag p-breadcrumb
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
 * <p-breadcrumb label="Breadcrumb">
 *   <p-breadcrumb-item href="#">Home</p-breadcrumb-item>
 *   <p-breadcrumb-item href="#">Category</p-breadcrumb-item>
 *   <p-breadcrumb-item active>Current Page</p-breadcrumb-item>
 * </p-breadcrumb>
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

  @queryAssignedElements({ selector: 'p-breadcrumb-item' })
  private breadcrumbItems!: Array<BreadcrumbItem>;

  firstUpdated() {
    this.updateBreadcrumbPositions();
  }

  private handleSlotChange() {
    this.updateBreadcrumbPositions();
  }

  private updateBreadcrumbPositions() {
    this.breadcrumbItems.forEach((item, index) => {
      item.position = `${index + 1}`;
    });
  }

  render() {
    return html`<nav aria-label=${this.label} class="breadcrumb">
      <ol>
        <slot @slotchange=${this.handleSlotChange}></slot>
      </ol>
    </nav>`;
  }
}
