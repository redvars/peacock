import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { addDays, differenceInDays, lastDayOf, startOfDay } from './utils.js';

/** What a drag in a calendar view does. */
export type CalendarDragAction = 'add' | 'move' | 'resize-start' | 'resize-end';

/** Pixels a mouse or pen moves before a press becomes a drag. */
const DRAG_DISTANCE = 5;
/** Milliseconds a finger holds still before a press becomes a drag; moving sooner scrolls. */
const TOUCH_HOLD_MS = 300;
/** Pixels a finger may move during the hold. */
const TOUCH_SLOP = 8;
/** Distance from a scroller's edge, in pixels, at which a drag scrolls it. */
const SCROLL_EDGE = 40;
/** Fastest auto-scroll, in pixels per frame. */
const SCROLL_MAX = 24;

/** Where the pointer is, in viewport pixels. */
export interface DragPoint {
  x: number;
  y: number;
}

/** What a view does at each step of a press. `T` is what the view knows about the press. */
export interface DragHandlers<T> {
  /** The press became a drag. `move` follows at once. */
  lift(data: T, point: DragPoint): void;
  /** The pointer moved during the drag, or a scroller scrolled under it. */
  move(data: T, point: DragPoint): void;
  /** The pointer was released after a drag. */
  drop(data: T, point: DragPoint): void;
  /** The drag ended without a drop: Escape, a canceled pointer, or the view left the page. */
  cancel(data: T): void;
  /** The pointer was released before the press became a drag. */
  tap?(data: T, point: DragPoint): void;
  /** Elements to scroll while the pointer is near their top or bottom edge. */
  scrollers?(data: T): (HTMLElement | null)[];
}

interface Press<T> {
  data: T;
  pointerId: number;
  pointerType: string;
  startX: number;
  startY: number;
  x: number;
  y: number;
  lifted: boolean;
  holdTimer?: ReturnType<typeof setTimeout>;
  frame?: number;
}

/**
 * The index of the element whose box holds the point, else of the nearest one; -1 when there are
 * none. Without `y`, only the horizontal distance counts.
 */
export function nearestIndex(elements: Element[], x: number, y?: number) {
  let best = -1;
  let bestDistance = Infinity;
  elements.forEach((element, index) => {
    const rect = element.getBoundingClientRect();
    const dx = Math.max(0, rect.left - x, x - rect.right);
    const dy = y === undefined ? 0 : Math.max(0, rect.top - y, y - rect.bottom);
    const distance = Math.hypot(dx, dy);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = index;
    }
  });
  return best;
}

/**
 * Where a drag by whole days puts an event, or the days it adds: `from` is the day pressed and
 * `to` the day under the pointer. Moves keep the event's times of day; resizes keep the time of
 * the edge that moves and leave the event at least a day long. An added range runs from midnight
 * to the midnight after its last day.
 */
export function dragByDays(
  action: CalendarDragAction,
  from: Date,
  to: Date,
  event?: { start: Date; end: Date },
): { start: Date; end: Date } | null {
  const fromDay = startOfDay(from);
  const toDay = startOfDay(to);
  if (action === 'add') {
    const [first, last] =
      fromDay.valueOf() <= toDay.valueOf()
        ? [fromDay, toDay]
        : [toDay, fromDay];
    return { start: first, end: addDays(last, 1) };
  }
  if (!event) return null;
  const { start, end } = event;
  const firstDay = startOfDay(start);
  const lastDay = lastDayOf(start, end);
  if (action === 'move') {
    const days = differenceInDays(toDay, fromDay);
    return { start: addDays(start, days), end: addDays(end, days) };
  }
  if (action === 'resize-end') {
    const target = toDay.valueOf() < firstDay.valueOf() ? firstDay : toDay;
    let newEnd = addDays(end, differenceInDays(target, lastDay));
    // An end earlier in the day than the start would make the event negative.
    if (newEnd.valueOf() <= start.valueOf()) newEnd = addDays(newEnd, 1);
    return { start, end: newEnd };
  }
  const target = toDay.valueOf() > lastDay.valueOf() ? lastDay : toDay;
  let newStart = addDays(start, differenceInDays(target, firstDay));
  if (newStart.valueOf() >= end.valueOf()) newStart = addDays(newStart, -1);
  return { start: newStart, end };
}

/** Auto-scroll speed for a pointer at `position` along a scroller from `start` to `end`. */
function edgeSpeed(position: number, start: number, end: number): number {
  let overshoot = 0;
  if (position < start + SCROLL_EDGE)
    overshoot = position - (start + SCROLL_EDGE);
  else if (position > end - SCROLL_EDGE)
    overshoot = position - (end - SCROLL_EDGE);
  if (!overshoot) return 0;
  return (
    Math.sign(overshoot) *
    Math.min(SCROLL_MAX, Math.ceil(Math.abs(overshoot) / 4))
  );
}

/**
 * Turns presses in a calendar view into drags, the way `wc-kanban` does: a mouse or pen drags once
 * it moves a few pixels, a finger once it has held still briefly (moving sooner scrolls). During a
 * drag the view's scrollers scroll near their edges, the page does not scroll under a finger, and
 * Escape cancels. The click that ends a drag is swallowed, so it does not also open an event.
 */
export class CalendarDragController<T> implements ReactiveController {
  private press: Press<T> | null = null;

  private readonly host: ReactiveControllerHost & HTMLElement;

  private readonly handlers: DragHandlers<T>;

  constructor(
    host: ReactiveControllerHost & HTMLElement,
    handlers: DragHandlers<T>,
  ) {
    this.host = host;
    this.handlers = handlers;
    host.addController(this);
  }

  /** Whether a press is being followed, dragging or not yet. */
  get pressing(): boolean {
    return this.press !== null;
  }

  /** Whether a drag is in progress. */
  get dragging(): boolean {
    return this.press?.lifted ?? false;
  }

  hostConnected() {
    this.host.addEventListener('touchmove', this.handleTouchMove, {
      passive: false,
    });
    this.host.addEventListener('contextmenu', this.handleContextMenu);
  }

  hostDisconnected() {
    this.host.removeEventListener('touchmove', this.handleTouchMove);
    this.host.removeEventListener('contextmenu', this.handleContextMenu);
    this.abort();
  }

  /**
   * Follows a press from its `pointerdown`. Returns `false`, ignoring it, for a secondary button
   * or pointer, or while another press is followed.
   */
  start(event: PointerEvent, data: T): boolean {
    if (!event.isPrimary || event.button !== 0 || this.press) return false;
    const press: Press<T> = {
      data,
      pointerId: event.pointerId,
      pointerType: event.pointerType,
      startX: event.clientX,
      startY: event.clientY,
      x: event.clientX,
      y: event.clientY,
      lifted: false,
    };
    this.press = press;
    if (press.pointerType === 'touch') {
      press.holdTimer = setTimeout(() => this.lift(), TOUCH_HOLD_MS);
    }
    window.addEventListener('pointermove', this.handlePointerMove);
    window.addEventListener('pointerup', this.handlePointerUp);
    window.addEventListener('pointercancel', this.handlePointerCancel);
    window.addEventListener('keydown', this.handleKeyDown, true);
    return true;
  }

  /** Stops following the press; a drag in progress is canceled. */
  abort() {
    const { press } = this;
    if (!press) return;
    this.end();
    if (press.lifted) this.handlers.cancel(press.data);
  }

  private lift() {
    const { press } = this;
    if (!press || press.lifted) return;
    press.lifted = true;
    const point = { x: press.x, y: press.y };
    this.handlers.lift(press.data, point);
    if (this.press !== press) return;
    this.handlers.move(press.data, point);
    const tick = () => {
      if (this.press !== press) return;
      this.autoScroll(press);
      press.frame = requestAnimationFrame(tick);
    };
    press.frame = requestAnimationFrame(tick);
  }

  private autoScroll(press: Press<T>) {
    let scrolled = false;
    (this.handlers.scrollers?.(press.data) ?? []).forEach(scroller => {
      if (!scroller || scroller.scrollHeight <= scroller.clientHeight) return;
      const rect = scroller.getBoundingClientRect();
      const speed = edgeSpeed(press.y, rect.top, rect.bottom);
      if (!speed) return;
      const before = scroller.scrollTop;
      scroller.scrollBy({ top: speed });
      scrolled ||= scroller.scrollTop !== before;
    });
    if (scrolled) this.handlers.move(press.data, { x: press.x, y: press.y });
  }

  /** Stops following the press without telling the view. */
  private end() {
    const { press } = this;
    if (!press) return;
    this.press = null;
    if (press.holdTimer) clearTimeout(press.holdTimer);
    if (press.frame !== undefined) cancelAnimationFrame(press.frame);
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('pointerup', this.handlePointerUp);
    window.removeEventListener('pointercancel', this.handlePointerCancel);
    window.removeEventListener('keydown', this.handleKeyDown, true);
  }

  private readonly handlePointerMove = (event: PointerEvent) => {
    const { press } = this;
    if (!press || event.pointerId !== press.pointerId) return;
    press.x = event.clientX;
    press.y = event.clientY;
    if (!press.lifted) {
      const distance = Math.hypot(
        press.x - press.startX,
        press.y - press.startY,
      );
      if (press.pointerType === 'touch') {
        // Moving before the hold ends is a scroll, not a drag.
        if (distance > TOUCH_SLOP) this.end();
        return;
      }
      if (distance >= DRAG_DISTANCE) this.lift();
      return;
    }
    event.preventDefault();
    this.handlers.move(press.data, { x: press.x, y: press.y });
  };

  private readonly handlePointerUp = (event: PointerEvent) => {
    const { press } = this;
    if (!press || event.pointerId !== press.pointerId) return;
    press.x = event.clientX;
    press.y = event.clientY;
    this.end();
    const point = { x: press.x, y: press.y };
    if (!press.lifted) {
      this.handlers.tap?.(press.data, point);
      return;
    }
    // The click that follows a drag is not a click on what was dragged.
    const swallow = (click: Event) => {
      click.stopPropagation();
      click.preventDefault();
    };
    window.addEventListener('click', swallow, { capture: true, once: true });
    setTimeout(() => window.removeEventListener('click', swallow, true));
    this.handlers.drop(press.data, point);
  };

  private readonly handlePointerCancel = (event: PointerEvent) => {
    if (!this.press || event.pointerId !== this.press.pointerId) return;
    this.abort();
  };

  private readonly handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || !this.press?.lifted) return;
    // Keep an enclosing dialog open.
    event.preventDefault();
    event.stopPropagation();
    this.abort();
  };

  private readonly handleTouchMove = (event: TouchEvent) => {
    // Keep the page from scrolling under a drag.
    if (this.press?.lifted && event.cancelable) event.preventDefault();
  };

  private readonly handleContextMenu = (event: Event) => {
    // A long press on touch screens opens the context menu.
    if (this.press) event.preventDefault();
  };
}
