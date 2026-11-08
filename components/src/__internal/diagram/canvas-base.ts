import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import { ViewportController } from './viewport-controller.js';
import { inflateRect, rectsIntersect, boundsOf } from './geometry.js';
import {
  DiagramListeners,
  type DiagramCanvas,
  type DiagramOverview,
} from './host.js';
import type {
  DiagramRect,
  DiagramStartPosition,
  DiagramView,
  DiagramViewportDetail,
} from './types.js';

/** Screen pixels arrow keys pan the empty canvas. */
const PAN_STEP = 60;

const ZOOM_STEP = 1.25;

/**
 * The camera, start position and chrome hooks every diagram canvas shares: `wc-diagram`,
 * `wc-workflow` and the later diagram components. Subclasses render their content inside the
 * element returned by `viewportElement()` and describe it through the abstract hooks.
 */
export abstract class DiagramCanvasElement
  extends LitElement
  implements DiagramCanvas
{
  // ── Properties

  /** The camera's scale. Follows wheel and pinch zooming; set it to zoom around the centre. */
  @property({ type: Number, reflect: true })
  zoom: number = 1;

  /** Screen pixels kept around content when fitting it. */
  @property({ type: Number, reflect: true })
  padding: number = 50;

  /** Where the camera starts: fit all content, the canvas origin at 100%, or the first item at 100%. */
  @property({ type: String, attribute: 'start-position' })
  startPosition: DiagramStartPosition = 'fit';

  /** An exact starting camera, `{ x, y, zoom }`, for example one saved from `viewport-change`. Wins over `start-position`. */
  @property({ type: Object, attribute: 'start-view' })
  startView?: DiagramView;

  /** Smallest zoom. */
  @property({ type: Number, attribute: 'min-zoom' })
  minZoom = 0.1;

  /** Largest zoom. */
  @property({ type: Number, attribute: 'max-zoom' })
  maxZoom = 4;

  /** Spacing of the background dots, in canvas pixels. */
  @property({ type: Number, attribute: 'grid-size' })
  gridSize = 20;

  /** Turns on editing. */
  @property({ type: Boolean, reflect: true })
  editable = false;

  /** Keeps content in place; the person can still pan, zoom and select. */
  @property({ type: Boolean, reflect: true })
  readonly = false;

  /** The canvas's accessible name. */
  @property({ type: String })
  label = '';

  // ── Protected fields

  protected readonly i18n = new I18nController(this);

  protected readonly listeners = new DiagramListeners();

  protected readonly viewport = new ViewportController(this, {
    element: () => this.viewportElement(),
    minZoom: () => this.minZoom,
    maxZoom: () => this.maxZoom,
    onChange: (view, settled) => this.onViewChange(view, settled),
    isBackground: target => this.isBackground(target),
    onBackgroundPointerDown: event => this.onBackgroundPointerDown(event),
    onBackgroundClick: event => this.onBackgroundClick(event),
  });

  /** Whether the camera has been placed at the start position. */
  protected startApplied = false;

  protected homeView?: DiagramView;

  private viewportFrame = 0;

  private pendingViewport?: DiagramViewportDetail;

  private resizeObserver?: ResizeObserver;

  // ── Hooks for subclasses

  /** The element that shows the canvas and takes pan and zoom input. */
  protected abstract viewportElement(): HTMLElement | null | undefined;

  /** The box around all content, in canvas coordinates. */
  protected abstract contentBounds(): DiagramRect | undefined;

  /** Boxes of the selected items, in canvas coordinates. */
  protected abstract selectionRects(): DiagramRect[];

  /** The box of the item with this id, for `zoomTo(id)`. */
  protected abstract itemRect(id: string): DiagramRect | undefined;

  /** The box of the first item, for `start-position="first"`. */
  protected abstract firstItemRect(): DiagramRect | undefined;

  /** Boxes the minimap draws. */
  protected abstract overviewItems(): DiagramOverview['items'];

  /** Whether a press on `target` is on the empty canvas. */
  protected abstract isBackground(target: EventTarget | null): boolean;

  abstract get canUndo(): boolean;

  abstract get canRedo(): boolean;

  abstract undo(): void;

  abstract redo(): void;

  /** Return true to take over a primary press on the background, for example for a marquee. */
  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  protected onBackgroundPointerDown(_event: PointerEvent): boolean {
    return false;
  }

  /** A background press released without moving. */
  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  protected onBackgroundClick(_event: PointerEvent): void {
    // Nothing by default.
  }

  // ── Lifecycle

  connectedCallback() {
    super.connectedCallback();
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.requestUpdate();
        this.maybeApplyStart();
      });
      this.resizeObserver.observe(this);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
    cancelAnimationFrame(this.viewportFrame);
  }

  protected willUpdate(changed: PropertyValues<this>) {
    if (
      changed.has('zoom') &&
      Math.abs(this.zoom - this.viewport.view.zoom) > 1e-6
    ) {
      this.viewport.zoomToValue(this.zoom);
    }
  }

  protected updated(changed: PropertyValues<this>) {
    super.updated(changed);
    this.maybeApplyStart();
    this.listeners.notify();
  }

  // ── Public API

  /** The camera: canvas point `c` is drawn at `c * zoom + (x, y)`. Setting it moves the camera at once. */
  get view(): DiagramView {
    return { ...this.viewport.view };
  }

  set view(value: DiagramView) {
    this.viewport.setView(value);
  }

  /** Fits all content in view, never zooming past 100%. */
  fit() {
    const bounds = this.contentBounds();
    if (!bounds) return;
    this.viewport.animateTo(this.viewport.viewForRect(bounds, this.padding));
  }

  /** Flies back to the start position. */
  home() {
    this.viewport.animateTo(this.homeView ?? this.computeStartView());
  }

  zoomIn() {
    this.animateZoom(this.viewport.view.zoom * ZOOM_STEP);
  }

  zoomOut() {
    this.animateZoom(this.viewport.view.zoom / ZOOM_STEP);
  }

  /** Zooms to a level (`1` is 100%), or centres the item with that id at 100%. */
  zoomTo(target: number | string) {
    if (typeof target === 'number') {
      this.animateZoom(target);
      return;
    }
    const r = this.itemRect(target);
    if (!r) return;
    this.viewport.animateTo(
      this.viewport.viewCentering(
        { x: r.x + r.width / 2, y: r.y + r.height / 2 },
        1,
      ),
    );
  }

  /** Fits the selection in view. */
  zoomToSelection() {
    const bounds = boundsOf(this.selectionRects());
    if (!bounds) return;
    this.viewport.animateTo(this.viewport.viewForRect(bounds, this.padding));
  }

  /** Centres canvas point `x, y`; animated unless `instant`. */
  centerOn(x: number, y: number, instant = false) {
    const view = this.viewport.viewCentering({ x, y });
    if (instant) this.viewport.setView(view);
    else this.viewport.animateTo(view, 300);
  }

  _diagramSubscribe(listener: () => void): () => void {
    return this.listeners.add(listener);
  }

  _diagramOverview(): DiagramOverview {
    return {
      items: this.overviewItems(),
      visible: this.viewport.visibleRect(),
    };
  }

  // ── Protected methods

  protected emit<T>(type: string, detail: T, cancelable = false): boolean {
    return this.dispatchEvent(
      new CustomEvent<T>(type, {
        detail,
        bubbles: true,
        composed: true,
        cancelable,
      }),
    );
  }

  /** The start view for the current `start-position`; subclasses may adjust `fit`. */
  protected computeStartView(): DiagramView {
    if (this.startView) {
      return {
        ...this.startView,
        zoom: this.viewport.clampZoom(this.startView.zoom),
      };
    }
    const { zoom } = this.viewport.view;
    if (this.startPosition === 'origin') return { x: 0, y: 0, zoom };
    const first = this.firstItemRect();
    if (this.startPosition === 'first' && first) {
      return this.viewport.viewCentering(
        { x: first.x + first.width / 2, y: first.y + first.height / 2 },
        1,
      );
    }
    const bounds = this.contentBounds();
    return bounds
      ? this.viewport.viewForRect(bounds, this.padding)
      : { x: 0, y: 0, zoom };
  }

  /** Whether there is anything to place the camera on yet. */
  protected hasContent(): boolean {
    return !!this.contentBounds();
  }

  /** Places the camera once, when the canvas has a size and something to show. */
  protected maybeApplyStart() {
    if (this.startApplied || !this.hasUpdated) return;
    const { width, height } = this.viewport.size();
    if (!width || !height) return;
    if (
      !this.hasContent() &&
      !this.startView &&
      this.startPosition !== 'origin'
    ) {
      return;
    }
    this.startApplied = true;
    this.homeView = this.computeStartView();
    this.viewport.setView(this.homeView);
  }

  /**
   * Canvas-wide shortcuts: zoom (+, -, Ctrl/⌘+0), fit (Shift+1), selection (Shift+2), back to start
   * (Home) and arrow keys on the empty canvas. Returns whether the key was handled.
   */
  protected handleCanvasKey(event: KeyboardEvent): boolean {
    const mod = event.ctrlKey || event.metaKey;
    const key = event.key.toLowerCase();
    const origin = event.composedPath()[0];
    let action: (() => void) | undefined;
    if (mod && key === '0') action = () => this.zoomTo(1);
    else if (!mod && (key === '+' || key === '=')) action = () => this.zoomIn();
    else if (!mod && key === '-') action = () => this.zoomOut();
    else if (event.shiftKey && event.code === 'Digit1')
      action = () => this.fit();
    else if (event.shiftKey && event.code === 'Digit2') {
      action = () => this.zoomToSelection();
    } else if (key === 'home') action = () => this.home();
    else if (origin === this.viewportElement() && key.startsWith('arrow')) {
      const d = {
        arrowleft: [PAN_STEP, 0],
        arrowright: [-PAN_STEP, 0],
        arrowup: [0, PAN_STEP],
        arrowdown: [0, -PAN_STEP],
      }[key];
      if (d) action = () => this.viewport.panBy(d[0], d[1]);
    }
    if (!action) return false;
    event.preventDefault();
    action();
    return true;
  }

  /** Inline style that scrolls and scales the background dots with the camera. */
  protected gridStyle(): string {
    const { x, y, zoom } = this.viewport.view;
    let dot = this.gridSize * zoom;
    while (dot < 12) dot *= 2;
    return `background-size: ${dot}px ${dot}px; background-position: ${x}px ${y}px;`;
  }

  /** Whether `rect` is near the view, for rendering only what can be seen. */
  protected nearView(rect: DiagramRect, margin = 200): boolean {
    const { width, height } = this.viewport.size();
    if (!this.startApplied || !width || !height) return true;
    const visible = inflateRect(
      this.viewport.visibleRect(),
      margin / this.viewport.view.zoom,
    );
    return rectsIntersect(rect, visible);
  }

  /** The "Back to content" button, shown when nothing is in view. */
  protected renderBackToContent() {
    const bounds = this.contentBounds();
    if (!this.startApplied || !bounds) return nothing;
    if (rectsIntersect(bounds, this.viewport.visibleRect())) return nothing;
    return html`<wc-button
      class="back-to-content"
      level="secondary"
      size="sm"
      @click=${() => this.fit()}
      ><wc-icon slot="icon" name="center_focus_strong"></wc-icon>${this.i18n.t(
        'diagramBackToContent',
      )}</wc-button
    >`;
  }

  // ── Private methods

  private onViewChange(view: DiagramView, settled: boolean) {
    if (this.zoom !== view.zoom) this.zoom = view.zoom;
    this.requestUpdate();
    this.pendingViewport = { ...view, settled };
    if (settled) {
      cancelAnimationFrame(this.viewportFrame);
      this.viewportFrame = 0;
      this.flushViewport();
    } else if (!this.viewportFrame) {
      this.viewportFrame = requestAnimationFrame(() => {
        this.viewportFrame = 0;
        this.flushViewport();
      });
    }
  }

  private flushViewport() {
    const detail = this.pendingViewport;
    this.pendingViewport = undefined;
    if (detail) this.emit<DiagramViewportDetail>('viewport-change', detail);
  }

  private animateZoom(zoom: number) {
    const { width, height } = this.viewport.size();
    const { x, y, zoom: current } = this.viewport.view;
    const next = this.viewport.clampZoom(zoom);
    const cx = (width / 2 - x) / current;
    const cy = (height / 2 - y) / current;
    this.viewport.animateTo(
      { zoom: next, x: width / 2 - cx * next, y: height / 2 - cy * next },
      200,
    );
  }
}
