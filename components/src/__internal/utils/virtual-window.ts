/**
 * The items a virtual list renders: those in view, with `overscan` extra items on each side.
 * Shared by `wc-table` (virtual body) and `wc-virtual-list`. Every item has the same height.
 */
export function virtualWindow(
  count: number,
  {
    rowHeight,
    scrollTop,
    viewport,
    overscan,
  }: {
    rowHeight: number;
    scrollTop: number;
    viewport: number;
    overscan: number;
  },
): { start: number; end: number } {
  if (count <= 0 || rowHeight <= 0) return { start: 0, end: 0 };
  const first = Math.floor(Math.max(0, scrollTop) / rowHeight);
  const visible = Math.ceil(Math.max(0, viewport) / rowHeight) + 1;
  const start = Math.min(Math.max(0, first - overscan), count);
  const end = Math.min(count, first + visible + overscan);
  return { start, end: Math.max(start, end) };
}
