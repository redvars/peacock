/**
 * The grid's keyboard model. Navigation rows are numbered from 0, the column header row; data
 * rows follow from 1. The column group row is not part of navigation.
 */
export interface GridPosition {
  row: number;
  col: number;
}

export interface GridBounds {
  /** Index of the last navigation row (the number of data rows on the page). */
  lastRow: number;
  /** Index of the last column. */
  lastCol: number;
}

/**
 * The cell an arrow, Home or End key moves to, or `undefined` for any other key. In right-to-left
 * layouts the left and right arrows swap, so they follow what is on screen.
 */
export function nextGridPosition(
  key: string,
  { row, col }: GridPosition,
  { lastRow, lastCol }: GridBounds,
  { ctrlKey = false, rtl = false }: { ctrlKey?: boolean; rtl?: boolean } = {},
): GridPosition | undefined {
  const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
  const backward = rtl ? 'ArrowRight' : 'ArrowLeft';
  switch (key) {
    case forward:
      return { row, col: Math.min(col + 1, lastCol) };
    case backward:
      return { row, col: Math.max(col - 1, 0) };
    case 'ArrowDown':
      return { row: Math.min(row + 1, lastRow), col };
    case 'ArrowUp':
      return { row: Math.max(row - 1, 0), col };
    case 'Home':
      return { row: ctrlKey ? 0 : row, col: 0 };
    case 'End':
      return { row: ctrlKey ? lastRow : row, col: lastCol };
    default:
      return undefined;
  }
}

/** Keeps a position inside the grid after rows or columns went away. */
export function clampGridPosition(
  position: GridPosition,
  { lastRow, lastCol }: GridBounds,
): GridPosition {
  return {
    row: Math.min(position.row, Math.max(0, lastRow)),
    col: Math.min(position.col, Math.max(0, lastCol)),
  };
}

/** `1` for a key that moves towards the end of the row, `-1` towards the start, else `0`. */
export function horizontalDirection(key: string, rtl: boolean): number {
  if (key === 'ArrowRight') return rtl ? -1 : 1;
  if (key === 'ArrowLeft') return rtl ? 1 : -1;
  return 0;
}
