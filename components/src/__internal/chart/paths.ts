/**
 * SVG path for a rectangle with its own radius per corner, in the order top-left, top-right,
 * bottom-right, bottom-left. Every path has the same commands, so d3 can tween between any two.
 */
export function roundedRectPath(
  x: number,
  y: number,
  width: number,
  height: number,
  radii: [number, number, number, number],
): string {
  const w = Math.max(width, 0);
  const h = Math.max(height, 0);
  const limit = Math.min(w / 2, h / 2);
  const [tl, tr, br, bl] = radii.map(r => Math.max(Math.min(r, limit), 0));
  return [
    `M${x + tl},${y}`,
    `H${x + w - tr}`,
    `A${tr},${tr} 0 0 1 ${x + w},${y + tr}`,
    `V${y + h - br}`,
    `A${br},${br} 0 0 1 ${x + w - br},${y + h}`,
    `H${x + bl}`,
    `A${bl},${bl} 0 0 1 ${x},${y + h - bl}`,
    `V${y + tl}`,
    `A${tl},${tl} 0 0 1 ${x + tl},${y}`,
    'Z',
  ].join('');
}
