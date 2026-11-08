import type { ReactiveController, ReactiveControllerHost } from 'lit';
import type { DiagramSize } from './types.js';

export interface MeasureOptions {
  /** The rendered elements to measure, each with its key. */
  elements: () => Iterable<[string, HTMLElement]>;
  /** Size assumed for a key that has not been measured yet. */
  fallback: DiagramSize;
}

/**
 * Measures rendered nodes with a ResizeObserver and re-renders the host when a size changes.
 * Sizes are layout sizes (`offsetWidth` / `offsetHeight`), so they ignore the canvas zoom, and
 * they are kept when a node is culled out of view so content bounds stay right.
 */
export class MeasureController implements ReactiveController {
  private readonly host: ReactiveControllerHost;

  private readonly options: MeasureOptions;

  private readonly sizes = new Map<string, DiagramSize>();

  private readonly observed = new Map<string, HTMLElement>();

  private readonly keys = new WeakMap<Element, string>();

  private observer?: ResizeObserver;

  constructor(host: ReactiveControllerHost, options: MeasureOptions) {
    this.host = host;
    this.options = options;
    host.addController(this);
  }

  /** The measured size of `key`, or the fallback. */
  size(key: string): DiagramSize {
    return this.sizes.get(key) ?? this.options.fallback;
  }

  /** Whether `key` has been measured. */
  has(key: string): boolean {
    return this.sizes.has(key);
  }

  hostConnected() {
    if (typeof ResizeObserver === 'undefined') return;
    this.observer = new ResizeObserver(entries => {
      let changed = false;
      for (const entry of entries) {
        const key = this.keys.get(entry.target);
        if (key !== undefined && this.read(key, entry.target as HTMLElement))
          changed = true;
      }
      if (changed) this.host.requestUpdate();
    });
    for (const el of this.observed.values()) this.observer.observe(el);
  }

  hostDisconnected() {
    this.observer?.disconnect();
    this.observer = undefined;
  }

  hostUpdated() {
    let changed = false;
    const seen = new Set<string>();
    for (const [key, el] of this.options.elements()) {
      seen.add(key);
      if (this.observed.get(key) !== el) {
        const old = this.observed.get(key);
        if (old) this.observer?.unobserve(old);
        this.observed.set(key, el);
        this.keys.set(el, key);
        this.observer?.observe(el);
      }
      if (this.read(key, el)) changed = true;
    }
    for (const [key, el] of this.observed) {
      if (!seen.has(key)) {
        this.observer?.unobserve(el);
        this.observed.delete(key);
      }
    }
    if (changed) this.host.requestUpdate();
  }

  /** Forgets keys that no longer exist. */
  retain(existing: Set<string>) {
    for (const key of this.sizes.keys()) {
      if (!existing.has(key)) this.sizes.delete(key);
    }
  }

  private read(key: string, el: HTMLElement): boolean {
    const width = el.offsetWidth;
    const height = el.offsetHeight;
    if (width === 0 && height === 0) return false;
    const current = this.sizes.get(key);
    if (current && current.width === width && current.height === height)
      return false;
    this.sizes.set(key, { width, height });
    return true;
  }
}
