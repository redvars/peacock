/** A slot in the page list: a page number, or a gap shown as an ellipsis. */
export type PageItem = number | 'ellipsis';

function range(from: number, to: number): number[] {
  return Array.from({ length: to - from + 1 }, (_, index) => from + index);
}

/**
 * Builds the page list shown by the `full` pagination variant.
 *
 * The list always keeps the first and last page, the current page and `siblings` pages on each
 * side of it, and fills the rest with an ellipsis. It never holds more than
 * `2 * siblings + 5` slots, so the control keeps its width while the user moves through pages.
 *
 * @example
 * getPageItems(5, 24); // [1, 'ellipsis', 4, 5, 6, 'ellipsis', 24]
 * getPageItems(2, 24); // [1, 2, 3, 4, 5, 'ellipsis', 24]
 */
export function getPageItems(
  current: number,
  total: number,
  siblings: number = 1,
): PageItem[] {
  const totalPages = Math.max(1, Math.trunc(total));
  const page = Math.min(Math.max(1, Math.trunc(current)), totalPages);
  const maxSlots = 2 * siblings + 5;

  if (totalPages <= maxSlots) {
    return range(1, totalPages);
  }

  const start = Math.max(page - siblings, 1);
  const end = Math.min(page + siblings, totalPages);
  // A gap of one page is shown as that page; only a gap of two or more becomes an ellipsis.
  const showStartGap = start > 3;
  const showEndGap = end < totalPages - 2;
  // Pages shown on the side without a gap: the window, the edge page and the slot the
  // ellipsis would have taken.
  const edgeCount = 2 * siblings + 3;

  if (!showStartGap && showEndGap) {
    return [...range(1, edgeCount), 'ellipsis', totalPages];
  }

  if (showStartGap && !showEndGap) {
    return [1, 'ellipsis', ...range(totalPages - edgeCount + 1, totalPages)];
  }

  return [1, 'ellipsis', ...range(start, end), 'ellipsis', totalPages];
}
