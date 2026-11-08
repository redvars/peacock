import type { DiagramRect, DiagramView } from './types.js';

/** What the minimap draws: content boxes and the part of the canvas in view. */
export interface DiagramOverview {
  items: (DiagramRect & { selected?: boolean })[];
  visible: DiagramRect;
}

/**
 * The contract between a canvas (`wc-diagram` and the later diagram components) and the shared chrome
 * (`wc-diagram-controls`, `wc-diagram-minimap`). Members starting with `_` are internal.
 */
export interface DiagramCanvas extends HTMLElement {
  readonly view: DiagramView;
  minZoom: number;
  maxZoom: number;
  editable: boolean;
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  zoomIn(): void;
  zoomOut(): void;
  zoomTo(target: number | string): void;
  fit(): void;
  home(): void;
  zoomToSelection(): void;
  undo(): void;
  redo(): void;
  /** Moves the camera so canvas point `x, y` is centred; animated unless `instant`. */
  centerOn(x: number, y: number, instant?: boolean): void;
  /** Calls `listener` after every render and view change. Returns an unsubscribe function. */
  _diagramSubscribe(listener: () => void): () => void;
  _diagramOverview(): DiagramOverview;
}

export function isDiagramCanvas(el: unknown): el is DiagramCanvas {
  return (
    !!el &&
    typeof (el as DiagramCanvas)._diagramSubscribe === 'function' &&
    typeof (el as DiagramCanvas)._diagramOverview === 'function'
  );
}

/**
 * Finds the canvas a control belongs to: the element with id `forId` in the same root, else the
 * nearest canvas ancestor (a control slotted into a canvas).
 */
export function findDiagramCanvas(
  el: HTMLElement,
  forId: string,
): DiagramCanvas | null {
  if (forId) {
    const root = el.getRootNode() as Document | ShadowRoot;
    const target = root.getElementById?.(forId) ?? null;
    return isDiagramCanvas(target) ? target : null;
  }
  let node: Node | null = el.parentNode;
  while (node) {
    if (isDiagramCanvas(node)) return node;
    node = node instanceof ShadowRoot ? node.host : node.parentNode;
  }
  return null;
}

/** A small listener set for `_diagramSubscribe`. */
export class DiagramListeners {
  private readonly listeners = new Set<() => void>();

  add(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) listener();
  }
}
