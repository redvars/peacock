import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import IndividualComponent from '@/IndividualComponent.js';
import { adoptCollapsed } from './site-nav-shared.js';
import styles from './site-nav-group.scss';

/**
 * @label Site Nav Group
 * @tag wc-site-nav-group
 * @rawTag site-nav-group
 *
 * @summary A titled column of links in a site header menu.
 * @overview
 * <p>Groups <code>wc-site-nav-link</code> elements under a title inside a
 * <code>wc-site-nav-menu</code>, usually one with <code>layout="columns"</code>, where each group is
 * a column. The group is labelled by its title for assistive technology.</p>
 *
 * @slot - The group's `wc-site-nav-link` elements.
 *
 * @csspart title - The group's title.
 *
 * @example
 * ```html
 * <wc-site-nav-group label="Build">
 *   <wc-site-nav-link href="/tables">Tables and forms</wc-site-nav-link>
 *   <wc-site-nav-link href="/rules">Rules</wc-site-nav-link>
 * </wc-site-nav-group>
 * ```
 * @tags navigation
 */
@IndividualComponent
export class SiteNavGroup extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** The group's title. */
  @property() label = '';

  // ── Lifecycle ────────────────────────────────────────────────────────────

  override connectedCallback() {
    super.connectedCallback();
    adoptCollapsed(this);
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    return html`<div class="group" role="group" aria-labelledby="title">
      <div id="title" class="title" part="title">${this.label}</div>
      <div class="links"><slot></slot></div>
    </div>`;
  }
}
