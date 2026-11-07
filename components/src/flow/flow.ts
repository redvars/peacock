import { html, LitElement, nothing, svg } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { repeat } from 'lit/directives/repeat.js';
import IndividualComponent from '@/IndividualComponent.js';
import styles from './flow.scss';

export type FlowDirection = 'up' | 'down' | 'left' | 'right';

export type FlowStrokeVariant = 'solid' | 'dashed' | 'animated-dashed';

export type FlowHandlePosition = 'top' | 'left' | 'bottom' | 'right';

export interface FlowPoint {
  x: number;
  y: number;
}

export interface FlowPathSegment {
  direction: FlowDirection;
  length: number;
}

export interface FlowNode {
  id: string;
  position: { x: number; y: number };
  inputs?: FlowHandlePosition[];
  outputs?: FlowHandlePosition[];
  data:
    | {
        label?: string;
        element?: HTMLElement;
        [key: string]: any;
      }
    | HTMLElement;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: FlowHandlePosition;
  targetHandle?: FlowHandlePosition;
  type?: 'smoothstep' | 'bezier' | 'straight';
  variant?: FlowStrokeVariant;
  label?: string;
  color?: string;
}

/** Detail of `node-drag` and `node-drag-end`. */
export interface FlowNodeMoveDetail {
  id: string;
  position: FlowPoint;
}

/** Detail of `select`. */
export interface FlowSelectDetail {
  id: string;
  node: FlowNode;
}

/** Detail of `connect`. */
export interface FlowConnectDetail {
  source: string;
  target: string;
  sourceHandle: FlowHandlePosition;
  targetHandle: FlowHandlePosition;
}

/** Canvas pixels an arrow key moves the focused node; matches the dot grid. */
const KEY_STEP = 20;

/** Canvas pixels Shift + arrow key moves the focused node. */
const LARGE_KEY_STEP = 100;

/** Pointer travel, in screen pixels, before a press on a node becomes a drag. */
const DRAG_THRESHOLD = 3;

/** Size assumed for a node before it has been measured. */
const DEFAULT_SIZE = { width: 150, height: 70 };

const OPPOSITE: Record<FlowHandlePosition, FlowHandlePosition> = {
  left: 'right',
  right: 'left',
  top: 'bottom',
  bottom: 'top',
};

/**
 * @label Flow
 * @tag wc-flow
 * @rawTag flow
 * @summary A node editor on a dotted grid, where the person moves nodes and draws connections between them.
 *
 * @overview
 * <p>Set <code>nodes</code> and <code>edges</code> as properties. A node shows its
 * <code>data.label</code> (or its id) on a default card, or renders your own element when
 * <code>data</code> is an element or has an <code>element</code>. Each node has input handles
 * (left by default) and output handles (right by default); an edge is drawn as a smooth step,
 * bezier or straight line, solid, dashed or animated dashed.</p>
 * <p>Nodes are dragged with a mouse, pen or touch; <code>node-drag</code> fires while a node moves
 * and <code>node-drag-end</code> once when the drag ends. A press without movement selects the
 * node, sets <code>selected</code> and fires <code>select</code>. Dragging from an output handle
 * onto another node's input handle fires <code>connect</code>; the flow does not add the edge, so
 * add it to <code>edges</code> yourself.</p>
 * <p>Each node is focusable and named by its label. Arrow keys move the focused node by one grid
 * step (20px), Shift + arrow by 100px, and each move fires <code>node-drag-end</code>; Enter or
 * Space selects it. Arrow keys follow the canvas axes, so they are not mirrored in right-to-left
 * layouts.</p>
 * <p>Moving a node never mutates the objects you passed: the flow replaces the moved node with a
 * new object (<code>{ ...node, position }</code>) and assigns a new array to <code>nodes</code>.
 * Read <code>flow.nodes</code>, or save the position from <code>node-drag-end</code>, to keep the
 * change. <code>zoom</code> scales the canvas and <code>padding</code> sets the space around the
 * nodes.</p>
 *
 * @example
 * ```html
 * <wc-flow id="my-flow"></wc-flow>
 * <script>
 *   const flow = document.getElementById('my-flow');
 *   flow.nodes = [
 *     { id: '1', position: { x: 50, y: 50 }, data: { label: 'Node 1' } },
 *     { id: '2', position: { x: 250, y: 50 }, data: { label: 'Node 2' } }
 *   ];
 *   flow.edges = [
 *     { id: 'e1-2', source: '1', target: '2' }
 *   ];
 * </script>
 * ```
 *
 * @fires {CustomEvent<FlowNodeMoveDetail>} node-drag - While a node is dragged. Detail contains `{ id, position }`.
 * @fires {CustomEvent<FlowNodeMoveDetail>} node-drag-end - Once when a drag ends, and after each keyboard move. Detail contains `{ id, position }`.
 * @fires {CustomEvent<FlowSelectDetail>} select - A node was clicked, or chosen with Enter or Space. Detail contains `{ id, node }`.
 * @fires {CustomEvent<FlowConnectDetail>} connect - An output handle was dragged onto another node's input handle. Detail contains `{ source, target, sourceHandle, targetHandle }`.
 *
 * @cssprop --flow-background - Background color for the canvas wrapper. Defaults to surface-container-low.
 * @cssprop --flow-dot-color - Color of the background grid dots. Defaults to outline-variant.
 * @cssprop --flow-line-color - Default stroke color for lines and connectors. Defaults to on-surface.
 * @cssprop --flow-hover-color - Stroke color on hover for clickable shapes. Defaults to primary.
 * @cssprop --flow-arrow-color - Stroke color for arrow markers. Defaults to on-surface.
 */
@IndividualComponent
export class Flow extends LitElement {
  // ── Static

  static styles = [styles];

  // ── Properties

  /** Nodes to draw. Replaced with a new array, never mutated, when a node moves. */
  @property({ type: Array })
  nodes: FlowNode[] = [];

  /** Connections between node handles. */
  @property({ type: Array })
  edges: FlowEdge[] = [];

  /** Scale of the canvas. */
  @property({ type: Number, reflect: true })
  zoom: number = 1;

  /** Space around the nodes, in canvas pixels. */
  @property({ type: Number, reflect: true })
  padding: number = 50;

  /** Id of the selected node. Set by clicking a node or pressing Enter or Space on it. */
  @property({ type: String, reflect: true })
  selected: string = '';

  // ── State

  /** Id of the node being dragged. */
  @state()
  private draggingNodeId: string | null = null;

  /** Whether a connection is being drawn from an output handle. */
  @state()
  private isDrawingConnection = false;

  /** Node the connection being drawn starts from. */
  @state()
  private draggingSourceId: string | null = null;

  /** Handle the connection being drawn starts from. */
  @state()
  private draggingSourceHandle: FlowHandlePosition | null = null;

  /** Start of the connection preview, in canvas coordinates. */
  @state()
  private connectionStart: FlowPoint = { x: 0, y: 0 };

  /** Pointer position for the connection preview, in canvas coordinates. */
  @state()
  private connectionEnd: FlowPoint = { x: 0, y: 0 };

  // ── Private fields

  /** Measured node sizes, by id. */
  private nodeDimensions = new Map<string, { width: number; height: number }>();

  /** The press on a node that may become a drag. */
  private nodeDrag?: {
    id: string;
    pointerId: number;
    startX: number;
    startY: number;
    origin: FlowPoint;
    moved: boolean;
    element: HTMLElement;
  };

  /** The pointer drawing a connection, and the handle that captured it. */
  private connectionDrag?: { pointerId: number; element: HTMLElement };

  // ── Lifecycle

  disconnectedCallback() {
    super.disconnectedCallback();
    this.endNodeDrag(false);
    this.cancelConnection();
  }

  protected updated() {
    let dimensionsChanged = false;
    this.shadowRoot?.querySelectorAll<HTMLElement>('.flow-node').forEach(el => {
      const id = el.getAttribute('data-id');
      if (id) {
        const current = this.nodeDimensions.get(id);
        const w = el.offsetWidth || DEFAULT_SIZE.width;
        const h = el.offsetHeight || DEFAULT_SIZE.height;
        if (!current || current.width !== w || current.height !== h) {
          this.nodeDimensions.set(id, { width: w, height: h });
          dimensionsChanged = true;
        }
      }
    });
    if (dimensionsChanged) {
      this.requestUpdate();
    }
  }

  // ── Private methods

  private emit<T>(type: string, detail: T) {
    this.dispatchEvent(
      new CustomEvent<T>(type, { detail, bubbles: true, composed: true }),
    );
  }

  /** Replaces the node with a moved copy and assigns a new `nodes` array. */
  private moveNode(id: string, position: FlowPoint) {
    this.nodes = this.nodes.map(node =>
      node.id === id ? { ...node, position: { ...position } } : node,
    );
  }

  private selectNode(node: FlowNode) {
    this.selected = node.id;
    this.emit<FlowSelectDetail>('select', { id: node.id, node });
  }

  private nodePosition(id: string): FlowPoint | undefined {
    const node = this.nodes.find(n => n.id === id);
    return node ? { ...node.position } : undefined;
  }

  // --- Node dragging

  private onNodePointerDown(event: PointerEvent, node: FlowNode) {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (
      target.closest('.handle') ||
      target.closest('button') ||
      target.closest('input') ||
      target.closest('a')
    ) {
      return;
    }
    event.preventDefault();
    const element = event.currentTarget as HTMLElement;
    element.focus({ preventScroll: true });
    this.nodeDrag = {
      id: node.id,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      origin: { ...node.position },
      moved: false,
      element,
    };
    try {
      element.setPointerCapture(event.pointerId);
    } catch {
      // Synthetic or already released pointers cannot be captured.
    }
    element.addEventListener('pointermove', this.onNodePointerMove);
    element.addEventListener('pointerup', this.onNodePointerUp);
    element.addEventListener('pointercancel', this.onNodePointerCancel);
  }

  private onNodePointerMove = (event: PointerEvent) => {
    const drag = this.nodeDrag;
    if (!drag || event.pointerId !== drag.pointerId) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    drag.moved = true;
    this.draggingNodeId = drag.id;
    const position = {
      x: drag.origin.x + dx / this.zoom,
      y: drag.origin.y + dy / this.zoom,
    };
    this.moveNode(drag.id, position);
    this.emit<FlowNodeMoveDetail>('node-drag', { id: drag.id, position });
  };

  private onNodePointerUp = (event: PointerEvent) => {
    if (!this.nodeDrag || event.pointerId !== this.nodeDrag.pointerId) return;
    this.endNodeDrag(true);
  };

  private onNodePointerCancel = (event: PointerEvent) => {
    if (!this.nodeDrag || event.pointerId !== this.nodeDrag.pointerId) return;
    this.endNodeDrag(true);
  };

  /** Ends the press on a node: a drag fires `node-drag-end`, a press without movement selects. */
  private endNodeDrag(notify: boolean) {
    const drag = this.nodeDrag;
    if (!drag) return;
    this.nodeDrag = undefined;
    this.draggingNodeId = null;
    const { element } = drag;
    element.removeEventListener('pointermove', this.onNodePointerMove);
    element.removeEventListener('pointerup', this.onNodePointerUp);
    element.removeEventListener('pointercancel', this.onNodePointerCancel);
    try {
      if (element.hasPointerCapture(drag.pointerId)) {
        element.releasePointerCapture(drag.pointerId);
      }
    } catch {
      // The pointer is already gone.
    }
    if (!notify) return;
    if (drag.moved) {
      const position = this.nodePosition(drag.id);
      if (position) {
        this.emit<FlowNodeMoveDetail>('node-drag-end', {
          id: drag.id,
          position,
        });
      }
    } else {
      const node = this.nodes.find(n => n.id === drag.id);
      if (node) this.selectNode(node);
    }
  }

  // --- Keyboard

  private onNodeKeyDown(event: KeyboardEvent, node: FlowNode) {
    // Keys typed into controls inside a custom node are theirs.
    if (event.target !== event.currentTarget) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.selectNode(node);
      return;
    }
    const step = event.shiftKey ? LARGE_KEY_STEP : KEY_STEP;
    const offsets: Record<string, FlowPoint> = {
      ArrowLeft: { x: -step, y: 0 },
      ArrowRight: { x: step, y: 0 },
      ArrowUp: { x: 0, y: -step },
      ArrowDown: { x: 0, y: step },
    };
    const offset = offsets[event.key];
    if (!offset) return;
    event.preventDefault();
    const position = {
      x: node.position.x + offset.x,
      y: node.position.y + offset.y,
    };
    this.moveNode(node.id, position);
    this.emit<FlowNodeMoveDetail>('node-drag-end', { id: node.id, position });
  }

  // --- Handles

  private getNodeInputs(node: FlowNode): FlowHandlePosition[] {
    if (node.inputs && Array.isArray(node.inputs)) {
      return node.inputs;
    }
    if (
      node.data &&
      typeof node.data === 'object' &&
      Array.isArray((node.data as any).inputs)
    ) {
      return (node.data as any).inputs;
    }
    return ['left'];
  }

  private getNodeOutputs(node: FlowNode): FlowHandlePosition[] {
    if (node.outputs && Array.isArray(node.outputs)) {
      return node.outputs;
    }
    if (
      node.data &&
      typeof node.data === 'object' &&
      Array.isArray((node.data as any).outputs)
    ) {
      return (node.data as any).outputs;
    }
    return ['right'];
  }

  private getHandleCoordinates(
    node: FlowNode,
    position: FlowHandlePosition,
    dim: { width: number; height: number },
  ): FlowPoint {
    const { x, y } = node.position;
    const w = dim.width;
    const h = dim.height;

    switch (position) {
      case 'top':
        return { x: x + w / 2, y };
      case 'bottom':
        return { x: x + w / 2, y: y + h };
      case 'left':
        return { x, y: y + h / 2 };
      case 'right':
      default:
        return { x: x + w, y: y + h / 2 };
    }
  }

  // --- Connection dragging

  private onHandlePointerDown(
    event: PointerEvent,
    node: FlowNode,
    position: FlowHandlePosition,
  ) {
    if (event.button !== 0) return;
    event.stopPropagation();
    event.preventDefault();

    const element = event.currentTarget as HTMLElement;
    const dim = this.nodeDimensions.get(node.id) || DEFAULT_SIZE;
    this.draggingSourceId = node.id;
    this.draggingSourceHandle = position;
    this.connectionStart = this.getHandleCoordinates(node, position, dim);
    this.connectionEnd = { ...this.connectionStart };
    this.isDrawingConnection = true;

    this.connectionDrag = { pointerId: event.pointerId, element };
    try {
      element.setPointerCapture(event.pointerId);
    } catch {
      // Synthetic or already released pointers cannot be captured.
    }
    element.addEventListener('pointermove', this.onConnectionPointerMove);
    element.addEventListener('pointerup', this.onConnectionPointerUp);
    element.addEventListener('pointercancel', this.onConnectionPointerCancel);
  }

  private onConnectionPointerMove = (event: PointerEvent) => {
    if (!this.isDrawingConnection) return;
    if (event.pointerId !== this.connectionDrag?.pointerId) return;
    this.connectionEnd = this.toCanvasPoint(event.clientX, event.clientY);
  };

  private onConnectionPointerUp = (event: PointerEvent) => {
    if (!this.isDrawingConnection) return;
    if (event.pointerId !== this.connectionDrag?.pointerId) return;
    const source = this.draggingSourceId;
    const sourceHandle = this.draggingSourceHandle;
    this.cancelConnection();

    // With the pointer captured, the event targets the source handle: hit-test what is under it.
    const target = this.shadowRoot?.elementFromPoint(
      event.clientX,
      event.clientY,
    );
    const inputHandle = target?.closest('.handle-input');
    if (!inputHandle || !source || !sourceHandle) return;
    const targetNodeId = inputHandle.getAttribute('data-node-id');
    const targetHandle = inputHandle.getAttribute(
      'data-position',
    ) as FlowHandlePosition;
    if (targetNodeId && targetNodeId !== source) {
      this.emit<FlowConnectDetail>('connect', {
        source,
        target: targetNodeId,
        sourceHandle,
        targetHandle,
      });
    }
  };

  private onConnectionPointerCancel = () => {
    this.cancelConnection();
  };

  /** Stops drawing a connection and releases its pointer. */
  private cancelConnection() {
    const drag = this.connectionDrag;
    this.connectionDrag = undefined;
    this.isDrawingConnection = false;
    this.draggingSourceId = null;
    this.draggingSourceHandle = null;
    if (!drag) return;
    const { element } = drag;
    element.removeEventListener('pointermove', this.onConnectionPointerMove);
    element.removeEventListener('pointerup', this.onConnectionPointerUp);
    element.removeEventListener(
      'pointercancel',
      this.onConnectionPointerCancel,
    );
    try {
      if (element.hasPointerCapture(drag.pointerId)) {
        element.releasePointerCapture(drag.pointerId);
      }
    } catch {
      // The pointer is already gone.
    }
  }

  /** Converts client coordinates to canvas coordinates. */
  private toCanvasPoint(clientX: number, clientY: number): FlowPoint {
    const workspaceEl = this.shadowRoot?.querySelector('.flow-workspace');
    if (!workspaceEl) return { ...this.connectionEnd };
    const rect = workspaceEl.getBoundingClientRect();
    const bounds = this.getBounds();
    return {
      x: bounds.minX - this.padding + (clientX - rect.left) / this.zoom,
      y: bounds.minY - this.padding + (clientY - rect.top) / this.zoom,
    };
  }

  // --- Path builders

  private getRoundedPath(points: FlowPoint[], radius = 12) {
    if (points.length < 3) {
      return points
        .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
        .join(' ');
    }

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length - 1; i += 1) {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1];

      const dxp = prev.x - curr.x;
      const dyp = prev.y - curr.y;
      const lenp = Math.hypot(dxp, dyp);

      const dxn = next.x - curr.x;
      const dyn = next.y - curr.y;
      const lenn = Math.hypot(dxn, dyn);

      // A zero-length leg has no corner to round.
      const r =
        lenp === 0 || lenn === 0 ? 0 : Math.min(radius, lenp / 2, lenn / 2);

      if (r > 0) {
        const x1 = curr.x + (dxp / lenp) * r;
        const y1 = curr.y + (dyp / lenp) * r;
        const x2 = curr.x + (dxn / lenn) * r;
        const y2 = curr.y + (dyn / lenn) * r;

        path += ` L ${x1} ${y1} Q ${curr.x} ${curr.y} ${x2} ${y2}`;
      } else {
        path += ` L ${curr.x} ${curr.y}`;
      }
    }

    const last = points[points.length - 1];
    path += ` L ${last.x} ${last.y}`;
    return path;
  }

  private getSmoothStepPath(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    sourceHandle: FlowHandlePosition = 'right',
    targetHandle: FlowHandlePosition = 'left',
  ) {
    const isSourceHorizontal =
      sourceHandle === 'left' || sourceHandle === 'right';
    const isTargetHorizontal =
      targetHandle === 'left' || targetHandle === 'right';

    let points: FlowPoint[];

    if (isSourceHorizontal && isTargetHorizontal) {
      const midX = x1 + (x2 - x1) / 2;
      points = [
        { x: x1, y: y1 },
        { x: midX, y: y1 },
        { x: midX, y: y2 },
        { x: x2, y: y2 },
      ];
    } else if (!isSourceHorizontal && !isTargetHorizontal) {
      const midY = y1 + (y2 - y1) / 2;
      points = [
        { x: x1, y: y1 },
        { x: x1, y: midY },
        { x: x2, y: midY },
        { x: x2, y: y2 },
      ];
    } else if (isSourceHorizontal && !isTargetHorizontal) {
      points = [
        { x: x1, y: y1 },
        { x: x2, y: y1 },
        { x: x2, y: y2 },
      ];
    } else {
      points = [
        { x: x1, y: y1 },
        { x: x1, y: y2 },
        { x: x2, y: y2 },
      ];
    }

    return this.getRoundedPath(points, 12);
  }

  private getBezierPath(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    sourceHandle: FlowHandlePosition = 'right',
    targetHandle: FlowHandlePosition = 'left',
  ) {
    const normals: Record<FlowHandlePosition, FlowPoint> = {
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 },
      top: { x: 0, y: -1 },
      bottom: { x: 0, y: 1 },
    };

    const sNormal = normals[sourceHandle] || { x: 1, y: 0 };
    const tNormal = normals[targetHandle] || { x: -1, y: 0 };

    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.hypot(dx, dy);
    const offset = Math.max(dist / 2, 50);

    const cx1 = x1 + sNormal.x * offset;
    const cy1 = y1 + sNormal.y * offset;
    const cx2 = x2 + tNormal.x * offset;
    const cy2 = y2 + tNormal.y * offset;

    return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
  }

  private getStraightPath(x1: number, y1: number, x2: number, y2: number) {
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  }

  private drawPath(
    sourceId: string,
    targetId: string,
    type?: 'smoothstep' | 'bezier' | 'straight',
    sourceHandle?: FlowHandlePosition,
    targetHandle?: FlowHandlePosition,
  ) {
    const sourceNode = this.nodes.find(n => n.id === sourceId);
    const targetNode = this.nodes.find(n => n.id === targetId);
    if (!sourceNode || !targetNode) return '';

    const sDim = this.nodeDimensions.get(sourceId) || DEFAULT_SIZE;
    const tDim = this.nodeDimensions.get(targetId) || DEFAULT_SIZE;

    const sHandle =
      sourceHandle || this.getNodeOutputs(sourceNode)[0] || 'right';
    const tHandle = targetHandle || this.getNodeInputs(targetNode)[0] || 'left';

    const start = this.getHandleCoordinates(sourceNode, sHandle, sDim);
    const end = this.getHandleCoordinates(targetNode, tHandle, tDim);

    const edgeType = type || 'smoothstep';
    if (edgeType === 'bezier') {
      return this.getBezierPath(
        start.x,
        start.y,
        end.x,
        end.y,
        sHandle,
        tHandle,
      );
    }
    if (edgeType === 'straight') {
      return this.getStraightPath(start.x, start.y, end.x, end.y);
    }
    return this.getSmoothStepPath(
      start.x,
      start.y,
      end.x,
      end.y,
      sHandle,
      tHandle,
    );
  }

  /** The box around every node, in canvas coordinates. */
  private getBounds() {
    if (this.nodes.length === 0) {
      return { minX: 0, minY: 0, maxX: 400, maxY: 300 };
    }
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    this.nodes.forEach(node => {
      const dim = this.nodeDimensions.get(node.id) || DEFAULT_SIZE;
      const { x, y } = node.position;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x + dim.width > maxX) maxX = x + dim.width;
      if (y + dim.height > maxY) maxY = y + dim.height;
    });

    return { minX, minY, maxX, maxY };
  }

  private isCustomNode(node: FlowNode) {
    if (node.data instanceof HTMLElement) {
      return true;
    }
    return Boolean(
      node.data &&
      typeof node.data === 'object' &&
      (node.data as any).element instanceof HTMLElement,
    );
  }

  /** The node's accessible name: its label, else its id. */
  private nodeLabel(node: FlowNode): string {
    if (node.data instanceof HTMLElement) {
      return node.data.getAttribute('aria-label') || node.id;
    }
    return (node.data as { label?: string } | undefined)?.label || node.id;
  }

  // ── Render helpers

  private renderNodeContent(node: FlowNode) {
    if (node.data instanceof HTMLElement) {
      return node.data;
    }
    if (
      node.data &&
      typeof node.data === 'object' &&
      (node.data as any).element instanceof HTMLElement
    ) {
      return (node.data as any).element;
    }
    const label =
      node.data && typeof node.data === 'object'
        ? (node.data as any).label || node.id
        : String(node.data);
    return html`
      <div class="flow-node-default-card">
        <div class="flow-node-title">${label}</div>
      </div>
    `;
  }

  private renderNode(node: FlowNode) {
    const inputs = this.getNodeInputs(node);
    const outputs = this.getNodeOutputs(node);
    const selected = this.selected === node.id;
    return html`
      <div
        class=${classMap({
          'flow-node': true,
          'flow-node-custom': this.isCustomNode(node),
          'is-dragging': this.draggingNodeId === node.id,
          'is-selected': selected,
        })}
        data-id=${node.id}
        role="group"
        tabindex="0"
        aria-label=${this.nodeLabel(node)}
        aria-current=${selected ? 'true' : nothing}
        style="position: absolute; left: ${node.position.x}px; top: ${node
          .position.y}px;"
        @pointerdown=${(e: PointerEvent) => this.onNodePointerDown(e, node)}
        @keydown=${(e: KeyboardEvent) => this.onNodeKeyDown(e, node)}
      >
        ${inputs.map(
          pos => html`
            <div
              class="handle handle-input handle-position-${pos}"
              data-node-id=${node.id}
              data-position=${pos}
            ></div>
          `,
        )}

        <div class="flow-node-content">${this.renderNodeContent(node)}</div>

        ${outputs.map(
          pos => html`
            <div
              class="handle handle-output handle-position-${pos}"
              data-node-id=${node.id}
              data-position=${pos}
              @pointerdown=${(e: PointerEvent) =>
                this.onHandlePointerDown(e, node, pos)}
            ></div>
          `,
        )}
      </div>
    `;
  }

  private renderEdges() {
    return this.edges.map(edge => {
      const pathString = this.drawPath(
        edge.source,
        edge.target,
        edge.type,
        edge.sourceHandle,
        edge.targetHandle,
      );
      const color =
        edge.color || 'var(--flow-line-color, var(--color-outline))';
      const variant = edge.variant || 'solid';
      return svg`
        <path
          class="${classMap({
            'flow-edge': true,
            'variant-dashed':
              variant === 'dashed' || variant === 'animated-dashed',
            'variant-animated-dashed': variant === 'animated-dashed',
          })}"
          d="${pathString}"
          stroke="${color}"
          fill="none"
          stroke-width="2"
          marker-end="url(#arrowhead)"
        />
      `;
    });
  }

  private renderConnectionPreview() {
    if (!this.isDrawingConnection || !this.draggingSourceHandle) {
      return nothing;
    }
    return svg`
      <path
        class="flow-edge-preview"
        d="${this.getBezierPath(
          this.connectionStart.x,
          this.connectionStart.y,
          this.connectionEnd.x,
          this.connectionEnd.y,
          this.draggingSourceHandle,
          OPPOSITE[this.draggingSourceHandle],
        )}"
        stroke="var(--flow-hover-color, var(--color-primary))"
        fill="none"
        stroke-width="2"
        stroke-dasharray="4 4"
      />
    `;
  }

  // ── Render

  protected render() {
    const bounds = this.getBounds();
    const viewBoxX = bounds.minX - this.padding;
    const viewBoxY = bounds.minY - this.padding;
    const viewBoxWidth = bounds.maxX - bounds.minX + 2 * this.padding;
    const viewBoxHeight = bounds.maxY - bounds.minY + 2 * this.padding;

    const svgViewBox = `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`;

    return html`
      <div class="flow-container">
        <div
          class="flow-scroller"
          style="width: ${viewBoxWidth * this.zoom}px; height: ${viewBoxHeight *
          this.zoom}px; position: relative;"
        >
          <div
            class="flow-workspace"
            style="transform: scale(${this
              .zoom}); transform-origin: top left; width: ${viewBoxWidth}px; height: ${viewBoxHeight}px; position: absolute; left: 0; top: 0;"
          >
            <svg class="flow-svg" viewBox="${svgViewBox}" aria-hidden="true">
              <defs>
                <pattern
                  id="dot-grid"
                  width="20"
                  height="20"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="1" cy="1" r="1" />
                </pattern>
                <marker
                  id="arrowhead"
                  markerWidth="8"
                  markerHeight="8"
                  refX="7"
                  refY="4"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 8 4, 0 8"
                    fill="var(--flow-line-color, var(--color-outline))"
                  />
                </marker>
              </defs>

              <rect
                x="${viewBoxX}"
                y="${viewBoxY}"
                width="${viewBoxWidth}"
                height="${viewBoxHeight}"
                fill="url(#dot-grid)"
              />

              ${this.renderEdges()} ${this.renderConnectionPreview()}
            </svg>

            <div
              class="flow-nodes"
              style="position: absolute; left: ${-viewBoxX}px; top: ${-viewBoxY}px;"
            >
              ${repeat(
                this.nodes,
                node => node.id,
                node => this.renderNode(node),
              )}
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
