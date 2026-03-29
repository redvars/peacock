import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './tree-view.scss';
import { TreeNode } from './tree-node.js';

/**
 * @label Tree View
 * @tag wc-tree-view
 * @rawTag tree-view
 * @summary A tree view is a hierarchical structure that provides nested levels of navigation. It supports keyboard navigation, single/multi select, and expandable nodes.
 *
 * @example
 * ```html
 * <wc-tree-view>
 *   <wc-tree-node label="Parent" expanded>
 *     <wc-tree-node label="Child 1"></wc-tree-node>
 *     <wc-tree-node label="Child 2"></wc-tree-node>
 *   </wc-tree-node>
 * </wc-tree-view>
 * ```
 * @tags navigation
 */
export class TreeView extends LitElement {
  static styles = [styles];

  /**
   * The value of the currently selected node.
   */
  @property({ type: String, attribute: 'selected-node', reflect: true })
  selectedNode: string = '';

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('tree-node:click', this._onNodeClick as EventListener);
    this.addEventListener('keydown', this._onKeyDown);
    this.setAttribute('role', 'tree');
  }

  updated(changedProps: Map<string, unknown>) {
    super.updated(changedProps);

    if (changedProps.has('selectedNode')) {
      this._syncSelectedStateFromProperty();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('tree-node:click', this._onNodeClick as EventListener);
    this.removeEventListener('keydown', this._onKeyDown);
  }

  private _getTopLevelNodes(): TreeNode[] {
    return Array.from(this.children).filter(
      el => el.tagName.toLowerCase() === 'wc-tree-node',
    ) as TreeNode[];
  }

  private _getAllVisibleNodes(): TreeNode[] {
    const result: TreeNode[] = [];
    const collect = (nodes: TreeNode[]) => {
      nodes.forEach(node => {
        result.push(node);
        if (node.expanded) {
          const children = Array.from(node.children).filter(
            el => el.tagName.toLowerCase() === 'wc-tree-node',
          ) as TreeNode[];
          collect(children);
        }
      });
    };
    collect(this._getTopLevelNodes());
    return result;
  }

  private _onNodeClick = (event: CustomEvent) => {
    const target = event.target as TreeNode;
    if (target.disabled) return;

    const value = event.detail?.value ?? target.value ?? target.label;
    this.selectedNode = value;

    // Update selected state on all nodes
    this._updateSelectedState(value);

    this.dispatchEvent(
      new CustomEvent('tree-view:change', {
        bubbles: true,
        composed: true,
        detail: { value, node: target },
      }),
    );
  };

  private _updateSelectedState(selectedValue: string) {
    const allNodes = this._collectAllNodes(this._getTopLevelNodes());
    allNodes.forEach(node => {
      const nodeValue = node.value || node.label;
      // eslint-disable-next-line no-param-reassign
      node.selected = nodeValue === selectedValue;
    });
  }

  private _clearSelectedState() {
    const allNodes = this._collectAllNodes(this._getTopLevelNodes());
    allNodes.forEach(node => {
      // eslint-disable-next-line no-param-reassign
      node.selected = false;
    });
  }

  private _syncSelectedStateFromProperty() {
    if (this.selectedNode) {
      this._updateSelectedState(this.selectedNode);
      return;
    }

    this._clearSelectedState();
  }

  private _onSlotChange = () => {
    this._syncSelectedStateFromProperty();
  };

  private _collectAllNodes(nodes: TreeNode[]): TreeNode[] {
    const result: TreeNode[] = [];
    nodes.forEach(node => {
      result.push(node);
      const children = Array.from(node.children).filter(
        el => el.tagName.toLowerCase() === 'wc-tree-node',
      ) as TreeNode[];
      result.push(...this._collectAllNodes(children));
    });
    return result;
  }

  private _onKeyDown = (event: KeyboardEvent) => {
    const visibleNodes = this._getAllVisibleNodes().filter(n => !n.disabled);
    if (visibleNodes.length === 0) return;

    const focusedIndex = visibleNodes.findIndex(node => {
      const root = node.shadowRoot;
      return root?.activeElement !== null && root?.activeElement !== undefined;
    });

    if (focusedIndex === -1 && event.key !== 'Tab') return;

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        const nextIndex = (focusedIndex + 1) % visibleNodes.length;
        visibleNodes[nextIndex]?.focus();
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        const prevIndex =
          (focusedIndex - 1 + visibleNodes.length) % visibleNodes.length;
        visibleNodes[prevIndex]?.focus();
        break;
      }
      case 'Home':
        event.preventDefault();
        visibleNodes[0]?.focus();
        break;
      case 'End':
        event.preventDefault();
        visibleNodes[visibleNodes.length - 1]?.focus();
        break;
      default:
        break;
    }
  };

  render() {
    return html`<div class="tree-view">
      <slot @slotchange=${this._onSlotChange}></slot>
    </div>`;
  }

  static Node = TreeNode;
}
