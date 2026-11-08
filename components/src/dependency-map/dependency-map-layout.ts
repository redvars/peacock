import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from 'd3';
import type { DiagramPoint } from '@/__internal/diagram/types.js';

export interface MapLayoutNode {
  id: string;
  /** Nodes in the same group are pulled together. */
  group?: string;
  /** A fixed position (pinned by the app or by dragging). */
  pinned?: DiagramPoint;
}

export interface MapLayoutEdge {
  source: string;
  target: string;
}

export interface MapLayoutOptions {
  /** Card size used for spacing. */
  nodeWidth: number;
  nodeHeight: number;
  /** Earlier positions to start from, so a live update moves as little as possible. */
  previous?: Map<string, DiagramPoint>;
  /** The node at the centre of a radial layout. */
  center?: string;
}

type SimNode = SimulationNodeDatum & { id: string; group?: string };

/** Room a group box takes around its nodes, matching how the map draws groups. */
export const GROUP_PADDING = { x: 28, top: 44, bottom: 28 };

/**
 * Moves whole groups (and nodes outside any group) apart until no group box overlaps another
 * group box or a loose node. Groups with a pinned node stay where they are.
 */
function separateGroups(
  result: Map<string, DiagramPoint>,
  nodes: MapLayoutNode[],
  options: MapLayoutOptions,
) {
  const clusters = new Map<string, MapLayoutNode[]>();
  for (const n of nodes) {
    const key = n.group ? `g:${n.group}` : `n:${n.id}`;
    clusters.set(key, [...(clusters.get(key) ?? []), n]);
  }
  if (![...clusters.keys()].some(k => k.startsWith('g:'))) return;
  const gap = 24;
  const hw = options.nodeWidth / 2;
  const hh = options.nodeHeight / 2;
  const items = [...clusters].map(([key, members]) => ({
    group: key.startsWith('g:'),
    fixed: members.some(m => m.pinned),
    members,
  }));
  const box = (item: (typeof items)[number]) => {
    const pad = item.group ? GROUP_PADDING : { x: 0, top: 0, bottom: 0 };
    const ps = item.members.map(m => result.get(m.id) ?? { x: 0, y: 0 });
    return {
      x1: Math.min(...ps.map(p => p.x)) - hw - pad.x - gap / 2,
      x2: Math.max(...ps.map(p => p.x)) + hw + pad.x + gap / 2,
      y1: Math.min(...ps.map(p => p.y)) - hh - pad.top - gap / 2,
      y2: Math.max(...ps.map(p => p.y)) + hh + pad.bottom + gap / 2,
    };
  };
  const shift = (item: (typeof items)[number], dx: number, dy: number) => {
    for (const m of item.members) {
      const p = result.get(m.id);
      if (p) result.set(m.id, { x: p.x + dx, y: p.y + dy });
    }
  };
  // Pushes one overlapping pair apart along the axis that needs the smaller move.
  const resolve = (a: (typeof items)[number], b: (typeof items)[number]) => {
    const ba = box(a);
    const bb = box(b);
    const ox = Math.min(ba.x2, bb.x2) - Math.max(ba.x1, bb.x1);
    const oy = Math.min(ba.y2, bb.y2) - Math.max(ba.y1, bb.y1);
    if (ox <= 0 || oy <= 0) return false;
    const horizontal = ox < oy;
    const ca = horizontal ? ba.x1 + ba.x2 : ba.y1 + ba.y2;
    const cb = horizontal ? bb.x1 + bb.x2 : bb.y1 + bb.y2;
    const dir = ca <= cb ? -1 : 1;
    const amount = (horizontal ? ox : oy) + 1;
    let shareA = 0.5;
    if (a.fixed) shareA = 0;
    else if (b.fixed) shareA = 1;
    const da = dir * amount * shareA;
    const db = -dir * amount * (1 - shareA);
    shift(a, horizontal ? da : 0, horizontal ? 0 : da);
    shift(b, horizontal ? db : 0, horizontal ? 0 : db);
    return true;
  };
  for (let round = 0; round < 60; round += 1) {
    let moved = false;
    for (let i = 0; i < items.length; i += 1) {
      for (let j = i + 1; j < items.length; j += 1) {
        const a = items[i];
        const b = items[j];
        if ((a.group || b.group) && !(a.fixed && b.fixed) && resolve(a, b))
          moved = true;
      }
    }
    if (!moved) break;
  }
}

/**
 * An organic layout: connected nodes attract, all nodes repel, nodes of a group drift together.
 * Starts from `previous` positions when given, so live updates are stable. Deterministic for the
 * same input (no random start).
 */
export function forceLayout(
  nodes: MapLayoutNode[],
  edges: MapLayoutEdge[],
  options: MapLayoutOptions,
): Map<string, DiagramPoint> {
  const known = options.previous ?? new Map();
  const sim: SimNode[] = nodes.map((n, i) => {
    const { pinned } = n;
    const prev = known.get(n.id);
    const start = pinned ?? prev;
    // A golden-angle spiral for nodes without a position.
    const angle = i * 2.399963;
    const radius = 40 * Math.sqrt(i + 1);
    return {
      id: n.id,
      group: n.group,
      x: start?.x ?? Math.cos(angle) * radius,
      y: start?.y ?? Math.sin(angle) * radius,
      fx: pinned?.x,
      fy: pinned?.y,
    };
  });
  const byId = new Map(sim.map(n => [n.id, n]));
  const links: SimulationLinkDatum<SimNode>[] = edges
    .filter(
      e => byId.has(e.source) && byId.has(e.target) && e.source !== e.target,
    )
    .map(e => ({ source: e.source, target: e.target }));

  // Group centres on a ring, so groups settle apart from each other.
  const groups = [
    ...new Set(nodes.map(n => n.group).filter((g): g is string => !!g)),
  ];
  const ring = Math.max(260, groups.length * 110);
  const groupCenter = new Map(
    groups.map((g, i) => {
      const a = (i / Math.max(groups.length, 1)) * Math.PI * 2;
      return [g, { x: Math.cos(a) * ring, y: Math.sin(a) * ring }];
    }),
  );
  const spread = Math.hypot(options.nodeWidth, options.nodeHeight);

  const simulation = forceSimulation(sim)
    .force(
      'link',
      forceLink<SimNode, SimulationLinkDatum<SimNode>>(links)
        .id(d => d.id)
        .distance(spread * 1.1)
        .strength(0.35),
    )
    .force('charge', forceManyBody<SimNode>().strength(-spread * 4))
    .force('collide', forceCollide<SimNode>(spread / 2 + 8))
    .force(
      'x',
      forceX<SimNode>(d =>
        d.group ? (groupCenter.get(d.group)?.x ?? 0) : 0,
      ).strength(d => (d.group ? 0.12 : 0.03)),
    )
    .force(
      'y',
      forceY<SimNode>(d =>
        d.group ? (groupCenter.get(d.group)?.y ?? 0) : 0,
      ).strength(d => (d.group ? 0.12 : 0.03)),
    )
    .stop();
  // Warm starts need fewer ticks.
  const ticks = known.size ? 120 : 300;
  simulation.alpha(known.size ? 0.4 : 1);
  for (let i = 0; i < ticks; i += 1) simulation.tick();
  const result = new Map(sim.map(n => [n.id, { x: n.x ?? 0, y: n.y ?? 0 }]));
  separateGroups(result, nodes, options);
  return result;
}

/**
 * A layered layout, upstream on the left and downstream on the right: each node goes one column
 * after its furthest caller, and nodes in a column are ordered to keep lines short (barycentre
 * sweeps). Cycles are broken at the edge that closes them.
 */
export function layeredLayout(
  nodes: MapLayoutNode[],
  edges: MapLayoutEdge[],
  options: MapLayoutOptions,
): Map<string, DiagramPoint> {
  const ids = new Set(nodes.map(n => n.id));
  const out = new Map<string, string[]>();
  const incoming = new Map<string, string[]>();
  for (const id of ids) {
    out.set(id, []);
    incoming.set(id, []);
  }
  // Drop the edges that close a cycle, found with a depth-first search.
  const state = new Map<string, 0 | 1 | 2>();
  const kept: MapLayoutEdge[] = [];
  const adjacency = new Map<string, string[]>();
  for (const e of edges) {
    if (ids.has(e.source) && ids.has(e.target) && e.source !== e.target) {
      adjacency.set(e.source, [...(adjacency.get(e.source) ?? []), e.target]);
    }
  }
  const visit = (id: string) => {
    state.set(id, 1);
    for (const next of adjacency.get(id) ?? []) {
      if (state.get(next) === 1) {
        // A back edge: skip it.
      } else {
        kept.push({ source: id, target: next });
        if (!state.get(next)) visit(next);
      }
    }
    state.set(id, 2);
  };
  for (const n of nodes) if (!state.get(n.id)) visit(n.id);
  for (const e of kept) {
    out.get(e.source)?.push(e.target);
    incoming.get(e.target)?.push(e.source);
  }

  // Longest path from the sources gives each node its column.
  const rank = new Map<string, number>();
  const rankOf = (id: string, seen = new Set<string>()): number => {
    const known = rank.get(id);
    if (known !== undefined) return known;
    if (seen.has(id)) return 0;
    seen.add(id);
    const callers = incoming.get(id) ?? [];
    const r = callers.length
      ? Math.max(...callers.map(c => rankOf(c, seen) + 1))
      : 0;
    rank.set(id, r);
    return r;
  };
  for (const n of nodes) rankOf(n.id);
  const columns: string[][] = [];
  for (const n of nodes) {
    const r = rank.get(n.id) ?? 0;
    (columns[r] = columns[r] ?? []).push(n.id);
  }

  // Order each column by the average position of its neighbours, sweeping both ways.
  const position = new Map<string, number>();
  const index = () =>
    columns.forEach(col => col.forEach((id, i) => position.set(id, i)));
  index();
  const barycentre = (id: string, neighbours: string[]) =>
    neighbours.length
      ? neighbours.reduce((s, n) => s + (position.get(n) ?? 0), 0) /
        neighbours.length
      : (position.get(id) ?? 0);
  for (let sweep = 0; sweep < 4; sweep += 1) {
    const forward = sweep % 2 === 0;
    const order = forward ? columns.keys() : [...columns.keys()].reverse();
    for (const c of order) {
      const col = columns[c];
      if (col) {
        col.sort(
          (a, b) =>
            barycentre(
              a,
              forward ? (incoming.get(a) ?? []) : (out.get(a) ?? []),
            ) -
            barycentre(
              b,
              forward ? (incoming.get(b) ?? []) : (out.get(b) ?? []),
            ),
        );
        col.forEach((id, i) => position.set(id, i));
      }
    }
  }

  const colGap = options.nodeWidth + 120;
  const rowGap = options.nodeHeight + 40;
  const result = new Map<string, DiagramPoint>();
  const groupOf = new Map(nodes.map(n => [n.id, n.group ?? '']));
  const lanes = [...new Set(nodes.map(n => n.group ?? ''))];
  if (lanes.length < 2) {
    columns.forEach((col, c) => {
      const height = (col.length - 1) * rowGap;
      col.forEach((id, i) =>
        result.set(id, { x: c * colGap, y: i * rowGap - height / 2 }),
      );
    });
  } else {
    // Groups become horizontal lanes, so their boxes never overlap. Lanes are ordered by where
    // their nodes sit on average, which keeps the barycentre order as far as possible.
    const avg = (lane: string) => {
      const ps = nodes
        .filter(n => (n.group ?? '') === lane)
        .map(
          n =>
            (position.get(n.id) ?? 0) /
            Math.max(1, (columns[rank.get(n.id) ?? 0] ?? []).length),
        );
      return ps.reduce((s, p) => s + p, 0) / Math.max(1, ps.length);
    };
    lanes.sort((a, b) => avg(a) - avg(b));
    let top = 0;
    for (const lane of lanes) {
      const perColumn = columns.map(col =>
        (col ?? []).filter(id => groupOf.get(id) === lane),
      );
      const rows = Math.max(...perColumn.map(c => c.length));
      const height = (rows - 1) * rowGap;
      const laneTop = top;
      perColumn.forEach((col, c) => {
        const offset = (height - (col.length - 1) * rowGap) / 2;
        col.forEach((id, i) =>
          result.set(id, { x: c * colGap, y: laneTop + offset + i * rowGap }),
        );
      });
      const boxed = lane ? GROUP_PADDING.top + GROUP_PADDING.bottom : 0;
      top += height + rowGap + boxed + 24;
    }
  }
  for (const n of nodes) if (n.pinned) result.set(n.id, n.pinned);
  return result;
}

/**
 * A radial layout around `center`: rings by the number of hops (either direction), with each
 * ring's nodes ordered to sit near the node that reached them. Unreached nodes go on an outer ring.
 */
export function radialLayout(
  nodes: MapLayoutNode[],
  edges: MapLayoutEdge[],
  options: MapLayoutOptions,
): Map<string, DiagramPoint> {
  const ids = nodes.map(n => n.id);
  const center =
    options.center && ids.includes(options.center) ? options.center : ids[0];
  const neighbours = new Map<string, string[]>(ids.map(id => [id, []]));
  for (const e of edges) {
    if (
      neighbours.has(e.source) &&
      neighbours.has(e.target) &&
      e.source !== e.target
    ) {
      neighbours.get(e.source)?.push(e.target);
      neighbours.get(e.target)?.push(e.source);
    }
  }
  const hop = new Map<string, number>();
  const parent = new Map<string, string>();
  const rings: string[][] = [];
  if (center) {
    hop.set(center, 0);
    rings[0] = [center];
    const queue = [center];
    while (queue.length) {
      const id = queue.shift() as string;
      const h = hop.get(id) ?? 0;
      for (const n of neighbours.get(id) ?? []) {
        if (!hop.has(n)) {
          hop.set(n, h + 1);
          parent.set(n, id);
          (rings[h + 1] = rings[h + 1] ?? []).push(n);
          queue.push(n);
        }
      }
    }
  }
  const rest = ids.filter(id => !hop.has(id));

  // Each node gets a slice of the circle sized by the leaves below it in the BFS tree, and its
  // children share that slice, so branches fan out without crossing.
  const children = new Map<string, string[]>();
  for (const [child, p] of parent)
    children.set(p, [...(children.get(p) ?? []), child]);
  const leaves = new Map<string, number>();
  const countLeaves = (id: string): number => {
    const kids = children.get(id) ?? [];
    const n = kids.length ? kids.reduce((s, k) => s + countLeaves(k), 0) : 1;
    leaves.set(id, n);
    return n;
  };
  const angle = new Map<string, number>();
  const assign = (id: string, from: number, to: number) => {
    angle.set(id, (from + to) / 2);
    const kids = children.get(id) ?? [];
    const total = kids.reduce((s, k) => s + (leaves.get(k) ?? 1), 0);
    let at = from;
    for (const k of kids) {
      const span = ((to - from) * (leaves.get(k) ?? 1)) / total;
      assign(k, at, at + span);
      at += span;
    }
  };
  if (center) {
    countLeaves(center);
    assign(center, -Math.PI / 2, (Math.PI * 3) / 2);
  }

  // Each ring is far enough out for its nodes to fit side by side.
  const step = Math.max(options.nodeWidth, options.nodeHeight * 3) + 40;
  const radii: number[] = [0];
  rings.forEach((ring, r) => {
    if (r > 0) {
      const room = options.nodeWidth + 24;
      const fit = (ring.length * room) / (Math.PI * 2);
      // The tightest pair of neighbours on the ring decides how far out it must go.
      const as = ring.map(id => angle.get(id) ?? 0).sort((a, b) => a - b);
      let tightest = Math.PI * 2;
      for (let i = 1; i < as.length; i += 1)
        tightest = Math.min(tightest, as[i] - as[i - 1]);
      const spread = as.length > 1 ? room / Math.max(tightest, 0.05) : 0;
      const prev = radii[r - 1];
      radii[r] = Math.max(prev + step, fit, Math.min(spread, prev + step * 3));
    }
  });
  const result = new Map<string, DiagramPoint>();
  for (const [id, h] of hop) {
    const a = angle.get(id) ?? 0;
    const radius = radii[h] ?? 0;
    result.set(
      id,
      h ? { x: Math.cos(a) * radius, y: Math.sin(a) * radius } : { x: 0, y: 0 },
    );
  }
  if (rest.length) {
    const outer = Math.max(
      (radii[radii.length - 1] ?? 0) + step,
      (rest.length * (options.nodeWidth + 24)) / (Math.PI * 2),
    );
    rest.forEach((id, i) => {
      const a = (i / rest.length) * Math.PI * 2 - Math.PI / 2;
      result.set(id, { x: Math.cos(a) * outer, y: Math.sin(a) * outer });
    });
  }
  for (const n of nodes) if (n.pinned) result.set(n.id, n.pinned);
  return result;
}

/** Ids reachable from `start` along edges: `upstream` follows edges backwards (who depends on it). */
export function reachable(
  start: string,
  edges: MapLayoutEdge[],
  direction: 'upstream' | 'downstream',
): Set<string> {
  const next = new Map<string, string[]>();
  for (const e of edges) {
    const [from, to] =
      direction === 'downstream' ? [e.source, e.target] : [e.target, e.source];
    next.set(from, [...(next.get(from) ?? []), to]);
  }
  const seen = new Set([start]);
  const queue = [start];
  while (queue.length) {
    const id = queue.shift() as string;
    for (const n of next.get(id) ?? []) {
      if (!seen.has(n)) {
        seen.add(n);
        queue.push(n);
      }
    }
  }
  return seen;
}

/** Ids within `hops` steps of `start`, in either direction. */
export function withinHops(
  start: string,
  edges: MapLayoutEdge[],
  hops: number,
): Set<string> {
  const neighbours = new Map<string, string[]>();
  for (const e of edges) {
    neighbours.set(e.source, [...(neighbours.get(e.source) ?? []), e.target]);
    neighbours.set(e.target, [...(neighbours.get(e.target) ?? []), e.source]);
  }
  const seen = new Map([[start, 0]]);
  const queue = [start];
  while (queue.length) {
    const id = queue.shift() as string;
    const h = seen.get(id) ?? 0;
    if (h < hops) {
      for (const n of neighbours.get(id) ?? []) {
        if (!seen.has(n)) {
          seen.set(n, h + 1);
          queue.push(n);
        }
      }
    }
  }
  return new Set(seen.keys());
}
