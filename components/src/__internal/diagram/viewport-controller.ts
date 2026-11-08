import type { ReactiveController, ReactiveControllerHost } from 'lit';
import type { DiagramPoint, DiagramRect, DiagramView } from './types.js';
import { prefersReducedMotion, tween } from './motion.js';

export interface ViewportOptions {
  /** The element that shows the canvas and receives pan and zoom input. */
  element: () => HTMLElement | null | undefined;
  minZoom: () => number;
  maxZoom: () => number;
  /** Called on every view change; `settled` is true once a gesture or animation has finished. */
  onChange: (view: DiagramView, settled: boolean) => void;
  /** Whether a press on `target` is on the empty canvas (pans) rather than on content. */
  isBackground: (target: EventTarget | null) => boolean;
  /**
   * Called for a primary-button press on the background before panning starts. Return true to
   * handle the press yourself, for example to draw a marquee.
   */
  onBackgroundPointerDown?: (event: PointerEvent) => boolean;
  /** Called when a background press is released without moving. */
  onBackgroundClick?: (event: PointerEvent) => void;
}

/** Pointer travel, in screen pixels, before a press becomes a pan. */
const PAN_THRESHOLD = 3;

/** Milliseconds without wheel input before a wheel gesture counts as settled. */
const WHEEL_SETTLE_MS = 150;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/**
 * The camera of an infinite canvas: pans with a background drag, Space + drag, the middle button,
 * a trackpad or the wheel, and zooms around the pointer with Ctrl/⌘ + wheel or a pinch. There are
 * no bounds, so content can sit anywhere, including at negative coordinates.
 *
 * A canvas point `c` is drawn at `c * zoom + (x, y)` relative to the element's top-left corner.
 */
export class ViewportController implements ReactiveController {
  view: DiagramView = { x: 0, y: 0, zoom: 1 };

  /** Whether Space is held, so any drag pans. */
  spaceHeld = false;

  /** Whether a pan gesture is moving the view. */
  panning = false;

  private readonly host: ReactiveControllerHost;

  private readonly options: ViewportOptions;

  private attachedTo?: HTMLElement;

  private pan?: {
    pointerId: number;
    startX: number;
    startY: number;
    origin: DiagramView;
    moved: boolean;
    background: boolean;
    element: HTMLElement;
  };

  private touches = new Map<number, DiagramPoint>();

  private pinch?: { distance: number; zoom: number; anchor: DiagramPoint };

  private wheelTimer?: ReturnType<typeof setTimeout>;

  private stopAnimation?: () => void;

  constructor(host: ReactiveControllerHost, options: ViewportOptions) {
    this.host = host;
    this.options = options;
    host.addController(this);
  }

  hostUpdated() {
    const element = this.options.element();
    if (element && element !== this.attachedTo) {
      this.detach();
      this.attach(element);
    }
  }

  hostDisconnected() {
    this.detach();
    this.cancelAnimation();
    clearTimeout(this.wheelTimer);
  }

  // ── Geometry

  /** The element's size in screen pixels. */
  size(): { width: number; height: number } {
    const el = this.options.element();
    return { width: el?.clientWidth ?? 0, height: el?.clientHeight ?? 0 };
  }

  /** The part of the canvas in view, in canvas coordinates. */
  visibleRect(): DiagramRect {
    const { width, height } = this.size();
    const { x, y, zoom } = this.view;
    return {
      x: -x / zoom,
      y: -y / zoom,
      width: width / zoom,
      height: height / zoom,
    };
  }

  /** Converts client (page viewport) coordinates to canvas coordinates. */
  toCanvas(clientX: number, clientY: number): DiagramPoint {
    const rect = this.options.element()?.getBoundingClientRect();
    const left = rect?.left ?? 0;
    const top = rect?.top ?? 0;
    return {
      x: (clientX - left - this.view.x) / this.view.zoom,
      y: (clientY - top - this.view.y) / this.view.zoom,
    };
  }

  clampZoom(zoom: number): number {
    return clamp(zoom, this.options.minZoom(), this.options.maxZoom());
  }

  /** The view that fits `rect` with `padding` screen pixels around it, never above `maxZoom`. */
  viewForRect(rect: DiagramRect, padding: number, maxZoom = 1): DiagramView {
    const { width, height } = this.size();
    const fitW = (width - 2 * padding) / Math.max(rect.width, 1);
    const fitH = (height - 2 * padding) / Math.max(rect.height, 1);
    const zoom = this.clampZoom(
      Math.min(fitW, fitH, maxZoom, this.options.maxZoom()),
    );
    return {
      zoom,
      x: width / 2 - (rect.x + rect.width / 2) * zoom,
      y: height / 2 - (rect.y + rect.height / 2) * zoom,
    };
  }

  /** The view that centres canvas `point` at `zoom`. */
  viewCentering(point: DiagramPoint, zoom = this.view.zoom): DiagramView {
    const { width, height } = this.size();
    const z = this.clampZoom(zoom);
    return { zoom: z, x: width / 2 - point.x * z, y: height / 2 - point.y * z };
  }

  // ── Moving the camera

  /** Moves the camera at once. */
  setView(view: DiagramView, settled = true) {
    this.cancelAnimation();
    this.apply(view, settled);
  }

  panBy(dx: number, dy: number, settled = true) {
    this.setView(
      { ...this.view, x: this.view.x + dx, y: this.view.y + dy },
      settled,
    );
  }

  /** Zooms by `factor` around a client point, or around the centre. */
  zoomBy(factor: number, clientX?: number, clientY?: number, settled = true) {
    this.zoomToValue(this.view.zoom * factor, clientX, clientY, settled);
  }

  zoomToValue(
    zoom: number,
    clientX?: number,
    clientY?: number,
    settled = true,
  ) {
    const el = this.options.element();
    const rect = el?.getBoundingClientRect();
    const { width, height } = this.size();
    const px = clientX !== undefined && rect ? clientX - rect.left : width / 2;
    const py = clientY !== undefined && rect ? clientY - rect.top : height / 2;
    const next = this.clampZoom(zoom);
    const cx = (px - this.view.x) / this.view.zoom;
    const cy = (py - this.view.y) / this.view.zoom;
    this.setView({ zoom: next, x: px - cx * next, y: py - cy * next }, settled);
  }

  /**
   * Flies the camera to `target`. Long trips zoom out on the way, like a map. Jumps at once under
   * reduced motion.
   */
  animateTo(target: DiagramView, duration = 500) {
    this.cancelAnimation();
    const goal = { ...target, zoom: this.clampZoom(target.zoom) };
    const { width, height } = this.size();
    if (prefersReducedMotion() || width === 0 || height === 0) {
      this.apply(goal, true);
      return;
    }
    const from = { ...this.view };
    const c0 = {
      x: (width / 2 - from.x) / from.zoom,
      y: (height / 2 - from.y) / from.zoom,
    };
    const c1 = {
      x: (width / 2 - goal.x) / goal.zoom,
      y: (height / 2 - goal.y) / goal.zoom,
    };
    const travel =
      Math.hypot(c1.x - c0.x, c1.y - c0.y) * Math.min(from.zoom, goal.zoom);
    const far = travel > Math.max(width, height);
    const lz0 = Math.log(from.zoom);
    const lz1 = Math.log(goal.zoom);
    this.stopAnimation = tween({
      duration,
      onUpdate: p => {
        const dip = far ? 1 - 0.4 * Math.sin(Math.PI * p) : 1;
        const zoom = Math.exp(lz0 + (lz1 - lz0) * p) * dip;
        const cx = c0.x + (c1.x - c0.x) * p;
        const cy = c0.y + (c1.y - c0.y) * p;
        const view =
          p >= 1
            ? goal
            : { zoom, x: width / 2 - cx * zoom, y: height / 2 - cy * zoom };
        this.apply(view, false);
      },
      onDone: () => {
        this.stopAnimation = undefined;
        this.apply(goal, true);
      },
    });
  }

  cancelAnimation() {
    this.stopAnimation?.();
    this.stopAnimation = undefined;
  }

  private apply(view: DiagramView, settled: boolean) {
    this.view = { x: view.x, y: view.y, zoom: view.zoom };
    this.options.onChange(this.view, settled);
  }

  /** Starts a pan from a pointer press anywhere, for Space + drag over content. */
  beginPan(event: PointerEvent, background = false) {
    const element = this.options.element();
    if (!element) return;
    this.cancelAnimation();
    event.preventDefault();
    this.pan = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      origin: { ...this.view },
      moved: false,
      background,
      element,
    };
    try {
      element.setPointerCapture(event.pointerId);
    } catch {
      // Synthetic pointers cannot be captured.
    }
  }

  // ── Input

  private attach(element: HTMLElement) {
    this.attachedTo = element;
    element.addEventListener('wheel', this.onWheel, { passive: false });
    element.addEventListener('pointerdown', this.onPointerDown);
    element.addEventListener('pointermove', this.onPointerMove);
    element.addEventListener('pointerup', this.onPointerUp);
    element.addEventListener('pointercancel', this.onPointerUp);
    element.addEventListener('keydown', this.onKeyDown);
    element.addEventListener('keyup', this.onKeyUp);
    element.addEventListener('blur', this.onBlur);
  }

  private detach() {
    const element = this.attachedTo;
    if (!element) return;
    element.removeEventListener('wheel', this.onWheel);
    element.removeEventListener('pointerdown', this.onPointerDown);
    element.removeEventListener('pointermove', this.onPointerMove);
    element.removeEventListener('pointerup', this.onPointerUp);
    element.removeEventListener('pointercancel', this.onPointerUp);
    element.removeEventListener('keydown', this.onKeyDown);
    element.removeEventListener('keyup', this.onKeyUp);
    element.removeEventListener('blur', this.onBlur);
    this.attachedTo = undefined;
  }

  /**
   * Whether a wheel event belongs to something inside the canvas: an overlay marked
   * `data-diagram-overlay` (a palette, a popover), or an element that can scroll that way.
   */
  private wheelBelongsInside(
    event: WheelEvent,
  ): 'overlay' | 'scroll' | undefined {
    for (const node of event.composedPath()) {
      if (node === this.attachedTo) break;
      if (node instanceof HTMLElement) {
        if (node.hasAttribute('data-diagram-overlay')) return 'overlay';
        const style = getComputedStyle(node);
        const scrollsY =
          event.deltaY !== 0 &&
          /(auto|scroll)/.test(style.overflowY) &&
          node.scrollHeight > node.clientHeight;
        const scrollsX =
          event.deltaX !== 0 &&
          /(auto|scroll)/.test(style.overflowX) &&
          node.scrollWidth > node.clientWidth;
        if (scrollsY || scrollsX) return 'scroll';
      }
    }
    return undefined;
  }

  private onWheel = (event: WheelEvent) => {
    const zooming = event.ctrlKey || event.metaKey;
    const inside = this.wheelBelongsInside(event);
    if (inside === 'overlay' || (inside === 'scroll' && !zooming)) {
      // Let the overlay or scroller have it; only stop the browser zooming the page.
      if (zooming) event.preventDefault();
      return;
    }
    event.preventDefault();
    this.cancelAnimation();
    let dx = event.deltaX;
    let dy = event.deltaY;
    if (event.deltaMode === 1) {
      dx *= 16;
      dy *= 16;
    } else if (event.deltaMode === 2) {
      dx *= this.size().width;
      dy *= this.size().height;
    }
    if (event.ctrlKey || event.metaKey) {
      this.zoomBy(
        Math.exp(-clamp(dy, -60, 60) * 0.0125),
        event.clientX,
        event.clientY,
        false,
      );
    } else {
      if (event.shiftKey && dx === 0) {
        dx = dy;
        dy = 0;
      }
      this.panBy(-dx, -dy, false);
    }
    clearTimeout(this.wheelTimer);
    this.wheelTimer = setTimeout(
      () => this.options.onChange(this.view, true),
      WHEEL_SETTLE_MS,
    );
  };

  private onPointerDown = (event: PointerEvent) => {
    if (event.pointerType === 'touch') {
      this.touches.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (this.touches.size === 2) {
        this.startPinch();
        return;
      }
    }
    const primary = event.button === 0;
    const middle = event.button === 1;
    if (!primary && !middle) return;
    const background = this.options.isBackground(
      event.composedPath()[0] ?? event.target,
    );
    if (!middle && !this.spaceHeld && !background) return;
    if (
      primary &&
      background &&
      !this.spaceHeld &&
      this.options.onBackgroundPointerDown?.(event)
    ) {
      return;
    }
    if (background) {
      this.options.element()?.focus({ preventScroll: true });
    }
    this.beginPan(event, background && primary);
  };

  private onPointerMove = (event: PointerEvent) => {
    if (this.touches.has(event.pointerId)) {
      this.touches.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (this.pinch) {
        this.movePinch();
        return;
      }
    }
    const { pan } = this;
    if (!pan || event.pointerId !== pan.pointerId) return;
    const dx = event.clientX - pan.startX;
    const dy = event.clientY - pan.startY;
    if (!pan.moved && Math.hypot(dx, dy) < PAN_THRESHOLD) return;
    if (!pan.moved) {
      pan.moved = true;
      this.panning = true;
      this.host.requestUpdate();
    }
    this.apply(
      { ...pan.origin, x: pan.origin.x + dx, y: pan.origin.y + dy },
      false,
    );
  };

  private onPointerUp = (event: PointerEvent) => {
    this.touches.delete(event.pointerId);
    if (this.pinch && this.touches.size < 2) {
      this.pinch = undefined;
      this.options.onChange(this.view, true);
    }
    const { pan } = this;
    if (!pan || event.pointerId !== pan.pointerId) return;
    this.pan = undefined;
    try {
      if (pan.element.hasPointerCapture(event.pointerId)) {
        pan.element.releasePointerCapture(event.pointerId);
      }
    } catch {
      // The pointer is already gone.
    }
    if (pan.moved) {
      this.panning = false;
      this.host.requestUpdate();
      this.options.onChange(this.view, true);
    } else if (pan.background && event.type === 'pointerup') {
      this.options.onBackgroundClick?.(event);
    }
  };

  private startPinch() {
    const [a, b] = [...this.touches.values()];
    if (this.pan) {
      this.pan = undefined;
      this.panning = false;
    }
    const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    this.pinch = {
      distance: Math.max(Math.hypot(a.x - b.x, a.y - b.y), 1),
      zoom: this.view.zoom,
      anchor: this.toCanvas(mid.x, mid.y),
    };
  }

  private movePinch() {
    const { pinch } = this;
    if (!pinch) return;
    const [a, b] = [...this.touches.values()];
    const rect = this.options.element()?.getBoundingClientRect();
    const mid = {
      x: (a.x + b.x) / 2 - (rect?.left ?? 0),
      y: (a.y + b.y) / 2 - (rect?.top ?? 0),
    };
    const zoom = this.clampZoom(
      pinch.zoom * (Math.hypot(a.x - b.x, a.y - b.y) / pinch.distance),
    );
    this.apply(
      {
        zoom,
        x: mid.x - pinch.anchor.x * zoom,
        y: mid.y - pinch.anchor.y * zoom,
      },
      false,
    );
  }

  private onKeyDown = (event: KeyboardEvent) => {
    if (event.key === ' ' && event.target === this.attachedTo) {
      event.preventDefault();
      if (!this.spaceHeld) {
        this.spaceHeld = true;
        this.host.requestUpdate();
      }
    }
  };

  private onKeyUp = (event: KeyboardEvent) => {
    if (event.key === ' ' && this.spaceHeld) {
      this.spaceHeld = false;
      this.host.requestUpdate();
    }
  };

  private onBlur = () => {
    if (this.spaceHeld) {
      this.spaceHeld = false;
      this.host.requestUpdate();
    }
  };
}
