import type { DiagramPoint } from '@/__internal/diagram/types.js';
import { layeredLayout } from '@/dependency-map/dependency-map-layout.js';

export interface ErdLayoutEntity {
  id: string;
  height: number;
  /** A fixed top-left corner (set by the app or by dragging). */
  pinned?: DiagramPoint;
}

export interface ErdLayoutRelation {
  /** The entity holding the foreign key. */
  source: string;
  /** The entity it references. */
  target: string;
}

export interface ErdLayoutOptions {
  width: number;
  /** Space between columns. */
  columnGap?: number;
  /** Space between entities in a column. */
  rowGap?: number;
}

/**
 * Places entities in columns, referenced tables to the left of the tables that reference them,
 * ordered to keep relations short. Columns are stacked with each entity's real height and centred
 * on one line. Entities with no relations go in a grid after the last column. Returns top-left
 * corners.
 */
export function layoutEntities(
  entities: ErdLayoutEntity[],
  relations: ErdLayoutRelation[],
  options: ErdLayoutOptions,
): Map<string, DiagramPoint> {
  const { width, columnGap = 120, rowGap = 48 } = options;
  const ids = new Set(entities.map(e => e.id));
  const linked = new Set<string>();
  const edges: ErdLayoutRelation[] = [];
  for (const r of relations) {
    if (ids.has(r.source) && ids.has(r.target) && r.source !== r.target) {
      linked.add(r.source);
      linked.add(r.target);
      // Referenced tables first: edges run from the parent to the child.
      edges.push({ source: r.target, target: r.source });
    }
  }
  const heights = new Map(entities.map(e => [e.id, e.height]));
  const connected = entities.filter(e => linked.has(e.id));
  const loose = entities.filter(e => !linked.has(e.id));

  // Ranks and order from the layered layout: x gives the column, y the order within it.
  const ranked = layeredLayout(
    connected.map(e => ({ id: e.id })),
    edges,
    { nodeWidth: width, nodeHeight: 100 },
  );
  const step = width + 120;
  const columns: string[][] = [];
  for (const [id, p] of ranked) {
    const c = Math.round(p.x / step);
    (columns[c] = columns[c] ?? []).push(id);
  }
  for (const col of columns) {
    col?.sort((a, b) => (ranked.get(a)?.y ?? 0) - (ranked.get(b)?.y ?? 0));
  }

  // Loose entities: a grid of roughly square shape after the connected part.
  if (loose.length) {
    const perColumn = Math.max(2, Math.ceil(Math.sqrt(loose.length)));
    for (let i = 0; i < loose.length; i += perColumn) {
      columns.push(loose.slice(i, i + perColumn).map(e => e.id));
    }
  }

  const result = new Map<string, DiagramPoint>();
  columns
    .filter(col => col?.length)
    .forEach((col, c) => {
      const total =
        col.reduce((s, id) => s + (heights.get(id) ?? 0), 0) +
        rowGap * (col.length - 1);
      let y = -total / 2;
      for (const id of col) {
        result.set(id, { x: c * (width + columnGap), y });
        y += (heights.get(id) ?? 0) + rowGap;
      }
    });
  for (const e of entities) if (e.pinned) result.set(e.id, e.pinned);
  return result;
}
