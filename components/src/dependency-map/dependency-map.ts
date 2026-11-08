import { html, nothing, svg, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { repeat } from 'lit/directives/repeat.js';
import IndividualComponent from '@/IndividualComponent.js';
import { DiagramCanvasElement } from '@/__internal/diagram/canvas-base.js';
import { MeasureController } from '@/__internal/diagram/measure-controller.js';
import { boundsOf } from '@/__internal/diagram/geometry.js';
import {
  easeInOutCubic,
  prefersReducedMotion,
  tween,
} from '@/__internal/diagram/motion.js';
import type { DiagramOverview } from '@/__internal/diagram/host.js';
import type {
  DiagramPoint,
  DiagramRect,
  DiagramViewportDetail,
} from '@/__internal/diagram/types.js';
import { formatDuration } from '@/workflow/workflow-format.js';
import {
  forceLayout,
  layeredLayout,
  radialLayout,
  reachable,
  withinHops,
  type MapLayoutEdge,
  type MapLayoutNode,
} from './dependency-map-layout.js';
import styles from './dependency-map.scss';

export type DependencyMapStatus = 'healthy' | 'degraded' | 'down' | 'unknown';

export type DependencyMapLayout = 'force' | 'layered' | 'radial';

export type DependencyMapImpact = 'none' | 'upstream' | 'downstream';

/** A service, database, queue, host or any other asset. */
export interface DependencyMapNode {
  id: string;
  /** What it is, for example "Service", "Database" or "Queue". Drives the legend and filters. */
  type?: string;
  headline: string;
  supportingText?: string;
  /** Material Symbols name. */
  icon?: string;
  status?: DependencyMapStatus;
  /** Id of the group (cluster, namespace, business service) it belongs to. */
  group?: string;
  tags?: string[];
  /** Shown on the card when zoomed in, for example `{ rps: '1.2k', p95: '38 ms' }`. */
  metrics?: Record<string, string | number>;
  /** A fixed position, in canvas pixels. */
  position?: DiagramPoint;
}

/** A relationship: `source` calls, depends on, runs on or is hosted in `target`. */
export interface DependencyMapEdge {
  id: string;
  source: string;
  target: string;
  /** What the relationship is, for example "calls" or "runs on". */
  type?: string;
  label?: string;
  status?: DependencyMapStatus;
  metrics?: {
    /** Requests per second: drives the line width. */
    rps?: number;
    /** 95th percentile latency in milliseconds. */
    latencyMs?: number;
    /** Share of failed requests, 0 to 1: drives the line colour. */
    errorRate?: number;
  };
}

/** A box around nodes, such as a cluster, namespace or business service. */
export interface DependencyMapGroup {
  id: string;
  label: string;
  icon?: string;
  /** Starts collapsed into a single node. */
  collapsed?: boolean;
}

/** Which nodes to show. Leave a field out to show everything for it. */
export interface DependencyMapFilter {
  types?: string[];
  statuses?: DependencyMapStatus[];
  /** Shows nodes with at least one of these tags. */
  tags?: string[];
  /** Matches the headline and supporting text. */
  text?: string;
}

/** Detail of `select`. */
export interface DependencyMapSelectDetail {
  id: string;
  node?: DependencyMapNode;
  group?: DependencyMapGroup;
}

/** Detail of `focus-change`. */
export interface DependencyMapFocusDetail {
  id: string | null;
  hops: number;
}

/** Detail of `filter-change`. */
export interface DependencyMapFilterDetail {
  filter: DependencyMapFilter;
}

/** Detail of `node-drag-end`. */
export interface DependencyMapMoveDetail {
  id: string;
  position: DiagramPoint;
}

/** Detail of `group-toggle`. */
export interface DependencyMapGroupDetail {
  id: string;
  collapsed: boolean;
}

/** Detail of `viewport-change`. */
export type DependencyMapViewportDetail = DiagramViewportDetail;

interface VisibleNode {
  id: string;
  kind: 'node' | 'group';
  node?: DependencyMapNode;
  group?: DependencyMapGroup;
  members: DependencyMapNode[];
  status: DependencyMapStatus;
}

interface VisibleEdge {
  id: string;
  source: string;
  target: string;
  edges: DependencyMapEdge[];
  rps: number;
  latencyMs?: number;
  errorRate: number;
  status?: DependencyMapStatus;
}

const NODE_SIZE = { width: 200, height: 52 };

const STATUS_RANK: Record<DependencyMapStatus, number> = {
  healthy: 0,
  unknown: 1,
  degraded: 2,
  down: 3,
};

const DRAG_THRESHOLD = 4;

const INTERACTIVE = 'button, a, input, wc-icon-button';

/** Below this zoom, nodes are drawn as status dots. */
const DOT_ZOOM = 0.45;

/** From this zoom, nodes show their metrics. */
const DETAIL_ZOOM = 1.2;

function worst(
  statuses: (DependencyMapStatus | undefined)[],
): DependencyMapStatus {
  return statuses.reduce<DependencyMapStatus>(
    (w, s) => (s && STATUS_RANK[s] > STATUS_RANK[w] ? s : w),
    'healthy',
  );
}

/**
 * @label Dependency map
 * @tag wc-dependency-map
 * @rawTag dependency-map
 * @summary An explorable map of connected services and assets: service meshes, CMDB relationships, infrastructure.
 *
 * @overview
 * <p>Set <code>nodes</code>, <code>edges</code> and optionally <code>groups</code>. Each node has a
 * <code>type</code>, a <code>status</code> (healthy, degraded, down) shown as a ring, and an optional
 * <code>group</code> (a cluster, namespace or business service) drawn as a box. Edges get thicker with
 * traffic (<code>metrics.rps</code>) and warmer with errors (<code>metrics.errorRate</code>); hover one
 * for its metrics. A collapsed group becomes one node with combined status and edges.</p>
 * <p><code>layout</code> is <code>force</code> (organic, groups drift together), <code>layered</code>
 * (callers on the left, dependencies on the right) or <code>radial</code> (rings of hops around the
 * focused or selected node). Live updates move as little as possible, and changing layout glides.
 * Drag a node to pin it.</p>
 * <p>Select a node and set <code>impact</code> to <code>upstream</code> to light up everything that
 * depends on it (what breaks if it goes down), or <code>downstream</code> for everything it depends on;
 * the rest dims. <code>focused-node</code> shows only the nodes within <code>hops</code> of one node (press F
 * on a node). <code>filter</code> limits nodes by type, status, tag or text, and the legend's types toggle
 * it. Zoomed out, nodes become status dots; zoomed in, they show their metrics.</p>
 * <p>Nodes are buttons with one tab stop. Down moves to a node it depends on, Up to one that depends
 * on it, Left and Right to the other nodes along that step, Enter selects, F focuses and Escape
 * clears. The canvas is infinite like <code>wc-diagram</code>, with the <code>controls</code> and
 * <code>minimap</code> slots.</p>
 *
 * @example
 * ```html
 * <wc-dependency-map id="mesh" style="height: 500px"></wc-dependency-map>
 * <script>
 *   const map = document.getElementById('mesh');
 *   map.nodes = [
 *     { id: 'web', type: 'Service', headline: 'checkout-web', status: 'healthy' },
 *     { id: 'api', type: 'Service', headline: 'payments-api', status: 'degraded' },
 *     { id: 'db', type: 'Database', headline: 'payments-db', status: 'degraded', icon: 'database' }
 *   ];
 *   map.edges = [
 *     { id: 'e1', source: 'web', target: 'api', metrics: { rps: 420 } },
 *     { id: 'e2', source: 'api', target: 'db', metrics: { rps: 1200, errorRate: 0.008 } }
 *   ];
 * </script>
 * ```
 *
 * @slot controls - A `wc-diagram-controls`, shown at the bottom start corner.
 * @slot minimap - A `wc-diagram-minimap`, shown at the bottom end corner.
 *
 * @fires {CustomEvent<DependencyMapSelectDetail>} select - A node or collapsed group was chosen. Detail contains `{ id, node, group }`.
 * @fires {CustomEvent<DependencyMapFocusDetail>} focus-change - Focus mode was turned on or off with the keyboard. Detail contains `{ id, hops }`.
 * @fires {CustomEvent<DependencyMapFilterDetail>} filter-change - The legend changed the filter. Detail contains `{ filter }`.
 * @fires {CustomEvent<DependencyMapMoveDetail>} node-drag-end - A dragged node was dropped and pinned there. Detail contains `{ id, position }`.
 * @fires {CustomEvent<DependencyMapGroupDetail>} group-toggle - A group was collapsed or expanded. Detail contains `{ id, collapsed }`.
 * @fires {CustomEvent<DependencyMapViewportDetail>} viewport-change - Once per frame while the camera moves and once when it settles. Detail contains `{ x, y, zoom, settled }`.
 *
 * @cssprop --dependency-map-edge-color - Colour of edges. Defaults to outline.
 * @cssprop --dependency-map-impact-color - Colour of the impact path. Defaults to the orange palette.
 * @cssprop --dependency-map-background - Canvas background. Defaults to surface-container-lowest.
 * @tags data
 */
@IndividualComponent
export class DependencyMap extends DiagramCanvasElement {
  // ── Static

  static styles = [styles];

  // ── Properties

  @property({ attribute: false })
  nodes: DependencyMapNode[] = [];

  @property({ attribute: false })
  edges: DependencyMapEdge[] = [];

  @property({ attribute: false })
  groups: DependencyMapGroup[] = [];

  /** How nodes are arranged. */
  @property({ type: String, reflect: true })
  layout: DependencyMapLayout = 'force';

  /** Highlights what depends on the selected node (`upstream`) or what it depends on (`downstream`). */
  @property({ type: String, reflect: true })
  impact: DependencyMapImpact = 'none';

  /** Shows only the nodes within `hops` of this node. */
  @property({ type: String, reflect: true, attribute: 'focused-node' })
  focusedNode = '';

  /** How far focus mode reaches. */
  @property({ type: Number, reflect: true })
  hops = 2;

  /** Which nodes to show. */
  @property({ attribute: false })
  filter: DependencyMapFilter = {};

  /** Id of the selected node or collapsed group. */
  @property({ type: String, reflect: true })
  selected = '';

  /** Leaves out the legend. */
  @property({ type: Boolean, attribute: 'hide-legend' })
  hideLegend = false;

  // ── State

  @state()
  private _collapsedGroups = new Set<string>();

  @state()
  private _focusId = '';

  @state()
  private _tooltip?: { x: number; y: number; edge: VisibleEdge };

  @state()
  private _announcement = '';

  // ── Private fields

  @query('.dm-viewport')
  private readonly _viewportEl?: HTMLElement;

  private readonly measure = new MeasureController(this, {
    elements: () => this.nodeElements(),
    fallback: NODE_SIZE,
  });

  private visibleNodes: VisibleNode[] = [];

  private visibleById = new Map<string, VisibleNode>();

  private visibleEdges: VisibleEdge[] = [];

  private positions = new Map<string, DiagramPoint>();

  private overrides = new Map<string, DiagramPoint>();

  private pinned = new Map<string, DiagramPoint>();

  private layoutKey = '';

  private stopGlide?: () => void;

  private seenGroups = new Set<string>();

  /** The step keyboard navigation last took, for Left and Right. */
  private navStep?: { from: string; direction: 'up' | 'down' };

  private nodeDrag?: {
    pointerId: number;
    startX: number;
    startY: number;
    id: string;
    origin: DiagramPoint;
    element: HTMLElement;
    moved: boolean;
  };

  // ── Lifecycle

  disconnectedCallback() {
    super.disconnectedCallback();
    this.stopGlide?.();
  }

  protected willUpdate(changed: PropertyValues<this>) {
    super.willUpdate(changed);
    if (changed.has('groups')) {
      let next: Set<string> | undefined;
      for (const g of this.groups) {
        if (g.collapsed && !this.seenGroups.has(g.id)) {
          this.seenGroups.add(g.id);
          next = next ?? new Set(this._collapsedGroups);
          next.add(g.id);
        }
      }
      if (next) this._collapsedGroups = next;
    }
    if (changed.has('nodes')) {
      for (const n of this.nodes)
        if (n.position) this.pinned.set(n.id, n.position);
    }
    if (
      [
        'nodes',
        'edges',
        'groups',
        'filter',
        'focusedNode',
        'hops',
        'layout',
        '_collapsedGroups',
      ].some(k => changed.has(k as keyof DependencyMap)) ||
      (this.layout === 'radial' && changed.has('selected'))
    ) {
      this.buildGraph();
      this.runLayout();
    }
  }

  // ── Public API

  /** The map has no undo; these keep the canvas contract. */
  get canUndo(): boolean {
    return false;
  }

  get canRedo(): boolean {
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  undo() {
    // Nothing to undo.
  }

  // eslint-disable-next-line class-methods-use-this
  redo() {
    // Nothing to redo.
  }

  /** Lays the map out again from scratch, keeping pinned nodes. */
  relayout() {
    this.layoutKey = '';
    const previous = this.positions;
    this.positions = new Map();
    this.runLayout(previous);
    this.requestUpdate();
  }

  /** Forgets every pinned position and lays the map out again. */
  unpinAll() {
    this.pinned.clear();
    this.relayout();
  }

  /** Shows only the nodes within `hops` of a node. */
  focusOn(id: string, hops = this.hops) {
    this.hops = hops;
    this.focusedNode = id;
  }

  clearFocus() {
    this.focusedNode = '';
  }

  /** Selects a node as a click would and brings it into view. */
  selectNode(id: string) {
    const v = this.visibleById.get(id);
    if (!v) return;
    this.select(v);
    this.moveFocusTo(id);
  }

  collapseGroup(id: string) {
    this.toggleGroup(id, true);
  }

  expandGroup(id: string) {
    this.toggleGroup(id, false);
  }

  // ── Canvas hooks

  protected viewportElement() {
    return this._viewportEl;
  }

  protected contentBounds(): DiagramRect | undefined {
    return boundsOf(this.visibleNodes.map(v => this.rectOf(v.id)));
  }

  protected selectionRects(): DiagramRect[] {
    return this.visibleById.has(this.selected)
      ? [this.rectOf(this.selected)]
      : [];
  }

  protected itemRect(id: string): DiagramRect | undefined {
    return this.visibleById.has(id) ? this.rectOf(id) : undefined;
  }

  protected firstItemRect(): DiagramRect | undefined {
    const first = this.visibleNodes[0];
    return first ? this.rectOf(first.id) : undefined;
  }

  protected overviewItems(): DiagramOverview['items'] {
    return this.visibleNodes.map(v => ({
      ...this.rectOf(v.id),
      selected: v.id === this.selected,
    }));
  }

  protected isBackground(target: EventTarget | null): boolean {
    const el = target as Element | null;
    if (!el) return false;
    return (
      el === this._viewportEl ||
      ['dm-world', 'dm-edges', 'dm-nodes', 'dm-groups', 'dm-group'].some(c =>
        el.classList?.contains(c),
      )
    );
  }

  protected onBackgroundClick() {
    this.selected = '';
  }

  // ── Private methods: graph

  /** Applies filter, focus and collapsed groups to get what is drawn. */
  private buildGraph() {
    const f = this.filter ?? {};
    const text = f.text?.trim().toLowerCase();
    const pass = (n: DependencyMapNode) =>
      (!f.types || !n.type || f.types.includes(n.type)) &&
      (!f.statuses || f.statuses.includes(n.status ?? 'unknown')) &&
      (!f.tags || f.tags.some(t => n.tags?.includes(t))) &&
      (!text ||
        n.headline.toLowerCase().includes(text) ||
        (n.supportingText ?? '').toLowerCase().includes(text));
    let shown = this.nodes.filter(pass);
    let ids = new Set(shown.map(n => n.id));
    let edges = this.edges.filter(e => ids.has(e.source) && ids.has(e.target));
    if (this.focusedNode && ids.has(this.focusedNode)) {
      const near = withinHops(this.focusedNode, edges, this.hops);
      shown = shown.filter(n => near.has(n.id));
      ids = near;
      edges = edges.filter(e => near.has(e.source) && near.has(e.target));
    }
    const groupsById = new Map(this.groups.map(g => [g.id, g]));
    const repr = (n: DependencyMapNode) =>
      n.group && this._collapsedGroups.has(n.group) && groupsById.has(n.group)
        ? `group:${n.group}`
        : n.id;
    const visible = new Map<string, VisibleNode>();
    for (const n of shown) {
      const id = repr(n);
      const existing = visible.get(id);
      if (id === n.id) {
        visible.set(id, {
          id,
          kind: 'node',
          node: n,
          members: [n],
          status: n.status ?? 'unknown',
        });
      } else if (existing) {
        existing.members.push(n);
        existing.status = worst(existing.members.map(m => m.status));
      } else {
        visible.set(id, {
          id,
          kind: 'group',
          group: groupsById.get(n.group ?? ''),
          members: [n],
          status: n.status ?? 'unknown',
        });
      }
    }
    const byNode = new Map(shown.map(n => [n.id, repr(n)]));
    const merged = new Map<string, VisibleEdge>();
    for (const e of edges) {
      const source = byNode.get(e.source);
      const target = byNode.get(e.target);
      if (source && target && source !== target) {
        const key = `${source}\u0000${target}`;
        const m = merged.get(key);
        if (m) {
          m.edges.push(e);
          m.rps += e.metrics?.rps ?? 0;
          m.errorRate = Math.max(m.errorRate, e.metrics?.errorRate ?? 0);
          m.latencyMs =
            Math.max(m.latencyMs ?? 0, e.metrics?.latencyMs ?? 0) || undefined;
          m.status = worst([m.status, e.status]);
        } else {
          merged.set(key, {
            id:
              source === e.source && target === e.target ? e.id : `agg:${key}`,
            source,
            target,
            edges: [e],
            rps: e.metrics?.rps ?? 0,
            latencyMs: e.metrics?.latencyMs,
            errorRate: e.metrics?.errorRate ?? 0,
            status: e.status,
          });
        }
      }
    }
    this.visibleNodes = [...visible.values()];
    this.visibleById = visible;
    this.visibleEdges = [...merged.values()];
    if (this.selected && !visible.has(this.selected)) this.selected = '';
  }

  /** Lays the visible graph out when its shape changed, gliding from the old positions. */
  private runLayout(previous = this.positions) {
    const center =
      this.layout === 'radial'
        ? (this.visibleById.has(this.focusedNode) && this.focusedNode) ||
          (this.visibleById.has(this.selected) && this.selected) ||
          undefined
        : undefined;
    const key = [
      this.layout,
      center,
      this.visibleNodes.map(v => v.id).join(','),
      this.visibleEdges.map(e => `${e.source}>${e.target}`).join(','),
    ].join('|');
    if (key === this.layoutKey) return;
    this.layoutKey = key;
    this._tooltip = undefined;
    const nodes: MapLayoutNode[] = this.visibleNodes.map(v => ({
      id: v.id,
      group: v.kind === 'node' ? v.node?.group : undefined,
      pinned: this.pinned.get(v.id),
    }));
    const edges: MapLayoutEdge[] = this.visibleEdges.map(e => ({
      source: e.source,
      target: e.target,
    }));
    const options = {
      nodeWidth: NODE_SIZE.width,
      nodeHeight: NODE_SIZE.height,
      previous,
      center,
    };
    let next: Map<string, DiagramPoint>;
    if (this.layout === 'layered') next = layeredLayout(nodes, edges, options);
    else if (this.layout === 'radial')
      next = radialLayout(nodes, edges, options);
    else next = forceLayout(nodes, edges, options);
    this.glide(previous, next);
    this.positions = next;
  }

  private glide(
    from: Map<string, DiagramPoint>,
    to: Map<string, DiagramPoint>,
  ) {
    this.stopGlide?.();
    this.overrides.clear();
    if (!from.size || prefersReducedMotion() || !this.startApplied) return;
    const moving = [...to].filter(([id, p]) => {
      const f = from.get(id);
      return f && (f.x !== p.x || f.y !== p.y);
    });
    if (!moving.length) return;
    this.stopGlide = tween({
      duration: 450,
      easing: easeInOutCubic,
      onUpdate: t => {
        for (const [id, p] of moving) {
          const f = from.get(id) ?? p;
          this.overrides.set(id, {
            x: f.x + (p.x - f.x) * t,
            y: f.y + (p.y - f.y) * t,
          });
        }
        this.requestUpdate();
      },
      onDone: () => {
        this.overrides.clear();
        this.stopGlide = undefined;
        this.requestUpdate();
      },
    });
  }

  private centerOf(id: string): DiagramPoint {
    return this.overrides.get(id) ?? this.positions.get(id) ?? { x: 0, y: 0 };
  }

  private rectOf(id: string): DiagramRect {
    const c = this.centerOf(id);
    const s = this.measure.size(id);
    return {
      x: c.x - s.width / 2,
      y: c.y - s.height / 2,
      width: s.width,
      height: s.height,
    };
  }

  private neighbours(id: string, direction: 'up' | 'down'): string[] {
    const ids = this.visibleEdges
      .filter(e => (direction === 'down' ? e.source === id : e.target === id))
      .map(e => (direction === 'down' ? e.target : e.source));
    const vertical = this.layout !== 'layered';
    return ids.sort((a, b) =>
      vertical
        ? this.centerOf(a).x - this.centerOf(b).x
        : this.centerOf(a).y - this.centerOf(b).y,
    );
  }

  private impactSet(): Set<string> | undefined {
    if (this.impact === 'none' || !this.visibleById.has(this.selected))
      return undefined;
    return reachable(this.selected, this.visibleEdges, this.impact);
  }

  // ── Private methods: interaction

  private announce(message: string) {
    this._announcement = '';
    requestAnimationFrame(() => {
      this._announcement = message;
    });
  }

  private select(v: VisibleNode) {
    this.selected = v.id;
    this.emit<DependencyMapSelectDetail>('select', {
      id: v.id,
      node: v.node,
      group: v.group,
    });
  }

  private moveFocusTo(id: string) {
    this._focusId = id;
    this.updateComplete.then(() => {
      this.nodeElement(id)?.focus({ preventScroll: true });
      const r = this.itemRect(id);
      const view = this.viewport.visibleRect();
      if (
        r &&
        (r.x < view.x ||
          r.y < view.y ||
          r.x + r.width > view.x + view.width ||
          r.y + r.height > view.y + view.height)
      ) {
        this.centerOn(r.x + r.width / 2, r.y + r.height / 2);
      }
    });
  }

  private toggleGroup(id: string, collapsed: boolean) {
    const next = new Set(this._collapsedGroups);
    if (collapsed) next.add(id);
    else next.delete(id);
    this._collapsedGroups = next;
    this.emit<DependencyMapGroupDetail>('group-toggle', { id, collapsed });
  }

  private toggleType(type: string, allTypes: string[]) {
    const current = this.filter.types ?? allTypes;
    const types = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    this.filter = {
      ...this.filter,
      types: types.length === allTypes.length ? undefined : types,
    };
    this.emit<DependencyMapFilterDetail>('filter-change', {
      filter: this.filter,
    });
  }

  private onNodeKeyDown(event: KeyboardEvent, v: VisibleNode) {
    if (event.target !== event.currentTarget) return;
    const done = (fn: () => void) => {
      event.preventDefault();
      event.stopPropagation();
      fn();
    };
    const { key } = event;
    if (key === 'Enter' || key === ' ') {
      done(() => {
        if (
          v.kind === 'group' &&
          v.group &&
          key === 'Enter' &&
          event.shiftKey
        ) {
          this.expandGroup(v.group.id);
        } else this.select(v);
      });
    } else if (key === 'ArrowDown' || key === 'ArrowUp') {
      const direction = key === 'ArrowDown' ? 'down' : 'up';
      const next = this.neighbours(v.id, direction)[0];
      if (next) {
        done(() => {
          this.navStep = { from: v.id, direction };
          this.moveFocusTo(next);
        });
      }
    } else if (key === 'ArrowLeft' || key === 'ArrowRight') {
      const step = this.navStep;
      const row = step ? this.neighbours(step.from, step.direction) : [];
      const at = row.indexOf(v.id);
      const rtl = getComputedStyle(this).direction === 'rtl';
      const delta = (key === 'ArrowRight') !== rtl ? 1 : -1;
      const next = at >= 0 ? row[at + delta] : undefined;
      if (next) done(() => this.moveFocusTo(next));
    } else if (key === 'f' || key === 'F') {
      done(() => {
        const id = this.focusedNode === v.id ? '' : v.id;
        this.focusedNode = id;
        this.emit<DependencyMapFocusDetail>('focus-change', {
          id: id || null,
          hops: this.hops,
        });
      });
    } else if (key === 'Home' && this.visibleNodes[0]) {
      done(() => this.moveFocusTo(this.visibleNodes[0].id));
    }
  }

  private onViewportKeyDown = (event: KeyboardEvent) => {
    if (event.defaultPrevented) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      if (this.focusedNode) {
        this.focusedNode = '';
        this.emit<DependencyMapFocusDetail>('focus-change', {
          id: null,
          hops: this.hops,
        });
      } else this.selected = '';
      return;
    }
    this.handleCanvasKey(event);
  };

  private onNodePointerDown(event: PointerEvent, v: VisibleNode) {
    if (event.button !== 0 || this.viewport.spaceHeld) return;
    const origin = event.composedPath()[0];
    if (origin instanceof Element && origin.closest(INTERACTIVE)) return;
    event.stopPropagation();
    const element = event.currentTarget as HTMLElement;
    element.focus({ preventScroll: true });
    this._focusId = v.id;
    this.nodeDrag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      id: v.id,
      origin: this.centerOf(v.id),
      element,
      moved: false,
    };
    try {
      element.setPointerCapture(event.pointerId);
    } catch {
      // Synthetic pointers cannot be captured.
    }
    element.addEventListener('pointermove', this.onDragMove);
    element.addEventListener('pointerup', this.onDragUp);
    element.addEventListener('pointercancel', this.onDragUp);
  }

  private onDragMove = (event: PointerEvent) => {
    const drag = this.nodeDrag;
    if (!drag || event.pointerId !== drag.pointerId || this.readonly) return;
    const { zoom } = this.viewport.view;
    const dx = (event.clientX - drag.startX) / zoom;
    const dy = (event.clientY - drag.startY) / zoom;
    if (!drag.moved && Math.hypot(dx * zoom, dy * zoom) < DRAG_THRESHOLD)
      return;
    drag.moved = true;
    const position = { x: drag.origin.x + dx, y: drag.origin.y + dy };
    this.positions.set(drag.id, position);
    this.pinned.set(drag.id, position);
    this.requestUpdate();
  };

  private onDragUp = (event: PointerEvent) => {
    const drag = this.nodeDrag;
    if (!drag || event.pointerId !== drag.pointerId) return;
    this.nodeDrag = undefined;
    drag.element.removeEventListener('pointermove', this.onDragMove);
    drag.element.removeEventListener('pointerup', this.onDragUp);
    drag.element.removeEventListener('pointercancel', this.onDragUp);
    try {
      if (drag.element.hasPointerCapture(drag.pointerId)) {
        drag.element.releasePointerCapture(drag.pointerId);
      }
    } catch {
      // The pointer is already gone.
    }
    const v = this.visibleById.get(drag.id);
    if (!v) return;
    if (drag.moved) {
      this.emit<DependencyMapMoveDetail>('node-drag-end', {
        id: drag.id,
        position: this.centerOf(drag.id),
      });
    } else this.select(v);
  };

  private nodeElements(): [string, HTMLElement][] {
    const out: [string, HTMLElement][] = [];
    this.renderRoot.querySelectorAll<HTMLElement>('.dm-node').forEach(el => {
      if (el.dataset.id) out.push([el.dataset.id, el]);
    });
    return out;
  }

  private nodeElement(id: string): HTMLElement | null {
    return this.renderRoot.querySelector<HTMLElement>(
      `.dm-node[data-id="${CSS.escape(id)}"]`,
    );
  }

  // ── Render helpers

  private statusLabel(status: DependencyMapStatus): string {
    return this.i18n.t(
      (
        {
          healthy: 'dependencyMapHealthy',
          degraded: 'dependencyMapDegraded',
          down: 'dependencyMapDown',
          unknown: 'dependencyMapUnknown',
        } as const
      )[status],
    );
  }

  private formatRps(rps: number): string {
    return new Intl.NumberFormat(this.i18n.locale, {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(rps);
  }

  /** The point where the line from `center` toward `toward` leaves the node's box. */
  private exitPoint(id: string, toward: DiagramPoint): DiagramPoint {
    const c = this.centerOf(id);
    const s = this.measure.size(id);
    const dx = toward.x - c.x;
    const dy = toward.y - c.y;
    if (!dx && !dy) return c;
    const scale = Math.min(
      dx ? (s.width / 2 + 4) / Math.abs(dx) : Infinity,
      dy ? (s.height / 2 + 4) / Math.abs(dy) : Infinity,
    );
    return { x: c.x + dx * scale, y: c.y + dy * scale };
  }

  private renderEdges(impact: Set<string> | undefined, shown: Set<string>) {
    const maxRps = Math.max(1, ...this.visibleEdges.map(e => e.rps));
    return this.visibleEdges
      .filter(e => shown.has(e.source) || shown.has(e.target))
      .map(e => {
        const a = this.centerOf(e.source);
        const b = this.centerOf(e.target);
        const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
        // A gentle bend, always to the same side of the direction of travel.
        const ctrl = {
          x: (a.x + b.x) / 2 - ((b.y - a.y) / len) * len * 0.08,
          y: (a.y + b.y) / 2 + ((b.x - a.x) / len) * len * 0.08,
        };
        const start = this.exitPoint(e.source, ctrl);
        const end = this.exitPoint(e.target, ctrl);
        const width =
          1.5 + 4 * (Math.log10(1 + e.rps) / Math.log10(1 + maxRps));
        const angle = Math.atan2(end.y - ctrl.y, end.x - ctrl.x);
        const size = 6 + width;
        const tip = `M ${end.x} ${end.y} L ${end.x - size * Math.cos(angle - 0.45)} ${end.y - size * Math.sin(angle - 0.45)} L ${end.x - size * Math.cos(angle + 0.45)} ${end.y - size * Math.sin(angle + 0.45)} Z`;
        const onImpact =
          !!impact &&
          impact.has(e.source) &&
          impact.has(e.target) &&
          (this.impact === 'upstream' ? impact.has(e.source) : true);
        let tone = '';
        if (e.status === 'down' || e.errorRate >= 0.05) tone = 'is-error';
        else if (e.status === 'degraded' || e.errorRate >= 0.01)
          tone = 'is-warning';
        const d = `M ${start.x} ${start.y} Q ${ctrl.x} ${ctrl.y} ${end.x} ${end.y}`;
        const mid = {
          x: (start.x + 2 * ctrl.x + end.x) / 4,
          y: (start.y + 2 * ctrl.y + end.y) / 4,
        };
        const showCount = e.edges.length > 1;
        return svg`<g class=${classMap({
          'dm-edge': true,
          [tone]: !!tone,
          'is-impact': onImpact,
          'is-dim': !!impact && !onImpact,
          'is-down': e.status === 'down',
        })}>
          <path class="dm-edge-line" d=${d} style="stroke-width: ${width}"></path>
          <path class="dm-edge-tip" d=${tip}></path>
          <path
            class="dm-edge-hit"
            d=${d}
            @pointerenter=${(ev: PointerEvent) => this.showTooltip(ev, e)}
            @pointermove=${(ev: PointerEvent) => this.showTooltip(ev, e)}
            @pointerleave=${() => {
              this._tooltip = undefined;
            }}
          ></path>
          ${
            showCount
              ? svg`<text class="dm-edge-count" x=${mid.x} y=${mid.y - 6}>${this.i18n.t('dependencyMapEdgeCount')(e.edges.length)}</text>`
              : nothing
          }
        </g>`;
      });
  }

  private showTooltip(event: PointerEvent, edge: VisibleEdge) {
    const vr = this._viewportEl?.getBoundingClientRect();
    this._tooltip = {
      x: event.clientX - (vr?.left ?? 0),
      y: event.clientY - (vr?.top ?? 0),
      edge,
    };
  }

  private renderTooltip() {
    const t = this._tooltip;
    if (!t) return nothing;
    const { edge } = t;
    const name = (id: string) => {
      const v = this.visibleById.get(id);
      return v?.node?.headline ?? v?.group?.label ?? id;
    };
    const parts = [
      edge.edges[0]?.type ?? edge.edges[0]?.label,
      edge.rps ? this.i18n.t('dependencyMapRps')(this.formatRps(edge.rps)) : '',
      edge.latencyMs
        ? this.i18n.t('dependencyMapLatency')(
            formatDuration(edge.latencyMs, this.i18n.locale),
          )
        : '',
      edge.errorRate
        ? this.i18n.t('dependencyMapErrors')(
            new Intl.NumberFormat(this.i18n.locale, {
              style: 'percent',
              maximumFractionDigits: 1,
            }).format(edge.errorRate),
          )
        : '',
    ].filter(Boolean);
    return html`<div
      class="dm-tooltip"
      aria-hidden="true"
      style="left: ${t.x + 14}px; top: ${t.y + 14}px;"
    >
      <strong>${name(edge.source)} → ${name(edge.target)}</strong>
      ${parts.length ? html`<span>${parts.join(' · ')}</span>` : nothing}
    </div>`;
  }

  private renderGroups() {
    // Rings of hops cut across groups, so a radial map draws no group boxes.
    if (this.layout === 'radial') return [];
    const out = [];
    for (const g of this.groups) {
      const members = this.visibleNodes.filter(
        v => v.kind === 'node' && v.node?.group === g.id,
      );
      if (members.length && !this._collapsedGroups.has(g.id)) {
        const b = boundsOf(members.map(m => this.rectOf(m.id)));
        if (b) {
          const status = worst(members.map(m => m.status));
          out.push(
            html`<div
              class=${classMap({ 'dm-group': true, [`st-${status}`]: true })}
              style="left: ${b.x - 28}px; top: ${b.y - 44}px; width: ${b.width +
              56}px; height: ${b.height + 72}px;"
            >
              <span class="dm-group-label">
                <wc-icon name=${g.icon ?? 'lan'}></wc-icon>${g.label}
                <button
                  type="button"
                  class="dm-group-toggle"
                  aria-label=${this.i18n.t('dependencyMapCollapseGroup')(
                    g.label,
                  )}
                  @click=${() => this.collapseGroup(g.id)}
                >
                  <wc-icon name="unfold_less"></wc-icon>
                </button>
              </span>
            </div>`,
          );
        }
      }
    }
    return out;
  }

  private renderNode(
    v: VisibleNode,
    focusId: string,
    impact: Set<string> | undefined,
    lod: string,
  ) {
    const c = this.centerOf(v.id);
    const name = v.node?.headline ?? v.group?.label ?? v.id;
    const type =
      v.kind === 'group'
        ? this.i18n.t('dependencyMapGroupCount')(v.members.length)
        : (v.node?.type ?? '');
    const icon =
      v.kind === 'group'
        ? (v.group?.icon ?? 'folder')
        : (v.node?.icon ?? 'deployed_code');
    const upstream = this.visibleEdges.filter(e => e.target === v.id).length;
    const downstream = this.visibleEdges.filter(e => e.source === v.id).length;
    const selected = this.selected === v.id;
    const metrics =
      lod === 'detail' && v.node?.metrics
        ? Object.entries(v.node.metrics).slice(0, 3)
        : [];
    return html`<div
      class=${classMap({
        'dm-node': true,
        [`st-${v.status}`]: true,
        'is-group': v.kind === 'group',
        'is-selected': selected,
        'is-impact': !!impact && impact.has(v.id) && !selected,
        'is-dim': !!impact && !impact.has(v.id),
        'is-focus': this.focusedNode === v.id,
      })}
      data-id=${v.id}
      role="button"
      aria-pressed=${selected ? 'true' : 'false'}
      aria-label=${this.i18n.t('dependencyMapNode')(
        name,
        type,
        this.statusLabel(v.status),
        upstream,
        downstream,
      )}
      tabindex=${focusId === v.id ? '0' : '-1'}
      style="left: ${c.x}px; top: ${c.y}px;"
      @pointerdown=${(e: PointerEvent) => this.onNodePointerDown(e, v)}
      @keydown=${(e: KeyboardEvent) => this.onNodeKeyDown(e, v)}
      @dblclick=${() => {
        if (v.kind === 'group' && v.group) this.expandGroup(v.group.id);
      }}
      @focus=${() => {
        this._focusId = v.id;
      }}
    >
      <span class="dm-ring"><wc-icon name=${icon}></wc-icon></span>
      <span class="dm-text">
        <span class="dm-name">${name}</span>
        ${type ? html`<span class="dm-type">${type}</span>` : nothing}
        ${metrics.length
          ? html`<span class="dm-metrics"
              >${metrics.map(
                ([k, val]) => html`<span>${k} <b>${val}</b></span>`,
              )}</span
            >`
          : nothing}
      </span>
      ${v.kind === 'group' && v.group
        ? html`<button
            type="button"
            class="dm-group-toggle"
            tabindex="-1"
            aria-label=${this.i18n.t('dependencyMapExpandGroup')(v.group.label)}
            @click=${() => v.group && this.expandGroup(v.group.id)}
          >
            <wc-icon name="unfold_more"></wc-icon>
          </button>`
        : nothing}
    </div>`;
  }

  private renderLegend() {
    if (this.hideLegend) return nothing;
    const types = new Map<string, { icon?: string; count: number }>();
    for (const n of this.nodes) {
      if (n.type) {
        const t = types.get(n.type) ?? { icon: n.icon, count: 0 };
        t.count += 1;
        types.set(n.type, t);
      }
    }
    const all = [...types.keys()];
    const active = this.filter.types ?? all;
    return html`<div
      class="dm-legend"
      role="group"
      aria-label=${this.i18n.t('dependencyMapLegend')}
    >
      ${all.length
        ? html`<div class="dm-legend-types">
            ${all.map(type => {
              const t = types.get(type);
              const on = active.includes(type);
              return html`<button
                type="button"
                class=${classMap({ 'dm-type-toggle': true, 'is-off': !on })}
                aria-pressed=${on ? 'true' : 'false'}
                title=${this.i18n.t('dependencyMapShowType')(type)}
                @click=${() => this.toggleType(type, all)}
              >
                <wc-icon name=${t?.icon ?? 'deployed_code'}></wc-icon
                >${type}<span class="dm-count">${t?.count}</span>
              </button>`;
            })}
          </div>`
        : nothing}
      <div class="dm-legend-keys">
        <span
          ><i class="dm-dot st-healthy"></i>${this.i18n.t(
            'dependencyMapHealthy',
          )}</span
        >
        <span
          ><i class="dm-dot st-degraded"></i>${this.i18n.t(
            'dependencyMapDegraded',
          )}</span
        >
        <span
          ><i class="dm-dot st-down"></i>${this.i18n.t(
            'dependencyMapDown',
          )}</span
        >
        ${this.impact !== 'none'
          ? html`<span
              ><i class="dm-bar is-impact"></i>${this.i18n.t(
                'dependencyMapImpact',
              )}</span
            >`
          : nothing}
        <span
          ><i class="dm-bar"></i>${this.i18n.t('dependencyMapTraffic')}</span
        >
      </div>
    </div>`;
  }

  // ── Render

  protected render() {
    const { x, y, zoom } = this.viewport.view;
    let lod = 'card';
    if (zoom < DOT_ZOOM) lod = 'dot';
    else if (zoom >= DETAIL_ZOOM) lod = 'detail';
    const impact = this.impactSet();
    const focusId = this.visibleById.has(this._focusId)
      ? this._focusId
      : (this.visibleNodes[0]?.id ?? '');
    const shown = new Set(
      this.visibleNodes
        .filter(
          v =>
            this.nearView(this.rectOf(v.id)) ||
            v.id === focusId ||
            v.id === this.selected,
        )
        .map(v => v.id),
    );
    return html`
      <div
        class=${classMap({
          'dm-viewport': true,
          [`lod-${lod}`]: true,
          'is-panning': this.viewport.panning,
          'is-space': this.viewport.spaceHeld,
        })}
        tabindex="0"
        role="region"
        aria-label=${this.label || this.i18n.t('dependencyMapLabel')}
        aria-describedby="instructions"
        style=${this.gridStyle()}
        @keydown=${this.onViewportKeyDown}
      >
        <div
          class="dm-world"
          style="transform: translate(${x}px, ${y}px) scale(${zoom}); --_zoom: ${zoom};"
        >
          <div class="dm-groups">${this.renderGroups()}</div>
          <svg class="dm-edges" width="1" height="1" aria-hidden="true">
            ${this.renderEdges(impact, shown)}
          </svg>
          <div
            class="dm-nodes"
            role="group"
            aria-label=${this.label || this.i18n.t('dependencyMapLabel')}
          >
            ${repeat(
              this.visibleNodes.filter(v => shown.has(v.id)),
              v => v.id,
              v => this.renderNode(v, focusId, impact, lod),
            )}
          </div>
        </div>
        ${this.renderLegend()} ${this.renderTooltip()}
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

// Nodes are measured after they render, so a second update is expected.
DependencyMap.disableWarning?.('change-in-update');
