/// <reference types="mocha" />
import { html } from 'lit';
import { fixtureSync, expect, waitUntil } from '@open-wc/testing';
import {
  Kanban,
  applyKanbanMove,
  type KanbanCard,
  type KanbanCardMoveDetail,
} from '../src/kanban/index.js';

if (!customElements.get('wc-kanban'))
  customElements.define('wc-kanban', Kanban);

const columns = () => [
  { id: 'todo', title: 'To do' },
  { id: 'doing', title: 'Doing', limit: 1 },
  { id: 'done', title: 'Done' },
];

const cards = (): KanbanCard[] => [
  { id: 'a', columnId: 'todo', title: 'Fix login' },
  { id: 'b', columnId: 'todo', title: 'Write docs' },
  { id: 'c', columnId: 'doing', title: 'Ship it' },
];

async function settle(el: Kanban) {
  for (let round = 0; round < 3; round += 1) {
    // eslint-disable-next-line no-await-in-loop
    await el.updateComplete;
  }
}

async function mount(template = html`<wc-kanban label="Sprint"></wc-kanban>`) {
  const el = fixtureSync<Kanban>(template);
  el.columns = columns();
  el.cards = cards();
  await settle(el);
  return el;
}

function card(el: Kanban, id: string) {
  return el.querySelector<HTMLElement>(
    `[data-kanban-card="${id}"]`,
  ) as HTMLElement;
}

/** The ids of the cards each column shows, in order, read from its slots. */
function layout(el: Kanban) {
  const result: Record<string, string[]> = {};
  el.shadowRoot?.querySelectorAll<HTMLElement>('.column').forEach(column => {
    result[column.dataset.columnId ?? ''] = Array.from(
      column.querySelectorAll('slot'),
    ).map(slot => slot.name.replace('card-', ''));
  });
  return result;
}

function announcement(el: Kanban) {
  return (
    el.shadowRoot?.querySelector('[role=status]')?.textContent?.trim() ?? ''
  );
}

function press(target: Element, key: string) {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    composed: true,
    cancelable: true,
  });
  target.dispatchEvent(event);
  return event;
}

function pointer(type: string, target: EventTarget, x: number, y: number) {
  target.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      composed: true,
      cancelable: true,
      clientX: x,
      clientY: y,
      pointerId: 1,
      pointerType: 'mouse',
      isPrimary: true,
      button: 0,
    }),
  );
}

describe('wc-kanban', () => {
  it('renders columns with counts and slots each card into its list', async () => {
    const el = await mount();
    expect(layout(el)).to.deep.equal({
      todo: ['a', 'b'],
      doing: ['c'],
      done: [],
    });
    const list = el.shadowRoot?.querySelector('.column .list');
    expect(list?.getAttribute('role')).to.equal('list');
    const first = card(el, 'a');
    expect(first.getAttribute('role')).to.equal('listitem');
    expect(first.getAttribute('slot')).to.equal('card-a');
    expect(first.assignedSlot).to.exist;
    expect(first.getAttribute('aria-setsize')).to.equal('2');
    expect(first.getAttribute('aria-posinset')).to.equal('1');
    expect(first.textContent?.trim()).to.equal('Fix login');
    const instructions = el.querySelector(
      `#${first.getAttribute('aria-describedby')}`,
    );
    expect(instructions?.textContent).to.contain('Space or Enter');
    expect(
      el.shadowRoot?.querySelector('.board')?.getAttribute('aria-label'),
    ).to.equal('Sprint');
    const done = el.shadowRoot?.querySelector('[data-column-id=done] .empty');
    expect(done?.textContent).to.equal('No cards');
  });

  it('flags a column over its limit', async () => {
    const el = await mount();
    const doing = el.shadowRoot?.querySelector<HTMLElement>(
      '.column[data-column-id=doing]',
    );
    expect(doing?.classList.contains('over')).to.equal(false);
    expect(doing?.querySelector('.count')?.textContent).to.equal('1/1');
    el.cards = [...el.cards, { id: 'd', columnId: 'doing', title: 'More' }];
    await settle(el);
    expect(doing?.classList.contains('over')).to.equal(true);
    expect(doing?.querySelector('.over-limit')?.textContent).to.contain(
      'Over limit',
    );
    expect(doing?.querySelector('.screen-reader-only')?.textContent).to.equal(
      '2 of 1 cards',
    );
  });

  it('renders card content with renderCard', async () => {
    const el = await mount();
    el.renderCard = item => html`<b>${item.title}</b>`;
    await settle(el);
    expect(card(el, 'b').querySelector('b')?.textContent).to.equal(
      'Write docs',
    );
  });

  it('moves focus between cards with the arrow keys', async () => {
    const el = await mount();
    expect(card(el, 'a').tabIndex).to.equal(0);
    expect(card(el, 'b').tabIndex).to.equal(-1);
    card(el, 'a').focus();
    press(card(el, 'a'), 'ArrowDown');
    await settle(el);
    expect(card(el, 'b').tabIndex).to.equal(0);
    expect(document.activeElement).to.equal(card(el, 'b'));
    press(card(el, 'b'), 'ArrowRight');
    await settle(el);
    expect(document.activeElement).to.equal(card(el, 'c'));
    // Done is empty: Right stays put.
    press(card(el, 'c'), 'ArrowRight');
    await settle(el);
    expect(document.activeElement).to.equal(card(el, 'c'));
    press(card(el, 'c'), 'ArrowLeft');
    await settle(el);
    expect(document.activeElement).to.equal(card(el, 'a'));
  });

  it('picks up, moves and drops a card with the keyboard', async () => {
    const el = await mount();
    const moves: KanbanCardMoveDetail[] = [];
    el.addEventListener('card-move', event =>
      moves.push((event as CustomEvent<KanbanCardMoveDetail>).detail),
    );
    const a = card(el, 'a');
    a.focus();
    press(a, 'Enter');
    await settle(el);
    expect(a.dataset.dragging).to.equal('keyboard');
    await waitUntil(() => announcement(el) !== '');
    expect(announcement(el)).to.equal(
      'Picked up card Fix login. Column To do, position 1 of 2.',
    );

    press(a, 'ArrowDown');
    await settle(el);
    expect(layout(el).todo).to.deep.equal(['b', 'a']);
    await waitUntil(() => announcement(el).includes('position 2 of 2'));

    press(a, 'ArrowRight');
    await settle(el);
    expect(layout(el).todo).to.deep.equal(['b']);
    expect(layout(el).doing).to.deep.equal(['c', 'a']);
    await waitUntil(
      () =>
        announcement(el) === 'Card Fix login: column Doing, position 2 of 2.',
    );
    expect(document.activeElement).to.equal(a);

    press(a, 'ArrowUp');
    await settle(el);
    expect(layout(el).doing).to.deep.equal(['a', 'c']);

    press(a, ' ');
    await settle(el);
    expect(moves).to.deep.equal([
      {
        cardId: 'a',
        fromColumn: 'todo',
        toColumn: 'doing',
        fromIndex: 0,
        toIndex: 0,
      },
    ]);
    expect(a.hasAttribute('data-dragging')).to.equal(false);
    expect(el.cards.map(item => `${item.id}:${item.columnId}`)).to.deep.equal([
      'b:todo',
      'a:doing',
      'c:doing',
    ]);
    await waitUntil(() =>
      announcement(el).startsWith('Dropped card Fix login'),
    );
    expect(announcement(el)).to.equal(
      'Dropped card Fix login. Column Doing, position 1 of 2.',
    );
  });

  it('cancels a keyboard move with Escape', async () => {
    const el = await mount();
    let fired = false;
    el.addEventListener('card-move', () => {
      fired = true;
    });
    const before = el.cards;
    const a = card(el, 'a');
    a.focus();
    press(a, ' ');
    press(a, 'ArrowRight');
    await settle(el);
    expect(layout(el).doing).to.include('a');
    const escape = press(a, 'Escape');
    expect(escape.defaultPrevented).to.equal(true);
    await settle(el);
    expect(layout(el).todo).to.deep.equal(['a', 'b']);
    expect(el.cards).to.equal(before);
    expect(fired).to.equal(false);
    await waitUntil(() => announcement(el).startsWith('Move canceled'));
    expect(announcement(el)).to.equal(
      'Move canceled. Card Fix login is back in column To do, position 1 of 2.',
    );
  });

  it('keeps the cards when card-move is canceled', async () => {
    const el = await mount();
    el.addEventListener('card-move', event => event.preventDefault());
    const before = el.cards;
    const a = card(el, 'a');
    a.focus();
    press(a, 'Enter');
    press(a, 'ArrowRight');
    press(a, 'Enter');
    await settle(el);
    expect(el.cards).to.equal(before);
    expect(layout(el).todo).to.deep.equal(['a', 'b']);
  });

  it('mirrors Left and Right in right-to-left layouts', async () => {
    const el = await mount(html`<wc-kanban dir="rtl"></wc-kanban>`);
    const a = card(el, 'a');
    a.focus();
    press(a, 'Enter');
    press(a, 'ArrowLeft');
    await settle(el);
    expect(layout(el).doing).to.include('a');
  });

  it('fires card-add from a column button with addable', async () => {
    const el = await mount(html`<wc-kanban addable></wc-kanban>`);
    let columnId = '';
    el.addEventListener('card-add', event => {
      columnId = (event as CustomEvent<{ columnId: string }>).detail.columnId;
    });
    const button = el.shadowRoot?.querySelector<HTMLElement>(
      '.column[data-column-id=done] .add',
    );
    expect(button?.getAttribute('aria-label')).to.equal('Add card to Done');
    button?.click();
    expect(columnId).to.equal('done');
  });

  it('drags a card to another column with a pointer', async () => {
    const el = await mount(html`<wc-kanban style="height: 400px"></wc-kanban>`);
    const moves: KanbanCardMoveDetail[] = [];
    el.addEventListener('card-move', event =>
      moves.push((event as CustomEvent<KanbanCardMoveDetail>).detail),
    );
    const a = card(el, 'a');
    const start = a.getBoundingClientRect();
    const c = card(el, 'c').getBoundingClientRect();
    pointer('pointerdown', a, start.left + 10, start.top + 10);
    // Below "Ship it" in Doing.
    pointer('pointermove', window, c.left + 10, c.bottom + 10);
    await settle(el);
    expect(a.dataset.dragging).to.equal('pointer');
    expect(a.style.position).to.equal('fixed');
    const placeholder = el.shadowRoot?.querySelector(
      '.column[data-column-id=doing] .placeholder',
    );
    expect(placeholder).to.exist;
    pointer('pointerup', window, c.left + 10, c.bottom + 10);
    await settle(el);
    expect(moves).to.deep.equal([
      {
        cardId: 'a',
        fromColumn: 'todo',
        toColumn: 'doing',
        fromIndex: 0,
        toIndex: 1,
      },
    ]);
    expect(a.style.position).to.equal('');
    expect(layout(el).doing).to.deep.equal(['c', 'a']);
    expect(el.shadowRoot?.querySelector('.placeholder')).to.not.exist;
  });

  it('does not start a drag from a click without movement', async () => {
    const el = await mount();
    let fired = false;
    el.addEventListener('card-move', () => {
      fired = true;
    });
    const a = card(el, 'a');
    const rect = a.getBoundingClientRect();
    pointer('pointerdown', a, rect.left + 5, rect.top + 5);
    pointer('pointermove', window, rect.left + 7, rect.top + 6);
    pointer('pointerup', window, rect.left + 7, rect.top + 6);
    await settle(el);
    expect(a.hasAttribute('data-dragging')).to.equal(false);
    expect(fired).to.equal(false);
  });

  it('applyKanbanMove moves a card within and between columns', () => {
    const list = cards();
    expect(
      applyKanbanMove(list, { cardId: 'a', toColumn: 'todo', toIndex: 1 }).map(
        item => item.id,
      ),
    ).to.deep.equal(['b', 'a', 'c']);
    const moved = applyKanbanMove(list, {
      cardId: 'b',
      toColumn: 'done',
      toIndex: 0,
    });
    expect(moved.find(item => item.id === 'b')?.columnId).to.equal('done');
    expect(list.find(item => item.id === 'b')?.columnId).to.equal('todo');
  });
});
