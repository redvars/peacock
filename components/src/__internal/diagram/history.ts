/**
 * Undo and redo over immutable snapshots. Record the state before each committed change with
 * `push`; `undo` and `redo` take the current state and return the one to restore.
 */
export class History<T> {
  private past: T[] = [];

  private future: T[] = [];

  private readonly limit: number;

  constructor(limit = 100) {
    this.limit = limit;
  }

  get canUndo(): boolean {
    return this.past.length > 0;
  }

  get canRedo(): boolean {
    return this.future.length > 0;
  }

  /** Records `state` as the one before a change. Clears the redo stack. */
  push(state: T) {
    this.past.push(state);
    if (this.past.length > this.limit) this.past.shift();
    this.future = [];
  }

  undo(current: T): T | undefined {
    const previous = this.past.pop();
    if (previous === undefined) return undefined;
    this.future.push(current);
    return previous;
  }

  redo(current: T): T | undefined {
    const next = this.future.pop();
    if (next === undefined) return undefined;
    this.past.push(current);
    return next;
  }

  clear() {
    this.past = [];
    this.future = [];
  }
}
