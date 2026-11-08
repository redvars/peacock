import { html, nothing, svg, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { repeat } from 'lit/directives/repeat.js';
import IndividualComponent from '@/IndividualComponent.js';
import { deprecate } from '@/__internal/utils/deprecate.js';
import { DiagramCanvasElement } from '@/__internal/diagram/canvas-base.js';
import { MeasureController } from '@/__internal/diagram/measure-controller.js';
import {
  anchorOnRect,
  boundsOf,
  edgeGeometry,
  inflateRect,
  nearestInDirection,
  OPPOSITE_SIDE,
  rectFromPoints,
  rectsIntersect,
  type EdgeGeometry,
} from '@/__internal/diagram/geometry.js';
import {
  markerInset,
  markerShapes,
  markerTransform,
} from '@/__internal/diagram/markers.js';
import { History } from '@/__internal/diagram/history.js';
import { DiagramSelection } from '@/__internal/diagram/selection.js';
import {
  animateOut,
  easeOutCubic,
  prefersReducedMotion,
  tween,
} from '@/__internal/diagram/motion.js';
import type { DiagramOverview } from '@/__internal/diagram/host.js';
import type {
  DiagramConnector,
  DiagramMarker,
  DiagramPoint,
  DiagramRect,
  DiagramStartPosition,
  DiagramView,
  DiagramViewportDetail,
} from '@/__internal/diagram/types.js';
import styles from './diagram.scss';

// The canvas types every diagram shares, public under their own names.
export type {
  DiagramConnector,
  DiagramMarker,
  DiagramPoint,
  DiagramStartPosition,
  DiagramView,
  DiagramViewportDetail,
};

export type DiagramStrokeVariant = 'solid' | 'dashed' | 'animated-dashed';

export type DiagramHandlePosition = 'top' | 'left' | 'bottom' | 'right';

/** How an edge is drawn. `smoothstep` is the deprecated name of `elbow`. */
export type DiagramEdgeType = DiagramConnector | 'smoothstep';

export type DiagramIntent = 'info' | 'success' | 'warning' | 'danger';

/** A connection point on a node's side. */
export interface DiagramPort {
  /** Unique within the node. Edges name it in `sourceHandle` or `targetHandle`. */
  id: string;
  side: DiagramHandlePosition;
  /** `source` ports start connections, `target` ports receive them, `both` (default) do both. */
  type?: 'source' | 'target' | 'both';
  /** Shown as a tooltip. */
  label?: string;
  /** Position along the side, 0 to 1. Ports on the same side spread evenly by default. */
  offset?: number;
}

export interface DiagramNode {
  id: string;
  position: { x: number; y: number };
  /** Title of the built-in card. */
  headline?: string;
  /** Second line of the built-in card. */
  supportingText?: string;
  /** Material Symbols name shown on the built-in card. */
  icon?: string;
  /** Colours the built-in card's icon and border. */
  intent?: DiagramIntent;
  /** Connection points. Default: a target port on the left and a source port on the right. */
  ports?: DiagramPort[];
  /** Keeps the node from being moved or deleted by the person. */
  locked?: boolean;
  /** @deprecated Use `ports` with `type: 'target'`. */
  inputs?: DiagramHandlePosition[];
  /** @deprecated Use `ports` with `type: 'source'`. */
  outputs?: DiagramHandlePosition[];
  /**
   * Your own data, kept with the node. Rendering from `data` is deprecated: put custom content in
   * an element with `slot="node:<id>"` and use `headline` instead of `data.label`.
   */
  data?:
    | {
        label?: string;
        element?: HTMLElement;
        [key: string]: unknown;
      }
    | HTMLElement;
}

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  /** Id of the source port. A side name works for nodes without `ports`. */
  sourceHandle?: string;
  /** Id of the target port. A side name works for nodes without `ports`. */
  targetHandle?: string;
  /** How the edge is drawn; defaults to the diagram's `connector`. */
  type?: DiagramEdgeType;
  variant?: DiagramStrokeVariant;
  /** Shown as a pill at the middle of the edge. */
  label?: string;
  /** Any CSS colour. */
  color?: string;
  /** Marker at the source end. Default `none`. */
  markerStart?: DiagramMarker;
  /** Marker at the target end. Default `arrow`. */
  markerEnd?: DiagramMarker;
}

/** Detail of `node-drag` and `node-drag-end`. */
export interface DiagramNodeMoveDetail {
  id: string;
  position: DiagramPoint;
}

/** Detail of `select`. */
export interface DiagramSelectDetail {
  id: string;
  kind: 'node' | 'edge';
  node?: DiagramNode;
  edge?: DiagramEdge;
}

/** Detail of `connect`. */
export interface DiagramConnectDetail {
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
}

export type DiagramChangeReason =
  | 'move'
  | 'connect'
  | 'reconnect'
  | 'delete'
  | 'paste'
  | 'undo'
  | 'redo';

/** Detail of `change`. */
export interface DiagramChangeDetail {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  reason: DiagramChangeReason;
}

/** Detail of `delete`. */
export interface DiagramDeleteDetail {
  nodes: string[];
  edges: string[];
}

interface ResolvedPort {
  id: string;
  side: DiagramHandlePosition;
  type: 'source' | 'target' | 'both';
  label?: string;
  offset: number;
}

interface Snapshot {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

interface EdgeRender {
  edge: DiagramEdge;
  geometry: EdgeGeometry;
  start: DiagramPoint;
  end: DiagramPoint;
  markerStart: DiagramMarker;
  markerEnd: DiagramMarker;
}

/** Canvas pixels an arrow key moves the focused node; matches the dot grid. */
const KEY_STEP = 20;

/** Canvas pixels Shift + arrow key moves the focused node. */
const LARGE_KEY_STEP = 100;

/** Pointer travel, in screen pixels, before a press on a node becomes a drag. */
const DRAG_THRESHOLD = 3;

/** Screen pixels within which a dragged connection snaps to a port. */
const SNAP_DISTANCE = 28;

/** Screen pixels within which a dragged node snaps to another node's edge or centre. */
const GUIDE_DISTANCE = 6;

/** Size assumed for a node before it has been measured. */
const DEFAULT_SIZE = { width: 150, height: 70 };

/** Screen pixels rendered beyond the viewport, so panning does not reveal empty space. */
const CULL_MARGIN = 200;

/** Elements inside a node that handle their own pointer and keyboard input. */
const INTERACTIVE =
  '.handle, button, input, select, textarea, a, [contenteditable], wc-button, wc-icon-button, wc-input, wc-select, wc-checkbox, wc-switch, wc-link';

/** Shared between diagrams on a page, like the system clipboard. */
let clipboard: Snapshot | undefined;

/**
 * @label Diagram
 * @tag wc-diagram
 * @rawTag diagram
 * @summary An infinite canvas of nodes and connections that the person pans, zooms and edits, for state machines, process maps and node editors.
 *
 * @overview
 * <p>Set <code>nodes</code> and <code>edges</code> as properties. A node shows a built-in card with
 * <code>headline</code>, <code>supportingText</code> and <code>icon</code>, or your own content in an
 * element with <code>slot="node:&lt;id&gt;"</code>. Nodes connect through <code>ports</code> on their
 * sides; edges are drawn as rounded elbows by default (<code>connector</code>), with an optional label
 * and markers at each end.</p>
 * <p>The canvas is infinite: drag the background, hold Space and drag, use the middle button or a
 * trackpad to pan, and hold Ctrl or Command and scroll, or pinch, to zoom. It opens at
 * <code>start-position</code> (<code>fit</code>, <code>origin</code> or <code>first</code>) or at an exact
 * <code>start-view</code>; Home or <code>home()</code> flies back there, Shift+1 or <code>fit()</code> fits
 * all content, and a "Back to content" button appears when everything is out of view. Read and set
 * the camera with <code>view</code>, and save it from <code>viewport-change</code>. Add
 * <code>wc-diagram-controls</code> and <code>wc-diagram-minimap</code> in the <code>controls</code> and
 * <code>minimap</code> slots.</p>
 * <p>By default nodes can be dragged and connections drawn; the diagram fires <code>node-drag-end</code>
 * and <code>connect</code> and leaves edges to you. <code>editable</code> turns it into a full editor:
 * it adds the edge on <code>connect</code> unless you cancel the event, selects edges, draws a marquee
 * with Shift + drag, moves several nodes at once, snaps to other nodes (and to the grid with
 * <code>snap-to-grid</code>), deletes with Delete, copies and pastes, and undoes with Ctrl+Z. Every
 * committed edit fires <code>change</code>. <code>readonly</code> keeps everything in place.</p>
 * <p>The diagram never mutates the objects you pass: edits assign new <code>nodes</code> and
 * <code>edges</code> arrays. Each node is focusable and named by its headline. Arrow keys move the
 * focused node by 20px (Shift: 100px), Alt + arrow moves focus to the nearest node in that
 * direction, and Enter or Space selects it. Arrow keys follow the canvas axes and are not mirrored in
 * right-to-left layouts.</p>
 * <p>This component was called <code>wc-flow</code> before 4.0. That tag still works as a
 * deprecated alias until 5.0.</p>
 *
 * @example
 * ```html
 * <wc-diagram id="my-diagram" style="height: 400px">
 *   <wc-diagram-controls slot="controls"></wc-diagram-controls>
 *   <wc-diagram-minimap slot="minimap"></wc-diagram-minimap>
 * </wc-diagram>
 * <script>
 *   const diagram = document.getElementById('my-diagram');
 *   diagram.nodes = [
 *     { id: 'new', position: { x: 0, y: 0 }, headline: 'New', icon: 'fiber_new' },
 *     { id: 'done', position: { x: 300, y: 0 }, headline: 'Done', icon: 'task_alt' }
 *   ];
 *   diagram.edges = [{ id: 'e1', source: 'new', target: 'done', label: 'finish' }];
 * </script>
 * ```
 *
 * @slot controls - A `wc-diagram-controls`, shown at the bottom start corner.
 * @slot minimap - A `wc-diagram-minimap`, shown at the bottom end corner.
 * @slot node:<id> - Custom content for the node with that id, in place of the built-in card.
 *
 * @fires {CustomEvent<DiagramNodeMoveDetail>} node-drag - While a node is dragged. Detail contains `{ id, position }`.
 * @fires {CustomEvent<DiagramNodeMoveDetail>} node-drag-end - Once when a drag ends, and after each keyboard move. Detail contains `{ id, position }`.
 * @fires {CustomEvent<DiagramSelectDetail>} select - A node or edge was chosen with a click, Enter or Space. Detail contains `{ id, kind, node, edge }`.
 * @fires {CustomEvent<DiagramConnectDetail>} connect - A connection was dragged onto a port. With `editable`, the diagram adds the edge unless the event is canceled. Detail contains `{ source, target, sourceHandle, targetHandle }`.
 * @fires {CustomEvent<DiagramDeleteDetail>} delete - Before nodes and edges are deleted with `editable`. Cancel it to keep them. Detail contains `{ nodes, edges }` (ids).
 * @fires {CustomEvent<DiagramChangeDetail>} change - After a committed edit. Detail contains `{ nodes, edges, reason }`.
 * @fires {CustomEvent<DiagramViewportDetail>} viewport-change - Once per frame while the camera moves and once when it settles. Detail contains `{ x, y, zoom, settled }`.
 *
 * @cssprop --diagram-background - Canvas background. Defaults to surface-container-lowest.
 * @cssprop --diagram-dot-color - Colour of the grid dots. Defaults to outline-variant.
 * @cssprop --diagram-line-color - Colour of edges at rest. Defaults to a mix of primary and outline-variant.
 * @cssprop --diagram-hover-color - Colour of hovered and selected edges, ports and nodes. Defaults to primary.
 * @cssprop --diagram-port-size - Diameter of a port ring. Defaults to 10px.
 * @cssprop --diagram-node-background - Background of the built-in card.
 * @tags data
 */
@IndividualComponent
export class Diagram extends DiagramCanvasElement {
  // ── Static

  static styles = [styles];

  // ── Properties

  /** Nodes to draw. Replaced with a new array, never mutated, when the person edits. */
  @property({ type: Array })
  nodes: DiagramNode[] = [];

  /** Connections between node ports. */
  @property({ type: Array })
  edges: DiagramEdge[] = [];

  /** Id of the selected node or edge. With several selected, the last one chosen. */
  @property({ type: String, reflect: true })
  selected: string = '';

  /** How edges without a `type` are drawn. */
  @property({ type: String, reflect: true })
  connector: DiagramConnector = 'elbow';

  /** Snaps dragged nodes to the grid (`grid-size`). */
  @property({ type: Boolean, attribute: 'snap-to-grid' })
  snapToGrid = false;

  // ── State

  @state()
  private _connection?: {
    mode: 'new' | 'reconnect';
    edgeId?: string;
    /** Which end of the edge moves while reconnecting. */
    end: 'source' | 'target';
    fixedNode: string;
    fixedPort: ResolvedPort;
    fixedPoint: DiagramPoint;
    pointer: DiagramPoint;
    snap?: { nodeId: string; port: ResolvedPort; point: DiagramPoint };
  };

  @state()
  private _marquee?: { start: DiagramPoint; end: DiagramPoint };

  @state()
  private _guides: { x1: number; y1: number; x2: number; y2: number }[] = [];

  @state()
  private _draggingIds: string[] = [];

  @state()
  private _announcement = '';

  @state()
  private _ripple = '';

  // ── Private fields

  @query('.diagram-viewport')
  private readonly _viewportEl?: HTMLElement;

  private readonly selection = new DiagramSelection(() => this.requestUpdate());

  private readonly history = new History<Snapshot>();

  private readonly measure = new MeasureController(this, {
    elements: () => this.nodeElements(),
    fallback: DEFAULT_SIZE,
  });

  private pasteCount = 0;

  private focusedId = '';

  private positionOverrides = new Map<string, DiagramPoint>();

  /** Key events a node or edge already handled, so the canvas does not act on them again. */
  private handledKeys = new WeakSet<Event>();

  private stopRestoreTween?: () => void;

  private rippleTimer?: ReturnType<typeof setTimeout>;

  private connectionFrame = 0;

  private nodeDrag?: {
    pointerId: number;
    startX: number;
    startY: number;
    primary: string;
    ids: string[];
    origins: Map<string, DiagramPoint>;
    before: Snapshot;
    moved: boolean;
    movable: boolean;
    additive: boolean;
    element: HTMLElement;
  };

  private connectionDrag?: { pointerId: number; element: HTMLElement };

  private marqueeDrag?: {
    pointerId: number;
    element: HTMLElement;
    origin: DiagramRect;
  };

  // ── Lifecycle

  disconnectedCallback() {
    super.disconnectedCallback();
    this.endNodeDrag(false);
    this.cancelConnection();
    this.endMarquee();
    this.stopRestoreTween?.();
    cancelAnimationFrame(this.connectionFrame);
    clearTimeout(this.rippleTimer);
  }

  protected willUpdate(changed: PropertyValues<this>) {
    super.willUpdate(changed);
    if (changed.has('nodes')) {
      this.warnLegacyNodes();
      this.selection.retain('node', new Set(this.nodes.map(n => n.id)));
      this.measure.retain(new Set(this.nodes.map(n => n.id)));
    }
    if (changed.has('edges')) {
      if (this.edges.some(e => e.type === 'smoothstep')) {
        deprecate(
          this.localName,
          'edge `type: "smoothstep"`',
          '`type: "elbow"`',
        );
      }
      this.selection.retain('edge', new Set(this.edges.map(e => e.id)));
    }
    if (changed.has('selected')) this.syncSelectedProperty();
  }

  // ── Public API

  /** Whether `undo()` has something to undo. */
  get canUndo(): boolean {
    return this.history.canUndo;
  }

  /** Whether `redo()` has something to redo. */
  get canRedo(): boolean {
    return this.history.canRedo;
  }

  /** Ids of the selected nodes. */
  get selectedNodes(): string[] {
    return this.selection.ids('node');
  }

  /** Ids of the selected edges. */
  get selectedEdges(): string[] {
    return this.selection.ids('edge');
  }

  undo() {
    const previous = this.history.undo(this.snapshot());
    if (previous) this.restore(previous, 'undo');
  }

  redo() {
    const next = this.history.redo(this.snapshot());
    if (next) this.restore(next, 'redo');
  }

  /** Forgets the undo and redo history, for example after saving. */
  clearHistory() {
    this.history.clear();
    this.listeners.notify();
  }

  /** Selects every node and edge. */
  selectAll() {
    this.selection.set([
      ...this.nodes.map(n => ({ kind: 'node' as const, id: n.id })),
      ...this.edges.map(e => ({ kind: 'edge' as const, id: e.id })),
    ]);
  }

  /** Deletes the selected nodes and edges (and edges attached to deleted nodes). Needs `editable`. */
  deleteSelection() {
    if (!this.editable) return;
    const nodeIds = this.selection
      .ids('node')
      .filter(id => !this.nodes.find(n => n.id === id)?.locked);
    const nodeSet = new Set(nodeIds);
    const edgeIds = new Set(this.selection.ids('edge'));
    for (const e of this.edges) {
      if (nodeSet.has(e.source) || nodeSet.has(e.target)) edgeIds.add(e.id);
    }
    if (nodeSet.size === 0 && edgeIds.size === 0) return;
    const allowed = this.emit<DiagramDeleteDetail>(
      'delete',
      { nodes: nodeIds, edges: [...edgeIds] },
      true,
    );
    if (!allowed) return;
    const before = this.snapshot();
    const leaving = nodeIds
      .map(id => this.nodeElement(id))
      .filter((el): el is HTMLElement => !!el);
    animateOut(leaving, () => {
      this.history.push(before);
      this.nodes = this.nodes.filter(n => !nodeSet.has(n.id));
      this.edges = this.edges.filter(e => !edgeIds.has(e.id));
      this.selection.clear();
      this.selected = '';
      this.announce(this.i18n.t('diagramDeleted')(nodeSet.size + edgeIds.size));
      this.emitChange('delete');
    });
  }

  // ── Canvas hooks

  protected viewportElement() {
    return this._viewportEl;
  }

  protected overviewItems(): DiagramOverview['items'] {
    return this.nodes.map(n => ({
      ...this.nodeRect(n),
      selected: this.selection.has('node', n.id),
    }));
  }

  protected itemRect(id: string): DiagramRect | undefined {
    const node = this.nodes.find(n => n.id === id);
    return node ? this.nodeRect(node) : undefined;
  }

  protected firstItemRect(): DiagramRect | undefined {
    return this.nodes[0] ? this.nodeRect(this.nodes[0]) : undefined;
  }

  protected onBackgroundPointerDown(event: PointerEvent): boolean {
    return this.startMarquee(event);
  }

  protected onBackgroundClick() {
    this.clearSelection();
  }

  // ── Private methods: data

  private emitChange(reason: DiagramChangeReason) {
    this.emit<DiagramChangeDetail>('change', {
      nodes: this.nodes,
      edges: this.edges,
      reason,
    });
    this.listeners.notify();
  }

  private snapshot(): Snapshot {
    return { nodes: this.nodes, edges: this.edges };
  }

  private announce(message: string) {
    this._announcement = '';
    requestAnimationFrame(() => {
      this._announcement = message;
    });
  }

  private warnLegacyNodes() {
    for (const node of this.nodes) {
      if (node.inputs || node.outputs) {
        deprecate(this.localName, 'node `inputs` and `outputs`', '`ports`');
      }
      if (node.data instanceof HTMLElement || node.data?.element) {
        deprecate(
          this.localName,
          'an element in node `data`',
          'an element with `slot="node:<id>"`',
        );
      } else if (node.data && 'label' in node.data && !node.headline) {
        deprecate(this.localName, 'node `data.label`', '`headline`');
      }
    }
  }

  /** Keeps the selection in step when the app sets `selected`. */
  private syncSelectedProperty() {
    const id = this.selected;
    if (!id) {
      if (this.selection.size) this.selection.clear();
      return;
    }
    const kind = this.nodes.some(n => n.id === id) ? 'node' : 'edge';
    if (!this.selection.has(kind, id)) this.selection.set([{ kind, id }]);
  }

  private nodePosition(node: DiagramNode): DiagramPoint {
    return this.positionOverrides.get(node.id) ?? node.position;
  }

  private nodeRect(node: DiagramNode): DiagramRect {
    const { x, y } = this.nodePosition(node);
    const size = this.measure.size(node.id);
    return { x, y, width: size.width, height: size.height };
  }

  protected contentBounds(): DiagramRect | undefined {
    return boundsOf(this.nodes.map(n => this.nodeRect(n)));
  }

  protected selectionRects(): DiagramRect[] {
    const nodeIds = new Set(this.selection.ids('node'));
    const edgeIds = new Set(this.selection.ids('edge'));
    for (const e of this.edges) {
      if (edgeIds.has(e.id)) {
        nodeIds.add(e.source);
        nodeIds.add(e.target);
      }
    }
    return this.nodes.filter(n => nodeIds.has(n.id)).map(n => this.nodeRect(n));
  }

  private nodeLabel(node: DiagramNode): string {
    if (node.headline) return node.headline;
    if (node.data instanceof HTMLElement) {
      return node.data.getAttribute('aria-label') || node.id;
    }
    const label = node.data?.label;
    return typeof label === 'string' && label ? label : node.id;
  }

  private legacyElement(node: DiagramNode): HTMLElement | undefined {
    if (node.data instanceof HTMLElement) return node.data;
    const el = node.data?.element;
    return el instanceof HTMLElement ? el : undefined;
  }

  private resolvePorts(node: DiagramNode): ResolvedPort[] {
    let ports: (Omit<ResolvedPort, 'offset'> & { offset?: number })[];
    if (node.ports?.length) {
      ports = node.ports.map(p => ({ ...p, type: p.type ?? 'both' }));
    } else {
      const inputs = node.inputs ?? ['left'];
      const outputs = node.outputs ?? ['right'];
      ports = [
        ...inputs.map(side => ({ id: side, side, type: 'target' as const })),
        ...outputs.map(side => ({ id: side, side, type: 'source' as const })),
      ];
    }
    const bySide = new Map<string, number>();
    const counts = new Map<string, number>();
    for (const p of ports) counts.set(p.side, (counts.get(p.side) ?? 0) + 1);
    return ports.map(p => {
      const i = bySide.get(p.side) ?? 0;
      bySide.set(p.side, i + 1);
      const n = counts.get(p.side) ?? 1;
      return { ...p, offset: p.offset ?? (i + 1) / (n + 1) };
    });
  }

  private findPort(
    node: DiagramNode,
    id: string | undefined,
    role: 'source' | 'target',
  ): ResolvedPort {
    const ports = this.resolvePorts(node);
    const capable = (p: ResolvedPort) => p.type === 'both' || p.type === role;
    return (
      (id
        ? (ports.find(p => p.id === id) ??
          ports.find(p => p.side === id && capable(p)))
        : undefined) ??
      ports.find(capable) ??
      ports[0] ?? {
        id: role === 'source' ? 'right' : 'left',
        side: role === 'source' ? 'right' : 'left',
        type: role,
        offset: 0.5,
      }
    );
  }

  private portPoint(node: DiagramNode, port: ResolvedPort): DiagramPoint {
    return anchorOnRect(this.nodeRect(node), port.side, port.offset);
  }

  private edgeRender(
    edge: DiagramEdge,
    byId: Map<string, DiagramNode>,
  ): EdgeRender | undefined {
    const source = byId.get(edge.source);
    const target = byId.get(edge.target);
    if (!source || !target) return undefined;
    const sp = this.findPort(source, edge.sourceHandle, 'source');
    const tp = this.findPort(target, edge.targetHandle, 'target');
    const start = this.portPoint(source, sp);
    const end = this.portPoint(target, tp);
    let kind: DiagramConnector = this.connector;
    if (edge.type === 'smoothstep') kind = 'elbow';
    else if (edge.type) kind = edge.type;
    const markerStart = edge.markerStart ?? 'none';
    const markerEnd = edge.markerEnd ?? 'arrow';
    const geometry = edgeGeometry(kind, start, sp.side, end, tp.side, {
      startInset: markerInset(markerStart),
      endInset: markerInset(markerEnd),
    });
    return { edge, geometry, start, end, markerStart, markerEnd };
  }

  private uniqueId(base: string, taken: Set<string>): string {
    if (!taken.has(base)) return base;
    let i = 2;
    while (taken.has(`${base}-${i}`)) i += 1;
    return `${base}-${i}`;
  }

  protected isBackground(target: EventTarget | null): boolean {
    const el = target as Element | null;
    if (!el) return false;
    return (
      el === this._viewportEl ||
      (el.classList?.contains('diagram-world') ?? false) ||
      (el.classList?.contains('diagram-svg') ?? false) ||
      (el.classList?.contains('diagram-nodes') ?? false)
    );
  }

  // ── Private methods: selection

  private clearSelection() {
    this.selection.clear();
    this.selected = '';
  }

  private selectNode(node: DiagramNode, additive = false) {
    if (additive && this.editable) {
      this.selection.toggle('node', node.id);
    } else {
      this.selection.set([{ kind: 'node', id: node.id }]);
    }
    this.selected = node.id;
    this.emit<DiagramSelectDetail>('select', {
      id: node.id,
      kind: 'node',
      node,
    });
  }

  private selectEdge(edge: DiagramEdge, additive = false) {
    if (additive && this.editable) {
      this.selection.toggle('edge', edge.id);
    } else {
      this.selection.set([{ kind: 'edge', id: edge.id }]);
    }
    this.selected = edge.id;
    this.emit<DiagramSelectDetail>('select', {
      id: edge.id,
      kind: 'edge',
      edge,
    });
  }

  // ── Private methods: node dragging

  private nodeElements(): [string, HTMLElement][] {
    const out: [string, HTMLElement][] = [];
    this.renderRoot
      .querySelectorAll<HTMLElement>('.diagram-node')
      .forEach(el => {
        const { id } = el.dataset;
        if (id) out.push([id, el]);
      });
    return out;
  }

  private nodeElement(id: string): HTMLElement | null {
    return this.renderRoot.querySelector<HTMLElement>(
      `.diagram-node[data-id="${CSS.escape(id)}"]`,
    );
  }

  private onNodePointerDown(event: PointerEvent, node: DiagramNode) {
    if (event.button !== 0 || this.viewport.spaceHeld) return;
    const target = event.composedPath()[0] as Element | undefined;
    if (target instanceof Element && target.closest(INTERACTIVE)) return;
    event.preventDefault();
    const element = event.currentTarget as HTMLElement;
    element.focus({ preventScroll: true });
    this.stopRestoreTween?.();
    const additive = event.shiftKey || event.metaKey || event.ctrlKey;
    const ids =
      this.editable && this.selection.has('node', node.id) && !additive
        ? this.selection
            .ids('node')
            .filter(id => !this.nodes.find(n => n.id === id)?.locked)
        : [node.id];
    this.nodeDrag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      primary: node.id,
      ids: ids.includes(node.id) ? ids : [node.id],
      origins: new Map(
        this.nodes
          .filter(n => ids.includes(n.id) || n.id === node.id)
          .map(n => [n.id, { ...n.position }]),
      ),
      before: this.snapshot(),
      moved: false,
      movable: !this.readonly && !node.locked,
      additive,
      element,
    };
    try {
      element.setPointerCapture(event.pointerId);
    } catch {
      // Synthetic or already released pointers cannot be captured.
    }
    element.addEventListener('pointermove', this.onNodePointerMove);
    element.addEventListener('pointerup', this.onNodePointerUp);
    element.addEventListener('pointercancel', this.onNodePointerUp);
  }

  private onNodePointerMove = (event: PointerEvent) => {
    const drag = this.nodeDrag;
    if (!drag || event.pointerId !== drag.pointerId || !drag.movable) return;
    const { zoom } = this.viewport.view;
    const dx = (event.clientX - drag.startX) / zoom;
    const dy = (event.clientY - drag.startY) / zoom;
    if (!drag.moved && Math.hypot(dx * zoom, dy * zoom) < DRAG_THRESHOLD)
      return;
    if (!drag.moved) {
      drag.moved = true;
      this._draggingIds = drag.ids;
    }
    const origin = drag.origins.get(drag.primary) ?? { x: 0, y: 0 };
    let next = { x: origin.x + dx, y: origin.y + dy };
    if (this.snapToGrid) {
      next = {
        x: Math.round(next.x / this.gridSize) * this.gridSize,
        y: Math.round(next.y / this.gridSize) * this.gridSize,
      };
    }
    const aligned = this.editable
      ? this.alignToOthers(drag.primary, next, new Set(drag.ids))
      : { position: next, guides: [] };
    next = aligned.position;
    this._guides = aligned.guides;
    const delta = { x: next.x - origin.x, y: next.y - origin.y };
    const moved = new Map<string, DiagramPoint>();
    for (const id of drag.ids) {
      const o = drag.origins.get(id);
      if (o) moved.set(id, { x: o.x + delta.x, y: o.y + delta.y });
    }
    this.moveNodes(moved);
    this.emit<DiagramNodeMoveDetail>('node-drag', {
      id: drag.primary,
      position: next,
    });
  };

  private onNodePointerUp = (event: PointerEvent) => {
    if (!this.nodeDrag || event.pointerId !== this.nodeDrag.pointerId) return;
    this.endNodeDrag(true);
  };

  /** Ends the press on a node: a drag commits the move, a press without movement selects. */
  private endNodeDrag(notify: boolean) {
    const drag = this.nodeDrag;
    if (!drag) return;
    this.nodeDrag = undefined;
    this._draggingIds = [];
    this._guides = [];
    const { element } = drag;
    element.removeEventListener('pointermove', this.onNodePointerMove);
    element.removeEventListener('pointerup', this.onNodePointerUp);
    element.removeEventListener('pointercancel', this.onNodePointerUp);
    try {
      if (element.hasPointerCapture(drag.pointerId)) {
        element.releasePointerCapture(drag.pointerId);
      }
    } catch {
      // The pointer is already gone.
    }
    if (!notify) return;
    if (drag.moved) {
      const node = this.nodes.find(n => n.id === drag.primary);
      if (!node) return;
      this.history.push(drag.before);
      this.emit<DiagramNodeMoveDetail>('node-drag-end', {
        id: drag.primary,
        position: { ...node.position },
      });
      this.emitChange('move');
    } else {
      const node = this.nodes.find(n => n.id === drag.primary);
      if (node) this.selectNode(node, drag.additive);
    }
  }

  /** Replaces moved nodes with new objects and assigns a new `nodes` array. */
  private moveNodes(positions: Map<string, DiagramPoint>) {
    this.nodes = this.nodes.map(node => {
      const p = positions.get(node.id);
      return p ? { ...node, position: { x: p.x, y: p.y } } : node;
    });
  }

  /** Snaps a dragged node's edges or centre to nearby nodes and returns guide lines to draw. */
  private alignToOthers(
    id: string,
    position: DiagramPoint,
    moving: Set<string>,
  ) {
    const size = this.measure.size(id);
    const threshold = GUIDE_DISTANCE / this.viewport.view.zoom;
    const visible = this.viewport.visibleRect();
    const others = this.nodes
      .filter(n => !moving.has(n.id))
      .map(n => this.nodeRect(n))
      .filter(r => rectsIntersect(r, visible));
    const mine = (p: DiagramPoint) => ({
      xs: [p.x, p.x + size.width / 2, p.x + size.width],
      ys: [p.y, p.y + size.height / 2, p.y + size.height],
    });
    let bestX: { delta: number; line: number; rect: DiagramRect } | undefined;
    let bestY: { delta: number; line: number; rect: DiagramRect } | undefined;
    const m = mine(position);
    for (const r of others) {
      for (const ox of [r.x, r.x + r.width / 2, r.x + r.width]) {
        for (const mx of m.xs) {
          const d = ox - mx;
          if (
            Math.abs(d) < threshold &&
            (!bestX || Math.abs(d) < Math.abs(bestX.delta))
          ) {
            bestX = { delta: d, line: ox, rect: r };
          }
        }
      }
      for (const oy of [r.y, r.y + r.height / 2, r.y + r.height]) {
        for (const my of m.ys) {
          const d = oy - my;
          if (
            Math.abs(d) < threshold &&
            (!bestY || Math.abs(d) < Math.abs(bestY.delta))
          ) {
            bestY = { delta: d, line: oy, rect: r };
          }
        }
      }
    }
    const next = {
      x: position.x + (bestX?.delta ?? 0),
      y: position.y + (bestY?.delta ?? 0),
    };
    const guides: { x1: number; y1: number; x2: number; y2: number }[] = [];
    if (bestX) {
      const top = Math.min(bestX.rect.y, next.y) - 16;
      const bottom =
        Math.max(bestX.rect.y + bestX.rect.height, next.y + size.height) + 16;
      guides.push({ x1: bestX.line, y1: top, x2: bestX.line, y2: bottom });
    }
    if (bestY) {
      const left = Math.min(bestY.rect.x, next.x) - 16;
      const right =
        Math.max(bestY.rect.x + bestY.rect.width, next.x + size.width) + 16;
      guides.push({ x1: left, y1: bestY.line, x2: right, y2: bestY.line });
    }
    return { position: next, guides };
  }

  // ── Private methods: keyboard

  private onNodeKeyDown(event: KeyboardEvent, node: DiagramNode) {
    // Keys typed into controls inside a custom node are theirs.
    if (event.target !== event.currentTarget) return;
    const { key } = event;
    if (key === 'Enter' || key === ' ') {
      this.markHandled(event);
      this.selectNode(node, event.shiftKey);
      return;
    }
    if ((key === 'Delete' || key === 'Backspace') && this.editable) {
      this.markHandled(event);
      if (!this.selection.has('node', node.id)) {
        this.selection.set([{ kind: 'node', id: node.id }]);
      }
      this.deleteSelection();
      return;
    }
    const dir = {
      ArrowLeft: 'left',
      ArrowRight: 'right',
      ArrowUp: 'up',
      ArrowDown: 'down',
    }[key] as 'left' | 'right' | 'up' | 'down' | undefined;
    if (!dir) return;
    this.markHandled(event);
    if (event.altKey) {
      const from = this.nodeRect(node);
      const next = nearestInDirection(
        from,
        this.nodes
          .filter(n => n.id !== node.id)
          .map(n => ({ node: n, rect: this.nodeRect(n) })),
        dir,
      );
      if (next) this.focusNode(next.node.id);
      return;
    }
    if (this.readonly || node.locked) return;
    const step = event.shiftKey ? LARGE_KEY_STEP : KEY_STEP;
    const offset = {
      left: { x: -step, y: 0 },
      right: { x: step, y: 0 },
      up: { x: 0, y: -step },
      down: { x: 0, y: step },
    }[dir];
    const ids =
      this.editable && this.selection.has('node', node.id)
        ? this.selection
            .ids('node')
            .filter(id => !this.nodes.find(n => n.id === id)?.locked)
        : [node.id];
    const before = this.snapshot();
    const moved = new Map<string, DiagramPoint>();
    for (const n of this.nodes) {
      if (ids.includes(n.id)) {
        moved.set(n.id, {
          x: n.position.x + offset.x,
          y: n.position.y + offset.y,
        });
      }
    }
    this.moveNodes(moved);
    this.history.push(before);
    const position = moved.get(node.id) ?? node.position;
    this.emit<DiagramNodeMoveDetail>('node-drag-end', {
      id: node.id,
      position,
    });
    this.announce(
      this.i18n.t('diagramMoved')(
        this.nodeLabel(node),
        String(Math.round(position.x)),
        String(Math.round(position.y)),
      ),
    );
    this.emitChange('move');
    this.keepInView(node.id);
  }

  private onEdgeKeyDown(event: KeyboardEvent, edge: DiagramEdge) {
    if (event.key === 'Enter' || event.key === ' ') {
      this.markHandled(event);
      this.selectEdge(edge, event.shiftKey);
    } else if (
      (event.key === 'Delete' || event.key === 'Backspace') &&
      this.editable
    ) {
      this.markHandled(event);
      if (!this.selection.has('edge', edge.id)) {
        this.selection.set([{ kind: 'edge', id: edge.id }]);
      }
      this.deleteSelection();
    }
  }

  private markHandled(event: Event) {
    event.preventDefault();
    this.handledKeys.add(event);
  }

  private onViewportKeyDown = (event: KeyboardEvent) => {
    if (event.defaultPrevented || this.handledKeys.has(event)) return;
    const origin = event.composedPath()[0];
    if (
      origin instanceof HTMLElement &&
      origin.matches(
        'input, textarea, select, [contenteditable], [contenteditable] *',
      )
    ) {
      return;
    }
    const mod = event.ctrlKey || event.metaKey;
    const key = event.key.toLowerCase();
    const handled = (fn: () => void) => {
      event.preventDefault();
      fn();
    };
    if (mod && key === 'z' && this.editable) {
      handled(() => (event.shiftKey ? this.redo() : this.undo()));
    } else if (mod && key === 'y' && this.editable) {
      handled(() => this.redo());
    } else if (mod && key === 'a' && this.editable) {
      handled(() => this.selectAll());
    } else if (mod && key === 'c' && this.editable) {
      handled(() => this.copySelection());
    } else if (mod && key === 'v' && this.editable) {
      handled(() => this.paste());
    } else if (mod && key === 'd' && this.editable) {
      handled(() => {
        this.copySelection();
        this.paste();
      });
    } else if ((key === 'delete' || key === 'backspace') && this.editable) {
      handled(() => this.deleteSelection());
    } else if (key === 'escape') {
      handled(() => {
        this.cancelConnection();
        this.clearSelection();
      });
    } else {
      this.handleCanvasKey(event);
    }
  };

  private focusNode(id: string) {
    this.focusedId = id;
    this.keepInView(id, true);
    this.updateComplete.then(() =>
      this.nodeElement(id)?.focus({ preventScroll: true }),
    );
  }

  /** Pans so the node is in view, when it is not. */
  private keepInView(id: string, animate = false) {
    const node = this.nodes.find(n => n.id === id);
    if (!node) return;
    const r = this.nodeRect(node);
    const visible = inflateRect(
      this.viewport.visibleRect(),
      -20 / this.viewport.view.zoom,
    );
    const inside =
      r.x >= visible.x &&
      r.y >= visible.y &&
      r.x + r.width <= visible.x + visible.width &&
      r.y + r.height <= visible.y + visible.height;
    if (inside) return;
    const view = this.viewport.viewCentering({
      x: r.x + r.width / 2,
      y: r.y + r.height / 2,
    });
    if (animate) this.viewport.animateTo(view, 300);
    else this.viewport.setView(view);
  }

  // ── Private methods: copy and paste

  private copySelection() {
    const ids = new Set(this.selection.ids('node'));
    if (!ids.size) return;
    clipboard = {
      nodes: this.nodes.filter(n => ids.has(n.id)),
      edges: this.edges.filter(e => ids.has(e.source) && ids.has(e.target)),
    };
    this.pasteCount = 0;
  }

  private paste() {
    if (!clipboard || !this.editable) return;
    this.pasteCount += 1;
    const offset = 40 * this.pasteCount;
    const takenNodes = new Set(this.nodes.map(n => n.id));
    const takenEdges = new Set(this.edges.map(e => e.id));
    const idMap = new Map<string, string>();
    const nodes = clipboard.nodes.map(n => {
      const id = this.uniqueId(`${n.id}-copy`, takenNodes);
      takenNodes.add(id);
      idMap.set(n.id, id);
      return {
        ...n,
        id,
        position: { x: n.position.x + offset, y: n.position.y + offset },
      };
    });
    const edges = clipboard.edges.map(e => {
      const id = this.uniqueId(`${e.id}-copy`, takenEdges);
      takenEdges.add(id);
      return {
        ...e,
        id,
        source: idMap.get(e.source) ?? e.source,
        target: idMap.get(e.target) ?? e.target,
      };
    });
    this.history.push(this.snapshot());
    this.nodes = [...this.nodes, ...nodes];
    this.edges = [...this.edges, ...edges];
    this.selection.set([
      ...nodes.map(n => ({ kind: 'node' as const, id: n.id })),
      ...edges.map(e => ({ kind: 'edge' as const, id: e.id })),
    ]);
    this.announce(this.i18n.t('diagramPasted')(nodes.length + edges.length));
    this.emitChange('paste');
  }

  // ── Private methods: undo

  /** Restores a snapshot; nodes that moved glide to their restored places. */
  private restore(snapshot: Snapshot, reason: 'undo' | 'redo') {
    this.stopRestoreTween?.();
    const from = new Map(this.nodes.map(n => [n.id, { ...n.position }]));
    this.nodes = snapshot.nodes;
    this.edges = snapshot.edges;
    const moving = snapshot.nodes.filter(n => {
      const f = from.get(n.id);
      return f && (f.x !== n.position.x || f.y !== n.position.y);
    });
    if (moving.length && !prefersReducedMotion()) {
      this.stopRestoreTween = tween({
        duration: 260,
        easing: easeOutCubic,
        onUpdate: p => {
          for (const n of moving) {
            const f = from.get(n.id);
            if (f) {
              this.positionOverrides.set(n.id, {
                x: f.x + (n.position.x - f.x) * p,
                y: f.y + (n.position.y - f.y) * p,
              });
            }
          }
          this.requestUpdate();
        },
        onDone: () => {
          this.positionOverrides.clear();
          this.stopRestoreTween = undefined;
          this.requestUpdate();
        },
      });
    }
    this.selection.retain('node', new Set(snapshot.nodes.map(n => n.id)));
    this.selection.retain('edge', new Set(snapshot.edges.map(e => e.id)));
    this.emitChange(reason);
  }

  // ── Private methods: connections

  private onPortPointerDown(
    event: PointerEvent,
    node: DiagramNode,
    port: ResolvedPort,
  ) {
    if (event.button !== 0 || this.viewport.spaceHeld) return;
    event.stopPropagation();
    event.preventDefault();
    if (this.readonly || port.type === 'target') return;
    const point = this.portPoint(node, port);
    this.beginConnectionDrag(event, {
      mode: 'new',
      end: 'target',
      fixedNode: node.id,
      fixedPort: port,
      fixedPoint: point,
      pointer: point,
    });
  }

  private startReconnect(
    event: PointerEvent,
    edge: DiagramEdge,
    end: 'source' | 'target',
  ) {
    if (event.button !== 0) return;
    event.stopPropagation();
    event.preventDefault();
    const byId = new Map(this.nodes.map(n => [n.id, n]));
    const render = this.edgeRender(edge, byId);
    const fixedNode = byId.get(end === 'target' ? edge.source : edge.target);
    if (!render || !fixedNode) return;
    const fixedPort = this.findPort(
      fixedNode,
      end === 'target' ? edge.sourceHandle : edge.targetHandle,
      end === 'target' ? 'source' : 'target',
    );
    this.beginConnectionDrag(event, {
      mode: 'reconnect',
      edgeId: edge.id,
      end,
      fixedNode: fixedNode.id,
      fixedPort,
      fixedPoint: end === 'target' ? render.start : render.end,
      pointer: end === 'target' ? render.end : render.start,
    });
  }

  private beginConnectionDrag(
    event: PointerEvent,
    connection: NonNullable<Diagram['_connection']>,
  ) {
    const element = event.currentTarget as HTMLElement;
    this._connection = connection;
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

  /** The nearest port that can take the moving end, within snapping distance. */
  private findSnap(point: DiagramPoint) {
    const c = this._connection;
    if (!c) return undefined;
    const role = c.end === 'target' ? 'target' : 'source';
    const limit = SNAP_DISTANCE / this.viewport.view.zoom;
    let best:
      | { nodeId: string; port: ResolvedPort; point: DiagramPoint; d: number }
      | undefined;
    const probe = { ...point, width: 0.01, height: 0.01 };
    for (const node of this.nodes.filter(n => n.id !== c.fixedNode)) {
      const rect = this.nodeRect(node);
      const inside = rectsIntersect(rect, probe);
      if (inside || rectsIntersect(inflateRect(rect, limit), probe)) {
        const ports = this.resolvePorts(node).filter(
          port => port.type === 'both' || port.type === role,
        );
        for (const port of ports) {
          const p = this.portPoint(node, port);
          const d = Math.hypot(p.x - point.x, p.y - point.y);
          if ((inside || d <= limit) && (!best || d < best.d)) {
            best = { nodeId: node.id, port, point: p, d };
          }
        }
      }
    }
    return best
      ? { nodeId: best.nodeId, port: best.port, point: best.point }
      : undefined;
  }

  private onConnectionPointerMove = (event: PointerEvent) => {
    const c = this._connection;
    if (!c || event.pointerId !== this.connectionDrag?.pointerId) return;
    const goal = this.viewport.toCanvas(event.clientX, event.clientY);
    const snap = this.findSnap(goal);
    const target = snap?.point ?? goal;
    if (prefersReducedMotion()) {
      this._connection = { ...c, snap, pointer: target };
      return;
    }
    // A short spring so the preview line follows the pointer smoothly.
    this._connection = { ...c, snap };
    const step = () => {
      const cur = this._connection;
      if (!cur) return;
      const dx = target.x - cur.pointer.x;
      const dy = target.y - cur.pointer.y;
      const done = Math.hypot(dx, dy) < 0.5;
      this._connection = {
        ...cur,
        pointer: done
          ? target
          : { x: cur.pointer.x + dx * 0.45, y: cur.pointer.y + dy * 0.45 },
      };
      this.connectionFrame = done ? 0 : requestAnimationFrame(step);
    };
    cancelAnimationFrame(this.connectionFrame);
    this.connectionFrame = requestAnimationFrame(step);
  };

  private onConnectionPointerUp = (event: PointerEvent) => {
    const c = this._connection;
    if (!c || event.pointerId !== this.connectionDrag?.pointerId) return;
    const snap =
      this.findSnap(this.viewport.toCanvas(event.clientX, event.clientY)) ??
      c.snap;
    this.cancelConnection();
    if (!snap) return;
    if (c.mode === 'new') {
      this.connect(c.fixedNode, c.fixedPort.id, snap.nodeId, snap.port.id);
    } else if (c.edgeId) {
      this.reconnect(c.edgeId, c.end, snap.nodeId, snap.port.id);
    }
  };

  private onConnectionPointerCancel = () => {
    this.cancelConnection();
  };

  /** Stops drawing a connection and releases its pointer. */
  private cancelConnection() {
    const drag = this.connectionDrag;
    this.connectionDrag = undefined;
    this._connection = undefined;
    cancelAnimationFrame(this.connectionFrame);
    this.connectionFrame = 0;
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

  private connect(
    source: string,
    sourceHandle: string,
    target: string,
    targetHandle: string,
  ) {
    if (source === target) return;
    const detail = { source, target, sourceHandle, targetHandle };
    const allowed = this.emit<DiagramConnectDetail>('connect', detail, true);
    this.ripple(target, targetHandle);
    if (!this.editable || !allowed) return;
    const duplicate = this.edges.some(
      e =>
        e.source === source &&
        e.target === target &&
        (e.sourceHandle ?? '') === sourceHandle &&
        (e.targetHandle ?? '') === targetHandle,
    );
    if (duplicate) return;
    const id = this.uniqueId(
      `${source}-${target}`,
      new Set(this.edges.map(e => e.id)),
    );
    this.history.push(this.snapshot());
    this.edges = [...this.edges, { id, ...detail }];
    const byId = new Map(this.nodes.map(n => [n.id, n]));
    const from = byId.get(source);
    const to = byId.get(target);
    if (from && to) {
      this.announce(
        this.i18n.t('diagramConnected')(
          this.nodeLabel(from),
          this.nodeLabel(to),
        ),
      );
    }
    this.emitChange('connect');
  }

  private reconnect(
    edgeId: string,
    end: 'source' | 'target',
    nodeId: string,
    portId: string,
  ) {
    const edge = this.edges.find(e => e.id === edgeId);
    if (!edge || !this.editable) return;
    const next =
      end === 'target'
        ? { ...edge, target: nodeId, targetHandle: portId }
        : { ...edge, source: nodeId, sourceHandle: portId };
    if (next.source === next.target) return;
    this.history.push(this.snapshot());
    this.edges = this.edges.map(e => (e.id === edgeId ? next : e));
    this.ripple(nodeId, portId);
    this.emitChange('reconnect');
  }

  private ripple(nodeId: string, portId: string) {
    clearTimeout(this.rippleTimer);
    this._ripple = `${nodeId}\u0000${portId}`;
    this.rippleTimer = setTimeout(() => {
      this._ripple = '';
    }, 500);
  }

  // ── Private methods: edges and marquee

  private onEdgePointerDown(event: PointerEvent, edge: DiagramEdge) {
    if (event.button !== 0 || this.viewport.spaceHeld) return;
    event.stopPropagation();
    this.selectEdge(edge, event.shiftKey || event.metaKey || event.ctrlKey);
  }

  private startMarquee(event: PointerEvent): boolean {
    if (!this.editable || !event.shiftKey) return false;
    const element = this._viewportEl;
    if (!element) return false;
    event.preventDefault();
    const rect = element.getBoundingClientRect();
    const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    this._marquee = { start: point, end: point };
    this.marqueeDrag = { pointerId: event.pointerId, element, origin: rect };
    try {
      element.setPointerCapture(event.pointerId);
    } catch {
      // Synthetic pointers cannot be captured.
    }
    element.addEventListener('pointermove', this.onMarqueeMove);
    element.addEventListener('pointerup', this.onMarqueeUp);
    element.addEventListener('pointercancel', this.onMarqueeUp);
    return true;
  }

  private onMarqueeMove = (event: PointerEvent) => {
    const drag = this.marqueeDrag;
    const m = this._marquee;
    if (!drag || !m || event.pointerId !== drag.pointerId) return;
    const end = {
      x: event.clientX - drag.origin.x,
      y: event.clientY - drag.origin.y,
    };
    this._marquee = { ...m, end };
    const { x, y, zoom } = this.viewport.view;
    const screen = rectFromPoints(m.start, end);
    const canvas = {
      x: (screen.x - x) / zoom,
      y: (screen.y - y) / zoom,
      width: screen.width / zoom,
      height: screen.height / zoom,
    };
    this.selection.set(
      this.nodes
        .filter(n => rectsIntersect(this.nodeRect(n), canvas))
        .map(n => ({ kind: 'node' as const, id: n.id })),
    );
  };

  private onMarqueeUp = (event: PointerEvent) => {
    if (event.pointerId !== this.marqueeDrag?.pointerId) return;
    this.endMarquee();
  };

  private endMarquee() {
    const drag = this.marqueeDrag;
    this.marqueeDrag = undefined;
    this._marquee = undefined;
    if (!drag) return;
    drag.element.removeEventListener('pointermove', this.onMarqueeMove);
    drag.element.removeEventListener('pointerup', this.onMarqueeUp);
    drag.element.removeEventListener('pointercancel', this.onMarqueeUp);
    try {
      if (drag.element.hasPointerCapture(drag.pointerId)) {
        drag.element.releasePointerCapture(drag.pointerId);
      }
    } catch {
      // The pointer is already gone.
    }
  }

  // ── Render helpers

  private renderNodeContent(node: DiagramNode) {
    const legacy = this.legacyElement(node);
    if (legacy) return legacy;
    return html`<slot name=${`node:${node.id}`}>
      <div class="diagram-node-default-card">
        ${node.icon
          ? html`<span class="diagram-node-icon"
              ><wc-icon name=${node.icon}></wc-icon
            ></span>`
          : nothing}
        <span class="diagram-node-text">
          <span class="diagram-node-title">${this.nodeLabel(node)}</span>
          ${node.supportingText
            ? html`<span class="diagram-node-supporting"
                >${node.supportingText}</span
              >`
            : nothing}
        </span>
      </div>
    </slot>`;
  }

  private renderNode(node: DiagramNode, slotted: Set<string>) {
    const selected = this.selection.has('node', node.id);
    const position = this.nodePosition(node);
    const custom = !!this.legacyElement(node) || slotted.has(node.id);
    const connecting = !!this._connection;
    return html`
      <div
        class=${classMap({
          'diagram-node': true,
          'diagram-node-custom': custom,
          'is-dragging': this._draggingIds.includes(node.id),
          'is-selected': selected,
          'is-locked': !!node.locked,
          [`intent-${node.intent}`]: !!node.intent,
        })}
        data-id=${node.id}
        role="group"
        aria-roledescription=${this.i18n.t('diagramNode')}
        tabindex="0"
        aria-label=${this.nodeLabel(node)}
        aria-current=${selected ? 'true' : nothing}
        style="left: ${position.x}px; top: ${position.y}px;"
        @pointerdown=${(e: PointerEvent) => this.onNodePointerDown(e, node)}
        @keydown=${(e: KeyboardEvent) => this.onNodeKeyDown(e, node)}
        @focus=${() => {
          this.focusedId = node.id;
        }}
      >
        ${this.resolvePorts(node).map(port => {
          const isSnap =
            this._connection?.snap?.nodeId === node.id &&
            this._connection.snap.port.id === port.id;
          const canTake =
            connecting &&
            this._connection?.fixedNode !== node.id &&
            (port.type === 'both' ||
              port.type ===
                (this._connection?.end === 'target' ? 'target' : 'source'));
          return html`<div
            class=${classMap({
              handle: true,
              'handle-input': port.type !== 'source',
              'handle-output': port.type !== 'target',
              [`handle-position-${port.side}`]: true,
              'is-snap': isSnap,
              'is-candidate': canTake,
              'is-ripple': this._ripple === `${node.id}\u0000${port.id}`,
            })}
            data-node-id=${node.id}
            data-port=${port.id}
            data-position=${port.side}
            style="--_offset: ${port.offset * 100}%"
            title=${port.label ?? nothing}
            @pointerdown=${(e: PointerEvent) =>
              this.onPortPointerDown(e, node, port)}
          ></div>`;
        })}
        <div class="diagram-node-content">${this.renderNodeContent(node)}</div>
      </div>
    `;
  }

  private renderMarkers(render: EdgeRender) {
    const out = [];
    for (const [marker, at, angle] of [
      [render.markerEnd, render.end, render.geometry.endAngle],
      [render.markerStart, render.start, render.geometry.startAngle],
    ] as const) {
      for (const shape of markerShapes(marker)) {
        out.push(
          svg`<path class="diagram-marker fill-${shape.fill}" d=${shape.d} transform=${markerTransform(at, angle)}></path>`,
        );
      }
    }
    return out;
  }

  private renderEdge(render: EdgeRender, labels: Map<string, string>) {
    const { edge, geometry } = render;
    const selected = this.selection.has('edge', edge.id);
    const variant = edge.variant ?? 'solid';
    return svg`
      <g
        class=${classMap({
          'diagram-edge-group': true,
          'is-selected': selected,
          'is-colored': !!edge.color,
        })}
        data-id=${edge.id}
        style=${edge.color ? `--_edge-color: ${edge.color}` : nothing}
        tabindex=${this.editable ? '0' : nothing}
        role=${this.editable ? 'button' : nothing}
        aria-label=${this.editable ? (labels.get(edge.id) ?? edge.id) : nothing}
        aria-pressed=${this.editable ? String(selected) : nothing}
        @pointerdown=${(e: PointerEvent) => this.onEdgePointerDown(e, edge)}
        @keydown=${(e: KeyboardEvent) => this.onEdgeKeyDown(e, edge)}
      >
        <path class="diagram-edge-hit" d=${geometry.d}></path>
        <path
          class=${classMap({
            'diagram-edge': true,
            'variant-dashed':
              variant === 'dashed' || variant === 'animated-dashed',
            'variant-animated-dashed': variant === 'animated-dashed',
          })}
          d=${geometry.d}
        ></path>
        ${this.renderMarkers(render)}
      </g>
    `;
  }

  private renderConnectionPreview() {
    const c = this._connection;
    if (!c) return nothing;
    const movingSide = c.snap?.port.side ?? OPPOSITE_SIDE[c.fixedPort.side];
    const g =
      c.end === 'target'
        ? edgeGeometry(
            this.connector,
            c.fixedPoint,
            c.fixedPort.side,
            c.pointer,
            movingSide,
          )
        : edgeGeometry(
            this.connector,
            c.pointer,
            movingSide,
            c.fixedPoint,
            c.fixedPort.side,
          );
    return svg`<path class=${classMap({ 'diagram-edge-preview': true, 'is-snapped': !!c.snap })} d=${g.d}></path>`;
  }

  // ── Render

  protected render() {
    const { x, y, zoom } = this.viewport.view;
    const { width, height } = this.viewport.size();
    const cull = this.startApplied && width > 0 && height > 0;
    const visible = inflateRect(
      this.viewport.visibleRect(),
      CULL_MARGIN / zoom,
    );
    const byId = new Map(this.nodes.map(n => [n.id, n]));
    const rects = new Map(this.nodes.map(n => [n.id, this.nodeRect(n)]));
    const keep = (n: DiagramNode) => {
      if (!cull) return true;
      const r = rects.get(n.id);
      return (
        (r && rectsIntersect(r, visible)) ||
        this.selection.has('node', n.id) ||
        this.focusedId === n.id ||
        this._draggingIds.includes(n.id)
      );
    };
    const shownNodes = this.nodes.filter(keep);
    const edgeLabels = new Map<string, string>();
    const shownEdges: EdgeRender[] = [];
    const edgeInView = (edge: DiagramEdge) => {
      const a = rects.get(edge.source);
      const b = rects.get(edge.target);
      if (!a || !b) return false;
      return !cull || rectsIntersect(boundsOf([a, b]) as DiagramRect, visible);
    };
    for (const edge of this.edges.filter(edgeInView)) {
      const render = this.edgeRender(edge, byId);
      if (render) shownEdges.push(render);
      const from = byId.get(edge.source);
      const to = byId.get(edge.target);
      edgeLabels.set(
        edge.id,
        this.i18n.t('diagramEdgeLabel')(
          from ? this.nodeLabel(from) : edge.source,
          to ? this.nodeLabel(to) : edge.target,
          edge.label,
        ),
      );
    }
    const slotted = new Set<string>();
    for (const child of Array.from(this.children)) {
      const slot = child.getAttribute('slot');
      if (slot?.startsWith('node:')) slotted.add(slot.slice(5));
    }
    const selectedEdges = this.editable
      ? shownEdges.filter(r => this.selection.has('edge', r.edge.id))
      : [];
    const marquee = this._marquee
      ? rectFromPoints(this._marquee.start, this._marquee.end)
      : undefined;

    return html`
      <div
        class=${classMap({
          'diagram-viewport': true,
          'is-panning': this.viewport.panning,
          'is-space': this.viewport.spaceHeld,
          'is-connecting': !!this._connection,
        })}
        tabindex="0"
        role="region"
        aria-label=${this.label || this.i18n.t('diagramLabel')}
        aria-describedby="instructions"
        style=${this.gridStyle()}
        @keydown=${this.onViewportKeyDown}
      >
        <div
          class="diagram-world"
          style="transform: translate(${x}px, ${y}px) scale(${zoom});"
        >
          <svg class="diagram-svg" width="1" height="1" aria-hidden="true">
            ${shownEdges.map(r => this.renderEdge(r, edgeLabels))}
            ${this.renderConnectionPreview()}
            ${this._guides.map(
              g =>
                svg`<line class="diagram-guide" x1=${g.x1} y1=${g.y1} x2=${g.x2} y2=${g.y2}></line>`,
            )}
          </svg>
          <div class="diagram-nodes" @slotchange=${() => this.requestUpdate()}>
            ${repeat(
              shownNodes,
              node => node.id,
              node => this.renderNode(node, slotted),
            )}
          </div>
          ${shownEdges
            .filter(r => r.edge.label)
            .map(
              r =>
                html`<div
                  class=${classMap({
                    'diagram-edge-label': true,
                    'is-selected': this.selection.has('edge', r.edge.id),
                  })}
                  style="left: ${r.geometry.mid.x}px; top: ${r.geometry.mid
                    .y}px;"
                  @pointerdown=${(e: PointerEvent) =>
                    this.onEdgePointerDown(e, r.edge)}
                >
                  ${r.edge.label}
                </div>`,
            )}
          ${selectedEdges.map(
            r => html`
              <div
                class="edge-end"
                style="left: ${r.start.x}px; top: ${r.start.y}px;"
                @pointerdown=${(e: PointerEvent) =>
                  this.startReconnect(e, r.edge, 'source')}
              ></div>
              <div
                class="edge-end"
                style="left: ${r.end.x}px; top: ${r.end.y}px;"
                @pointerdown=${(e: PointerEvent) =>
                  this.startReconnect(e, r.edge, 'target')}
              ></div>
            `,
          )}
        </div>
        ${marquee
          ? html`<div
              class="diagram-marquee"
              style="left: ${marquee.x}px; top: ${marquee.y}px; width: ${marquee.width}px; height: ${marquee.height}px;"
            ></div>`
          : nothing}
        ${this.renderBackToContent()}
        <div class="slot-controls"><slot name="controls"></slot></div>
        <div class="slot-minimap"><slot name="minimap"></slot></div>
        <div id="instructions" hidden>
          ${this.i18n.t('diagramInstructions')}
        </div>
        <div class="sr-only" aria-live="polite">${this._announcement}</div>
      </div>
    `;
  }
}

// Nodes are measured after they render and the camera is placed from those sizes, so a second
// update right after the first is expected. Lit warns about that in development builds.
Diagram.disableWarning?.('change-in-update');
