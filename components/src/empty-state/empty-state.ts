import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './empty-state.scss';
import IndividualComponent from '@/IndividualComponent.js';

/**
 * @label Empty State
 * @tag wc-empty-state
 * @rawTag empty-state
 * @summary A message that displays when there is no information to display.
 * @overview
 * <p>The layout follows the width of the empty state's own container, not the window: below
 * 672px the illustration stacks above the text; wider, they sit side by side.</p>
 * @tags display
 *
 * @example
 * ```html
 * <wc-empty-state style="width:100%" headline="No items found"></wc-empty-state>
 * ```
 */
@IndividualComponent
export class EmptyState extends LitElement {
  // Lit handles styles in a static property for better performance
  static styles = [styles];

  /** The illustration shown beside (or, when narrow, above) the text. */
  @property({ type: String, reflect: true })
  illustration: 'no-document' | 'page' | 'search' = 'no-document';

  /** The title. */
  @property({ type: String, reflect: true })
  headline = '';

  /** The supporting text under the title. */
  @property({ type: String, reflect: true })
  description = '';

  // ── Render helpers ────────────────────────────────────────────────────────

  __renderTitle() {
    if (!this.headline) return nothing;
    return html`<div class="headline">${this.headline}</div>`;
  }

  __renderDescription() {
    if (!this.description) return nothing;
    return html`<div class="description">${this.description}</div>`;
  }

  // ── Render ────────────────────────────────────────────────────────────────

  protected render() {
    // Resolving asset paths in Lit typically uses import.meta.url or absolute paths
    const illustrationPath = new URL(
      `./assets/images/empty-state/${this.illustration}.svg`,
      import.meta.url,
    ).href;

    return html`
      <div class="empty-state">
        <div class="empty-state-container">
          <div class="illustration">
            <wc-icon
              class="illustration-svg"
              src="${illustrationPath}"
            ></wc-icon>
          </div>

          <div class="content">
            ${this.__renderTitle()} ${this.__renderDescription()}
            <div class="actions">
              <slot name="actions"></slot>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
