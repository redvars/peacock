import { html, LitElement, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import styles from './empty-state.scss';

/**
 * @label Empty State
 * @name empty-state
 * @description A message that displays when there is no information to display.
 */
export class EmptyState extends LitElement {
  // Lit handles styles in a static property for better performance
  static styles = [styles];

  @property({ type: String, reflect: true })
  illustration: 'no-document' | 'page' | 'search' = 'no-document';

  @property({ type: String, reflect: true })
  headline = '';

  @property({ type: String, reflect: true })
  description = '';

  @state()
  private vertical = false;

  connectedCallback() {
    // eslint-disable-next-line wc/guard-super-call
    super.connectedCallback();
    window.addEventListener('resize', this.handleResize);
    // Initial check
    this.handleResize();
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this.handleResize);
    // eslint-disable-next-line wc/guard-super-call
    super.disconnectedCallback();
  }

  private handleResize = () => {
    // Logic equivalent to Stencil's clientWidth check
    this.vertical = this.offsetWidth < 768;
  };

  __renderTitle() {
    if (!this.headline) return nothing;
    return html`<div class="title">${this.headline}</div>`;
  }

  __renderDescription() {
    if (!this.description) return nothing;
    return html`<div class="description">${this.description}</div>`;
  }

  protected render() {
    const classes = {
      'empty-state': true,
      vertical: this.vertical,
    };

    // Resolving asset paths in Lit typically uses import.meta.url or absolute paths
    const illustrationPath = new URL(
      `./assets/images/empty-state/${this.illustration}.svg`,
      import.meta.url,
    ).href;

    return html`
      <div class="${classMap(classes)}">
        <div class="empty-state-container">
          <div class="illustration">
            <p-icon src="${illustrationPath}"></p-icon>
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
