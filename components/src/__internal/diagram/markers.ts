import type { DiagramMarker, DiagramPoint } from './types.js';

/** How a marker shape is painted: in the line colour, in the canvas colour, or as a stroke only. */
export type MarkerFill = 'solid' | 'surface' | 'none';

export interface MarkerShape {
  d: string;
  fill: MarkerFill;
}

/*
 * Every shape points along +x with its tip at 0,0 and its body behind the tip (negative x), so
 * it can be placed with `translate(tip) rotate(direction)`. Drawing markers as geometry instead of
 * SVG `<marker>` elements lets them take each edge's colour, hover and selection styles.
 */
const CIRCLE = (cx: number) => `M ${cx - 4} 0 a 4 4 0 1 0 8 0 a 4 4 0 1 0 -8 0`;
const CROW = 'M -14 0 L 0 -7 M -14 0 L 0 7 M -14 0 L 0 0';
const BAR = (x: number) => `M ${x} -7 L ${x} 7`;

const SHAPES: Record<Exclude<DiagramMarker, 'none'>, MarkerShape[]> = {
  arrow: [{ d: 'M 0 0 L -10 -5 L -10 5 Z', fill: 'solid' }],
  'arrow-open': [{ d: 'M -10 -5 L 0 0 L -10 5', fill: 'none' }],
  circle: [{ d: CIRCLE(-4), fill: 'surface' }],
  diamond: [{ d: 'M 0 0 L -7 -5 L -14 0 L -7 5 Z', fill: 'surface' }],
  one: [{ d: `${BAR(-8)} ${BAR(-13)}`, fill: 'none' }],
  'zero-or-one': [
    { d: BAR(-8), fill: 'none' },
    { d: CIRCLE(-17), fill: 'surface' },
  ],
  many: [{ d: CROW, fill: 'none' }],
  'one-or-many': [{ d: `${CROW} ${BAR(-18)}`, fill: 'none' }],
  'zero-or-many': [
    { d: CROW, fill: 'none' },
    { d: CIRCLE(-22), fill: 'surface' },
  ],
};

/** The shapes that make up a marker; none for `none`. */
export function markerShapes(marker: DiagramMarker | undefined): MarkerShape[] {
  if (!marker || marker === 'none') return [];
  return SHAPES[marker] ?? [];
}

/**
 * How far the line stops short of the port, so a filled arrow's tip lands on the port instead of
 * the line's square end poking past it. Crow's-foot markers sit on top of the line, so they need none.
 */
export function markerInset(marker: DiagramMarker | undefined): number {
  return marker === 'arrow' ? 6 : 0;
}

/** The SVG transform that places a marker's tip at `at`, pointing along `angle` (radians). */
export function markerTransform(at: DiagramPoint, angle: number): string {
  const deg = (angle * 180) / Math.PI;
  return `translate(${Math.round(at.x * 100) / 100} ${Math.round(at.y * 100) / 100}) rotate(${Math.round(deg * 100) / 100})`;
}
