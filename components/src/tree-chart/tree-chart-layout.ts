import { hierarchy, tree } from 'd3';
import type { DiagramPoint, DiagramSize } from '@/__internal/diagram/types.js';

/** A node to lay out: its size and the ids of its visible children. */
export interface LayoutInput {
  id: string;
  children: string[];
}

export interface LayoutOptions {
  orientation: 'vertical' | 'horizontal';
  /** Stack children that are all leaves in a column under their parent (vertical only). */
  compact: boolean;
  /** Space between siblings, in canvas pixels. */
  siblingGap: number;
  /** Space between levels. */
  levelGap: number;
  /** Space between the cards of a compact stack. */
  stackGap: number;
  /** Indent of a compact stack from its connector lane. */
  stackIndent: number;
}

export interface LayoutResult {
  /** Top-left corner of each laid-out node. */
  positions: Map<string, DiagramPoint>;
  /** Parents whose children are drawn as a compact stack. */
  stacked: Set<string>;
}

/**
 * The corner points of the connector from a parent box to a child box: down to a fork halfway
 * across the level gap, across, and down into the child. For a compact stack, across to a lane on
 * the stack's left and into the child's side.
 */
export function linkPoints(
  parent: { x: number; y: number; width: number; height: number },
  child: { x: number; y: number; width: number; height: number },
  options: Pick<LayoutOptions, 'orientation' | 'levelGap' | 'stackIndent'> & {
    stacked: boolean;
  },
): DiagramPoint[] {
  if (options.orientation === 'horizontal') {
    const start = {
      x: parent.x + parent.width,
      y: parent.y + parent.height / 2,
    };
    const end = { x: child.x, y: child.y + child.height / 2 };
    const fork = start.x + options.levelGap / 2;
    return [start, { x: fork, y: start.y }, { x: fork, y: end.y }, end];
  }
  const start = { x: parent.x + parent.width / 2, y: parent.y + parent.height };
  const fork = start.y + options.levelGap / 2;
  if (options.stacked) {
    const lane = child.x - options.stackIndent;
    const mid = child.y + child.height / 2;
    return [
      start,
      { x: start.x, y: fork },
      { x: lane, y: fork },
      { x: lane, y: mid },
      { x: child.x, y: mid },
    ];
  }
  const end = { x: child.x + child.width / 2, y: child.y };
  return [start, { x: start.x, y: fork }, { x: end.x, y: fork }, end];
}

interface Box {
  id: string;
  /** Width across the tree (breadth) and along it (depth). */
  breadth: number;
  depth: number;
  /** For a compact stack: the leaves inside, top to bottom. */
  stack?: string[];
  children: Box[];
}

const VIRTUAL_ROOT = '\u0000root';

/**
 * Lays out a forest as tidy trees (d3's Buchheim algorithm) with each node's real size. Roots sit
 * side by side. With `compact`, a parent whose visible children are all leaves gets them as one
 * column, which keeps wide teams narrow.
 */
export function layoutTree(
  roots: string[],
  nodes: Map<string, LayoutInput>,
  size: (id: string) => DiagramSize,
  options: LayoutOptions,
): LayoutResult {
  const vertical = options.orientation === 'vertical';
  const breadthOf = (s: DiagramSize) => (vertical ? s.width : s.height);
  const depthOf = (s: DiagramSize) => (vertical ? s.height : s.width);
  const stacked = new Set<string>();

  const build = (id: string): Box => {
    const s = size(id);
    const kids = nodes.get(id)?.children ?? [];
    const allLeaves =
      kids.length > 1 &&
      kids.every(k => (nodes.get(k)?.children.length ?? 0) === 0);
    if (vertical && options.compact && allLeaves) {
      stacked.add(id);
      const widths = kids.map(k => size(k).width);
      const heights = kids.map(k => size(k).height);
      const stackBox: Box = {
        id: `${id}\u0000stack`,
        breadth: Math.max(...widths) + options.stackIndent * 2,
        depth:
          heights.reduce((a, b) => a + b, 0) +
          options.stackGap * (kids.length - 1),
        stack: kids,
        children: [],
      };
      return {
        id,
        breadth: breadthOf(s),
        depth: depthOf(s),
        children: [stackBox],
      };
    }
    return {
      id,
      breadth: breadthOf(s),
      depth: depthOf(s),
      children: kids.map(build),
    };
  };

  const forest: Box = {
    id: VIRTUAL_ROOT,
    breadth: 0,
    depth: 0,
    children: roots.map(build),
  };
  const root = hierarchy(forest, b => b.children);

  // Depth extent per level, so levels line up even when cards differ in height. A compact stack
  // has nothing below it, so its height does not push deeper levels down.
  const levelDepth: number[] = [];
  root.each(n => {
    const extent = n.data.stack ? 0 : n.data.depth;
    levelDepth[n.depth] = Math.max(levelDepth[n.depth] ?? 0, extent);
  });
  const levelStart: number[] = [];
  let cursor = 0;
  levelDepth.forEach((d, i) => {
    levelStart[i] = cursor;
    cursor += d + (i === 0 ? 0 : options.levelGap);
  });

  tree<Box>()
    .nodeSize([1, 1])
    .separation(
      (a, b) =>
        (a.data.breadth + b.data.breadth) / 2 +
        options.siblingGap * (a.parent === b.parent ? 1 : 1.5),
    )(root);

  const positions = new Map<string, DiagramPoint>();
  root.each(node => {
    const n = node as typeof node & { x: number };
    if (n.data.id === VIRTUAL_ROOT) return;
    const start = levelStart[n.depth];
    const center = n.x;
    if (n.data.stack) {
      // A compact stack: one column with its lane on the left, starting at this level.
      const left = center - n.data.breadth / 2 + options.stackIndent * 2;
      let y = start;
      for (const leaf of n.data.stack) {
        positions.set(leaf, { x: left, y });
        y += size(leaf).height + options.stackGap;
      }
      return;
    }
    const b = center - breadthOf(size(n.data.id)) / 2;
    positions.set(
      n.data.id,
      vertical ? { x: b, y: start } : { x: start, y: b },
    );
  });

  return { positions, stacked };
}
