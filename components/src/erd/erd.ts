import { html, nothing, svg, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { repeat } from 'lit/directives/repeat.js';
import IndividualComponent from '@/IndividualComponent.js';
import { DiagramCanvasElement } from '@/__internal/diagram/canvas-base.js';
import {
  boundsOf,
  edgeGeometry,
  inflateRect,
  nearestInDirection,
  polylineMidpoint,
  roundedPath,
  type EdgeGeometry,
} from '@/__internal/diagram/geometry.js';
import { markerShapes, markerTransform } from '@/__internal/diagram/markers.js';
import { History } from '@/__internal/diagram/history.js';
import {
  animateOut,
  easeInOutCubic,
  prefersReducedMotion,
  tween,
} from '@/__internal/diagram/motion.js';
import type { DiagramOverview } from '@/__internal/diagram/host.js';
import type {
  DiagramPoint,
  DiagramRect,
  DiagramSide,
  DiagramViewportDetail,
} from '@/__internal/diagram/types.js';
import { withinHops } from '@/dependency-map/dependency-map-layout.js';
import { layoutEntities } from './erd-layout.js';
import styles from './erd.scss';

/** Crow's-foot cardinality at one end of a relation. */
export type ErdCardinality =
  | 'one'
  | 'zero-or-one'
  | 'many'
  | 'one-or-many'
  | 'zero-or-many';

export type ErdAccent =
  | 'primary'
  | 'tertiary'
  | 'blue'
  | 'green'
  | 'orange'
  | 'purple'
  | 'red'
  | 'yellow'
  | 'neutral';

export interface ErdColumn {
  name: string;
  /** The data type, for example `uuid` or `varchar(120)`. */
  type?: string;
  /** Part of the primary key. */
  pk?: boolean;
  nullable?: boolean;
  unique?: boolean;
  /** Shown as the row's tooltip. */
  comment?: string;
}

/** A table, view or other entity. */
export interface ErdEntity {
  id: string;
  name: string;
  /** Shown before the name, and what the `schema` filter matches. */
  schema?: string;
  /** Material Symbols name for the header tile. Defaults to `table`. */
  icon?: string;
  accent?: ErdAccent;
  columns: ErdColumn[];
  /** Starts collapsed to its header. */
  collapsed?: boolean;
  /** A fixed top-left corner, in canvas pixels. Entities without one are laid out automatically. */
  position?: DiagramPoint;
  comment?: string;
}

/**
 * A reference from `source` (the entity holding the foreign key) to `target` (the entity it
 * references). With column names the line joins those rows; without, the headers.
 */
export interface ErdRelation {
  id: string;
  source: string;
  sourceColumn?: string;
  target: string;
  targetColumn?: string;
  /** How many `source` rows point at one `target` row. Defaults to `many`. */
  sourceCardinality?: ErdCardinality;
  /** How many `target` rows one `source` row points at. Defaults to `one`. */
  targetCardinality?: ErdCardinality;
  label?: string;
}

export type ErdChangeReason =
  | 'move'
  | 'rename'
  | 'entity-add'
  | 'column-add'
  | 'column-remove'
  | 'column-update'
  | 'connect'
  | 'cardinality'
  | 'delete'
  | 'undo'
  | 'redo';

/** Detail of `select`. */
export interface ErdSelectDetail {
  id: string;
  kind: 'entity' | 'relation';
  entity?: ErdEntity;
  relation?: ErdRelation;
}

/** Detail of `entity-move`. */
export interface ErdMoveDetail {
  id: string;
  position: DiagramPoint;
}

/** Detail of `toggle`. */
export interface ErdToggleDetail {
  id: string;
  collapsed: boolean;
}

/** Detail of `connect`. Cancel it to keep the relation from being added. */
export interface ErdConnectDetail {
  relation: ErdRelation;
}

/** Detail of `delete`. Cancel it to keep the items. */
export interface ErdDeleteDetail {
  entities: string[];
  relations: string[];
}

/** Detail of `change`. */
export interface ErdChangeDetail {
  entities: ErdEntity[];
  relations: ErdRelation[];
  reason: ErdChangeReason;
}

/** Detail of `focus-change`. */
export interface ErdFocusDetail {
  id: string | null;
  hops: number;
}

/** Detail of `viewport-change`. */
export type ErdViewportDetail = DiagramViewportDetail;

interface ErdSnapshot {
  entities: ErdEntity[];
  relations: ErdRelation[];
}

interface RowRef {
  entity: string;
  column?: string;
}

/** Fixed sizes, so relations can be routed to rows without measuring. */
const WIDTH = 264;
const BORDER = 1;
const HEADER = 48;
const ROW = 28;
/** Space above the first row and below the last. */
const ROWS_PADDING = 4;
const ADD_ROW = 32;

const DRAG_THRESHOLD = 4;

const INTERACTIVE = 'button, a, input, wc-icon-button';

/** Below this zoom, rows are drawn as bars. */
const FAR_ZOOM = 0.4;

const CARDINALITY_PRESETS: {
  key:
    | 'erdManyToOne'
    | 'erdZeroOrManyToOne'
    | 'erdOneToOne'
    | 'erdZeroOrOneToOne'
    | 'erdManyToMany';
  source: ErdCardinality;
  target: ErdCardinality;
}[] = [
  { key: 'erdManyToOne', source: 'many', target: 'one' },
  { key: 'erdZeroOrManyToOne', source: 'zero-or-many', target: 'one' },
  { key: 'erdOneToOne', source: 'one', target: 'one' },
  { key: 'erdZeroOrOneToOne', source: 'zero-or-one', target: 'one' },
  { key: 'erdManyToMany', source: 'many', target: 'many' },
];

let relationCounter = 0;

/**
 * @label ERD
 * @tag wc-erd
 * @rawTag erd
 * @summary An entity-relationship diagram: tables with their columns, joined by crow's-foot relations.
 *
 * @overview
 * <p>Set <code>entities</code> (each with <code>columns</code>) and <code>relations</code>. A relation
 * runs from the entity holding the foreign key (<code>source</code>, <code>sourceColumn</code>) to the
 * one it references (<code>target</code>, <code>targetColumn</code>), and its ends show crow's-foot
 * cardinality (many to one by default). Lines join the column rows and route at right angles. Primary
 * keys show a key, foreign keys a link. Hover an entity or a column to highlight what it is joined to.</p>
 * <p>Entities without a <code>position</code> are laid out automatically: referenced tables to the left
 * of the tables that reference them. Collapse an entity to its header with the chevron (or Shift+Enter);
 * the layout closes the gap. <code>schema</code> shows one schema, and <code>focused-node</code> with
 * <code>hops</code> shows one entity's neighbourhood (press F on an entity). Zoomed far out, rows
 * become bars.</p>
 * <p>With <code>editable</code>: double-click a name or type to rename it (F2 on an entity), add and
 * remove columns, click a row's key to toggle the primary key, drag the ring at a row's end onto
 * another row to add a relation and pick its cardinality, and delete with Delete. Every edit fires
 * <code>change</code> with the new <code>entities</code> and <code>relations</code>; undo with Ctrl+Z.</p>
 * <p>Entities are one tab stop: arrow keys move to the nearest entity in that direction, Enter selects.
 * The canvas is infinite like <code>wc-diagram</code>, with the <code>controls</code> and
 * <code>minimap</code> slots.</p>
 *
 * @example
 * ```html
 * <wc-erd id="schema" style="height: 480px"></wc-erd>
 * <script>
 *   const erd = document.getElementById('schema');
 *   erd.entities = [
 *     { id: 'customers', name: 'customers', columns: [
 *       { name: 'id', type: 'uuid', pk: true }, { name: 'email', type: 'text' }] },
 *     { id: 'orders', name: 'orders', columns: [
 *       { name: 'id', type: 'uuid', pk: true }, { name: 'customer_id', type: 'uuid' }] }
 *   ];
 *   erd.relations = [
 *     { id: 'r1', source: 'orders', sourceColumn: 'customer_id', target: 'customers', targetColumn: 'id' }
 *   ];
 * </script>
 * ```
 *
 * @slot controls - A `wc-diagram-controls`, shown at the bottom start corner.
 * @slot minimap - A `wc-diagram-minimap`, shown at the bottom end corner.
 *
 * @fires {CustomEvent<ErdSelectDetail>} select - An entity or relation was chosen. Detail contains `{ id, kind, entity, relation }`.
 * @fires {CustomEvent<ErdMoveDetail>} entity-move - A dragged entity was dropped. Detail contains `{ id, position }`.
 * @fires {CustomEvent<ErdToggleDetail>} toggle - An entity was collapsed or expanded. Detail contains `{ id, collapsed }`.
 * @fires {CustomEvent<ErdConnectDetail>} connect - A relation is about to be added by dragging. Cancelable. Detail contains `{ relation }`.
 * @fires {CustomEvent<ErdDeleteDetail>} delete - Entities or relations are about to be deleted. Cancelable. Detail contains `{ entities, relations }`.
 * @fires {CustomEvent<ErdChangeDetail>} change - An edit was made. Detail contains `{ entities, relations, reason }`.
 * @fires {CustomEvent<ErdFocusDetail>} focus-change - Focus mode was turned on or off with the keyboard. Detail contains `{ id, hops }`.
 * @fires {CustomEvent<ErdViewportDetail>} viewport-change - Once per frame while the camera moves and once when it settles. Detail contains `{ x, y, zoom, settled }`.
 *
 * @cssprop --erd-relation-color - Colour of relations. Defaults to outline.
 * @cssprop --erd-highlight-color - Colour of highlighted relations and rows. Defaults to primary.
 * @cssprop --erd-background - Canvas background. Defaults to surface-container-lowest.
 * @tags data
 */
@IndividualComponent
export class Erd extends DiagramCanvasElement {
  // ── Static

  static styles = [styles];

  // ── Properties

  @property({ attribute: false })
  entities: ErdEntity[] = [];

  @property({ attribute: false })
  relations: ErdRelation[] = [];

  /** Shows only the entities of this schema. */
  @property({ type: String, reflect: true })
  schema = '';

  /** Shows only the entities within `hops` relations of this entity. */
  @property({ type: String, reflect: true, attribute: 'focused-node' })
  focusedNode = '';

  /** How far focus mode reaches. */
  @property({ type: Number, reflect: true })
  hops = 1;

  /** Id of the selected entity or relation. */
  @property({ type: String, reflect: true })
  selected = '';

  // ── State

  @state()
  private _collapsed = new Set<string>();

  @state()
  private _hover?: RowRef;

  @state()
  private _focusId = '';

  @state()
  private _editing?: {
    entity: string;
    column?: number;
    field: 'name' | 'type';
  };

  @state()
  private _picker?: { id: string; x: number; y: number };

  @state()
  private _connecting?: {
    from: RowRef;
    start: DiagramPoint;
    side: DiagramSide;
    pointer: DiagramPoint;
  };

  @state()
  private _announcement = '';

  @state()
  private _fresh = new Set<string>();

  // ── Private fields

  @query('.erd-viewport')
  private readonly _viewportEl?: HTMLElement;

  private readonly history = new History<ErdSnapshot>();

  private visible: ErdEntity[] = [];

  private visibleIds = new Set<string>();

  private byId = new Map<string, ErdEntity>();

  private positions = new Map<string, DiagramPoint>();

  private overrides = new Map<string, DiagramPoint>();

  private pinned = new Map<string, DiagramPoint>();

  private layoutKey = '';

  private seen = new Set<string>();

  private stopGlide?: () => void;

  private drag?: {
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
    if (changed.has('entities')) {
      let next: Set<string> | undefined;
      for (const e of this.entities) {
        if (!this.seen.has(e.id)) {
          this.seen.add(e.id);
          if (e.collapsed) {
            next = next ?? new Set(this._collapsed);
            next.add(e.id);
          }
        }
        if (e.position) this.pinned.set(e.id, e.position);
      }
      if (next) this._collapsed = next;
      this.byId = new Map(this.entities.map(e => [e.id, e]));
    }
    if (
      (
        [
          'entities',
          'relations',
          'schema',
          'focusedNode',
          'hops',
          'editable',
          '_collapsed',
        ] as (keyof Erd)[]
      ).some(k => changed.has(k))
    ) {
      this.computeVisible();
      this.runLayout();
    }
  }

  protected updated(changed: PropertyValues<this>) {
    super.updated(changed);
    if (changed.has('_editing' as keyof Erd) && this._editing) {
      const input =
        this.renderRoot.querySelector<HTMLInputElement>('.erd-input');
      input?.focus();
      input?.select();
    }
  }

  // ── Public API

  get canUndo(): boolean {
    return this.editable && !this.readonly && this.history.canUndo;
  }

  get canRedo(): boolean {
    return this.editable && !this.readonly && this.history.canRedo;
  }

  undo() {
    if (!this.canUndo) return;
    const previous = this.history.undo(this.snapshot());
    if (previous) this.restore(previous, 'undo');
  }

  redo() {
    if (!this.canRedo) return;
    const next = this.history.redo(this.snapshot());
    if (next) this.restore(next, 'redo');
  }

  /** Lays every entity out again, forgetting dragged and given positions. */
  autoLayout() {
    this.pinned.clear();
    this.layoutKey = '';
    this.runLayout();
    this.requestUpdate();
  }

  collapse(id: string) {
    this.toggle(id, true);
  }

  expand(id: string) {
    this.toggle(id, false);
  }

  collapseAll() {
    this._collapsed = new Set(this.entities.map(e => e.id));
  }

  expandAll() {
    this._collapsed = new Set();
  }

  /** Selects an entity as a click would and brings it into view. */
  selectEntity(id: string) {
    const entity = this.byId.get(id);
    if (!entity || !this.visibleIds.has(id)) return;
    this.selectItem(id);
    this.moveFocusTo(id);
  }

  /** Adds an entity at the centre of the view (or at its `position`) and starts renaming it. */
  addEntity(entity: Partial<ErdEntity> = {}) {
    const view = this.viewport.visibleRect();
    const id = entity.id ?? this.uniqueId('entity');
    const created: ErdEntity = {
      name: this.i18n.t('erdNewEntity'),
      columns: [{ name: 'id', type: 'uuid', pk: true }],
      ...entity,
      id,
      position: entity.position ?? {
        x: Math.round(view.x + view.width / 2 - WIDTH / 2),
        y: Math.round(view.y + view.height / 2 - 60),
      },
    };
    this.markFresh(id);
    this.commit([...this.entities, created], this.relations, 'entity-add');
    if (this.editable) this._editing = { entity: id, field: 'name' };
    this._focusId = id;
    return created;
  }

  /** Adds a relation as a drag would, firing the cancelable `connect` first. Returns whether it was added. */
  addRelation(relation: Omit<ErdRelation, 'id'> & { id?: string }): boolean {
    const created: ErdRelation = {
      sourceCardinality: 'many',
      targetCardinality: 'one',
      ...relation,
      id: relation.id ?? this.uniqueId('relation'),
    };
    if (!this.emit<ErdConnectDetail>('connect', { relation: created }, true))
      return false;
    this.markFresh(created.id);
    this.commit(this.entities, [...this.relations, created], 'connect');
    const name = (r: RowRef) => {
      const e = this.byId.get(r.entity);
      return r.column ? `${e?.name}.${r.column}` : (e?.name ?? r.entity);
    };
    this.announce(
      this.i18n.t('erdConnected')(
        name({ entity: created.source, column: created.sourceColumn }),
        name({ entity: created.target, column: created.targetColumn }),
      ),
    );
    return true;
  }

  /** Deletes entities (with their relations) and relations, firing the cancelable `delete` first. */
  deleteItems(ids: string[]) {
    const entityIds = ids.filter(id => this.byId.has(id));
    const relationIds = new Set(
      ids.filter(id => this.relations.some(r => r.id === id)),
    );
    for (const r of this.relations) {
      if (entityIds.includes(r.source) || entityIds.includes(r.target))
        relationIds.add(r.id);
    }
    if (!entityIds.length && !relationIds.size) return;
    const detail = { entities: entityIds, relations: [...relationIds] };
    if (!this.emit<ErdDeleteDetail>('delete', detail, true)) return;
    const apply = () => {
      if (this.selected && ids.includes(this.selected)) this.selected = '';
      this.commit(
        this.entities.filter(e => !entityIds.includes(e.id)),
        this.relations.filter(r => !relationIds.has(r.id)),
        'delete',
      );
    };
    const elements = entityIds
      .map(id => this.entityElement(id))
      .filter((el): el is HTMLElement => !!el);
    animateOut(elements, apply);
  }

  // ── Canvas hooks

  protected viewportElement() {
    return this._viewportEl;
  }

  protected contentBounds(): DiagramRect | undefined {
    return boundsOf(this.visible.map(e => this.rectOf(e.id)));
  }

  protected selectionRects(): DiagramRect[] {
    if (this.visibleIds.has(this.selected)) return [this.rectOf(this.selected)];
    const r = this.relations.find(x => x.id === this.selected);
    return r && this.visibleIds.has(r.source) && this.visibleIds.has(r.target)
      ? [this.rectOf(r.source), this.rectOf(r.target)]
      : [];
  }

  protected itemRect(id: string): DiagramRect | undefined {
    return this.visibleIds.has(id) ? this.rectOf(id) : undefined;
  }

  protected firstItemRect(): DiagramRect | undefined {
    const first = this.visible[0];
    return first ? this.rectOf(first.id) : undefined;
  }

  protected overviewItems(): DiagramOverview['items'] {
    return this.visible.map(e => ({
      ...this.rectOf(e.id),
      selected: e.id === this.selected,
    }));
  }

  protected isBackground(target: EventTarget | null): boolean {
    const el = target as Element | null;
    if (!el) return false;
    return (
      el === this._viewportEl ||
      ['erd-world', 'erd-relations', 'erd-entities'].some(c =>
        el.classList?.contains(c),
      )
    );
  }

  protected onBackgroundClick() {
    this.selected = '';
    this._picker = undefined;
  }

  // ── Private methods: model

  private snapshot(): ErdSnapshot {
    return { entities: this.entities, relations: this.relations };
  }

  private restore(s: ErdSnapshot, reason: ErdChangeReason) {
    this.entities = s.entities;
    this.relations = s.relations;
    this.emit<ErdChangeDetail>('change', { ...s, reason });
  }

  private commit(
    entities: ErdEntity[],
    relations: ErdRelation[],
    reason: ErdChangeReason,
  ) {
    this.history.push(this.snapshot());
    this.entities = entities;
    this.relations = relations;
    this.emit<ErdChangeDetail>('change', { entities, relations, reason });
  }

  private updateEntity(
    id: string,
    update: (e: ErdEntity) => ErdEntity,
    reason: ErdChangeReason,
  ) {
    this.commit(
      this.entities.map(e => (e.id === id ? update(e) : e)),
      this.relations,
      reason,
    );
  }

  private uniqueId(prefix: string) {
    relationCounter += 1;
    const taken = new Set([
      ...this.entities.map(e => e.id),
      ...this.relations.map(r => r.id),
    ]);
    let id = `${prefix}-${relationCounter}`;
    while (taken.has(id)) {
      relationCounter += 1;
      id = `${prefix}-${relationCounter}`;
    }
    return id;
  }

  private markFresh(id: string) {
    if (prefersReducedMotion()) return;
    this._fresh = new Set([...this._fresh, id]);
    setTimeout(() => {
      const next = new Set(this._fresh);
      next.delete(id);
      this._fresh = next;
    }, 600);
  }

  private computeVisible() {
    let shown = this.entities.filter(
      e => !this.schema || e.schema === this.schema,
    );
    const ids = new Set(shown.map(e => e.id));
    if (this.focusedNode && ids.has(this.focusedNode)) {
      const near = withinHops(
        this.focusedNode,
        this.relations.filter(r => ids.has(r.source) && ids.has(r.target)),
        this.hops,
      );
      shown = shown.filter(e => near.has(e.id));
    }
    this.visible = shown;
    this.visibleIds = new Set(shown.map(e => e.id));
    if (this.visibleIds.size && !this.visibleIds.has(this.selected)) {
      if (!this.relations.some(r => r.id === this.selected)) this.selected = '';
    }
  }

  private heightOf(e: ErdEntity): number {
    const frame = HEADER + BORDER * 2;
    if (this._collapsed.has(e.id)) return frame;
    return (
      frame +
      e.columns.length * ROW +
      ROWS_PADDING * 2 +
      (this.editable && !this.readonly ? ADD_ROW : 0)
    );
  }

  private runLayout() {
    const relations = this.relations.filter(
      r => this.visibleIds.has(r.source) && this.visibleIds.has(r.target),
    );
    const key = [
      this.visible
        .map(
          e =>
            `${e.id}:${this.heightOf(e)}:${this.pinned.has(e.id) ? 'p' : ''}`,
        )
        .join(','),
      relations.map(r => `${r.source}>${r.target}`).join(','),
    ].join('|');
    if (key === this.layoutKey) return;
    this.layoutKey = key;
    const next = layoutEntities(
      this.visible.map(e => ({
        id: e.id,
        height: this.heightOf(e),
        pinned: this.pinned.get(e.id),
      })),
      relations,
      { width: WIDTH },
    );
    this.glide(this.positions, next);
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
      duration: 400,
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

  private topLeft(id: string): DiagramPoint {
    return this.overrides.get(id) ?? this.positions.get(id) ?? { x: 0, y: 0 };
  }

  private rectOf(id: string): DiagramRect {
    const p = this.topLeft(id);
    const e = this.byId.get(id);
    return {
      x: p.x,
      y: p.y,
      width: WIDTH,
      height: e ? this.heightOf(e) : HEADER,
    };
  }

  /** The y of a column row's middle, or the header's when the row is hidden or missing. */
  private rowY(entity: ErdEntity, column?: string): number {
    const top = this.topLeft(entity.id).y + BORDER;
    const index = column
      ? entity.columns.findIndex(c => c.name === column)
      : -1;
    if (index < 0 || this._collapsed.has(entity.id)) return top + HEADER / 2;
    return top + HEADER + ROWS_PADDING + index * ROW + ROW / 2;
  }

  private foreignKeys(entityId: string): Set<string> {
    const out = new Set<string>();
    for (const r of this.relations)
      if (r.source === entityId && r.sourceColumn) out.add(r.sourceColumn);
    return out;
  }

  private related(id: string): {
    references: string[];
    referencedBy: string[];
  } {
    const name = (x: string) => this.byId.get(x)?.name ?? x;
    return {
      references: [
        ...new Set(
          this.relations.filter(r => r.source === id).map(r => name(r.target)),
        ),
      ],
      referencedBy: [
        ...new Set(
          this.relations.filter(r => r.target === id).map(r => name(r.source)),
        ),
      ],
    };
  }

  /** Relations and rows lit by the hovered entity or column. */
  private highlight():
    | { relations: Set<string>; entities: Set<string>; rows: Set<string> }
    | undefined {
    const h = this._hover;
    if (!h || this._connecting || this.drag?.moved) return undefined;
    const relations = new Set<string>();
    const entities = new Set<string>([h.entity]);
    const rows = new Set<string>();
    for (const r of this.relations) {
      const fromHere =
        r.source === h.entity && (!h.column || r.sourceColumn === h.column);
      const toHere =
        r.target === h.entity && (!h.column || r.targetColumn === h.column);
      if (fromHere || toHere) {
        relations.add(r.id);
        entities.add(r.source);
        entities.add(r.target);
        if (r.sourceColumn) rows.add(`${r.source}\u0000${r.sourceColumn}`);
        if (r.targetColumn) rows.add(`${r.target}\u0000${r.targetColumn}`);
      }
    }
    return { relations, entities, rows };
  }

  // ── Private methods: interaction

  private announce(message: string) {
    this._announcement = '';
    requestAnimationFrame(() => {
      this._announcement = message;
    });
  }

  private selectItem(id: string) {
    this.selected = id;
    const entity = this.byId.get(id);
    const relation = entity ? undefined : this.relations.find(r => r.id === id);
    this.emit<ErdSelectDetail>('select', {
      id,
      kind: entity ? 'entity' : 'relation',
      entity,
      relation,
    });
  }

  private moveFocusTo(id: string) {
    this._focusId = id;
    this.updateComplete.then(() => {
      this.entityElement(id)?.focus({ preventScroll: true });
      const r = this.itemRect(id);
      const view = this.viewport.visibleRect();
      if (
        r &&
        (r.x < view.x ||
          r.y < view.y ||
          r.x + r.width > view.x + view.width ||
          r.y + r.height > view.y + view.height)
      ) {
        this.centerOn(r.x + r.width / 2, r.y + Math.min(r.height, 200) / 2);
      }
    });
  }

  private toggle(id: string, collapsed: boolean) {
    if (this._collapsed.has(id) === collapsed) return;
    const next = new Set(this._collapsed);
    if (collapsed) next.add(id);
    else next.delete(id);
    this._collapsed = next;
    this.emit<ErdToggleDetail>('toggle', { id, collapsed });
  }

  private get canEdit() {
    return this.editable && !this.readonly;
  }

  private startEdit(entity: string, field: 'name' | 'type', column?: number) {
    if (!this.canEdit) return;
    this._editing = { entity, column, field };
  }

  private finishEdit(value: string | undefined) {
    const editing = this._editing;
    this._editing = undefined;
    if (!editing || value === undefined) return;
    const text = value.trim();
    const entity = this.byId.get(editing.entity);
    if (!entity || (!text && editing.field === 'name')) return;
    if (editing.column === undefined) {
      if (text !== entity.name)
        this.updateEntity(entity.id, e => ({ ...e, name: text }), 'rename');
    } else {
      const column = entity.columns[editing.column];
      if (!column) return;
      const field = editing.field === 'name' ? 'name' : 'type';
      if ((column[field] ?? '') === text) return;
      const oldName = column.name;
      this.commit(
        this.entities.map(e =>
          e.id === entity.id
            ? {
                ...e,
                columns: e.columns.map((c, i) =>
                  i === editing.column ? { ...c, [field]: text } : c,
                ),
              }
            : e,
        ),
        // Relations follow a renamed column.
        field === 'name'
          ? this.relations.map(r => ({
              ...r,
              sourceColumn:
                r.source === entity.id && r.sourceColumn === oldName
                  ? text
                  : r.sourceColumn,
              targetColumn:
                r.target === entity.id && r.targetColumn === oldName
                  ? text
                  : r.targetColumn,
            }))
          : this.relations,
        field === 'name' ? 'rename' : 'column-update',
      );
    }
    this.moveFocusTo(entity.id);
  }

  private addColumn(entityId: string) {
    const entity = this.byId.get(entityId);
    if (!entity) return;
    const base = this.i18n.t('erdNewColumn');
    const taken = new Set(entity.columns.map(c => c.name));
    let name = base;
    for (let n = 2; taken.has(name); n += 1) name = `${base}_${n}`;
    this.updateEntity(
      entityId,
      e => ({
        ...e,
        columns: [...e.columns, { name, type: 'text', nullable: true }],
      }),
      'column-add',
    );
    this._editing = {
      entity: entityId,
      column: entity.columns.length,
      field: 'name',
    };
  }

  private removeColumn(entityId: string, index: number) {
    const entity = this.byId.get(entityId);
    const column = entity?.columns[index];
    if (!entity || !column) return;
    this.commit(
      this.entities.map(e =>
        e.id === entityId
          ? { ...e, columns: e.columns.filter((_, i) => i !== index) }
          : e,
      ),
      this.relations.filter(
        r =>
          !(r.source === entityId && r.sourceColumn === column.name) &&
          !(r.target === entityId && r.targetColumn === column.name),
      ),
      'column-remove',
    );
  }

  private togglePrimaryKey(entityId: string, index: number) {
    this.updateEntity(
      entityId,
      e => ({
        ...e,
        columns: e.columns.map((c, i) =>
          i === index ? { ...c, pk: !c.pk } : c,
        ),
      }),
      'column-update',
    );
  }

  private setCardinality(
    id: string,
    source: ErdCardinality,
    target: ErdCardinality,
  ) {
    this._picker = undefined;
    this.commit(
      this.entities,
      this.relations.map(r =>
        r.id === id
          ? { ...r, sourceCardinality: source, targetCardinality: target }
          : r,
      ),
      'cardinality',
    );
  }

  private toCanvas(event: PointerEvent): DiagramPoint {
    const vr = this._viewportEl?.getBoundingClientRect();
    const { x, y, zoom } = this.viewport.view;
    return {
      x: (event.clientX - (vr?.left ?? 0) - x) / zoom,
      y: (event.clientY - (vr?.top ?? 0) - y) / zoom,
    };
  }

  private onEntityKeyDown(event: KeyboardEvent, entity: ErdEntity) {
    if (event.target !== event.currentTarget) return;
    const done = (fn: () => void) => {
      event.preventDefault();
      event.stopPropagation();
      fn();
    };
    const { key } = event;
    const arrows: Record<string, 'up' | 'down' | 'left' | 'right'> = {
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right',
    };
    if (key === 'Enter' && event.shiftKey) {
      done(() => this.toggle(entity.id, !this._collapsed.has(entity.id)));
    } else if (key === 'Enter' || key === ' ') {
      done(() => this.selectItem(entity.id));
    } else if (arrows[key]) {
      const next = nearestInDirection(
        this.rectOf(entity.id),
        this.visible
          .filter(e => e.id !== entity.id)
          .map(e => ({ id: e.id, rect: this.rectOf(e.id) })),
        arrows[key],
      );
      if (next) done(() => this.moveFocusTo(next.id));
    } else if (key === 'f' || key === 'F') {
      done(() => {
        const id = this.focusedNode === entity.id ? '' : entity.id;
        this.focusedNode = id;
        this.emit<ErdFocusDetail>('focus-change', {
          id: id || null,
          hops: this.hops,
        });
      });
    } else if (key === 'F2' && this.canEdit) {
      done(() => this.startEdit(entity.id, 'name'));
    } else if ((key === 'Delete' || key === 'Backspace') && this.canEdit) {
      done(() => this.deleteItems([entity.id]));
    }
  }

  private onViewportKeyDown = (event: KeyboardEvent) => {
    if (event.defaultPrevented) return;
    const mod = event.ctrlKey || event.metaKey;
    const key = event.key.toLowerCase();
    if (key === 'escape') {
      event.preventDefault();
      if (this._picker) this._picker = undefined;
      else if (this.focusedNode) {
        this.focusedNode = '';
        this.emit<ErdFocusDetail>('focus-change', {
          id: null,
          hops: this.hops,
        });
      } else this.selected = '';
      return;
    }
    if (mod && key === 'z' && !event.shiftKey) {
      event.preventDefault();
      this.undo();
      return;
    }
    if (mod && (key === 'y' || (key === 'z' && event.shiftKey))) {
      event.preventDefault();
      this.redo();
      return;
    }
    if (
      (key === 'delete' || key === 'backspace') &&
      this.canEdit &&
      this.relations.some(r => r.id === this.selected)
    ) {
      event.preventDefault();
      this.deleteItems([this.selected]);
      return;
    }
    this.handleCanvasKey(event);
  };

  private onEntityPointerDown(event: PointerEvent, entity: ErdEntity) {
    if (event.button !== 0 || this.viewport.spaceHeld) return;
    const origin = event.composedPath()[0];
    if (
      origin instanceof Element &&
      origin.closest(`${INTERACTIVE}, .erd-port`)
    )
      return;
    event.stopPropagation();
    this._picker = undefined;
    const element = event.currentTarget as HTMLElement;
    element.focus({ preventScroll: true });
    this._focusId = entity.id;
    this.drag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      id: entity.id,
      origin: this.topLeft(entity.id),
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
    const { drag } = this;
    if (!drag || event.pointerId !== drag.pointerId || this.readonly) return;
    const { zoom } = this.viewport.view;
    const dx = (event.clientX - drag.startX) / zoom;
    const dy = (event.clientY - drag.startY) / zoom;
    if (!drag.moved && Math.hypot(dx * zoom, dy * zoom) < DRAG_THRESHOLD)
      return;
    drag.moved = true;
    const position = {
      x: Math.round(drag.origin.x + dx),
      y: Math.round(drag.origin.y + dy),
    };
    this.positions.set(drag.id, position);
    this.pinned.set(drag.id, position);
    this.requestUpdate();
  };

  private onDragUp = (event: PointerEvent) => {
    const { drag } = this;
    if (!drag || event.pointerId !== drag.pointerId) return;
    this.drag = undefined;
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
    if (!drag.moved) {
      this.selectItem(drag.id);
      return;
    }
    const position = this.topLeft(drag.id);
    // The layout key changes now that the entity is pinned; keep everything else where it is.
    this.layoutKey = '';
    this.runLayout();
    this.emit<ErdMoveDetail>('entity-move', { id: drag.id, position });
    if (this.canEdit) {
      this.updateEntity(drag.id, e => ({ ...e, position }), 'move');
    }
  };

  private onPortPointerDown(
    event: PointerEvent,
    entity: ErdEntity,
    column: ErdColumn,
  ) {
    if (event.button !== 0 || !this.canEdit) return;
    event.preventDefault();
    event.stopPropagation();
    const handle = event.currentTarget as HTMLElement;
    const start = {
      x: this.topLeft(entity.id).x + WIDTH,
      y: this.rowY(entity, column.name),
    };
    this._connecting = {
      from: { entity: entity.id, column: column.name },
      start,
      side: 'right',
      pointer: this.toCanvas(event),
    };
    try {
      handle.setPointerCapture(event.pointerId);
    } catch {
      // Synthetic pointers cannot be captured.
    }
    const move = (e: PointerEvent) => {
      if (this._connecting)
        this._connecting = { ...this._connecting, pointer: this.toCanvas(e) };
    };
    const up = (e: PointerEvent) => {
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', up);
      handle.removeEventListener('pointercancel', up);
      const connecting = this._connecting;
      this._connecting = undefined;
      if (!connecting || e.type === 'pointercancel') return;
      const target = this.rowAt(e.clientX, e.clientY);
      if (!target) return;
      const { from } = connecting;
      if (target.entity === from.entity && target.column === from.column)
        return;
      if (
        this.addRelation({
          source: from.entity,
          sourceColumn: from.column,
          target: target.entity,
          targetColumn: target.column,
        })
      ) {
        const vr = this._viewportEl?.getBoundingClientRect();
        const created = this.relations[this.relations.length - 1];
        this._picker = {
          id: created.id,
          x: e.clientX - (vr?.left ?? 0),
          y: e.clientY - (vr?.top ?? 0),
        };
      }
    };
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', up);
    handle.addEventListener('pointercancel', up);
  }

  /** The row (or entity header) under a screen point. */
  private rowAt(clientX: number, clientY: number): RowRef | undefined {
    const root = this.renderRoot as ShadowRoot;
    const hits = root.elementsFromPoint?.(clientX, clientY) ?? [];
    for (const el of hits) {
      const row = el.closest?.('.erd-row') as HTMLElement | null;
      const card = el.closest?.('.erd-entity') as HTMLElement | null;
      if (row?.dataset.column !== undefined && card?.dataset.id) {
        return { entity: card.dataset.id, column: row.dataset.column };
      }
      if (card?.dataset.id) return { entity: card.dataset.id };
    }
    return undefined;
  }

  private entityElement(id: string): HTMLElement | null {
    return this.renderRoot.querySelector<HTMLElement>(
      `.erd-entity[data-id="${CSS.escape(id)}"]`,
    );
  }

  // ── Render helpers

  private renderMarker(
    cardinality: ErdCardinality,
    at: DiagramPoint,
    angle: number,
  ) {
    return markerShapes(cardinality).map(
      s =>
        svg`<path class=${`erd-marker fill-${s.fill}`} d=${s.d} transform=${markerTransform(at, angle)}></path>`,
    );
  }

  /**
   * A route between facing sides that avoids the entities in between: when the plain elbow would
   * cross one, the line turns in the gap next to each end and runs along the nearest free channel.
   * Returns `undefined` when the plain elbow is clear or no channel is found.
   */
  private routeAround(
    start: DiagramPoint,
    end: DiagramPoint,
    sourceId: string,
    targetId: string,
  ): EdgeGeometry | undefined {
    const dir = end.x >= start.x ? 1 : -1;
    const margin = 14;
    const obstacles = this.visible
      .filter(e => e.id !== sourceId && e.id !== targetId)
      .map(e => inflateRect(this.rectOf(e.id), margin));
    const hits = (a: DiagramPoint, b: DiagramPoint) => {
      const x1 = Math.min(a.x, b.x);
      const x2 = Math.max(a.x, b.x);
      const y1 = Math.min(a.y, b.y);
      const y2 = Math.max(a.y, b.y);
      return obstacles.some(
        o => x1 < o.x + o.width && x2 > o.x && y1 < o.y + o.height && y2 > o.y,
      );
    };
    const clear = (points: DiagramPoint[]) =>
      points.every((p, i) => i === 0 || !hits(points[i - 1], p));
    const xm = (start.x + end.x) / 2;
    if (clear([start, { x: xm, y: start.y }, { x: xm, y: end.y }, end])) {
      return undefined;
    }
    const gapA = start.x + dir * 28;
    const gapB = end.x - dir * 28;
    const candidates = [
      start.y,
      end.y,
      ...obstacles.flatMap(o => [o.y - 1, o.y + o.height + 1]),
    ];
    let best: DiagramPoint[] | undefined;
    let bestCost = Infinity;
    for (const y of candidates) {
      const points = [
        start,
        { x: gapA, y: start.y },
        { x: gapA, y },
        { x: gapB, y },
        { x: gapB, y: end.y },
        end,
      ];
      const cost = Math.abs(y - start.y) + Math.abs(y - end.y);
      if (cost < bestCost && clear(points)) {
        best = points;
        bestCost = cost;
      }
    }
    if (!best) return undefined;
    return {
      d: roundedPath(best, 14),
      mid: polylineMidpoint(best),
      startAngle: dir > 0 ? Math.PI : 0,
      endAngle: dir > 0 ? 0 : Math.PI,
    };
  }

  private renderRelations(
    lit: ReturnType<Erd['highlight']>,
    shown: Set<string>,
  ) {
    return this.relations
      .filter(
        r => this.visibleIds.has(r.source) && this.visibleIds.has(r.target),
      )
      .filter(r => shown.has(r.source) || shown.has(r.target))
      .map(r => {
        const s = this.byId.get(r.source) as ErdEntity;
        const t = this.byId.get(r.target) as ErdEntity;
        const sp = this.topLeft(s.id);
        const tp = this.topLeft(t.id);
        let sSide: DiagramSide = 'right';
        let tSide: DiagramSide = 'left';
        if (tp.x + WIDTH + 40 < sp.x) {
          sSide = 'left';
          tSide = 'right';
        } else if (!(sp.x + WIDTH + 40 < tp.x)) {
          // Stacked in one column: both lines leave on the right and loop.
          tSide = 'right';
        }
        const start = {
          x: sSide === 'right' ? sp.x + WIDTH : sp.x,
          y: this.rowY(s, r.sourceColumn),
        };
        const end = {
          x: tSide === 'right' ? tp.x + WIDTH : tp.x,
          y: this.rowY(t, r.targetColumn),
        };
        const g =
          (sSide !== tSide && this.routeAround(start, end, s.id, t.id)) ||
          edgeGeometry('elbow', start, sSide, end, tSide, { radius: 14 });
        const on = !!lit?.relations.has(r.id);
        const selected = this.selected === r.id;
        return svg`<g
          class=${classMap({
            'erd-relation': true,
            'is-lit': on,
            'is-dim': !!lit && !on,
            'is-selected': selected,
            'is-fresh': this._fresh.has(r.id),
          })}
          data-id=${r.id}
        >
          <path class="erd-line" d=${g.d} pathLength="1"></path>
          ${this.renderMarker(r.sourceCardinality ?? 'many', start, g.startAngle)}
          ${this.renderMarker(r.targetCardinality ?? 'one', end, g.endAngle)}
          <path
            class="erd-hit"
            d=${g.d}
            @pointerdown=${(e: PointerEvent) => e.stopPropagation()}
            @click=${() => this.selectItem(r.id)}
          ></path>
          ${
            r.label
              ? svg`<text class="erd-relation-label" x=${g.mid.x} y=${g.mid.y - 6}>${r.label}</text>`
              : nothing
          }
        </g>`;
      });
  }

  private renderPreview() {
    const c = this._connecting;
    if (!c) return nothing;
    const side: DiagramSide = c.pointer.x >= c.start.x ? 'left' : 'right';
    const g = edgeGeometry('elbow', c.start, c.side, c.pointer, side, {
      radius: 14,
    });
    return svg`<path class="erd-preview" d=${g.d}></path>`;
  }

  private renderInput(value: string) {
    return html`<input
      class="erd-input"
      .value=${value}
      aria-label=${this.i18n.t('erdRename')}
      @pointerdown=${(e: Event) => e.stopPropagation()}
      @keydown=${(e: KeyboardEvent) => {
        e.stopPropagation();
        if (e.key === 'Enter')
          this.finishEdit((e.target as HTMLInputElement).value);
        else if (e.key === 'Escape') this.finishEdit(undefined);
      }}
      @blur=${(e: FocusEvent) => {
        if (this._editing)
          this.finishEdit((e.target as HTMLInputElement).value);
      }}
    />`;
  }

  private renderRow(
    entity: ErdEntity,
    column: ErdColumn,
    index: number,
    fks: Set<string>,
    lit: ReturnType<Erd['highlight']>,
  ) {
    const editing = this._editing;
    const editingName =
      editing?.entity === entity.id &&
      editing.column === index &&
      editing.field === 'name';
    const editingType =
      editing?.entity === entity.id &&
      editing.column === index &&
      editing.field === 'type';
    const fk = fks.has(column.name);
    let keyIcon = '';
    if (column.pk) keyIcon = 'key';
    else if (fk) keyIcon = 'link';
    let keyLabel = '';
    if (column.pk) keyLabel = this.i18n.t('erdPrimaryKey');
    else if (fk) keyLabel = this.i18n.t('erdForeignKey');
    const keyCell = this.canEdit
      ? html`<button
          type="button"
          class=${classMap({
            'erd-key': true,
            'is-pk': !!column.pk,
            'is-fk': fk && !column.pk,
          })}
          aria-label=${this.i18n.t('erdTogglePrimaryKey')(column.name)}
          aria-pressed=${column.pk ? 'true' : 'false'}
          @click=${() => this.togglePrimaryKey(entity.id, index)}
        >
          <wc-icon name=${keyIcon || 'key'}></wc-icon>
        </button>`
      : html`<span
          class=${classMap({
            'erd-key': true,
            'is-pk': !!column.pk,
            'is-fk': fk && !column.pk,
          })}
          title=${keyLabel}
          >${keyIcon
            ? html`<wc-icon name=${keyIcon}></wc-icon>`
            : nothing}</span
        >`;
    return html`<div
      class=${classMap({
        'erd-row': true,
        'is-lit': !!lit?.rows.has(`${entity.id}\u0000${column.name}`),
        'is-hover':
          this._hover?.entity === entity.id &&
          this._hover.column === column.name,
      })}
      data-column=${column.name}
      title=${column.comment ?? nothing}
      @pointerenter=${() => {
        this._hover = { entity: entity.id, column: column.name };
      }}
      @pointerleave=${() => {
        this._hover = { entity: entity.id };
      }}
    >
      ${keyCell}
      ${editingName
        ? this.renderInput(column.name)
        : html`<span
            class="erd-col-name"
            @dblclick=${() => this.startEdit(entity.id, 'name', index)}
            >${column.name}${keyLabel
              ? html`<span class="sr-only">, ${keyLabel}</span>`
              : nothing}</span
          >`}
      ${editingType
        ? this.renderInput(column.type ?? '')
        : html`<span
            class="erd-col-type"
            @dblclick=${() => this.startEdit(entity.id, 'type', index)}
            >${column.type ?? ''}${column.nullable
              ? html`<span class="erd-null" title=${this.i18n.t('erdNullable')}
                  >?</span
                >`
              : nothing}</span
          >`}
      ${this.canEdit
        ? html`<wc-icon-button
              class="erd-remove"
              variant="text"
              shape="round"
              size="xs"
              aria-label=${this.i18n.t('erdRemoveColumn')(column.name)}
              @click=${() => this.removeColumn(entity.id, index)}
              ><wc-icon name="close"></wc-icon
            ></wc-icon-button>
            <span
              class="erd-port"
              aria-hidden="true"
              @pointerdown=${(e: PointerEvent) =>
                this.onPortPointerDown(e, entity, column)}
            ></span>`
        : nothing}
    </div>`;
  }

  private renderEntity(
    entity: ErdEntity,
    focusId: string,
    lit: ReturnType<Erd['highlight']>,
  ) {
    const p = this.topLeft(entity.id);
    const collapsed = this._collapsed.has(entity.id);
    const fks = this.foreignKeys(entity.id);
    const { references, referencedBy } = this.related(entity.id);
    const editingName =
      this._editing?.entity === entity.id && this._editing.column === undefined;
    const selected = this.selected === entity.id;
    return html`<div
      class=${classMap({
        'erd-entity': true,
        [`accent-${entity.accent ?? 'primary'}`]: true,
        'is-selected': selected,
        'is-collapsed': collapsed,
        'is-lit': !!lit?.entities.has(entity.id) && lit.entities.size > 1,
        'is-dim': !!lit && !lit.entities.has(entity.id),
        'is-fresh': this._fresh.has(entity.id),
        'is-focus': this.focusedNode === entity.id,
      })}
      data-id=${entity.id}
      role="button"
      aria-pressed=${selected ? 'true' : 'false'}
      aria-expanded=${collapsed ? 'false' : 'true'}
      aria-label=${this.i18n.t('erdEntity')(
        entity.schema ? `${entity.schema}.${entity.name}` : entity.name,
        entity.columns.length,
        references,
        referencedBy,
      )}
      tabindex=${focusId === entity.id ? '0' : '-1'}
      style="left: ${p.x}px; top: ${p.y}px; width: ${WIDTH}px;"
      @pointerdown=${(e: PointerEvent) => this.onEntityPointerDown(e, entity)}
      @pointerenter=${() => {
        this._hover = { entity: entity.id };
      }}
      @pointerleave=${() => {
        this._hover = undefined;
      }}
      @keydown=${(e: KeyboardEvent) => this.onEntityKeyDown(e, entity)}
      @focus=${() => {
        this._focusId = entity.id;
      }}
    >
      <div class="erd-header">
        <span class="erd-tile"
          ><wc-icon name=${entity.icon ?? 'table'}></wc-icon
        ></span>
        <span class="erd-title" title=${entity.comment ?? nothing}>
          ${entity.schema
            ? html`<span class="erd-schema">${entity.schema}.</span>`
            : nothing}
          ${editingName
            ? this.renderInput(entity.name)
            : html`<span
                class="erd-name"
                @dblclick=${() => this.startEdit(entity.id, 'name')}
                >${entity.name}</span
              >`}
        </span>
        ${collapsed
          ? html`<span class="erd-count"
              >${this.i18n.t('erdColumnCount')(entity.columns.length)}</span
            >`
          : nothing}
        <wc-icon-button
          class="erd-toggle"
          variant="text"
          shape="round"
          size="xs"
          tabindex="-1"
          aria-label=${this.i18n.t(collapsed ? 'erdExpand' : 'erdCollapse')(
            entity.name,
          )}
          @click=${() => this.toggle(entity.id, !collapsed)}
          ><wc-icon
            name=${collapsed ? 'keyboard_arrow_down' : 'keyboard_arrow_up'}
          ></wc-icon
        ></wc-icon-button>
      </div>
      ${collapsed
        ? nothing
        : html`<div class="erd-rows">
            ${entity.columns.map((c, i) =>
              this.renderRow(entity, c, i, fks, lit),
            )}
            ${this.canEdit
              ? html`<button
                  type="button"
                  class="erd-add"
                  @click=${() => this.addColumn(entity.id)}
                >
                  <wc-icon name="add"></wc-icon>${this.i18n.t('erdAddColumn')}
                </button>`
              : nothing}
          </div>`}
    </div>`;
  }

  private renderPicker() {
    const picker = this._picker;
    if (!picker) return nothing;
    const relation = this.relations.find(r => r.id === picker.id);
    if (!relation) return nothing;
    return html`<div
      class="erd-picker"
      role="menu"
      aria-label=${this.i18n.t('erdCardinality')}
      data-diagram-overlay
      style="left: ${picker.x + 8}px; top: ${picker.y + 8}px;"
      @pointerdown=${(e: Event) => e.stopPropagation()}
    >
      ${CARDINALITY_PRESETS.map(
        preset =>
          html`<button
            type="button"
            role="menuitemradio"
            aria-checked=${relation.sourceCardinality === preset.source &&
            relation.targetCardinality === preset.target
              ? 'true'
              : 'false'}
            @click=${() =>
              this.setCardinality(relation.id, preset.source, preset.target)}
          >
            <svg
              class="erd-picker-icon"
              viewBox="-30 -10 60 20"
              aria-hidden="true"
            >
              <path class="erd-line" d="M -26 0 L 26 0"></path>
              ${this.renderMarker(preset.source, { x: -26, y: 0 }, Math.PI)}
              ${this.renderMarker(preset.target, { x: 26, y: 0 }, 0)}
            </svg>
            ${this.i18n.t(preset.key)}
          </button>`,
      )}
    </div>`;
  }

  // ── Render

  protected render() {
    const { x, y, zoom } = this.viewport.view;
    const lit = this.highlight();
    const focusId = this.visibleIds.has(this._focusId)
      ? this._focusId
      : (this.visible[0]?.id ?? '');
    const shown = new Set(
      this.visible
        .filter(
          e =>
            this.nearView(this.rectOf(e.id)) ||
            e.id === focusId ||
            e.id === this.selected,
        )
        .map(e => e.id),
    );
    return html`
      <div
        class=${classMap({
          'erd-viewport': true,
          'lod-far': zoom < FAR_ZOOM,
          'is-panning': this.viewport.panning,
          'is-space': this.viewport.spaceHeld,
          'is-connecting': !!this._connecting,
          'is-editable': this.canEdit,
        })}
        tabindex="0"
        role="region"
        aria-label=${this.label || this.i18n.t('erdLabel')}
        aria-describedby="instructions"
        style=${this.gridStyle()}
        @keydown=${this.onViewportKeyDown}
      >
        <div
          class="erd-world"
          style="transform: translate(${x}px, ${y}px) scale(${zoom}); --_zoom: ${zoom};"
        >
          <svg class="erd-relations" width="1" height="1" aria-hidden="true">
            ${this.renderRelations(lit, shown)} ${this.renderPreview()}
          </svg>
          <div
            class="erd-entities"
            role="group"
            aria-label=${this.label || this.i18n.t('erdLabel')}
          >
            ${repeat(
              this.visible.filter(e => shown.has(e.id)),
              e => e.id,
              e => this.renderEntity(e, focusId, lit),
            )}
          </div>
        </div>
        ${this.renderPicker()} ${this.renderBackToContent()}
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
