import type { ReactiveController, ReactiveControllerHost } from 'lit';

export interface RovingFocusOptions {
  /** The items, in order. Disabled or hidden ones are skipped automatically. */
  items: () => HTMLElement[];
  /** `horizontal` uses Left/Right (mirrored in right-to-left), `vertical` Up/Down, `both` all four. */
  orientation?: () => 'horizontal' | 'vertical' | 'both';
  /** Whether moving past the last item goes to the first. Default true. */
  wrap?: () => boolean;
  /** Whether typing a character moves to the next item whose text starts with it. Default false. */
  typeahead?: () => boolean;
  /** The text typeahead matches for an item. Default: its `textContent`. */
  itemText?: (item: HTMLElement) => string;
  /** The item that should hold the tab stop when none has it yet (default: the first). */
  initialItem?: (items: HTMLElement[]) => HTMLElement | null | undefined;
  /** Called after focus moved to `item` by keyboard, for components that select on focus (tabs). */
  onMove?: (item: HTMLElement, event: KeyboardEvent) => void;
  /** Whether an item can take focus; default: not `disabled`, not `aria-disabled="true"`, not hidden. */
  isFocusable?: (item: HTMLElement) => boolean;
  /**
   * Whether to manage `tabindex` (one tab stop for the set). Default true. Set it to false when
   * every item stays in the Tab order and the arrow keys are only a shortcut, as for accordion
   * headers in the WAI-ARIA pattern.
   */
  manageTabIndex?: () => boolean;
}

const TYPEAHEAD_RESET_MS = 500;

function defaultFocusable(item: HTMLElement) {
  return (
    !item.hidden &&
    !item.hasAttribute('disabled') &&
    item.getAttribute('aria-disabled') !== 'true'
  );
}

/**
 * Roving tabindex for a set of items (toolbar actions, tabs, list items, accordion headers):
 * one item is the tab stop (`tabindex="0"`), the others `-1`; arrow keys, Home and End move focus
 * between them, mirroring Left/Right in right-to-left layouts.
 *
 * The host attaches `handleKeyDown` and `handleFocusIn` to the element that contains the items
 * (or its host), and calls `sync()` when the items change (on `slotchange` and after updates).
 *
 * @example
 * private readonly roving = new RovingFocusController(this, {
 *   items: () => this.slottedTabs(),
 *   orientation: () => 'horizontal',
 * });
 * // render: <div role="tablist" @keydown=${this.roving.handleKeyDown}
 * //          @focusin=${this.roving.handleFocusIn}><slot @slotchange=${() => this.roving.sync()}>
 */
export class RovingFocusController implements ReactiveController {
  private readonly host: ReactiveControllerHost & HTMLElement;

  private readonly options: RovingFocusOptions;

  private active: HTMLElement | null = null;

  private typed = '';

  private typedAt = 0;

  constructor(
    host: ReactiveControllerHost & HTMLElement,
    options: RovingFocusOptions,
  ) {
    this.host = host;
    this.options = options;
    host.addController(this);
  }

  hostUpdated() {
    this.sync();
  }

  /** The item that holds the tab stop. */
  get activeItem(): HTMLElement | null {
    return this.active;
  }

  /** Re-applies the tab stops; call after the items change. */
  sync() {
    const items = this.focusableItems();
    if (!this.active || !items.includes(this.active)) {
      this.active = this.options.initialItem?.(items) ?? items[0] ?? null;
    }
    if (!(this.options.manageTabIndex?.() ?? true)) return;
    for (const item of this.options.items()) {
      const stop = item === this.active;
      if (item.tabIndex !== (stop ? 0 : -1)) item.tabIndex = stop ? 0 : -1;
    }
  }

  /** Makes `item` the tab stop, and focuses it unless `focus` is false. */
  setActive(item: HTMLElement, focus = true) {
    this.active = item;
    this.sync();
    if (focus) item.focus();
  }

  /** Keeps the tab stop on the item that got focus by click or Tab. */
  handleFocusIn = (event: FocusEvent) => {
    const item = this.itemFromEvent(event);
    if (item && item !== this.active) {
      this.active = item;
      this.sync();
    }
  };

  handleKeyDown = (event: KeyboardEvent) => {
    if (
      event.defaultPrevented ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey
    ) {
      return;
    }
    const items = this.focusableItems();
    const current = this.itemFromEvent(event);
    if (items.length === 0 || !current) return;

    const target = this.targetFor(event, items, current);
    if (!target) return;
    event.preventDefault();
    this.setActive(target);
    this.options.onMove?.(target, event);
  };

  // ── Private ──────────────────────────────────────────────────────────────

  private focusableItems() {
    const focusable = this.options.isFocusable ?? defaultFocusable;
    return this.options.items().filter(item => focusable(item));
  }

  private itemFromEvent(event: Event): HTMLElement | null {
    const items = this.options.items();
    return (
      (event
        .composedPath()
        .find(node => items.includes(node as HTMLElement)) as
        | HTMLElement
        | undefined) ?? null
    );
  }

  private targetFor(
    event: KeyboardEvent,
    items: HTMLElement[],
    current: HTMLElement,
  ): HTMLElement | undefined {
    const orientation = this.options.orientation?.() ?? 'horizontal';
    const rtl = getComputedStyle(this.host).direction === 'rtl';
    const wrap = this.options.wrap?.() ?? true;
    const index = Math.max(0, items.indexOf(current));

    const next: string[] = [];
    const previous: string[] = [];
    if (orientation !== 'vertical') {
      next.push(rtl ? 'ArrowLeft' : 'ArrowRight');
      previous.push(rtl ? 'ArrowRight' : 'ArrowLeft');
    }
    if (orientation !== 'horizontal') {
      next.push('ArrowDown');
      previous.push('ArrowUp');
    }

    const step = (delta: number) => {
      const to = index + delta;
      if (wrap) return items[(to + items.length) % items.length];
      return items[Math.min(items.length - 1, Math.max(0, to))];
    };

    if (next.includes(event.key)) return step(1);
    if (previous.includes(event.key)) return step(-1);
    if (event.key === 'Home') return items[0];
    if (event.key === 'End') return items[items.length - 1];

    if (
      this.options.typeahead?.() &&
      event.key.length === 1 &&
      event.key !== ' '
    ) {
      return this.typeaheadTarget(event.key, items, index);
    }
    return undefined;
  }

  /** The next item whose text starts with the typed characters (a 500 ms buffer, like native). */
  private typeaheadTarget(key: string, items: HTMLElement[], index: number) {
    const now = Date.now();
    this.typed =
      now - this.typedAt > TYPEAHEAD_RESET_MS ? key : this.typed + key;
    this.typedAt = now;
    // The same letter typed again ("bb") cycles through the items starting with it, like a
    // native select; other buffers match as a prefix.
    const typed = this.typed.toLowerCase();
    const repeated = [...typed].every(char => char === typed[0]);
    const query = repeated ? typed[0] : typed;
    const start = query.length === 1 ? index + 1 : index;
    for (let offset = 0; offset < items.length; offset += 1) {
      const item = items[(start + offset) % items.length];
      const text = this.options.itemText?.(item) ?? item.textContent ?? '';
      if (text.trim().toLowerCase().startsWith(query)) {
        return item;
      }
    }
    return undefined;
  }
}
