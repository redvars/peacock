export type SelectionKind = 'node' | 'edge';

/** A set of selected nodes and edges, kept apart by kind so ids may repeat across kinds. */
export class DiagramSelection {
  private keys = new Set<string>();

  private readonly onChange: () => void;

  constructor(onChange: () => void = () => undefined) {
    this.onChange = onChange;
  }

  private static key(kind: SelectionKind, id: string) {
    return `${kind}:${id}`;
  }

  get size(): number {
    return this.keys.size;
  }

  has(kind: SelectionKind, id: string): boolean {
    return this.keys.has(DiagramSelection.key(kind, id));
  }

  ids(kind: SelectionKind): string[] {
    const prefix = `${kind}:`;
    return [...this.keys]
      .filter(k => k.startsWith(prefix))
      .map(k => k.slice(prefix.length));
  }

  /** Replaces the selection. */
  set(items: { kind: SelectionKind; id: string }[]) {
    const next = new Set(items.map(i => DiagramSelection.key(i.kind, i.id)));
    if (
      next.size === this.keys.size &&
      [...next].every(k => this.keys.has(k))
    ) {
      return;
    }
    this.keys = next;
    this.onChange();
  }

  toggle(kind: SelectionKind, id: string) {
    const key = DiagramSelection.key(kind, id);
    if (this.keys.has(key)) this.keys.delete(key);
    else this.keys.add(key);
    this.onChange();
  }

  /** Drops ids that no longer exist. */
  retain(kind: SelectionKind, existing: Set<string>) {
    let changed = false;
    for (const id of this.ids(kind)) {
      if (!existing.has(id)) {
        this.keys.delete(DiagramSelection.key(kind, id));
        changed = true;
      }
    }
    if (changed) this.onChange();
  }

  clear() {
    if (this.keys.size === 0) return;
    this.keys.clear();
    this.onChange();
  }
}
