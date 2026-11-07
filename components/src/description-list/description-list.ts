import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import IndividualComponent from '@/IndividualComponent.js';

import { DescriptionItem } from './description-item.js';
import styles from './description-list.scss';

/** Where each item's label goes: above its value, or beside it. */
export type DescriptionListLayout = 'stacked' | 'inline';

/**
 * @label Description List
 * @tag wc-description-list
 * @rawTag description-list
 *
 * @summary Shows the details of a record as labels and values, such as "Status: Active" and "Owner: Ana".
 * @overview
 * <p>Description list lays out <code>wc-description-item</code>s, each a label and a value, for
 * record and detail pages. With <code>layout="stacked"</code> (the default) each label sits above
 * its value; with <code>layout="inline"</code> it sits beside it, in a column of the same width
 * for every item, so the values line up.</p>
 * <p><code>columns</code> (1 to 4) puts the items in a grid. The grid follows the width of the
 * list, not of the window: below 40rem it drops to at most two columns and below 24rem to one,
 * where inline items also stack. <code>divided</code> draws a line under every item. An item
 * with <code>span</code> takes a whole row.</p>
 * <p>Each item is its own <code>&lt;dl&gt;</code> with a <code>&lt;dt&gt;</code> and a
 * <code>&lt;dd&gt;</code>, so screen readers announce every label as the term of its value.</p>
 *
 * @cssprop --description-list-label-width - Width of the label column in the inline layout.
 * @cssprop --description-list-column-gap - Space between the columns.
 * @cssprop --description-list-row-gap - Space between the rows.
 *
 * @example
 * ```html
 * <wc-description-list columns="2">
 *   <wc-description-item label="Status">Active</wc-description-item>
 *   <wc-description-item label="Owner">Ana Lima</wc-description-item>
 *   <wc-description-item label="Created">12 March 2026</wc-description-item>
 *   <wc-description-item label="Due date"></wc-description-item>
 *   <wc-description-item label="Description" span>Replace the lobby lights.</wc-description-item>
 * </wc-description-list>
 * ```
 * @example
 * ```html
 * <wc-description-list layout="inline" divided>
 *   <wc-description-item label="Order">#10042</wc-description-item>
 *   <wc-description-item label="Total">€ 1,240.00</wc-description-item>
 * </wc-description-list>
 * ```
 * @tags display
 */
@IndividualComponent
export class DescriptionList extends LitElement {
  // ── Static

  static styles = [styles];

  static Item = DescriptionItem;

  // ── Properties

  /** Puts each label above its value (`stacked`) or beside it (`inline`). */
  @property({ type: String, reflect: true })
  layout: DescriptionListLayout = 'stacked';

  /** Number of columns, 1 to 4; fewer when the list is narrow. */
  @property({ type: Number, reflect: true }) columns = 1;

  /** Draws a line under every item. */
  @property({ type: Boolean, reflect: true }) divided = false;

  // ── Render

  render() {
    const columns = Math.min(4, Math.max(1, Math.round(this.columns) || 1));
    return html`
      <div class="container">
        <div class="list columns-${columns}">
          <slot></slot>
        </div>
      </div>
    `;
  }
}
