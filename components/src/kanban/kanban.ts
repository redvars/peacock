import { html, LitElement, nothing, render, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import IndividualComponent from '@/IndividualComponent.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import { isRtl } from '@/__internal/i18n/locale.js';
import styles from './kanban.scss';

/** A column of the board. */
export interface KanbanColumn {
  id: string;
  /** Shown in the column header and read in announcements. */
  title: string;
  /** Work-in-progress limit: the header shows the count against it and flags a column over it. */
  limit?: number;
}

/** A card of the board. Add any fields of your own; `renderCard` receives the whole object. */
export interface KanbanCard {
  id: string;
  /** The `id` of the column the card is in. */
  columnId: string;
  /** Shown by the default card and read in announcements. */
  title: string;
  [key: string]: unknown;
}

/**
 * Renders the content of one card. Return anything Lit can render: a `TemplateResult`, a DOM node
 * or a string. Declared as a method type so a function typed for your own card type fits.
 */
export type KanbanRenderCard = {
  bivarianceHack(card: KanbanCard): unknown;
}['bivarianceHack'];

/** Detail of the `card-move` event. Indices are 0-based positions within a column. */
export interface KanbanCardMoveDetail {
  cardId: string;
  fromColumn: string;
  toColumn: string;
  fromIndex: number;
  /** The card's index in `toColumn` after the move. */
  toIndex: number;
}

/** Detail of the `card-add` event. */
export interface KanbanCardAddDetail {
  columnId: string;
}

/** The pending move of a lifted card. */
interface DragState extends KanbanCardMoveDetail {
  mode: 'keyboard' | 'pointer';
}

/** One entry of a rendered column: a card's slot, or the drop placeholder of a pointer drag. */
type LayoutEntry = { kind: 'card'; card: KanbanCard } | { kind: 'placeholder' };

/** The press on a card that may become a pointer drag. */
interface PointerPress {
  pointerId: number;
  pointerType: string;
  card: HTMLElement;
  cardId: string;
  startX: number;
  startY: number;
  x: number;
  y: number;
  lifted: boolean;
  offsetX: number;
  offsetY: number;
  holdTimer?: ReturnType<typeof setTimeout>;
  frame?: number;
}

/** Elements inside a card that handle their own pointer and keys. */
const INTERACTIVE =
  'a[href], button, input, select, textarea, [contenteditable]:not([contenteditable="false"]), wc-button, wc-icon-button, wc-link, wc-checkbox, wc-switch, wc-select, wc-input';

/** Pixels a mouse or pen moves before a press becomes a drag. */
const DRAG_DISTANCE = 5;
/** Milliseconds a finger holds still on a card before it lifts; moving sooner scrolls. */
const TOUCH_HOLD_MS = 250;
/** Pixels a finger may move during the hold. */
const TOUCH_SLOP = 8;
/** Distance from a scroll container's edge, in pixels, at which a drag scrolls it. */
const SCROLL_EDGE = 48;

let instructionsCount = 0;

/**
 * Moves a card in a `cards` array the way the board does, returning a new array. Use it to apply
 * a `card-move` you canceled, for example once the server has accepted it.
 */
export function applyKanbanMove(
  cards: readonly KanbanCard[],
  move: Pick<KanbanCardMoveDetail, 'cardId' | 'toColumn' | 'toIndex'>,
): KanbanCard[] {
  const card = cards.find(item => item.id === move.cardId);
  if (!card) return [...cards];
  const rest = cards.filter(item => item !== card);
  const moved: KanbanCard = { ...card, columnId: move.toColumn };
  const target = rest.filter(item => item.columnId === move.toColumn);
  const index = Math.min(Math.max(0, move.toIndex), target.length);
  let at: number;
  if (index < target.length) at = rest.indexOf(target[index]);
  else if (target.length) at = rest.indexOf(target[target.length - 1]) + 1;
  else at = rest.length;
  rest.splice(at, 0, moved);
  return rest;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * @label Kanban
 * @tag wc-kanban
 * @rawTag kanban
 *
 * @summary A board of columns whose cards the person moves by drag and drop or with the keyboard.
 * @overview
 * <p>The board is data-driven: <code>columns</code> (<code>{id, title, limit?}</code>) and
 * <code>cards</code> (<code>{id, columnId, title, ...}</code>), where the order of
 * <code>cards</code> is the order within each column. <code>renderCard</code> renders a card's
 * content; without it a card shows its <code>title</code>. Cards are rendered into the light DOM,
 * so page styles reach the content, and each sits in a wrapper with <code>role="listitem"</code>
 * inside its column's <code>role="list"</code>, named by the column title.</p>
 * <p>Moving a card fires the cancelable <code>card-move</code> event with
 * <code>{cardId, fromColumn, toColumn, fromIndex, toIndex}</code>. Unless it is canceled, the
 * board applies the move itself and replaces <code>cards</code> with a new array. To confirm a
 * move with a server first, cancel the event and apply it later with
 * <code>applyKanbanMove()</code>.</p>
 * <p>With a pointer, drag a card (on touch, hold it briefly first, so a swipe still scrolls). A
 * placeholder shows where it will land, and the board and columns scroll when the card nears
 * their edges. Escape cancels.</p>
 * <p>Cards are one tab stop. The arrow keys move focus between cards (Left and Right between
 * columns, mirrored in right-to-left), Home and End to the first and last card of the column.
 * Space or Enter picks the focused card up; the arrow keys then move it, Space or Enter drops it
 * and Escape or Tab cancels. Each step is announced in a live region.</p>
 * <p>A column with a <code>limit</code> shows its count against it and is flagged when it holds
 * more cards. <code>addable</code> adds an "Add card" button to every column, which fires
 * <code>card-add</code>.</p>
 *
 * @fires {CustomEvent<KanbanCardMoveDetail>} card-move - Dispatched when the person drops a card in a new place. Cancelable: cancel it to keep the cards as they are.
 * @fires {CustomEvent<{columnId: string}>} card-add - Dispatched when the person presses a column's "Add card" button.
 *
 * @cssprop --kanban-column-inline-size - The width of a column. Defaults to `18rem`.
 * @cssprop --kanban-column-container-color - The background of a column.
 * @cssprop --kanban-card-container-color - The background of a card.
 * @cssprop --kanban-card-padding - The padding of a card. Defaults to `var(--spacing-150)`.
 *
 * @example
 * ```html
 * <wc-kanban id="board" label="Sprint" style="height: 28rem" addable></wc-kanban>
 * <script>
 *   const board = document.getElementById('board');
 *   board.columns = [
 *     { id: 'todo', title: 'To do' },
 *     { id: 'doing', title: 'In progress', limit: 2 },
 *     { id: 'done', title: 'Done' },
 *   ];
 *   board.cards = [
 *     { id: '1', columnId: 'todo', title: 'Fix login' },
 *     { id: '2', columnId: 'doing', title: 'Write docs' },
 *   ];
 *   board.addEventListener('card-move', event => console.log(event.detail));
 * </script>
 * ```
 * @tags display
 */
@IndividualComponent
export class Kanban extends LitElement {
  // ── Static

  static styles = [styles];

  // ── Properties

  /** The columns, in order. */
  @property({ attribute: false }) columns: KanbanColumn[] = [];

  /** The cards. Their order is the order within each column; cards of unknown columns are not shown. */
  @property({ attribute: false }) cards: KanbanCard[] = [];

  /** Renders a card's content. Without it, a card shows its `title`. */
  @property({ attribute: false }) renderCard?: KanbanRenderCard;

  /** The accessible name of the board. Defaults to "Board". */
  @property({ type: String }) label = '';

  /** Adds an "Add card" button to every column, which fires `card-add`. */
  @property({ type: Boolean, reflect: true }) addable = false;

  // ── State

  /** The card being moved, with where it would land. */
  @state() private drag: DragState | null = null;

  /** The id of the card that holds the tab stop. */
  @state() private activeCardId = '';

  /** The live region's text. */
  @state() private announcement = '';

  // ── Private fields

  /** Each column's entries, worked out before every render. */
  private layouts = new Map<string, LayoutEntry[]>();

  /** The press or pointer drag in progress. */
  private press: PointerPress | null = null;

  /** Height of the dragged card, for the placeholder. */
  private placeholderHeight = 0;

  /** Whether to focus and reveal the lifted card after the next update. */
  private revealLifted = false;

  private readonly instructionsId = `wc-kanban-instructions-${(instructionsCount += 1)}`;

  private readonly i18n = new I18nController(this);

  // ── Lifecycle

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener('keydown', this.__handleKeyDown);
    this.addEventListener('focusin', this.__handleFocusIn);
    this.addEventListener('focusout', this.__handleFocusOut);
    this.addEventListener('pointerdown', this.__handlePointerDown);
    this.addEventListener('touchmove', this.__handleTouchMove, {
      passive: false,
    });
    this.addEventListener('contextmenu', this.__handleContextMenu);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this.__handleKeyDown);
    this.removeEventListener('focusin', this.__handleFocusIn);
    this.removeEventListener('focusout', this.__handleFocusOut);
    this.removeEventListener('pointerdown', this.__handlePointerDown);
    this.removeEventListener('touchmove', this.__handleTouchMove);
    this.removeEventListener('contextmenu', this.__handleContextMenu);
    this.__endPress();
    this.drag = null;
  }

  protected override willUpdate(changed: PropertyValues<this>) {
    super.willUpdate(changed);
    this.layouts = this.__computeLayouts();
    const shown = this.__shownCards();
    if (!shown.some(card => card.id === this.activeCardId)) {
      this.activeCardId = shown[0]?.id ?? '';
    }
  }

  /** Renders the shadow DOM (columns and slots), then the cards into the light DOM. */
  protected override update(changed: PropertyValues<this>) {
    super.update(changed);
    render(this.__renderCards(), this);
  }

  protected override updated(changed: PropertyValues<this>) {
    super.updated(changed);
    if (this.revealLifted && this.drag) {
      this.revealLifted = false;
      const card = this.__cardElement(this.drag.cardId);
      if (card) {
        if (!card.matches(':focus')) card.focus({ preventScroll: true });
        this.__reveal(card);
      }
    }
  }

  // ── Private methods

  /** The cards of `columnId` in order, optionally without one card. */
  private __cardsIn(columnId: string, without?: string): KanbanCard[] {
    return this.cards.filter(
      card => card.columnId === columnId && card.id !== without,
    );
  }

  private __computeLayouts(): Map<string, LayoutEntry[]> {
    const layouts = new Map<string, LayoutEntry[]>();
    const { drag } = this;
    const dragged = drag
      ? this.cards.find(card => card.id === drag.cardId)
      : undefined;
    this.columns.forEach(column => {
      const entries: LayoutEntry[] = this.__cardsIn(column.id, dragged?.id).map(
        card => ({ kind: 'card', card }),
      );
      if (drag && dragged && drag.toColumn === column.id) {
        const at = Math.min(drag.toIndex, entries.length);
        const inserted: LayoutEntry[] = [{ kind: 'card', card: dragged }];
        if (drag.mode === 'pointer') inserted.push({ kind: 'placeholder' });
        entries.splice(at, 0, ...inserted);
      }
      layouts.set(column.id, entries);
    });
    return layouts;
  }

  /** The rendered cards in column order (the order focus moves through). */
  private __shownCards(): KanbanCard[] {
    const shown: KanbanCard[] = [];
    this.layouts.forEach(entries =>
      entries.forEach(entry => {
        if (entry.kind === 'card') shown.push(entry.card);
      }),
    );
    return shown;
  }

  /** The cards of a rendered column. */
  private __layoutCards(columnId: string): KanbanCard[] {
    const cards: KanbanCard[] = [];
    this.layouts.get(columnId)?.forEach(entry => {
      if (entry.kind === 'card') cards.push(entry.card);
    });
    return cards;
  }

  /** Where a card is in the committed `cards`. */
  private __positionOf(
    cardId: string,
  ): { columnId: string; index: number } | null {
    const card = this.cards.find(item => item.id === cardId);
    if (!card || !this.columns.some(column => column.id === card.columnId)) {
      return null;
    }
    return {
      columnId: card.columnId,
      index: this.__cardsIn(card.columnId).indexOf(card),
    };
  }

  private __cardElement(cardId: string): HTMLElement | null {
    return (
      Array.from(this.children).find(
        (child): child is HTMLElement =>
          child instanceof HTMLElement && child.dataset.kanbanCard === cardId,
      ) ?? null
    );
  }

  /** The card wrapper that contains `node`, if any. */
  private __cardOf(node: EventTarget | null): HTMLElement | null {
    if (!(node instanceof Element)) return null;
    const card = node.closest<HTMLElement>('[data-kanban-card]');
    return card && card.parentElement === this ? card : null;
  }

  private __format(value: number): string {
    return new Intl.NumberFormat(this.i18n.locale).format(value);
  }

  private __columnTitle(columnId: string): string {
    return this.columns.find(column => column.id === columnId)?.title ?? '';
  }

  private __cardTitle(cardId: string): string {
    return this.cards.find(card => card.id === cardId)?.title ?? '';
  }

  /** Announces a step of a move, with the card's position in `columnId`. */
  private __announceAt(
    key: 'kanbanPickedUp' | 'kanbanMoved' | 'kanbanDropped' | 'kanbanCanceled',
    cardId: string,
    columnId: string,
    index: number,
    total: number,
  ) {
    this.__announce(
      this.i18n.t(key)(
        this.__cardTitle(cardId),
        this.__columnTitle(columnId),
        this.__format(index + 1),
        this.__format(total),
      ),
    );
  }

  /** Announces the lifted card at its pending place. */
  private __announceDrag(
    key: 'kanbanPickedUp' | 'kanbanMoved' | 'kanbanDropped',
  ) {
    const { drag } = this;
    if (!drag) return;
    const total = this.__cardsIn(drag.toColumn, drag.cardId).length + 1;
    this.__announceAt(key, drag.cardId, drag.toColumn, drag.toIndex, total);
  }

  private __announce(message: string) {
    // Clear first, so the same message twice in a row is read again.
    this.announcement = '';
    setTimeout(() => {
      this.announcement = message;
    });
  }

  /** Scrolls a card into view within its column and the board. */
  private __reveal(card: HTMLElement) {
    card.scrollIntoView?.({
      block: 'nearest',
      inline: 'nearest',
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  }

  /** Lifts a card for a move. */
  private __lift(cardId: string, mode: DragState['mode']) {
    const position = this.__positionOf(cardId);
    if (!position) return false;
    this.drag = {
      mode,
      cardId,
      fromColumn: position.columnId,
      fromIndex: position.index,
      toColumn: position.columnId,
      toIndex: position.index,
    };
    this.__announceDrag('kanbanPickedUp');
    return true;
  }

  /** Drops the lifted card where it is: fires `card-move` and applies it unless canceled. */
  private __drop() {
    const { drag } = this;
    if (!drag) return;
    this.drag = null;
    const { cardId, fromColumn, toColumn, fromIndex, toIndex } = drag;
    if (fromColumn === toColumn && fromIndex === toIndex) {
      const total = this.__cardsIn(toColumn).length;
      this.__announceAt('kanbanDropped', cardId, toColumn, toIndex, total);
      return;
    }
    const detail: KanbanCardMoveDetail = {
      cardId,
      fromColumn,
      toColumn,
      fromIndex,
      toIndex,
    };
    const event = new CustomEvent<KanbanCardMoveDetail>('card-move', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail,
    });
    if (!this.dispatchEvent(event)) {
      const total = this.__cardsIn(fromColumn).length;
      this.__announceAt('kanbanCanceled', cardId, fromColumn, fromIndex, total);
      return;
    }
    this.cards = applyKanbanMove(this.cards, detail);
    const total = this.__cardsIn(toColumn).length;
    this.__announceAt('kanbanDropped', cardId, toColumn, toIndex, total);
  }

  /** Puts the lifted card back where it was. */
  private __cancel() {
    const { drag } = this;
    if (!drag) return;
    this.drag = null;
    const total = this.__cardsIn(drag.fromColumn).length;
    this.__announceAt(
      'kanbanCanceled',
      drag.cardId,
      drag.fromColumn,
      drag.fromIndex,
      total,
    );
  }

  /** Moves the pending place of a keyboard-lifted card by whole columns or positions. */
  private __moveLifted(columnStep: number, indexStep: number) {
    const { drag } = this;
    if (!drag) return;
    const columnIndex = this.columns.findIndex(
      column => column.id === drag.toColumn,
    );
    const nextColumn =
      this.columns[
        Math.min(Math.max(0, columnIndex + columnStep), this.columns.length - 1)
      ];
    if (!nextColumn) return;
    const others = this.__cardsIn(nextColumn.id, drag.cardId);
    const toIndex = Math.min(
      Math.max(0, drag.toIndex + indexStep),
      others.length,
    );
    if (nextColumn.id === drag.toColumn && toIndex === drag.toIndex) return;
    this.drag = { ...drag, toColumn: nextColumn.id, toIndex };
    this.revealLifted = true;
    this.__announceDrag('kanbanMoved');
  }

  /** Moves focus (and the tab stop) to a card. */
  private async __focusCard(cardId: string) {
    this.activeCardId = cardId;
    await this.updateComplete;
    const card = this.__cardElement(cardId);
    if (!card) return;
    card.focus({ preventScroll: true });
    this.__reveal(card);
  }

  /** The card focus moves to from `cardId` by `key`, when no card is lifted. */
  private __cardInDirection(cardId: string, key: string): string | undefined {
    const columnIds = this.columns.map(column => column.id);
    const columnIndex = columnIds.findIndex(id =>
      this.__layoutCards(id).some(card => card.id === cardId),
    );
    if (columnIndex < 0) return undefined;
    const cards = this.__layoutCards(columnIds[columnIndex]);
    const index = cards.findIndex(card => card.id === cardId);
    switch (key) {
      case 'ArrowUp':
        return cards[Math.max(0, index - 1)]?.id;
      case 'ArrowDown':
        return cards[Math.min(cards.length - 1, index + 1)]?.id;
      case 'Home':
        return cards[0]?.id;
      case 'End':
        return cards[cards.length - 1]?.id;
      default: {
        // Left or Right, already mirrored: the nearest column with cards in that direction.
        const step = key === 'next' ? 1 : -1;
        for (
          let other = columnIndex + step;
          other >= 0 && other < columnIds.length;
          other += step
        ) {
          const target = this.__layoutCards(columnIds[other]);
          if (target.length) {
            return target[Math.min(index, target.length - 1)].id;
          }
        }
        return undefined;
      }
    }
  }

  private readonly __handleKeyDown = (event: KeyboardEvent) => {
    const card = this.__cardOf(event.target);
    // Keys inside a card's own controls belong to them.
    if (!card || event.target !== card) return;
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const cardId = card.dataset.kanbanCard ?? '';
    const rtl = isRtl(this);
    const horizontal = (key: string) =>
      (key === 'ArrowRight') !== rtl ? 'next' : 'previous';

    if (this.drag?.mode === 'keyboard') {
      switch (event.key) {
        case 'ArrowUp':
          this.__moveLifted(0, -1);
          break;
        case 'ArrowDown':
          this.__moveLifted(0, 1);
          break;
        case 'ArrowLeft':
        case 'ArrowRight':
          this.__moveLifted(horizontal(event.key) === 'next' ? 1 : -1, 0);
          break;
        case ' ':
        case 'Enter':
          this.__drop();
          break;
        case 'Escape':
          // Keep an enclosing dialog open.
          event.stopPropagation();
          this.__cancel();
          break;
        case 'Tab':
          this.__cancel();
          return;
        default:
          return;
      }
      event.preventDefault();
      return;
    }

    let next: string | undefined;
    switch (event.key) {
      case ' ':
      case 'Enter':
        event.preventDefault();
        if (this.__lift(cardId, 'keyboard')) this.revealLifted = true;
        return;
      case 'ArrowUp':
      case 'ArrowDown':
      case 'Home':
      case 'End':
        next = this.__cardInDirection(cardId, event.key);
        break;
      case 'ArrowLeft':
      case 'ArrowRight':
        next = this.__cardInDirection(cardId, horizontal(event.key));
        break;
      default:
        return;
    }
    event.preventDefault();
    if (next && next !== cardId) this.__focusCard(next);
  };

  private readonly __handleFocusIn = (event: FocusEvent) => {
    const card = this.__cardOf(event.target);
    if (card?.dataset.kanbanCard) this.activeCardId = card.dataset.kanbanCard;
  };

  private readonly __handleFocusOut = () => {
    if (this.drag?.mode !== 'keyboard') return;
    // A moved card's slot moves, which can blur it for a moment; `updated()` focuses it again.
    queueMicrotask(() => {
      const { drag } = this;
      if (drag?.mode !== 'keyboard') return;
      const card = this.__cardElement(drag.cardId);
      if (!card || document.activeElement !== card) this.__cancel();
    });
  };

  // ── Pointer drag

  private readonly __handlePointerDown = (event: PointerEvent) => {
    if (!event.isPrimary || event.button !== 0 || this.press) return;
    const card = this.__cardOf(event.target);
    if (!card || !(event.target instanceof Element)) return;
    const control = event.target.closest(INTERACTIVE);
    if (control && control !== card && card.contains(control)) return;
    if (this.drag) this.__cancel();
    const press: PointerPress = {
      pointerId: event.pointerId,
      pointerType: event.pointerType,
      card,
      cardId: card.dataset.kanbanCard ?? '',
      startX: event.clientX,
      startY: event.clientY,
      x: event.clientX,
      y: event.clientY,
      lifted: false,
      offsetX: 0,
      offsetY: 0,
    };
    this.press = press;
    if (press.pointerType === 'touch') {
      press.holdTimer = setTimeout(() => this.__liftPointer(), TOUCH_HOLD_MS);
    }
    window.addEventListener('pointermove', this.__handlePointerMove);
    window.addEventListener('pointerup', this.__handlePointerUp);
    window.addEventListener('pointercancel', this.__handlePointerCancel);
    window.addEventListener('keydown', this.__handleWindowKeyDown, true);
  };

  private readonly __handlePointerMove = (event: PointerEvent) => {
    const { press } = this;
    if (!press || event.pointerId !== press.pointerId) return;
    press.x = event.clientX;
    press.y = event.clientY;
    const distance = Math.hypot(press.x - press.startX, press.y - press.startY);
    if (!press.lifted) {
      if (press.pointerType === 'touch') {
        // Moving before the hold ends is a scroll, not a drag.
        if (distance > TOUCH_SLOP) this.__endPress();
        return;
      }
      if (distance < DRAG_DISTANCE) return;
      this.__liftPointer();
      return;
    }
    event.preventDefault();
    this.__followPointer();
  };

  private readonly __handlePointerUp = (event: PointerEvent) => {
    const { press } = this;
    if (!press || event.pointerId !== press.pointerId) return;
    const { lifted } = press;
    this.__endPress();
    if (!lifted) return;
    // The click that follows a drag is not a click on the card.
    const swallow = (click: Event) => {
      click.stopPropagation();
      click.preventDefault();
    };
    window.addEventListener('click', swallow, { capture: true, once: true });
    setTimeout(() => window.removeEventListener('click', swallow, true));
    this.__drop();
  };

  private readonly __handlePointerCancel = (event: PointerEvent) => {
    if (!this.press || event.pointerId !== this.press.pointerId) return;
    const { lifted } = this.press;
    this.__endPress();
    if (lifted) this.__cancel();
  };

  private readonly __handleWindowKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || !this.press?.lifted) return;
    event.preventDefault();
    event.stopPropagation();
    this.__endPress();
    this.__cancel();
  };

  private readonly __handleTouchMove = (event: TouchEvent) => {
    // Keep the page from scrolling under a lifted card.
    if (this.press?.lifted && event.cancelable) event.preventDefault();
  };

  private readonly __handleContextMenu = (event: Event) => {
    if (this.press) event.preventDefault();
  };

  /** Turns the press into a drag: the card follows the pointer and a placeholder marks its place. */
  private __liftPointer() {
    const { press } = this;
    if (!press || press.lifted) return;
    if (!this.__lift(press.cardId, 'pointer')) {
      this.__endPress();
      return;
    }
    const rect = press.card.getBoundingClientRect();
    press.lifted = true;
    press.offsetX = press.startX - rect.left;
    press.offsetY = press.startY - rect.top;
    this.placeholderHeight = rect.height;
    const { style } = press.card;
    style.setProperty('position', 'fixed');
    style.setProperty('inline-size', `${rect.width}px`);
    style.setProperty('z-index', '1000');
    style.setProperty('pointer-events', 'none');
    this.__followPointer();
    const tick = () => {
      if (!this.press?.lifted) return;
      this.__autoScroll();
      this.press.frame = requestAnimationFrame(tick);
    };
    press.frame = requestAnimationFrame(tick);
  }

  /** Places the lifted card under the pointer and works out where it would land. */
  private __followPointer() {
    const { press, drag } = this;
    if (!press?.lifted || !drag) return;
    press.card.style.setProperty('left', `${press.x - press.offsetX}px`);
    press.card.style.setProperty('top', `${press.y - press.offsetY}px`);

    const columns = Array.from(
      this.renderRoot.querySelectorAll<HTMLElement>('.column'),
    );
    let column: HTMLElement | undefined;
    let best = Infinity;
    columns.forEach(candidate => {
      const rect = candidate.getBoundingClientRect();
      const distance = Math.max(0, rect.left - press.x, press.x - rect.right);
      if (distance < best) {
        best = distance;
        column = candidate;
      }
    });
    const columnId = column?.dataset.columnId;
    if (!columnId) return;
    let toIndex = 0;
    this.__cardsIn(columnId, drag.cardId).forEach(card => {
      const rect = this.__cardElement(card.id)?.getBoundingClientRect();
      if (rect && press.y > rect.top + rect.height / 2) toIndex += 1;
    });
    if (columnId !== drag.toColumn || toIndex !== drag.toIndex) {
      this.drag = { ...drag, toColumn: columnId, toIndex };
    }
  }

  /** Scrolls the board and the column under the pointer when it nears their edges. */
  private __autoScroll() {
    const { press, drag } = this;
    if (!press || !drag) return;
    const speed = (overshoot: number) =>
      Math.sign(overshoot) * Math.ceil(Math.abs(overshoot) / 4);
    const edge = (position: number, start: number, end: number) => {
      if (position < start + SCROLL_EDGE) {
        return speed(position - (start + SCROLL_EDGE));
      }
      if (position > end - SCROLL_EDGE) {
        return speed(position - (end - SCROLL_EDGE));
      }
      return 0;
    };
    let scrolled = false;
    const board = this.renderRoot.querySelector<HTMLElement>('.board');
    if (board) {
      const rect = board.getBoundingClientRect();
      const left = edge(press.x, rect.left, rect.right);
      if (left) {
        const before = board.scrollLeft;
        board.scrollBy({ left });
        scrolled ||= board.scrollLeft !== before;
      }
    }
    const scroller = Array.from(
      this.renderRoot.querySelectorAll<HTMLElement>('.cards'),
    ).find(element => element.dataset.columnId === drag.toColumn);
    if (scroller) {
      const rect = scroller.getBoundingClientRect();
      const top = edge(press.y, rect.top, rect.bottom);
      if (top) {
        const before = scroller.scrollTop;
        scroller.scrollBy({ top });
        scrolled ||= scroller.scrollTop !== before;
      }
    }
    if (scrolled) this.__followPointer();
  }

  /** Ends a press or pointer drag and puts the card back in the flow. */
  private __endPress() {
    const { press } = this;
    if (!press) return;
    this.press = null;
    if (press.holdTimer) clearTimeout(press.holdTimer);
    if (press.frame !== undefined) cancelAnimationFrame(press.frame);
    if (press.lifted) {
      [
        'position',
        'inline-size',
        'z-index',
        'pointer-events',
        'left',
        'top',
      ].forEach(name => press.card.style.removeProperty(name));
    }
    window.removeEventListener('pointermove', this.__handlePointerMove);
    window.removeEventListener('pointerup', this.__handlePointerUp);
    window.removeEventListener('pointercancel', this.__handlePointerCancel);
    window.removeEventListener('keydown', this.__handleWindowKeyDown, true);
  }

  private __handleAdd(columnId: string) {
    this.dispatchEvent(
      new CustomEvent<KanbanCardAddDetail>('card-add', {
        bubbles: true,
        composed: true,
        detail: { columnId },
      }),
    );
  }

  // ── Render helpers

  /** The light-DOM cards, each assigned to its own slot, and the keyboard instructions. */
  private __renderCards() {
    const positions = new Map<string, { index: number; size: number }>();
    this.layouts.forEach(entries => {
      const cards = entries.filter(entry => entry.kind === 'card');
      cards.forEach((entry, index) => {
        if (entry.kind === 'card') {
          positions.set(entry.card.id, { index, size: cards.length });
        }
      });
    });
    const { drag } = this;
    return html`${repeat(
        this.cards.filter(card => positions.has(card.id)),
        card => card.id,
        card => {
          const position = positions.get(card.id);
          return html`<div
            slot="card-${card.id}"
            data-kanban-card=${card.id}
            data-dragging=${drag?.cardId === card.id ? drag.mode : nothing}
            role="listitem"
            tabindex=${card.id === this.activeCardId ? '0' : '-1'}
            aria-describedby=${this.instructionsId}
            aria-setsize=${position?.size ?? nothing}
            aria-posinset=${position ? position.index + 1 : nothing}
          >
            ${this.renderCard ? this.renderCard(card) : card.title}
          </div>`;
        },
      )}
      <div id=${this.instructionsId} hidden>
        ${this.i18n.t('kanbanInstructions')}
      </div>`;
  }

  private __renderHeader(column: KanbanColumn, titleId: string, count: number) {
    const { limit } = column;
    const hasLimit = typeof limit === 'number' && limit >= 0;
    const over = hasLimit && count > limit;
    const visible = hasLimit
      ? `${this.__format(count)}/${this.__format(limit)}`
      : this.__format(count);
    return html`<div class="header">
      <span class="title" id=${titleId}>${column.title}</span>
      <span class="count" aria-hidden="true">${visible}</span>
      <span class="screen-reader-only"
        >${this.i18n.t('kanbanCount')(
          count,
          this.__format(count),
          hasLimit ? this.__format(limit) : undefined,
        )}</span
      >
      ${over
        ? html`<span class="over-limit"
            ><wc-icon name="warning"></wc-icon>${this.i18n.t(
              'kanbanOverLimit',
            )}</span
          >`
        : nothing}
    </div>`;
  }

  private __renderColumn(column: KanbanColumn, index: number) {
    const entries = this.layouts.get(column.id) ?? [];
    const count = entries.filter(entry => entry.kind === 'card').length;
    const over =
      typeof column.limit === 'number' &&
      column.limit >= 0 &&
      count > column.limit;
    const titleId = `title-${index}`;
    const target = this.drag?.toColumn === column.id;
    return html`<section
      class="column ${over ? 'over' : ''} ${target ? 'target' : ''}"
      data-column-id=${column.id}
      aria-labelledby=${titleId}
    >
      ${this.__renderHeader(column, titleId, count)}
      <div class="cards" data-column-id=${column.id}>
        <div class="list" role="list" aria-labelledby=${titleId}>
          ${repeat(
            entries,
            entry =>
              entry.kind === 'card' ? `card:${entry.card.id}` : 'placeholder',
            entry =>
              entry.kind === 'card'
                ? html`<slot name="card-${entry.card.id}"></slot>`
                : html`<div
                    class="placeholder"
                    aria-hidden="true"
                    style="block-size: ${this.placeholderHeight}px"
                  ></div>`,
          )}
        </div>
        ${entries.length
          ? nothing
          : html`<div class="empty">${this.i18n.t('kanbanEmpty')}</div>`}
      </div>
      ${this.addable
        ? html`<wc-button
            class="add"
            variant="text"
            aria-label=${this.i18n.t('kanbanAddCardTo')(column.title)}
            @click=${() => this.__handleAdd(column.id)}
            ><wc-icon slot="icon" name="add"></wc-icon>${this.i18n.t(
              'kanbanAddCard',
            )}</wc-button
          >`
        : nothing}
    </section>`;
  }

  // ── Render

  render() {
    return html`<div
        class="board ${this.drag ? 'dragging' : ''}"
        role="group"
        aria-label=${this.label || this.i18n.t('kanbanLabel')}
      >
        ${this.columns.map((column, index) =>
          this.__renderColumn(column, index),
        )}
      </div>
      <div class="screen-reader-only" role="status" aria-live="polite">
        ${this.announcement}
      </div>`;
  }
}
