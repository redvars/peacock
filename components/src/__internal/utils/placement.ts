import type { Placement } from '@floating-ui/dom';

type Side = 'top' | 'bottom' | 'start' | 'end';

/**
 * Where an overlay sits relative to its anchor (ADR-030001): a side, `top`, `bottom`, `start` or
 * `end`, optionally followed by an alignment, `-start` or `-end`. `start` and `end` follow the
 * writing direction.
 */
export type OverlayPlacement = Side | `${Side}-start` | `${Side}-end`;

/**
 * Turns a logical placement into the physical one floating-ui takes, using the direction of
 * `element`. floating-ui already flips `-start` / `-end` alignment for right-to-left, so only the
 * side needs mapping.
 */
export function toPhysicalPlacement(
  placement: OverlayPlacement,
  element: Element,
): Placement {
  const [side, alignment] = placement.split('-');
  let physical = side;
  if (side === 'start' || side === 'end') {
    const rtl = getComputedStyle(element).direction === 'rtl';
    physical = (side === 'start') !== rtl ? 'left' : 'right';
  }
  return (alignment ? `${physical}-${alignment}` : physical) as Placement;
}
