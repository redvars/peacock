import type { Placement } from '@floating-ui/dom';
import { deprecate } from './deprecate.js';

type Side = 'top' | 'bottom' | 'start' | 'end';

/**
 * Where an overlay sits relative to its anchor (ADR-030001): a side, `top`, `bottom`, `start` or
 * `end`, optionally followed by an alignment, `-start` or `-end`. `start` and `end` follow the
 * writing direction. The physical `left` and `right` sides still work but are deprecated.
 */
export type OverlayPlacement =
  | Side
  | `${Side}-start`
  | `${Side}-end`
  | Placement;

/**
 * Turns a logical placement into the physical one floating-ui takes, using the direction of
 * `element`. floating-ui already flips `-start` / `-end` alignment for right-to-left, so only the
 * side needs mapping. `tag` names the component in the deprecation warning for `left` / `right`.
 */
export function toPhysicalPlacement(
  placement: OverlayPlacement,
  element: Element,
  tag: string,
): Placement {
  const [side, alignment] = placement.split('-');
  let physical = side;
  if (side === 'start' || side === 'end') {
    const rtl = getComputedStyle(element).direction === 'rtl';
    physical = (side === 'start') !== rtl ? 'left' : 'right';
  } else if (side === 'left' || side === 'right') {
    deprecate(
      tag,
      `placement="${placement}"`,
      `placement="${side === 'left' ? 'start' : 'end'}${alignment ? `-${alignment}` : ''}" (logical)`,
    );
  }
  return (alignment ? `${physical}-${alignment}` : physical) as Placement;
}
