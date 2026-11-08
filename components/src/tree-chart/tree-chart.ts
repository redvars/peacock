import { html, nothing, svg, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { repeat } from 'lit/directives/repeat.js';
import IndividualComponent from '@/IndividualComponent.js';
import { DiagramCanvasElement } from '@/__internal/diagram/canvas-base.js';
import { MeasureController } from '@/__internal/diagram/measure-controller.js';
import { boundsOf, roundedPath } from '@/__internal/diagram/geometry.js';
import { History } from '@/__internal/diagram/history.js';
import {
  easeOutCubic,
  prefersReducedMotion,
  tween,
} from '@/__internal/diagram/motion.js';
import type { DiagramOverview } from '@/__internal/diagram/host.js';
import type {
  DiagramPoint,
  DiagramRect,
  DiagramView,
  DiagramViewportDetail,
} from '@/__internal/diagram/types.js';
import {
  layoutTree,
  linkPoints,
  type LayoutInput,
  type LayoutOptions,
} from './tree-chart-layout.js';
import styles from './tree-chart.scss';

export type TreeChartOrientation = 'vertical' | 'horizontal';

export type TreeChartAccent =
  | 'primary'
  | 'tertiary'
  | 'blue'
  | 'green'
  | 'orange'
  | 'purple'
  | 'red'
  | 'yellow'
  | 'neutral';

/** One box in the tree. Items refer to their parent, so rows from a database work as they are. */
export interface TreeChartItem {
  id: string;
  /** The parent's id; leave it out (or point it at a missing id) for a root. */
  parentId?: string | null;
  headline: string;
  supportingText?: string;
  /** An image URL for the avatar. Without it, and without `icon`, the avatar shows initials. */
  avatar?: string;
  /** Material Symbols name, shown in a tinted tile instead of an avatar. */
  icon?: string;
  accent?: TreeChartAccent;
  /** A short chip, such as a department. */
  badge?: string;
  /** Has children that are not loaded yet: expanding it fires `expand` so you can add them. */
  hasChildren?: boolean;
  /** Starts collapsed. */
  collapsed?: boolean;
  /** Your own data, kept with the item. */
  data?: Record<string, unknown>;
}

export type TreeChartChangeReason = 'move' | 'add' | 'remove' | 'undo' | 'redo';

/** Detail of `change`. */
export interface TreeChartChangeDetail {
  items: TreeChartItem[];
  reason: TreeChartChangeReason;
}

/** Detail of `select`, `expand` and `collapse`. */
export interface TreeChartItemDetail {
  id: string;
  item: TreeChartItem;
}

/** Detail of `reparent`. */
export interface TreeChartReparentDetail {
  id: string;
  parentId: string | null;
  previousParentId: string | null;
}

/** Detail of `add`. */
export interface TreeChartAddDetail {
  /** The parent the new item gets. */
  parentId: string | null;
  /** Whether it was added below (`child`) or beside (`sibling`) the item `of`. */
  position: 'child' | 'sibling';
  of: string;
}

/** Detail of `delete`. */
export interface TreeChartDeleteDetail {
  ids: string[];
}

/** Detail of `viewport-change`. */
export type TreeChartViewportDetail = DiagramViewportDetail;

const DEFAULT_SIZE = { width: 240, height: 72 };

/** Below this zoom a fitted tree is hard to read, so it starts at its root instead. */
const MIN_FIT_ZOOM = 0.5;

const DRAG_THRESHOLD = 5;

const INTERACTIVE = 'button, a, input, wc-icon-button, wc-button';

const LAYOUT: Omit<LayoutOptions, 'orientation' | 'compact'> = {
  siblingGap: 32,
  levelGap: 64,
  stackGap: 12,
  stackIndent: 20,
};

/**
 * @label Tree chart
 * @tag wc-tree-chart
 * @rawTag tree-chart
 * @summary A hierarchy laid out as a tidy tree on an infinite canvas: org charts, taxonomies, sitemaps, decision trees.
 *
 * @overview
 * <p>Set <code>items</code> to a flat list where each item names its <code>parentId</code>; the chart lays
 * the tree out with each card's real size. Top to bottom by default, or left to right with
 * <code>orientation="horizontal"</code>. <code>compact</code> stacks teams with no further levels in a
 * column under their manager, which keeps wide organisations narrow.</p>
 * <p>A card shows an avatar (or an <code>icon</code>), a headline, supporting text and a
 * <code>badge</code>. Put your own card in <code>slot="item:&lt;id&gt;"</code>. The chip under a card
 * shows how many items are below it and expands or collapses them (<code>expand</code> and
 * <code>collapse</code> fire). For lazy loading, give an item <code>hasChildren</code> and add its
 * children when it fires <code>expand</code>; it shows a spinner until they arrive.</p>
 * <p><code>search(text)</code> expands the way to every match, highlights the path from the root and
 * dims the rest, and zooms to the first match; <code>clearSearch()</code> undoes it.</p>
 * <p>With <code>editable</code>, drag a card onto another to change its parent (never into its own
 * branch), add an item below or beside with the buttons on a card, and delete with Delete, which
 * moves the item's children up to its parent. <code>reparent</code>, <code>add</code> and
 * <code>delete</code> fire first and can be canceled; every edit then fires <code>change</code> with the
 * new <code>items</code>. Undo with Ctrl+Z. Expanding, collapsing and edits glide.</p>
 * <p>The tree follows the WAI-ARIA tree pattern with one tab stop. In a vertical chart Up goes to the
 * parent, Down to the first child, Left and Right to siblings (mirrored in right-to-left); a
 * horizontal chart turns the keys. Home and End go to the first and last item, <code>*</code> expands
 * all siblings, Enter selects and Shift + Enter expands or collapses. The canvas is infinite like
 * <code>wc-diagram</code>, with the <code>controls</code> and <code>minimap</code> slots.</p>
 *
 * @example
 * ```html
 * <wc-tree-chart id="org" style="height: 500px"></wc-tree-chart>
 * <script>
 *   document.getElementById('org').items = [
 *     { id: 'ceo', headline: 'Sarah Jenkins', supportingText: 'CEO' },
 *     { id: 'cto', parentId: 'ceo', headline: 'Michael Chen', supportingText: 'CTO', badge: 'Engineering' },
 *     { id: 'cpo', parentId: 'ceo', headline: 'Elena Rostova', supportingText: 'CPO', badge: 'Product' }
 *   ];
 * </script>
 * ```
 *
 * @slot controls - A `wc-diagram-controls`, shown at the bottom start corner.
 * @slot minimap - A `wc-diagram-minimap`, shown at the bottom end corner.
 * @slot item:<id> - Custom content for the item with that id, in place of the built-in card.
 *
 * @fires {CustomEvent<TreeChartItemDetail>} select - An item was chosen with a click, Enter or Space. Detail contains `{ id, item }`.
 * @fires {CustomEvent<TreeChartItemDetail>} expand - An item was expanded. Add its children now when they load lazily. Detail contains `{ id, item }`.
 * @fires {CustomEvent<TreeChartItemDetail>} collapse - An item was collapsed. Detail contains `{ id, item }`.
 * @fires {CustomEvent<TreeChartReparentDetail>} reparent - Before a dragged item gets a new parent. Cancel it to keep it where it was. Detail contains `{ id, parentId, previousParentId }`.
 * @fires {CustomEvent<TreeChartAddDetail>} add - Before a new item is added with a card's buttons. Cancel it to add the item your own way. Detail contains `{ parentId, position, of }`.
 * @fires {CustomEvent<TreeChartDeleteDetail>} delete - Before an item is removed. Cancel it to keep it. Detail contains `{ ids }`.
 * @fires {CustomEvent<TreeChartChangeDetail>} change - After every edit. Detail contains `{ items, reason }`.
 * @fires {CustomEvent<TreeChartViewportDetail>} viewport-change - Once per frame while the camera moves and once when it settles. Detail contains `{ x, y, zoom, settled }`.
 *
 * @cssprop --tree-chart-connector-color - Colour of connectors. Defaults to a mix of primary and outline-variant.
 * @cssprop --tree-chart-background - Canvas background. Defaults to surface-container-lowest.
 * @tags data
 */
@IndividualComponent
export class TreeChart extends DiagramCanvasElement {
  // ── Static

  static styles = [styles];

  // ── Properties

  /** The items, each naming its parent. Replaced with a new array, never mutated, on every edit. */
  @property({ attribute: false })
  items: TreeChartItem[] = [];

  /** Lays the tree out top to bottom or left to right. */
  @property({ type: String, reflect: true })
  orientation: TreeChartOrientation = 'vertical';

  /** Stacks children that have no children of their own in a column (vertical charts). */
  @property({ type: Boolean, reflect: true })
  compact = false;

  /** Id of the selected item. */
  @property({ type: String, reflect: true })
  selected = '';

  // ── State

  @state()
  private _collapsed = new Set<string>();

  @state()
  private _loading = new Set<string>();

  @state()
  private _focusId = '';

  @state()
  private _matches = new Set<string>();

  @state()
  private _path = new Set<string>();

  @state()
  private _drag?: { id: string; x: number; y: number; target?: string };

  @state()
  private _announcement = '';

  // ── Private fields

  @query('.tc-viewport')
  private readonly _viewportEl?: HTMLElement;

  private readonly measure = new MeasureController(this, {
    elements: () => this.nodeElements(),
    fallback: DEFAULT_SIZE,
  });

  private readonly history = new History<TreeChartItem[]>();

  private readonly handledKeys = new WeakSet<Event>();

  private byId = new Map<string, TreeChartItem>();

  private childMap = new Map<string, string[]>();

  private roots: string[] = [];

  private seenCollapsed = new Set<string>();

  /** Laid-out positions from the last render. */
  private positions = new Map<string, DiagramPoint>();

  private stacked = new Set<string>();

  private overrides = new Map<string, DiagramPoint>();

  private glideFrom?: { positions: Map<string, DiagramPoint>; anchor?: string };

  private stopGlide?: () => void;

  private pendingZoom?: string;

  private nodeDrag?: {
    pointerId: number;
    startX: number;
    startY: number;
    id: string;
    element: HTMLElement;
    moved: boolean;
  };

  // ── Lifecycle

  disconnectedCallback() {
    super.disconnectedCallback();
    this.stopGlide?.();
    this.endDrag(false);
  }

  protected willUpdate(changed: PropertyValues<this>) {
    super.willUpdate(changed);
    if (changed.has('items')) this.indexItems();
  }

  protected updated(changed: PropertyValues<this>) {
    this.playGlide();
    if (this.pendingZoom) {
      const id = this.pendingZoom;
      this.pendingZoom = undefined;
      this.zoomTo(id);
    }
    super.updated(changed);
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

  undo() {
    const previous = this.history.undo(this.items);
    if (previous) this.commit(previous, 'undo', false);
  }

  redo() {
    const next = this.history.redo(this.items);
    if (next) this.commit(next, 'redo', false);
  }

  /** Forgets the undo and redo history. */
  clearHistory() {
    this.history.clear();
    this.listeners.notify();
  }

  expand(id: string) {
    const item = this.byId.get(id);
    if (!item || !this._collapsed.has(id)) {
      if (item?.hasChildren && !this.childMap.get(id)?.length)
        this.requestChildren(item);
      return;
    }
    this.glide(() => {
      const next = new Set(this._collapsed);
      next.delete(id);
      this._collapsed = next;
    }, id);
    if (item.hasChildren && !this.childMap.get(id)?.length)
      this.requestChildren(item);
    else this.emit<TreeChartItemDetail>('expand', { id, item });
  }

  collapse(id: string) {
    const item = this.byId.get(id);
    if (!item || this._collapsed.has(id) || !this.hasKids(id)) return;
    this.glide(() => {
      const next = new Set(this._collapsed);
      next.add(id);
      this._collapsed = next;
    }, id);
    this.emit<TreeChartItemDetail>('collapse', { id, item });
  }

  /** Expands every item. */
  expandAll() {
    this.glide(() => {
      this._collapsed = new Set();
    });
  }

  /**
   * Highlights the items whose headline, supporting text or badge contains `text`, expands the way
   * to them, dims the rest and zooms to the first. Returns the ids of the matches.
   */
  search(text: string): string[] {
    const needle = text.trim().toLowerCase();
    if (!needle) {
      this.clearSearch();
      return [];
    }
    const matches = this.items
      .filter(i =>
        [i.headline, i.supportingText, i.badge].some(v =>
          v?.toLowerCase().includes(needle),
        ),
      )
      .map(i => i.id);
    const path = new Set<string>();
    const collapsed = new Set(this._collapsed);
    for (const id of matches) {
      let cursor: string | undefined = id;
      while (cursor) {
        path.add(cursor);
        const parent = this.parentOf(cursor);
        if (parent) collapsed.delete(parent);
        cursor = parent;
      }
    }
    this._collapsed = collapsed;
    this._matches = new Set(matches);
    this._path = path;
    this.announce(this.i18n.t('treeChartMatches')(matches.length));
    const [first] = matches;
    if (first) this.pendingZoom = first;
    return matches;
  }

  clearSearch() {
    this._matches = new Set();
    this._path = new Set();
  }

  /** Selects an item, fires `select`, and brings it into view. */
  selectItem(id: string) {
    const item = this.byId.get(id);
    if (!item) return;
    this.select(item);
    this.focusItem(id);
  }

  /** Moves keyboard focus to an item and pans it into view. */
  focusItem(id: string) {
    this._focusId = id;
    this.updateComplete.then(() => {
      this.nodeElement(id)?.focus({ preventScroll: true });
      this.keepInView(id);
    });
  }

  // ── Canvas hooks

  protected viewportElement() {
    return this._viewportEl;
  }

  protected contentBounds(): DiagramRect | undefined {
    return boundsOf([...this.positions.keys()].map(id => this.rectOf(id)));
  }

  protected selectionRects(): DiagramRect[] {
    return this.selected && this.positions.has(this.selected)
      ? [this.rectOf(this.selected)]
      : [];
  }

  protected itemRect(id: string): DiagramRect | undefined {
    return this.positions.has(id) ? this.rectOf(id) : undefined;
  }

  protected firstItemRect(): DiagramRect | undefined {
    return this.roots[0] && this.positions.has(this.roots[0])
      ? this.rectOf(this.roots[0])
      : undefined;
  }

  protected overviewItems(): DiagramOverview['items'] {
    return [...this.positions.keys()].map(id => ({
      ...this.rectOf(id),
      selected: id === this.selected,
    }));
  }

  protected isBackground(target: EventTarget | null): boolean {
    const el = target as Element | null;
    if (!el) return false;
    return (
      el === this._viewportEl ||
      ['tc-world', 'tc-links', 'tc-nodes'].some(c => el.classList?.contains(c))
    );
  }

  protected onBackgroundClick() {
    this.selected = '';
  }

  /** Fits the tree, or shows its root at 50% when fitting it all would be too small to read. */
  protected computeStartView(): DiagramView {
    if (this.startView || this.startPosition !== 'fit')
      return super.computeStartView();
    const bounds = this.contentBounds();
    const first = this.firstItemRect();
    if (!bounds || !first) return super.computeStartView();
    const fitted = this.viewport.viewForRect(bounds, this.padding);
    if (fitted.zoom >= MIN_FIT_ZOOM) return fitted;
    const zoom = MIN_FIT_ZOOM;
    const { width, height } = this.viewport.size();
    return this.orientation === 'vertical'
      ? {
          zoom,
          x: width / 2 - (first.x + first.width / 2) * zoom,
          y: this.padding - first.y * zoom,
        }
      : {
          zoom,
          x: this.padding - first.x * zoom,
          y: height / 2 - (first.y + first.height / 2) * zoom,
        };
  }

  // ── Private methods: data

  private indexItems() {
    this.byId = new Map(this.items.map(i => [i.id, i]));
    this.childMap = new Map();
    this.roots = [];
    for (const item of this.items) {
      const parent =
        item.parentId && this.byId.has(item.parentId)
          ? item.parentId
          : undefined;
      if (parent) {
        const list = this.childMap.get(parent) ?? [];
        list.push(item.id);
        this.childMap.set(parent, list);
      } else {
        this.roots.push(item.id);
      }
    }
    let collapsed: Set<string> | undefined;
    for (const item of this.items) {
      if (item.collapsed && !this.seenCollapsed.has(item.id)) {
        this.seenCollapsed.add(item.id);
        collapsed = collapsed ?? new Set(this._collapsed);
        collapsed.add(item.id);
      }
    }
    if (collapsed) this._collapsed = collapsed;
    if (this._loading.size) {
      const loading = new Set(
        [...this._loading].filter(
          id =>
            this.byId.get(id)?.hasChildren && !this.childMap.get(id)?.length,
        ),
      );
      if (loading.size !== this._loading.size) this._loading = loading;
    }
    if (this.selected && !this.byId.has(this.selected)) this.selected = '';
    this.measure.retain(new Set(this.byId.keys()));
  }

  private parentOf(id: string): string | undefined {
    const p = this.byId.get(id)?.parentId;
    return p && this.byId.has(p) ? p : undefined;
  }

  private hasKids(id: string): boolean {
    return !!this.childMap.get(id)?.length || !!this.byId.get(id)?.hasChildren;
  }

  /** Whether `id` is `ancestor` or below it. */
  private isWithin(id: string, ancestor: string): boolean {
    let cursor: string | undefined = id;
    while (cursor) {
      if (cursor === ancestor) return true;
      cursor = this.parentOf(cursor);
    }
    return false;
  }

  private requestChildren(item: TreeChartItem) {
    const next = new Set(this._loading);
    next.add(item.id);
    this._loading = next;
    this.emit<TreeChartItemDetail>('expand', { id: item.id, item });
  }

  private commit(
    next: TreeChartItem[],
    reason: TreeChartChangeReason,
    record = true,
  ) {
    if (record) this.history.push(this.items);
    this.glide(() => {
      this.items = next;
    });
    this.emit<TreeChartChangeDetail>('change', { items: next, reason });
    this.listeners.notify();
  }

  private announce(message: string) {
    this._announcement = '';
    requestAnimationFrame(() => {
      this._announcement = message;
    });
  }

  private select(item: TreeChartItem) {
    this.selected = item.id;
    this.emit<TreeChartItemDetail>('select', { id: item.id, item });
  }

  private uniqueId(base: string): string {
    if (!this.byId.has(base)) return base;
    let i = 2;
    while (this.byId.has(`${base}-${i}`)) i += 1;
    return `${base}-${i}`;
  }

  private reparent(id: string, parentId: string | null) {
    const item = this.byId.get(id);
    if (!item || (parentId && this.isWithin(parentId, id))) return;
    const previousParentId = this.parentOf(id) ?? null;
    if (previousParentId === parentId) return;
    const allowed = this.emit<TreeChartReparentDetail>(
      'reparent',
      { id, parentId, previousParentId },
      true,
    );
    if (!allowed) return;
    if (parentId && this._collapsed.has(parentId)) {
      const next = new Set(this._collapsed);
      next.delete(parentId);
      this._collapsed = next;
    }
    this.commit(
      this.items.map(i => (i.id === id ? { ...i, parentId } : i)),
      'move',
    );
    const parent = parentId ? this.byId.get(parentId) : undefined;
    this.announce(
      this.i18n.t('treeChartMoved')(item.headline, parent?.headline ?? ''),
    );
  }

  private add(of: string, position: 'child' | 'sibling') {
    const parentId = position === 'child' ? of : (this.parentOf(of) ?? null);
    const allowed = this.emit<TreeChartAddDetail>(
      'add',
      { parentId, position, of },
      true,
    );
    if (!allowed) return;
    const item: TreeChartItem = {
      id: this.uniqueId('item'),
      parentId,
      headline: this.i18n.t('treeChartNewItem'),
    };
    const at = this.items.findIndex(i => i.id === of);
    const next = [
      ...this.items.slice(0, at + 1),
      item,
      ...this.items.slice(at + 1),
    ];
    if (parentId && this._collapsed.has(parentId)) {
      const collapsed = new Set(this._collapsed);
      collapsed.delete(parentId);
      this._collapsed = collapsed;
    }
    this.commit(next, 'add');
    this.selected = item.id;
    this.emit<TreeChartItemDetail>('select', { id: item.id, item });
    this.focusItem(item.id);
  }

  /** Removes an item; its children move up to its parent. */
  private removeItem(id: string) {
    const item = this.byId.get(id);
    if (!item) return;
    if (!this.emit<TreeChartDeleteDetail>('delete', { ids: [id] }, true))
      return;
    const parentId = this.parentOf(id) ?? null;
    const siblings = parentId
      ? (this.childMap.get(parentId) ?? [])
      : this.roots;
    const neighbour =
      siblings[siblings.indexOf(id) + 1] ??
      siblings[siblings.indexOf(id) - 1] ??
      parentId;
    this.commit(
      this.items
        .filter(i => i.id !== id)
        .map(i => (i.parentId === id ? { ...i, parentId } : i)),
      'remove',
    );
    this.announce(this.i18n.t('treeChartRemoved')(item.headline));
    if (neighbour) this.focusItem(neighbour);
  }

  // ── Private methods: layout and motion

  private layout() {
    const nodes = new Map<string, LayoutInput>();
    const visit = (id: string) => {
      const kids = this._collapsed.has(id) ? [] : (this.childMap.get(id) ?? []);
      nodes.set(id, { id, children: kids });
      kids.forEach(visit);
    };
    this.roots.forEach(visit);
    const result = layoutTree(this.roots, nodes, id => this.measure.size(id), {
      ...LAYOUT,
      orientation: this.orientation,
      compact: this.compact,
    });
    this.positions = result.positions;
    this.stacked = result.stacked;
  }

  private positionOf(id: string): DiagramPoint {
    return this.overrides.get(id) ?? this.positions.get(id) ?? { x: 0, y: 0 };
  }

  private rectOf(id: string): DiagramRect {
    const p = this.positionOf(id);
    const s = this.measure.size(id);
    return { x: p.x, y: p.y, width: s.width, height: s.height };
  }

  /** Runs a change and glides items from where they were; new items grow out of `anchor`. */
  private glide(change: () => void, anchor?: string) {
    if (!prefersReducedMotion() && this.positions.size) {
      this.glideFrom = { positions: new Map(this.positions), anchor };
    }
    change();
  }

  private playGlide() {
    const from = this.glideFrom;
    this.glideFrom = undefined;
    if (!from) return;
    this.stopGlide?.();
    const to = new Map(this.positions);
    const start = new Map<string, DiagramPoint>();
    for (const [id, target] of to) {
      let origin = from.positions.get(id);
      if (!origin) {
        // New items start at their nearest visible ancestor, or the anchor.
        let cursor = this.parentOf(id);
        while (cursor && !from.positions.has(cursor))
          cursor = this.parentOf(cursor);
        origin = from.positions.get(cursor ?? from.anchor ?? '') ?? target;
      }
      if (origin.x !== target.x || origin.y !== target.y) start.set(id, origin);
    }
    if (!start.size) return;
    this.stopGlide = tween({
      duration: 320,
      easing: easeOutCubic,
      onUpdate: p => {
        for (const [id, origin] of start) {
          const target = to.get(id) ?? origin;
          this.overrides.set(id, {
            x: origin.x + (target.x - origin.x) * p,
            y: origin.y + (target.y - origin.y) * p,
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

  private keepInView(id: string) {
    const r = this.itemRect(id);
    if (!r) return;
    const v = this.viewport.visibleRect();
    const inside =
      r.x >= v.x &&
      r.y >= v.y &&
      r.x + r.width <= v.x + v.width &&
      r.y + r.height <= v.y + v.height;
    if (!inside) this.centerOn(r.x + r.width / 2, r.y + r.height / 2);
  }

  // ── Private methods: nodes

  private nodeElements(): [string, HTMLElement][] {
    const out: [string, HTMLElement][] = [];
    this.renderRoot.querySelectorAll<HTMLElement>('.tc-node').forEach(el => {
      if (el.dataset.id) out.push([el.dataset.id, el]);
    });
    return out;
  }

  private nodeElement(id: string): HTMLElement | null {
    return this.renderRoot.querySelector<HTMLElement>(
      `.tc-node[data-id="${CSS.escape(id)}"]`,
    );
  }

  /** Visible items in reading order. */
  private visibleOrder(): string[] {
    const out: string[] = [];
    const visit = (id: string) => {
      out.push(id);
      if (!this._collapsed.has(id))
        (this.childMap.get(id) ?? []).forEach(visit);
    };
    this.roots.forEach(visit);
    return out;
  }

  private siblingsOf(id: string): string[] {
    const parent = this.parentOf(id);
    return parent ? (this.childMap.get(parent) ?? []) : this.roots;
  }

  private onNodeKeyDown(event: KeyboardEvent, item: TreeChartItem) {
    if (event.target !== event.currentTarget) return;
    const handled = (fn: () => void) => {
      event.preventDefault();
      this.handledKeys.add(event);
      fn();
    };
    const { key } = event;
    const vertical = this.orientation === 'vertical';
    const rtl = getComputedStyle(this).direction === 'rtl';
    // The keys that point "back" and "forward" along a row, mirrored in right-to-left pages.
    const back = rtl ? 'ArrowRight' : 'ArrowLeft';
    const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
    const toParent = vertical ? 'ArrowUp' : back;
    const toChild = vertical ? 'ArrowDown' : forward;
    const prevSibling = vertical ? back : 'ArrowUp';
    const nextSibling = vertical ? forward : 'ArrowDown';
    const siblings = this.siblingsOf(item.id);
    const at = siblings.indexOf(item.id);
    const order = this.visibleOrder();
    const firstChild = this._collapsed.has(item.id)
      ? undefined
      : this.childMap.get(item.id)?.[0];
    if (key === 'Enter' && event.shiftKey) {
      handled(() =>
        this._collapsed.has(item.id)
          ? this.expand(item.id)
          : this.collapse(item.id),
      );
    } else if (key === 'Enter' || key === ' ') {
      handled(() => this.select(item));
    } else if (key === toParent && this.parentOf(item.id)) {
      handled(() => this.focusItem(this.parentOf(item.id) ?? item.id));
    } else if (key === toChild && firstChild) {
      handled(() => this.focusItem(firstChild));
    } else if (key === toChild && this._collapsed.has(item.id)) {
      handled(() => this.expand(item.id));
    } else if (key === prevSibling && siblings[at - 1]) {
      handled(() => this.focusItem(siblings[at - 1]));
    } else if (key === nextSibling && siblings[at + 1]) {
      handled(() => this.focusItem(siblings[at + 1]));
    } else if (key === 'Home' && order[0]) {
      handled(() => this.focusItem(order[0]));
    } else if (key === 'End' && order.length) {
      handled(() => this.focusItem(order[order.length - 1]));
    } else if (key === '*') {
      handled(() => siblings.forEach(id => this.expand(id)));
    } else if (
      (key === 'Delete' || key === 'Backspace') &&
      this.editable &&
      !this.readonly
    ) {
      handled(() => this.removeItem(item.id));
    }
  }

  private onViewportKeyDown = (event: KeyboardEvent) => {
    if (event.defaultPrevented || this.handledKeys.has(event)) return;
    const mod = event.ctrlKey || event.metaKey;
    const key = event.key.toLowerCase();
    const editing = this.editable && !this.readonly;
    if (mod && key === 'z' && editing) {
      event.preventDefault();
      if (event.shiftKey) this.redo();
      else this.undo();
    } else if (mod && key === 'y' && editing) {
      event.preventDefault();
      this.redo();
    } else if (key === 'escape') {
      event.preventDefault();
      this.selected = '';
      this.clearSearch();
    } else this.handleCanvasKey(event);
  };

  private onNodePointerDown(event: PointerEvent, item: TreeChartItem) {
    if (event.button !== 0 || this.viewport.spaceHeld) return;
    const origin = event.composedPath()[0];
    if (origin instanceof Element && origin.closest(INTERACTIVE)) return;
    event.stopPropagation();
    const element = event.currentTarget as HTMLElement;
    element.focus({ preventScroll: true });
    this._focusId = item.id;
    this.nodeDrag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      id: item.id,
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
    element.addEventListener('pointercancel', this.onDragCancel);
  }

  private onDragMove = (event: PointerEvent) => {
    const drag = this.nodeDrag;
    if (
      !drag ||
      event.pointerId !== drag.pointerId ||
      !this.editable ||
      this.readonly
    )
      return;
    if (
      !drag.moved &&
      Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) <
        DRAG_THRESHOLD
    ) {
      return;
    }
    drag.moved = true;
    const vr = this._viewportEl?.getBoundingClientRect();
    const point = this.viewport.toCanvas(event.clientX, event.clientY);
    let target: string | undefined;
    for (const id of this.positions.keys()) {
      const r = this.rectOf(id);
      if (
        id !== drag.id &&
        point.x >= r.x &&
        point.x <= r.x + r.width &&
        point.y >= r.y &&
        point.y <= r.y + r.height &&
        !this.isWithin(id, drag.id)
      ) {
        target = id;
      }
    }
    this._drag = {
      id: drag.id,
      x: event.clientX - (vr?.left ?? 0),
      y: event.clientY - (vr?.top ?? 0),
      target,
    };
  };

  private onDragUp = (event: PointerEvent) => {
    if (!this.nodeDrag || event.pointerId !== this.nodeDrag.pointerId) return;
    this.endDrag(true);
  };

  private onDragCancel = () => {
    this.endDrag(false);
  };

  private endDrag(commit: boolean) {
    const drag = this.nodeDrag;
    if (!drag) return;
    this.nodeDrag = undefined;
    const target = this._drag?.target;
    this._drag = undefined;
    drag.element.removeEventListener('pointermove', this.onDragMove);
    drag.element.removeEventListener('pointerup', this.onDragUp);
    drag.element.removeEventListener('pointercancel', this.onDragCancel);
    try {
      if (drag.element.hasPointerCapture(drag.pointerId)) {
        drag.element.releasePointerCapture(drag.pointerId);
      }
    } catch {
      // The pointer is already gone.
    }
    if (!commit) return;
    const item = this.byId.get(drag.id);
    if (!item) return;
    if (!drag.moved) this.select(item);
    else if (target) this.reparent(drag.id, target);
  }

  // ── Render

  private renderNode(id: string, focusId: string) {
    const item = this.byId.get(id);
    if (!item) return nothing;
    const p = this.positionOf(id);
    const kids = this.childMap.get(id) ?? [];
    const expandable = this.hasKids(id);
    const collapsed =
      this._collapsed.has(id) || (!!item.hasChildren && !kids.length);
    const loading = this._loading.has(id);
    const siblings = this.siblingsOf(id);
    let depth = 1;
    for (let c = this.parentOf(id); c; c = this.parentOf(c)) depth += 1;
    const searching = this._path.size > 0;
    const editing = this.editable && !this.readonly;
    const avatar = item.icon
      ? html`<span class=${`tc-tile accent-${item.accent ?? 'primary'}`}
          ><wc-icon name=${item.icon}></wc-icon
        ></span>`
      : html`<wc-avatar
          size="sm"
          name=${item.headline}
          src=${item.avatar ?? nothing}
        ></wc-avatar>`;
    return html`<div
      class=${classMap({
        'tc-node': true,
        'is-selected': this.selected === id,
        'is-match': this._matches.has(id),
        'is-dim': searching && !this._path.has(id),
        'is-dragging': this._drag?.id === id,
        'is-drop': this._drag?.target === id,
      })}
      data-id=${id}
      role="treeitem"
      aria-level=${depth}
      aria-setsize=${siblings.length}
      aria-posinset=${siblings.indexOf(id) + 1}
      aria-expanded=${expandable ? String(!collapsed) : nothing}
      aria-selected=${this.selected === id ? 'true' : 'false'}
      aria-busy=${loading ? 'true' : nothing}
      aria-label=${[item.headline, item.supportingText, item.badge]
        .filter(Boolean)
        .join(', ')}
      tabindex=${focusId === id ? '0' : '-1'}
      style="left: ${p.x}px; top: ${p.y}px;"
      @pointerdown=${(e: PointerEvent) => this.onNodePointerDown(e, item)}
      @keydown=${(e: KeyboardEvent) => this.onNodeKeyDown(e, item)}
      @focus=${() => {
        this._focusId = id;
      }}
    >
      <slot name=${`item:${id}`}>
        <div class="tc-card">
          ${avatar}
          <span class="tc-text">
            <span class="tc-headline">${item.headline}</span>
            ${item.supportingText
              ? html`<span class="tc-sub">${item.supportingText}</span>`
              : nothing}
          </span>
          ${item.badge
            ? html`<span class="tc-badge">${item.badge}</span>`
            : nothing}
        </div>
      </slot>
      ${expandable
        ? html`<button
            class="tc-count"
            type="button"
            tabindex="-1"
            aria-label=${collapsed
              ? this.i18n.t('treeChartExpand')(item.headline, kids.length)
              : this.i18n.t('treeChartCollapse')(item.headline)}
            @click=${() => (collapsed ? this.expand(id) : this.collapse(id))}
          >
            ${loading
              ? html`<wc-icon
                  class="tc-spin"
                  name="progress_activity"
                ></wc-icon>`
              : html`${kids.length ? kids.length : nothing}<wc-icon
                    name=${collapsed
                      ? 'keyboard_arrow_down'
                      : 'keyboard_arrow_up'}
                  ></wc-icon>`}
          </button>`
        : nothing}
      ${editing
        ? html`<span class="tc-actions">
            <button
              type="button"
              tabindex="-1"
              title=${this.i18n.t('treeChartAddChild')}
              aria-label=${this.i18n.t('treeChartAddChild')}
              @click=${() => this.add(id, 'child')}
            >
              <wc-icon name="subdirectory_arrow_right"></wc-icon>
            </button>
            ${this.parentOf(id)
              ? html`<button
                  type="button"
                  tabindex="-1"
                  title=${this.i18n.t('treeChartAddSibling')}
                  aria-label=${this.i18n.t('treeChartAddSibling')}
                  @click=${() => this.add(id, 'sibling')}
                >
                  <wc-icon name="add"></wc-icon>
                </button>`
              : nothing}
          </span>`
        : nothing}
    </div>`;
  }

  private renderLinks(shown: Set<string>) {
    const searching = this._path.size > 0;
    const out = [];
    for (const id of this.positions.keys()) {
      const parent = this.parentOf(id);
      if (
        parent &&
        this.positions.has(parent) &&
        (shown.has(id) || shown.has(parent))
      ) {
        const points = linkPoints(this.rectOf(parent), this.rectOf(id), {
          ...LAYOUT,
          orientation: this.orientation,
          stacked: this.stacked.has(parent),
        });
        const onPath = this._path.has(id) && this._path.has(parent);
        out.push(
          svg`<path class=${classMap({ 'tc-link': true, 'is-path': onPath, 'is-dim': searching && !onPath })} d=${roundedPath(points, 14)}></path>`,
        );
      }
    }
    return out;
  }

  protected render() {
    this.layout();
    const { x, y, zoom } = this.viewport.view;
    const order = this.visibleOrder();
    const focusId =
      this._focusId && this.positions.has(this._focusId)
        ? this._focusId
        : order[0];
    const shown = new Set(
      order.filter(
        id =>
          this.nearView(this.rectOf(id)) ||
          id === focusId ||
          id === this.selected,
      ),
    );
    const dragged = this._drag ? this.byId.get(this._drag.id) : undefined;
    return html`
      <div
        class=${classMap({
          'tc-viewport': true,
          'is-panning': this.viewport.panning,
          'is-space': this.viewport.spaceHeld,
          'is-dragging': !!this._drag,
        })}
        tabindex="0"
        role="region"
        aria-label=${this.label || this.i18n.t('treeChartLabel')}
        aria-describedby="instructions"
        style=${this.gridStyle()}
        @keydown=${this.onViewportKeyDown}
      >
        <div
          class="tc-world"
          style="transform: translate(${x}px, ${y}px) scale(${zoom});"
        >
          <svg class="tc-links" width="1" height="1" aria-hidden="true">
            ${this.renderLinks(shown)}
          </svg>
          <div
            class="tc-nodes"
            role="tree"
            aria-label=${this.label || this.i18n.t('treeChartLabel')}
          >
            ${repeat(
              order.filter(id => shown.has(id)),
              id => id,
              id => this.renderNode(id, focusId),
            )}
          </div>
        </div>
        ${dragged && this._drag
          ? html`<div
              class="tc-ghost"
              style="left: ${this._drag.x}px; top: ${this._drag.y}px;"
            >
              ${dragged.headline}
            </div>`
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

// Cards are measured after they render and laid out from those sizes, so a second update is expected.
TreeChart.disableWarning?.('change-in-update');
