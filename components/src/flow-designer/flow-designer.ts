import { html, LitElement, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import IndividualComponent from '@/IndividualComponent.js';

import '../toolbar/toolbar.js';
import '../button/icon-button/icon-button.js';
import '../icon/icon.js';
import './flow-designer-node.js';

import styles from './flow-designer.scss';
import type {
  Workflow,
  WorkflowNode,
  PositionedNode,
  WorkflowChangeEvent,
  HistoryEntry,
  EditorState,
  WorkflowCommand,
} from './types.js';
import {
  AddNodeCommand,
  DeleteNodeCommand,
  EditNodeCommand,
  MoveNodeCommand,
} from './commands.js';
import { SwimlaneLayout } from './layout.js';
import { WorkflowValidator } from './validation.js';
import { cloneWorkflow } from './workflow-utils.js';

/**
 * @label Flow Designer
 * @tag wc-flow-designer
 * @rawTag flow-designer
 * @summary Low-code business process flow designer with swimlane layout, undo/redo, and interactive editing.
 *
 * @cssprop --flow-designer-height - Height of the flow designer container. Defaults to 400px.
 * @cssprop --flow-designer-border-color - Border color of the flow designer. Defaults to outline-variant.
 * @cssprop --flow-designer-background - Background color of the designer. Defaults to surface.
 * @cssprop --flow-designer-border-radius - Corner radius. Defaults to medium shape.
 * @cssprop --flow-designer-action-bar-bg - Background color of the action bar. Defaults to surface-container.
 *
 * @example
 * ```html
 * <wc-flow-designer id="editor"></wc-flow-designer>
 * <script>
 *   const workflow = {
 *     workflow_id: "demo",
 *     nodes: {
 *       id: "node_1",
 *       type: "trigger",
 *       label: "Start"
 *     }
 *   };
 *   document.querySelector('#editor').workflow = workflow;
 * </script>
 * ```
 */
@IndividualComponent
export class FlowDesigner extends LitElement {
  static styles = [styles];

  /**
   * The workflow definition to display and edit
   */
  @property({ type: Object })
  workflow: Workflow = { workflow_id: '', nodes: { id: 'root', type: 'trigger', label: 'Start' } };

  /**
   * Whether the flow designer is in read-only mode
   */
  @property({ type: Boolean, reflect: true, attribute: 'readonly' })
  readonly: boolean = false;

  /**
   * Whether the flow designer is disabled
   */
  @property({ type: Boolean, reflect: true })
  disabled: boolean = false;

  /**
   * Show validation errors/warnings
   */
  @property({ type: Boolean, attribute: 'show-validation' })
  showValidation: boolean = false;

  @state()
  private _editor: EditorState = {
    selectedNodeId: null,
    isEditing: false,
    editingNode: null,
    hoveredNodeId: null,
    isDragging: false,
    draggedNodeId: null,
    zoom: 1,
    panX: 0,
    panY: 0,
  };

  @state()
  private _positionedNodes: PositionedNode[] = [];

  @state()
  private _history: HistoryEntry[] = [];

  @state()
  private _historyIndex: number = -1;

  @query('.flow-designer')
  private scrollElm?: HTMLElement;

  private _isDragScrolling: boolean = false;
  private _dragStartX: number = 0;
  private _dragStartY: number = 0;
  private _scrollStartX: number = 0;
  private _scrollStartY: number = 0;

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('mouseup', this._handleMouseUp);
    window.addEventListener('keydown', this._handleKeyDown);
    this._recalculateLayout();
  }

  disconnectedCallback() {
    window.removeEventListener('mouseup', this._handleMouseUp);
    window.removeEventListener('keydown', this._handleKeyDown);
    super.disconnectedCallback();
  }

  protected willUpdate() {
    this._recalculateLayout();
  }

  /**
   * Recalculate layout when workflow changes
   */
  private _recalculateLayout() {
    if (!this.workflow?.nodes) return;
    this._positionedNodes = SwimlaneLayout.calculateLayout(this.workflow.nodes);
  }

  /**
   * Add a new node
   */
  addNode(
    newNode: WorkflowNode,
    parentNodeId: string,
    connectionType: 'child' | 'branch' | 'task' = 'child',
    branchKey?: string
  ): void {
    const command = new AddNodeCommand(
      newNode,
      parentNodeId,
      connectionType,
      branchKey
    );
    this._executeCommand(command);
  }

  /**
   * Delete a node by ID
   */
  deleteNode(nodeId: string): void {
    const command = new DeleteNodeCommand(nodeId, this.workflow);
    this._executeCommand(command);
  }

  /**
   * Edit a node
   */
  editNode(nodeId: string, updates: Partial<WorkflowNode>): void {
    const command = new EditNodeCommand(nodeId, updates, this.workflow);
    this._executeCommand(command);
  }

  /**
   * Move a node to a different parent/position
   */
  moveNode(
    nodeId: string,
    newParentId: string,
    newIndex: number,
    connectionType: 'child' | 'branch' | 'task' = 'child',
    branchKey?: string
  ): void {
    const command = new MoveNodeCommand(
      nodeId,
      newParentId,
      newIndex,
      connectionType,
      branchKey,
      this.workflow
    );
    this._executeCommand(command);
  }

  /**
   * Execute a command and add to history
   */
  private _executeCommand(command: WorkflowCommand): void {
    const newWorkflow = command.execute(this.workflow);

    // Validate workflow after change
    const errors = WorkflowValidator.validate(newWorkflow);
    const hasErrors = errors.some((e) => e.severity === 'error');

    if (hasErrors && !confirm('Workflow has errors. Continue anyway?')) {
      return;
    }

    // Add to history
    this._history = this._history.slice(0, this._historyIndex + 1);
    this._history.push({
      command,
      workflow: newWorkflow,
      timestamp: Date.now(),
    });
    this._historyIndex++;

    // Update workflow
    this.workflow = newWorkflow;

    // Emit change event
    this._emitWorkflowChange('node-edited', undefined);
  }

  /**
   * Undo last operation
   */
  undo(): void {
    if (this._historyIndex <= 0) return;

    this._historyIndex--;
    const entry = this._history[this._historyIndex];
    this.workflow = cloneWorkflow(entry.workflow);
    this._emitWorkflowChange('undo', undefined);
  }

  /**
   * Redo last undone operation
   */
  redo(): void {
    if (this._historyIndex >= this._history.length - 1) return;

    this._historyIndex++;
    const entry = this._history[this._historyIndex];
    this.workflow = cloneWorkflow(entry.workflow);
    this._emitWorkflowChange('redo', undefined);
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this._historyIndex > 0;
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this._historyIndex < this._history.length - 1;
  }

  /**
   * Export current workflow as JSON
   */
  exportWorkflow(): string {
    return JSON.stringify(this.workflow, null, 2);
  }

  /**
   * Validate workflow
   */
  validate(): void {
    const errors = WorkflowValidator.validate(this.workflow);
    this.dispatchEvent(
      new CustomEvent('validation-result', {
        detail: { errors },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _emitWorkflowChange(
    type: WorkflowChangeEvent['type'],
    nodeId?: string
  ): void {
    this.dispatchEvent(
      new CustomEvent('workflow-changed', {
        detail: {
          type,
          nodeId,
          workflow: this.workflow,
        } as WorkflowChangeEvent,
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handleKeyDown = (event: KeyboardEvent) => {
    if (this.disabled || this.readonly) return;

    if (event.ctrlKey || event.metaKey) {
      if (event.key === 'z') {
        event.preventDefault();
        this.undo();
      } else if (event.key === 'y') {
        event.preventDefault();
        this.redo();
      }
    }

    if (event.key === 'Delete' && this._editor.selectedNodeId) {
      event.preventDefault();
      this.deleteNode(this._editor.selectedNodeId);
    }
  };

  private _handleMouseUp = () => {
    this._isDragScrolling = false;
  };

  private _handleCanvasMouseDown = (e: MouseEvent) => {
    if (this.disabled) return;

    if (e.target === this.scrollElm || (e.target as HTMLElement).classList.contains('canvas-container')) {
      this._isDragScrolling = true;
      this._dragStartX = e.clientX;
      this._dragStartY = e.clientY;
      if (this.scrollElm) {
        this._scrollStartX = this.scrollElm.scrollLeft;
        this._scrollStartY = this.scrollElm.scrollTop;
      }
    }
  };

  private _handleCanvasMouseMove = (e: MouseEvent) => {
    if (!this._isDragScrolling || !this.scrollElm) return;

    const deltaX = e.clientX - this._dragStartX;
    const deltaY = e.clientY - this._dragStartY;

    this.scrollElm.scrollLeft = this._scrollStartX - deltaX;
    this.scrollElm.scrollTop = this._scrollStartY - deltaY;
  };

  private _handleNodeClick = (e: CustomEvent) => {
    const nodeId = e.detail.nodeId;
    this._editor.selectedNodeId = nodeId;
    this.requestUpdate();
  };

  private _handleNodeDelete = (e: CustomEvent) => {
    const nodeId = e.detail.nodeId;
    this.deleteNode(nodeId);
  };

  private _handleNodeEdit = (e: CustomEvent) => {
    const nodeId = e.detail.nodeId;
    this._editor.selectedNodeId = nodeId;
    this._editor.isEditing = true;
    this.requestUpdate();
  };

  private _handleZoomIn = () => {
    this._editor.zoom = Math.min(2, this._editor.zoom + 0.1);
    this.requestUpdate();
  };

  private _handleZoomOut = () => {
    this._editor.zoom = Math.max(0.5, this._editor.zoom - 0.1);
    this.requestUpdate();
  };

  protected render() {
    if (!this.workflow?.nodes) {
      return html`<div class="flow-designer-container">
        <p class="empty-state">No workflow loaded</p>
      </div>`;
    }

    const validationErrors = this.showValidation
      ? WorkflowValidator.validate(this.workflow)
      : [];
    const canvasBounds = SwimlaneLayout.getCanvasBounds(this._positionedNodes);

    return html`
      <div class="flow-designer-container">
        <wc-toolbar
          class="editor-toolbar"
          variant="floating"
          orientation="horizontal"
          elevated
        >
          <wc-icon-button
            variant="text"
            ?disabled=${this._editor.zoom <= 0.5}
            @click=${this._handleZoomOut}
            title="Zoom Out (Ctrl+-)"
          >
            <wc-icon name="remove"></wc-icon>
          </wc-icon-button>
          <span class="zoom-display">${Math.round(this._editor.zoom * 100)}%</span>
          <wc-icon-button
            variant="text"
            ?disabled=${this._editor.zoom >= 2}
            @click=${this._handleZoomIn}
            title="Zoom In (Ctrl++)"
          >
            <wc-icon name="add"></wc-icon>
          </wc-icon-button>
          <wc-icon-button
            variant="text"
            ?disabled=${!this.canUndo()}
            @click=${() => this.undo()}
            title="Undo (Ctrl+Z)"
          >
            <wc-icon name="undo"></wc-icon>
          </wc-icon-button>
          <wc-icon-button
            variant="text"
            ?disabled=${!this.canRedo()}
            @click=${() => this.redo()}
            title="Redo (Ctrl+Y)"
          >
            <wc-icon name="redo"></wc-icon>
          </wc-icon-button>
          ${!this.readonly
            ? html`
                <wc-icon-button
                  variant="text"
                  @click=${() => this.validate()}
                  title="Validate Workflow"
                >
                  <wc-icon name="check_circle"></wc-icon>
                </wc-icon-button>
              `
            : nothing}
        </wc-toolbar>

        <!-- Validation messages -->
        ${validationErrors.length > 0
          ? html`
              <div class="validation-panel">
                ${validationErrors.map(
                  (error) =>
                    html`
                      <div class="validation-item ${error.severity}">
                        <wc-icon
                          name=${error.severity === 'error' ? 'error' : 'warning'}
                        ></wc-icon>
                        <span>${error.message}</span>
                      </div>
                    `
                )}
              </div>
            `
          : nothing}

        <!-- Flow canvas -->
        <div
          class="flow-designer"
          @mousedown=${this._handleCanvasMouseDown}
          @mousemove=${this._handleCanvasMouseMove}
        >
          <div
            class="canvas-container"
            style="
              transform: scale(${this._editor.zoom});
              width: ${canvasBounds.width}px;
              height: ${canvasBounds.height}px;
            "
          >
            <!-- SVG Connectors -->
            <svg
              class="connectors-layer"
              width="${canvasBounds.width}"
              height="${canvasBounds.height}"
              viewBox="0 0 ${canvasBounds.width} ${canvasBounds.height}"
            >
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3, 0 6" fill="currentColor"></polygon>
                </marker>
              </defs>
              ${this._renderConnectors()}
            </svg>

            <!-- Swimlane backgrounds -->
            <div class="swimlanes-container">
              ${this._renderSwimlanes()}
            </div>

            <!-- Positioned nodes -->
            <div class="nodes-layer">
              ${this._renderNodes()}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private _renderConnectors() {
    return this._positionedNodes.flatMap((node) => {
      if (!node.connectorPoints) return [];

      return node.connectorPoints.map((connector, idx) => {
        const { from, to, type } = connector;
        const isLoopback = type === 'curved';

        if (isLoopback) {
          // Render curved path for loop back
          const midY = (from.y + to.y) / 2;
          const d =
            `M ${from.x} ${from.y} ` +
            `L ${from.x + 30} ${from.y} ` +
            `Q ${from.x + 60} ${midY} ${to.x - 30} ${to.y} ` +
            `L ${to.x} ${to.y}`;

          return html`
            <path
              key=${`${node.node.id}-connector-${idx}`}
              d=${d}
              class="connector ${type}"
              marker-end="url(#arrowhead)"
              vector-effect="non-scaling-stroke"
            ></path>
          `;
        }

        // Render straight connector
        const d = `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
        return html`
          <path
            key=${`${node.node.id}-connector-${idx}`}
            d=${d}
            class="connector ${type}"
            marker-end="url(#arrowhead)"
            vector-effect="non-scaling-stroke"
          ></path>
        `;
      });
    });
  }

  private _renderSwimlanes() {
    const swimlanes = SwimlaneLayout.getSwimlanes(this._positionedNodes);

    return swimlanes.map(
      (lane) => {
        const laneTop = Math.min(...lane.nodes.map((n) => n.y)) - 14;
        const laneBottom = Math.max(...lane.nodes.map((n) => n.y + n.height)) + 14;
        const laneHeight = Math.max(120, laneBottom - laneTop);

        return html`
          <div
            class="swimlane ${lane.isParallel ? 'parallel' : ''}"
            style="top: ${laneTop}px; height: ${laneHeight}px;"
          >
            <div class="swimlane-header">${lane.name}</div>
          </div>
        `;
      }
    );
  }

  private _renderNodes() {
    return this._positionedNodes.map(
      (posNode) =>
        html`
          <div
            class="positioned-node"
            style="
              left: ${posNode.x}px;
              top: ${posNode.y}px;
              width: ${posNode.width}px;
              height: ${posNode.height}px;
            "
          >
            <wc-flow-designer-node
              .node=${posNode.node}
              ?selected=${posNode.node.id === this._editor.selectedNodeId}
              ?editing=${this._editor.isEditing &&
              posNode.node.id === this._editor.selectedNodeId}
              ?disabled=${this.disabled}
              @node-click=${this._handleNodeClick}
              @node-delete=${this._handleNodeDelete}
              @node-edit-start=${this._handleNodeEdit}
            ></wc-flow-designer-node>
          </div>
        `
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wc-flow-designer': FlowDesigner;
  }
}
