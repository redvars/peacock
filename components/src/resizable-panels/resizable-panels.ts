import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property, queryAll, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import IndividualComponent from '@/IndividualComponent.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import { isRtl } from '@/__internal/i18n/locale.js';
import { Panel } from './panel.js';
import styles from './resizable-panels.scss';

/** Detail of the `input` and `change` events. */
export interface ResizablePanelsChangeDetail {
  /** Every panel's size in percent, in order; they add up to 100. */
  value: number[];
  /** Whether each panel is collapsed, in order. */
  collapsed: boolean[];
}

/** Which way the panels sit. */
export type ResizablePanelsOrientation = 'horizontal' | 'vertical';

/** What `autosave` keeps in local storage. */
interface SavedLayout {
  sizes: (number | null)[];
  collapsed: boolean[];
}

/** A drag in progress. */
interface Drag {
  index: number;
  pointerId: number;
  start: number;
  sizes: number[];
  total: number;
}

const STORAGE_PREFIX = 'peacock:resizable-panels:';

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** Rounds to two decimals, so sizes read cleanly in events and storage. */
function round(value: number) {
  return Math.round(value * 100) / 100;
}

/**
 * @label Resizable Panels
 * @tag wc-resizable-panels
 * @rawTag resizable-panels
 *
 * @summary A split view whose panes the person resizes by dragging the dividers between them.
 * @overview
 * <p>Resizable panels lays out its <code>wc-panel</code> children in a row
 * (<code>orientation="horizontal"</code>, the default) or a column (<code>"vertical"</code>), with a
 * divider between each pair: a list beside its detail, an editor above its preview. Each panel's
 * <code>size</code> is its share in percent, bounded by <code>min-size</code> and
 * <code>max-size</code>. Dragging a divider resizes the two panels beside it; in right-to-left
 * layouts horizontal drags mirror.</p>
 * <p>A <code>collapsible</code> panel collapses to its <code>collapsed-size</code> when dragged
 * well past its minimum, and a double-click or Enter on the divider collapses or restores it.</p>
 * <p>Each divider is a focusable <code>role="separator"</code> whose value is the size of the
 * panel before it. The arrow keys along the split move it by 1% (10% with Shift), Home and End
 * move it to the panel's minimum and maximum, and Enter collapses or restores.</p>
 * <p><code>input</code> fires while a divider moves and <code>change</code> when the drag ends or a
 * key moves it, with every panel's size. Set <code>autosave</code> to a key to keep the layout in
 * local storage and restore it on the next visit. A panel can hold another split view.</p>
 *
 * @slot - The `wc-panel` elements.
 *
 * @fires {CustomEvent<{value: number[], collapsed: boolean[]}>} input - Dispatched while a divider is dragged.
 * @fires {CustomEvent<{value: number[], collapsed: boolean[]}>} change - Dispatched when a drag ends, a key moves a divider, or a panel collapses or restores.
 *
 * @csspart divider - Each divider.
 *
 * @cssprop --resizable-panels-divider-size - Thickness of the divider line. Defaults to 1px.
 * @cssprop --resizable-panels-divider-color - Color of the divider line. Defaults to `--color-outline-variant`.
 * @cssprop --resizable-panels-divider-active-color - Color of a hovered, dragged or focused divider. Defaults to `--color-primary`.
 *
 * @example
 * ```html
 * <wc-resizable-panels style="height: 400px" autosave="mail">
 *   <wc-panel size="30" min-size="20" collapsible label="Folders">Folders</wc-panel>
 *   <wc-panel min-size="30">Messages</wc-panel>
 * </wc-resizable-panels>
 * ```
 * @example
 * ```html
 * <wc-resizable-panels orientation="vertical" style="height: 400px">
 *   <wc-panel size="60">Editor</wc-panel>
 *   <wc-panel collapsible label="Preview">Preview</wc-panel>
 * </wc-resizable-panels>
 * ```
 * @tags layout
 */
@IndividualComponent
export class ResizablePanels extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  static Panel = Panel;

  /** Each panel gets its own slot, so the dividers can sit between them. */
  // eslint-disable-next-line no-undef
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    slotAssignment: 'manual',
  };

  // ── Properties ───────────────────────────────────────────────────────────

  /** `"horizontal"`: panels side by side; `"vertical"`: panels stacked. */
  @property({ reflect: true }) orientation: ResizablePanelsOrientation =
    'horizontal';

  /** Key to keep the layout under in local storage; empty keeps nothing. */
  @property() autosave = '';

  // ── State ────────────────────────────────────────────────────────────────

  /** The direct `wc-panel` children, in order. */
  @state() private panels: Panel[] = [];

  /** The divider being dragged. */
  @state() private dragIndex = -1;

  // ── Queries ──────────────────────────────────────────────────────────────

  @queryAll('slot') private slotElements!: HTMLSlotElement[];

  @queryAll('.divider') private dividerElements!: HTMLElement[];

  // ── Private fields ───────────────────────────────────────────────────────

  /** Peacock's strings for the dividers' names. */
  private readonly i18n = new I18nController(this);

  /** Watches for panels added or removed. */
  private readonly childObserver = new MutationObserver(() =>
    this.requestUpdate(),
  );

  /** The drag in progress. */
  private drag?: Drag;

  /** Whether the saved layout was applied, so it is applied once. */
  private restored = false;

  // ── Lifecycle ────────────────────────────────────────────────────────────

  override connectedCallback() {
    super.connectedCallback();
    this.childObserver.observe(this, { childList: true });
  }

  override disconnectedCallback() {
    this.childObserver.disconnect();
    super.disconnectedCallback();
  }

  protected override willUpdate() {
    this.syncPanels();
  }

  protected override updated(changed: PropertyValues<this>) {
    super.updated(changed);
    const slots = Array.from(this.slotElements);
    this.panels.forEach((panel, index) => slots[index]?.assign(panel));
    this.syncControls();
  }

  // ── Public methods ───────────────────────────────────────────────────────

  /** Every panel's size in percent, in order, adding up to 100. */
  get sizes(): number[] {
    const raw = this.panels.map(panel => panel.effectiveSize);
    const total = raw.reduce((sum, size) => sum + size, 0);
    if (total <= 0) return raw.map(() => 100 / Math.max(1, raw.length));
    return raw.map(size => (size * 100) / total);
  }

  // ── Private methods ──────────────────────────────────────────────────────

  /**
   * Reads the panels from the children. Panels not yet defined are left out until they are; a
   * panel asks for an update when it connects or changes.
   */
  private syncPanels() {
    const panels = Array.from(this.children).filter(
      (child): child is Panel =>
        child.localName === 'wc-panel' && 'effectiveSize' in child,
    );
    const same =
      panels.length === this.panels.length &&
      panels.every((panel, index) => panel === this.panels[index]);
    if (!same) this.panels = panels;
    if (!this.restored && this.autosave && panels.length > 0) {
      this.restored = this.restore();
    }
    this.fillMissingSizes();
  }

  /** Panels without a `size` share what the others leave. */
  private fillMissingSizes() {
    const missing = this.panels.filter(panel => panel.size === undefined);
    if (missing.length === 0) return;
    const given = this.panels
      .filter(panel => panel.size !== undefined)
      .reduce((sum, panel) => sum + panel.effectiveSize, 0);
    const share = Math.max(0, 100 - given) / missing.length;
    for (const panel of missing) panel.size = round(share);
  }

  /** Points each divider at the panel before it; element references reach across the shadow root. */
  private syncControls() {
    const dividers = Array.from(this.dividerElements);
    dividers.forEach((divider, index) => {
      const target = divider as HTMLElement & {
        ariaControlsElements?: Element[] | null;
      };
      if ('ariaControlsElements' in Element.prototype) {
        target.ariaControlsElements = [this.panels[index]].filter(Boolean);
      }
    });
  }

  private get storageKey() {
    return `${STORAGE_PREFIX}${this.autosave}`;
  }

  /** Applies the saved layout; false while there is none for this many panels. */
  private restore(): boolean {
    let saved: SavedLayout | null = null;
    try {
      const text = localStorage.getItem(this.storageKey);
      saved = text ? (JSON.parse(text) as SavedLayout) : null;
    } catch {
      saved = null;
    }
    if (!saved || !Array.isArray(saved.sizes)) return false;
    if (saved.sizes.length !== this.panels.length) return false;
    this.panels.forEach((panel, index) => {
      const size = saved?.sizes[index];
      if (typeof size === 'number' && Number.isFinite(size)) {
        // eslint-disable-next-line no-param-reassign
        panel.size = size;
      }
      // eslint-disable-next-line no-param-reassign
      panel.collapsed = !!saved?.collapsed?.[index];
    });
    return true;
  }

  private save() {
    if (!this.autosave) return;
    const layout: SavedLayout = {
      sizes: this.panels.map(panel =>
        panel.size === undefined ? null : round(panel.size),
      ),
      collapsed: this.panels.map(panel => panel.isCollapsed),
    };
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(layout));
    } catch {
      // Storage can be full or blocked (private windows); the layout just is not kept.
    }
  }

  private emit(type: 'input' | 'change') {
    if (type === 'change') {
      // The person's layout now wins over one saved earlier.
      this.restored = true;
      this.save();
    }
    this.dispatchEvent(
      new CustomEvent<ResizablePanelsChangeDetail>(type, {
        detail: {
          value: this.sizes.map(round),
          collapsed: this.panels.map(panel => panel.isCollapsed),
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** Writes normalized sizes back to the panels, so a resize starts from sizes adding up to 100. */
  private normalizeSizes(): number[] {
    const { sizes } = this;
    this.panels.forEach((panel, index) => {
      // eslint-disable-next-line no-param-reassign
      if (!panel.isCollapsed) panel.size = sizes[index];
    });
    return sizes;
  }

  private setPanel(panel: Panel, size: number, collapsed: boolean) {
    /* eslint-disable no-param-reassign */
    if (collapsed) {
      // Keep `size` as the size to restore.
      if (panel.size === undefined || panel.size < panel.minSize) {
        panel.size = panel.minSize;
      }
      panel.collapsed = true;
    } else {
      panel.collapsed = false;
      panel.size = size;
    }
    /* eslint-enable no-param-reassign */
  }

  /**
   * Moves divider `index` by `delta` percent from `start` sizes. Only the two panels beside it
   * change. With `allowCollapse`, a panel dragged well past its minimum collapses.
   */
  private moveDivider(
    index: number,
    start: number[],
    delta: number,
    allowCollapse: boolean,
  ) {
    const a = this.panels[index];
    const b = this.panels[index + 1];
    if (!a || !b) return;
    const pair = start[index] + start[index + 1];
    let sizeA = start[index] + delta;
    let collapseA = false;
    let collapseB = false;

    const collapses = (panel: Panel, size: number, other: Panel) =>
      allowCollapse &&
      panel.collapsible &&
      size < panel.minSize &&
      size <= (panel.collapsedSize + panel.minSize) / 2 &&
      pair - panel.collapsedSize <= other.maxSize;

    if (collapses(a, sizeA, b)) {
      collapseA = true;
      sizeA = a.collapsedSize;
    } else if (collapses(b, pair - sizeA, a)) {
      collapseB = true;
      sizeA = pair - b.collapsedSize;
    } else {
      const low = Math.max(a.minSize, pair - b.maxSize);
      const high = Math.min(a.maxSize, pair - b.minSize);
      sizeA = low <= high ? clamp(sizeA, low, high) : start[index];
    }
    this.setPanel(a, sizeA, collapseA);
    this.setPanel(b, pair - sizeA, collapseB);
    this.requestUpdate();
  }

  /** Collapses or restores the collapsible panel beside divider `index` (the one before it first). */
  private toggleCollapse(index: number) {
    const a = this.panels[index];
    const b = this.panels[index + 1];
    if (!a || !b) return;
    const sizes = this.normalizeSizes();
    const pair = sizes[index] + sizes[index + 1];
    let target: Panel | undefined;
    if (a.collapsible) target = a;
    else if (b.collapsible) target = b;
    if (!target) return;
    const other = target === a ? b : a;

    if (target.isCollapsed) {
      const low = Math.max(target.minSize, pair - other.maxSize);
      const high = Math.min(target.maxSize, pair - other.minSize);
      if (low > high) return;
      const size = clamp(target.size ?? target.minSize, low, high);
      this.setPanel(target, size, false);
      this.setPanel(other, pair - size, false);
    } else {
      const otherSize = pair - target.collapsedSize;
      if (otherSize > other.maxSize) return;
      this.setPanel(target, target.size ?? 0, true);
      this.setPanel(other, otherSize, false);
    }
    this.requestUpdate();
    this.emit('change');
  }

  private get horizontal() {
    return this.orientation !== 'vertical';
  }

  /** The pointer's position along the split. */
  private coordinate(event: PointerEvent) {
    return this.horizontal ? event.clientX : event.clientY;
  }

  /** Pixels the panels share, without the dividers. */
  private panelSpace() {
    return this.panels.reduce((sum, panel) => {
      const rect = panel.getBoundingClientRect();
      return sum + (this.horizontal ? rect.width : rect.height);
    }, 0);
  }

  private handlePointerDown(event: PointerEvent, index: number) {
    if (event.button !== 0) return;
    const total = this.panelSpace();
    if (total <= 0) return;
    const divider = event.currentTarget as HTMLElement;
    try {
      divider.setPointerCapture(event.pointerId);
    } catch {
      // A synthetic or already released pointer cannot be captured; the drag still works.
    }
    event.preventDefault();
    divider.focus();
    this.drag = {
      index,
      pointerId: event.pointerId,
      start: this.coordinate(event),
      sizes: this.normalizeSizes(),
      total,
    };
    this.dragIndex = index;
  }

  private handlePointerMove(event: PointerEvent) {
    const { drag } = this;
    if (!drag || event.pointerId !== drag.pointerId) return;
    let pixels = this.coordinate(event) - drag.start;
    if (this.horizontal && isRtl(this)) pixels = -pixels;
    this.moveDivider(drag.index, drag.sizes, (pixels / drag.total) * 100, true);
    this.emit('input');
  }

  private handlePointerUp(event: PointerEvent) {
    const { drag } = this;
    if (!drag || event.pointerId !== drag.pointerId) return;
    const divider = event.currentTarget as HTMLElement;
    if (divider.hasPointerCapture?.(event.pointerId)) {
      divider.releasePointerCapture(event.pointerId);
    }
    const moved = this.coordinate(event) !== drag.start;
    this.drag = undefined;
    this.dragIndex = -1;
    if (moved) this.emit('change');
  }

  private handleKeydown(event: KeyboardEvent, index: number) {
    const a = this.panels[index];
    if (!a) return;
    if (event.key === 'Enter') {
      event.preventDefault();
      this.toggleCollapse(index);
      return;
    }
    const step = event.shiftKey ? 10 : 1;
    const forward = this.horizontal ? 'ArrowRight' : 'ArrowDown';
    const backward = this.horizontal ? 'ArrowLeft' : 'ArrowUp';
    // Right moves a horizontal divider right on screen, which shrinks the start panel in RTL.
    const mirror = this.horizontal && isRtl(this) ? -1 : 1;
    const sizes = this.normalizeSizes();
    let delta: number;
    switch (event.key) {
      case forward:
        delta = step * mirror;
        break;
      case backward:
        delta = -step * mirror;
        break;
      case 'Home':
        delta = a.minSize - sizes[index];
        break;
      case 'End':
        delta = a.maxSize - sizes[index];
        break;
      default:
        return;
    }
    event.preventDefault();
    this.moveDivider(index, sizes, delta, false);
    this.emit('change');
  }

  private handleDoubleClick(index: number) {
    this.toggleCollapse(index);
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  private renderDivider(index: number, sizes: number[]) {
    const panel = this.panels[index];
    const label = panel.label
      ? this.i18n.t('resizePanel')(panel.label)
      : this.i18n.t('resizePanels');
    const min = panel.collapsible
      ? Math.min(panel.collapsedSize, panel.minSize)
      : panel.minSize;
    // The divider splits along the other axis: panels side by side have an upright divider.
    return html`<div
      class=${classMap({ divider: true, dragging: this.dragIndex === index })}
      part="divider"
      role="separator"
      tabindex="0"
      aria-orientation=${this.horizontal ? 'vertical' : 'horizontal'}
      aria-label=${label}
      aria-valuenow=${Math.round(sizes[index])}
      aria-valuemin=${Math.round(min)}
      aria-valuemax=${Math.round(panel.maxSize)}
      @pointerdown=${(event: PointerEvent) =>
        this.handlePointerDown(event, index)}
      @pointermove=${this.handlePointerMove}
      @pointerup=${this.handlePointerUp}
      @pointercancel=${this.handlePointerUp}
      @keydown=${(event: KeyboardEvent) => this.handleKeydown(event, index)}
      @dblclick=${() => this.handleDoubleClick(index)}
    ></div>`;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    const { sizes } = this;
    const last = this.panels.length - 1;
    return html`${this.panels.map(
      (_panel, index) =>
        html`<slot></slot>${index < last
            ? this.renderDivider(index, sizes)
            : nothing}`,
    )}`;
  }
}
