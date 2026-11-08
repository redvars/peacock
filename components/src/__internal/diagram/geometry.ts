import type {
  DiagramConnector,
  DiagramPoint,
  DiagramRect,
  DiagramSide,
} from './types.js';

/** Rounds to two decimals, to keep SVG path strings short. */
function round(n: number) {
  return Math.round(n * 100) / 100;
}

/** Unit vector pointing out of each side. */
export const SIDE_NORMAL: Record<DiagramSide, DiagramPoint> = {
  top: { x: 0, y: -1 },
  right: { x: 1, y: 0 },
  bottom: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
};

export const OPPOSITE_SIDE: Record<DiagramSide, DiagramSide> = {
  top: 'bottom',
  right: 'left',
  bottom: 'top',
  left: 'right',
};

/** Corner radius of elbow connectors, in canvas pixels. */
export const ELBOW_RADIUS = 32;

/** Straight run out of a port before an elbow turns back on itself. */
const STUB = 24;

const isHorizontal = (side: DiagramSide) => side === 'left' || side === 'right';

/** The point on `side` of `rect`, `offset` (0 to 1) of the way along it. */
export function anchorOnRect(
  rect: DiagramRect,
  side: DiagramSide,
  offset = 0.5,
): DiagramPoint {
  switch (side) {
    case 'top':
      return { x: rect.x + rect.width * offset, y: rect.y };
    case 'bottom':
      return { x: rect.x + rect.width * offset, y: rect.y + rect.height };
    case 'left':
      return { x: rect.x, y: rect.y + rect.height * offset };
    case 'right':
    default:
      return { x: rect.x + rect.width, y: rect.y + rect.height * offset };
  }
}

/** Drops repeated points and the middle point of three in a line. */
function simplify(points: DiagramPoint[]): DiagramPoint[] {
  const out: DiagramPoint[] = [];
  for (const p of points) {
    const last = out[out.length - 1];
    const repeated =
      last && Math.abs(last.x - p.x) < 0.01 && Math.abs(last.y - p.y) < 0.01;
    if (!repeated) out.push(p);
    while (!repeated && out.length >= 3) {
      const [a, b, c] = out.slice(-3);
      const cross = (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x);
      if (Math.abs(cross) > 0.01) break;
      out.splice(out.length - 2, 1);
    }
  }
  return out;
}

/**
 * The corner points of an orthogonal route from `start` (leaving `startSide`) to `end` (entering
 * `endSide`). Forward routes make one turn pair at the midpoint; routes that must turn back run
 * out of each port first.
 */
export function elbowPoints(
  start: DiagramPoint,
  startSide: DiagramSide,
  end: DiagramPoint,
  endSide: DiagramSide,
): DiagramPoint[] {
  const ns = SIDE_NORMAL[startSide];
  const ne = SIDE_NORMAL[endSide];
  const s1 = { x: start.x + ns.x * STUB, y: start.y + ns.y * STUB };
  const e1 = { x: end.x + ne.x * STUB, y: end.y + ne.y * STUB };

  if (isHorizontal(startSide) && isHorizontal(endSide)) {
    const forward = (end.x - start.x) * ns.x > 0 && ns.x === -ne.x;
    if (forward) {
      const xm = (start.x + end.x) / 2;
      return simplify([start, { x: xm, y: start.y }, { x: xm, y: end.y }, end]);
    }
    let ym = (start.y + end.y) / 2;
    if (Math.abs(end.y - start.y) < 1) ym = start.y + 3 * STUB;
    if (ns.x === ne.x) {
      const x = ns.x > 0 ? Math.max(s1.x, e1.x) : Math.min(s1.x, e1.x);
      return simplify([start, { x, y: start.y }, { x, y: end.y }, end]);
    }
    return simplify([
      start,
      s1,
      { x: s1.x, y: ym },
      { x: e1.x, y: ym },
      e1,
      end,
    ]);
  }

  if (!isHorizontal(startSide) && !isHorizontal(endSide)) {
    const forward = (end.y - start.y) * ns.y > 0 && ns.y === -ne.y;
    if (forward) {
      const ym = (start.y + end.y) / 2;
      return simplify([start, { x: start.x, y: ym }, { x: end.x, y: ym }, end]);
    }
    let xm = (start.x + end.x) / 2;
    if (Math.abs(end.x - start.x) < 1) xm = start.x + 3 * STUB;
    if (ns.y === ne.y) {
      const y = ns.y > 0 ? Math.max(s1.y, e1.y) : Math.min(s1.y, e1.y);
      return simplify([start, { x: start.x, y }, { x: end.x, y }, end]);
    }
    return simplify([
      start,
      s1,
      { x: xm, y: s1.y },
      { x: xm, y: e1.y },
      e1,
      end,
    ]);
  }

  // One horizontal side, one vertical: a single corner when both ports face it.
  const corner = isHorizontal(startSide)
    ? { x: end.x, y: start.y }
    : { x: start.x, y: end.y };
  const leavesTowardCorner =
    (corner.x - start.x) * ns.x + (corner.y - start.y) * ns.y > 0;
  const entersFromCorner =
    (corner.x - end.x) * ne.x + (corner.y - end.y) * ne.y > 0;
  if (leavesTowardCorner && entersFromCorner) {
    return simplify([start, corner, end]);
  }
  const mid = isHorizontal(startSide)
    ? { x: s1.x, y: e1.y }
    : { x: e1.x, y: s1.y };
  return simplify([start, s1, mid, e1, end]);
}

/** An SVG path through `points` whose corners are true circular arcs of up to `radius`. */
export function roundedPath(points: DiagramPoint[], radius = ELBOW_RADIUS) {
  if (points.length === 0) return '';
  let d = `M ${round(points[0].x)} ${round(points[0].y)}`;
  for (let i = 1; i < points.length - 1; i += 1) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];
    const lenIn = Math.hypot(curr.x - prev.x, curr.y - prev.y);
    const lenOut = Math.hypot(next.x - curr.x, next.y - curr.y);
    const r = Math.min(radius, lenIn / 2, lenOut / 2);
    if (r < 0.5 || lenIn === 0 || lenOut === 0) {
      d += ` L ${round(curr.x)} ${round(curr.y)}`;
    } else {
      const din = {
        x: (curr.x - prev.x) / lenIn,
        y: (curr.y - prev.y) / lenIn,
      };
      const dout = {
        x: (next.x - curr.x) / lenOut,
        y: (next.y - curr.y) / lenOut,
      };
      const sweep = din.x * dout.y - din.y * dout.x > 0 ? 1 : 0;
      const a = { x: curr.x - din.x * r, y: curr.y - din.y * r };
      const b = { x: curr.x + dout.x * r, y: curr.y + dout.y * r };
      d += ` L ${round(a.x)} ${round(a.y)} A ${round(r)} ${round(r)} 0 0 ${sweep} ${round(b.x)} ${round(b.y)}`;
    }
  }
  const last = points[points.length - 1];
  d += ` L ${round(last.x)} ${round(last.y)}`;
  return d;
}

/** The point halfway along a polyline. */
export function polylineMidpoint(points: DiagramPoint[]): DiagramPoint {
  if (points.length === 1) return { ...points[0] };
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    total += Math.hypot(
      points[i].x - points[i - 1].x,
      points[i].y - points[i - 1].y,
    );
  }
  let remaining = total / 2;
  for (let i = 1; i < points.length; i += 1) {
    const a = points[i - 1];
    const b = points[i];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    if (remaining <= len && len > 0) {
      const t = remaining / len;
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    }
    remaining -= len;
  }
  return { ...points[points.length - 1] };
}

/** A connector's drawn path, where its label goes, and the direction it arrives in (radians). */
export interface EdgeGeometry {
  d: string;
  mid: DiagramPoint;
  /** Direction of travel at the end, for the end marker. */
  endAngle: number;
  /** Direction of travel away from the start, reversed, for the start marker. */
  startAngle: number;
}

function cubicPoint(
  p0: DiagramPoint,
  p1: DiagramPoint,
  p2: DiagramPoint,
  p3: DiagramPoint,
  t: number,
): DiagramPoint {
  const u = 1 - t;
  return {
    x:
      u ** 3 * p0.x +
      3 * u * u * t * p1.x +
      3 * u * t * t * p2.x +
      t ** 3 * p3.x,
    y:
      u ** 3 * p0.y +
      3 * u * u * t * p1.y +
      3 * u * t * t * p2.y +
      t ** 3 * p3.y,
  };
}

/**
 * Builds a connector between two ports. `startInset` and `endInset` shorten the line so markers
 * sit on the port instead of under the line's end.
 */
export function edgeGeometry(
  kind: DiagramConnector,
  start: DiagramPoint,
  startSide: DiagramSide,
  end: DiagramPoint,
  endSide: DiagramSide,
  options: { radius?: number; startInset?: number; endInset?: number } = {},
): EdgeGeometry {
  const { radius = ELBOW_RADIUS, startInset = 0, endInset = 0 } = options;
  const ns = SIDE_NORMAL[startSide];
  const ne = SIDE_NORMAL[endSide];

  if (kind === 'straight') {
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const s = {
      x: start.x + Math.cos(angle) * startInset,
      y: start.y + Math.sin(angle) * startInset,
    };
    const e = {
      x: end.x - Math.cos(angle) * endInset,
      y: end.y - Math.sin(angle) * endInset,
    };
    return {
      d: `M ${round(s.x)} ${round(s.y)} L ${round(e.x)} ${round(e.y)}`,
      mid: { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 },
      endAngle: angle,
      startAngle: angle + Math.PI,
    };
  }

  const s = { x: start.x + ns.x * startInset, y: start.y + ns.y * startInset };
  const e = { x: end.x + ne.x * endInset, y: end.y + ne.y * endInset };
  const endAngle = Math.atan2(-ne.y, -ne.x);
  const startAngle = Math.atan2(-ns.y, -ns.x);

  if (kind === 'bezier') {
    const dist = Math.hypot(e.x - s.x, e.y - s.y);
    const offset = Math.max(dist / 2, 50);
    const c1 = { x: s.x + ns.x * offset, y: s.y + ns.y * offset };
    const c2 = { x: e.x + ne.x * offset, y: e.y + ne.y * offset };
    return {
      d: `M ${round(s.x)} ${round(s.y)} C ${round(c1.x)} ${round(c1.y)}, ${round(c2.x)} ${round(c2.y)}, ${round(e.x)} ${round(e.y)}`,
      mid: cubicPoint(s, c1, c2, e, 0.5),
      endAngle,
      startAngle,
    };
  }

  const points = elbowPoints(s, startSide, e, endSide);
  return {
    d: roundedPath(points, radius),
    mid: polylineMidpoint(points),
    endAngle,
    startAngle,
  };
}

/** The smallest box around every rect, or `undefined` for none. */
export function boundsOf(rects: DiagramRect[]): DiagramRect | undefined {
  if (rects.length === 0) return undefined;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const r of rects) {
    minX = Math.min(minX, r.x);
    minY = Math.min(minY, r.y);
    maxX = Math.max(maxX, r.x + r.width);
    maxY = Math.max(maxY, r.y + r.height);
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

export function rectsIntersect(a: DiagramRect, b: DiagramRect): boolean {
  return (
    a.x < b.x + b.width &&
    b.x < a.x + a.width &&
    a.y < b.y + b.height &&
    b.y < a.y + a.height
  );
}

export function inflateRect(r: DiagramRect, by: number): DiagramRect {
  return {
    x: r.x - by,
    y: r.y - by,
    width: r.width + 2 * by,
    height: r.height + 2 * by,
  };
}

/** A rect from two corner points in any order. */
export function rectFromPoints(a: DiagramPoint, b: DiagramPoint): DiagramRect {
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    width: Math.abs(a.x - b.x),
    height: Math.abs(a.y - b.y),
  };
}

/**
 * The candidate nearest to `from` in a direction, for spatial keyboard navigation. Candidates
 * mostly to the side count more than those ahead diagonally.
 */
export function nearestInDirection<T extends { rect: DiagramRect }>(
  from: DiagramRect,
  candidates: T[],
  direction: 'up' | 'down' | 'left' | 'right',
): T | undefined {
  const cx = from.x + from.width / 2;
  const cy = from.y + from.height / 2;
  let best: T | undefined;
  let bestScore = Infinity;
  for (const c of candidates) {
    const x = c.rect.x + c.rect.width / 2;
    const y = c.rect.y + c.rect.height / 2;
    const dx = x - cx;
    const dy = y - cy;
    const along = { up: -dy, down: dy, left: -dx, right: dx }[direction];
    const across =
      direction === 'up' || direction === 'down' ? Math.abs(dx) : Math.abs(dy);
    const score = along + across * 2;
    if (along > 1 && score < bestScore) {
      bestScore = score;
      best = c;
    }
  }
  return best;
}
