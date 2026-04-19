import { html, LitElement, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import IndividualComponent from '@/IndividualComponent.js';
import styles from './flow-designer.scss';
import type { WorkflowNode } from './types.js';

/**
 * Individual node component for flow designer
 * Renders a single workflow node with customizable slot templates
 *
 * @tag wc-flow-designer-node
 * @rawTag flow-designer-node
 * @wip true
 */
@IndividualComponent
export class FlowDesignerNode extends LitElement {
  static styles = [styles];

  /**
   * The workflow node to render
   */
  @property({ type: Object })
  node: WorkflowNode = { id: '', type: 'action', label: '' };

  /**
   * Whether this node is currently selected
   */
  @property({ type: Boolean, reflect: true, attribute: 'selected' })
  isSelected: boolean = false;

  /**
   * Whether this node is in edit mode
   */
  @property({ type: Boolean, reflect: true, attribute: 'editing' })
  isEditing: boolean = false;

  /**
   * Whether this node is disabled
   */
  @property({ type: Boolean, reflect: true })
  disabled: boolean = false;

  /**
   * Whether to show the delete button
   */
  @property({ type: Boolean, attribute: 'show-delete' })
  showDelete: boolean = true;

  private _handleClick = () => {
    this.dispatchEvent(
      new CustomEvent('node-click', {
        detail: { nodeId: this.node.id },
        bubbles: true,
        composed: true,
      })
    );
  };

  private _handleDoubleClick = () => {
    this.dispatchEvent(
      new CustomEvent('node-edit-start', {
        detail: { nodeId: this.node.id },
        bubbles: true,
        composed: true,
      })
    );
  };

  private _handleDelete = (e: Event) => {
    e.stopPropagation();
    if (confirm(`Delete "${this.node.label}"?`)) {
      this.dispatchEvent(
        new CustomEvent('node-delete', {
          detail: { nodeId: this.node.id },
          bubbles: true,
          composed: true,
        })
      );
    }
  };

  private _handleMouseEnter = () => {
    // Node hover state handled via CSS
  };

  private _handleMouseLeave = () => {
    // Node hover state handled via CSS
  };

  render() {
    const { node, isSelected, isEditing, disabled } = this;
    const nodeType = node.type || 'action';

    return html`
      <div
        class="node-card ${nodeType}"
        ?selected=${isSelected}
        ?editing=${isEditing}
        ?disabled=${disabled}
        @click=${this._handleClick}
        @dblclick=${this._handleDoubleClick}
        role="button"
        tabindex="0"
        @keydown=${(e: KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') this._handleClick();
        }}
      >
        <!-- Customizable header slot -->
        <slot name="${nodeType}-header">
          ${this._renderDefaultHeader()}
        </slot>

        <!-- Customizable body slot -->
        <slot name="${nodeType}-body">${this._renderDefaultBody()}</slot>

        <!-- Action buttons -->
        ${this.isEditing
          ? html`
              <div class="node-actions">
                <button class="btn-sm" @click=${this._handleDelete}>
                  Delete
                </button>
              </div>
            `
          : nothing}
      </div>
    `;
  }

  private _renderDefaultHeader() {
    const { node } = this;
    const iconMap: Record<string, string> = {
      trigger: 'play-circle',
      action: 'check-circle',
      decision: 'help-circle',
      loop_start: 'repeat',
      loop_end: 'repeat',
      fork: 'git-branch',
      join: 'git-merge',
    };

    const icon = iconMap[node.type] || 'activity';

    return html`
      <div class="node-header">
        <wc-icon provider="carbon" name=${icon} class="node-icon"></wc-icon>
        <span class="node-title">${node.label}</span>
      </div>
    `;
  }

  private _renderDefaultBody() {
    const { node } = this;
    return html`
      <div class="node-body">
        ${node.description
          ? html`<p class="node-description">${node.description}</p>`
          : nothing}
        <div class="node-metadata">
          <span class="node-type-tag">${node.type}</span>
          ${node.id ? html`<span class="node-id">${node.id}</span>` : nothing}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wc-flow-designer-node': FlowDesignerNode;
  }
}
