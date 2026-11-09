import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import IndividualComponent from '@/IndividualComponent.js';
import styles from './site-footer-group.scss';

/**
 * @label Site Footer Group
 * @tag wc-site-footer-group
 * @rawTag site-footer-group
 *
 * @summary A titled column of links in a site footer.
 * @overview
 * <p>A column of a <code>wc-site-footer</code>: a title and a list of links. The column is a
 * navigation landmark named by its <code>label</code>, so a screen reader lists "Product",
 * "Company" and so on among the page's landmarks.</p>
 * <p>Put plain <code>&lt;a&gt;</code> elements or <code>wc-link</code> in it; the group lays them
 * out and styles plain links.</p>
 *
 * @slot - The column's links.
 *
 * @csspart nav - The `<nav>` element.
 * @csspart title - The column's title.
 *
 * @example
 * ```html
 * <wc-site-footer-group label="Developers">
 *   <a href="/docs">Docs</a>
 *   <a href="https://peacock.redvars.com">Peacock</a>
 * </wc-site-footer-group>
 * ```
 * @tags navigation
 */
@IndividualComponent
export class SiteFooterGroup extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** The column's title, also the name of its navigation landmark. */
  @property() label = '';

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    return html`<nav class="nav" part="nav" aria-label=${this.label}>
      <div class="title" part="title" aria-hidden="true">${this.label}</div>
      <div class="links"><slot></slot></div>
    </nav>`;
  }
}
