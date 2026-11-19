/// <reference types="mocha" />
import { expect, fixture } from '@open-wc/testing';
import {
  TimelineGrid,
  applyTimelineGridChange,
} from '../src/timeline-grid/timeline-grid.js';
import {
  assignLanes,
  eventSpan,
  viewRange,
} from '../src/timeline-grid/layout.js';
import type {
  TimelineGridEvent,
  TimelineGridEventAddDetail,
  TimelineGridEventChangeDetail,
  TimelineGridResource,
} from '../src/timeline-grid/types.js';

if (!customElements.get('wc-timeline-grid')) {
  customElements.define('wc-timeline-grid', TimelineGrid);
}

type Point = { x: number; y: number };

type PointerInit = NonNullable<ConstructorParameters<typeof PointerEvent>[1]>;

function pointer(type: string, { x, y }: Point, init: PointerInit = {}) {
  return new PointerEvent(type, {
    bubbles: true,
    composed: true,
    cancelable: true,
    clientX: x,
    clientY: y,
    pointerId: 1,
    pointerType: 'mouse',
    isPrimary: true,
    button: 0,
    buttons: type === 'pointerup' ? 0 : 1,
    ...init,
  });
}

/** Presses `target` at `from`, moves to `to` in a few steps and releases. */
function drag(target: Element, from: Point, to: Point) {
  target.dispatchEvent(pointer('pointerdown', from));
  for (let step = 1; step <= 4; step += 1) {
    const at = {
      x: from.x + ((to.x - from.x) * step) / 4,
      y: from.y + ((to.y - from.y) * step) / 4,
    };
    document.body.dispatchEvent(pointer('pointermove', at));
  }
  document.body.dispatchEvent(pointer('pointerup', to));
}

function tap(target: Element, at: Point) {
  target.dispatchEvent(pointer('pointerdown', at));
  document.body.dispatchEvent(pointer('pointerup', at));
}

function root(el: Element): ShadowRoot {
  return el.shadowRoot as ShadowRoot;
}

function collect<T>(el: Element, type: string): CustomEvent<T>[] {
  const fired: CustomEvent<T>[] = [];
  el.addEventListener(type, event => fired.push(event as CustomEvent<T>));
  return fired;
}

function tracks(el: TimelineGrid): HTMLElement[] {
  return [...root(el).querySelectorAll<HTMLElement>('.track')];
}

/** A point in row `row`, `hours` hours after the start of the range of an hour view. */
function timePoint(
  el: TimelineGrid,
  row: number,
  hours: number,
  totalHours = 24,
): Point {
  const header = (
    root(el).querySelector('.time-header') as HTMLElement
  ).getBoundingClientRect();
  const track = tracks(el)[row].getBoundingClientRect();
  const fraction = hours / totalHours;
  const rtl = getComputedStyle(el).direction === 'rtl';
  return {
    x: rtl
      ? header.right - fraction * header.width
      : header.left + fraction * header.width,
    y: track.top + track.height / 2,
  };
}

/** The middle of day `day` (0-based) of a day view, in row `row`. */
function dayPoint(
  el: TimelineGrid,
  row: number,
  day: number,
  days: number,
): Point {
  return timePoint(el, row, (day + 0.5) * 24, days * 24);
}

function eventsIn(el: TimelineGrid, row: number): HTMLElement[] {
  return [...tracks(el)[row].querySelectorAll<HTMLElement>('.event')];
}

async function announcement(el: TimelineGrid): Promise<string> {
  await new Promise(resolve => {
    setTimeout(resolve);
  });
  return root(el).querySelector('[role="status"]')?.textContent?.trim() ?? '';
}

const rooms = (): TimelineGridResource[] => [
  { id: 'aspen', title: 'Aspen', supportingText: '8 seats' },
  { id: 'birch', title: 'Birch' },
  { id: 'cedar', title: 'Cedar' },
];

const review = (): TimelineGridEvent => ({
  id: 1,
  resourceId: 'aspen',
  title: 'Design review',
  start: new Date(2026, 10, 4, 9),
  end: new Date(2026, 10, 4, 10),
});

/** A grid on Wednesday, November 4, 2026, with weeks starting on Sunday. */
async function mount(
  events: TimelineGridEvent[],
  attributes = 'editable addable',
  resources = rooms(),
) {
  const host = document.createElement('div');
  host.innerHTML = `<wc-timeline-grid locale="en-US" date="2026-11-04" first-day="0" style="height: 900px; width: 1200px" ${attributes}></wc-timeline-grid>`;
  const el = host.firstElementChild as TimelineGrid;
  el.resources = resources;
  el.events = events;
  const mounted = await fixture<TimelineGrid>(el);
  await mounted.updateComplete;
  return mounted;
}

describe('wc-timeline-grid', () => {
  it('renders a row per resource with its events on the time axis', async () => {
    const el = await mount(
      [
        review(),
        {
          id: 2,
          resourceId: 'birch',
          title: 'Planning',
          start: new Date(2026, 10, 4, 13),
          end: new Date(2026, 10, 4, 15),
        },
        {
          id: 3,
          resourceId: 'nowhere',
          title: 'Hidden',
          start: new Date(2026, 10, 4, 9),
          end: new Date(2026, 10, 4, 10),
        },
      ],
      '',
    );
    expect(root(el).querySelector('[role="table"]')).to.exist;
    const headers = [...root(el).querySelectorAll('[role="rowheader"]')].map(
      cell => cell.textContent?.replace(/\s+/g, ' ').trim(),
    );
    expect(headers).to.deep.equal(['Aspen 8 seats', 'Birch', 'Cedar']);
    expect(root(el).querySelectorAll('.event').length).to.equal(2);
    const [block] = eventsIn(el, 0);
    expect(block.style.getPropertyValue('inset-inline-start')).to.equal(
      '37.5%',
    );
    expect(parseFloat(block.style.width)).to.be.closeTo(100 / 24, 0.01);
    expect(block.getAttribute('role')).to.equal('button');
    expect(block.getAttribute('aria-label')).to.equal(
      'Design review, Aspen, Nov 4, 2026, 9:00 – 10:00 AM',
    );
  });

  it('stacks overlapping events in lanes and grows the row', async () => {
    const at = (h: number) => new Date(2026, 10, 4, h);
    const el = await mount(
      [
        { id: 1, resourceId: 'aspen', title: 'A', start: at(9), end: at(11) },
        { id: 2, resourceId: 'aspen', title: 'B', start: at(10), end: at(12) },
        { id: 3, resourceId: 'aspen', title: 'C', start: at(11), end: at(13) },
      ],
      '',
    );
    expect(tracks(el)[0].style.getPropertyValue('--_lanes').trim()).to.equal(
      '2',
    );
    const lanes = eventsIn(el, 0).map(block =>
      block.style.getPropertyValue('--_lane-index'),
    );
    // C starts when A ends, so it takes A's lane.
    expect(lanes).to.deep.equal(['0', '1', '0']);
    expect(tracks(el)[0].offsetHeight).to.be.greaterThan(
      tracks(el)[1].offsetHeight,
    );
  });

  it('labels hours in the day view and days in the week and month views', async () => {
    const el = await mount([], '');
    const labels = () => root(el).querySelectorAll('.slot-label');
    const title = () =>
      root(el).querySelector('.calendar-header .title')?.textContent?.trim();
    expect(labels().length).to.equal(24);
    expect(labels()[9].textContent?.trim()).to.equal('9 AM');
    expect(title()).to.equal('Wednesday, November 4, 2026');

    el.view = 'week';
    await el.updateComplete;
    expect(labels().length).to.equal(7);
    expect(labels()[0].textContent?.replace(/\s+/g, ' ').trim()).to.equal(
      'Sun 1',
    );
    expect(title()).to.equal('Nov 1 – 7, 2026');

    el.view = 'month';
    await el.updateComplete;
    expect(labels().length).to.equal(30);
    expect(title()).to.equal('November 2026');
  });

  it('moves by the view period and switches views from the header', async () => {
    const el = await mount([], '');
    const dates = collect<{ value: string }>(el, 'date-change');
    el.next();
    expect(dates[0].detail.value).to.equal('2026-11-05');
    el.view = 'week';
    el.previous();
    expect(dates[1].detail.value).to.equal('2026-10-29');
    el.view = 'month';
    el.next();
    expect(dates[2].detail.value).to.equal('2026-11-29');

    const views = collect<{ view: string }>(el, 'view-change');
    root(el)
      .querySelector('wc-segmented-button-group')
      ?.dispatchEvent(new CustomEvent('change', { detail: { value: 'day' } }));
    expect(views[0].detail.view).to.equal('day');
    expect(el.view).to.equal('day');
  });

  it('moves an event to another time and row, and applies the change', async () => {
    const original = review();
    const el = await mount([original]);
    const changes = collect<TimelineGridEventChangeDetail>(el, 'event-change');
    drag(eventsIn(el, 0)[0], timePoint(el, 0, 9.5), timePoint(el, 1, 11.5));
    expect(changes.length).to.equal(1);
    expect(changes[0].cancelable).to.equal(true);
    expect(changes[0].detail).to.deep.equal({
      event: original,
      start: new Date(2026, 10, 4, 11),
      end: new Date(2026, 10, 4, 12),
      resourceId: 'birch',
      action: 'move',
    });
    expect(el.events[0]).to.include({ id: 1, resourceId: 'birch' });
    expect(original.resourceId).to.equal('aspen');
    expect(await announcement(el)).to.equal(
      'Moved Design review to Birch, Nov 4, 2026, 11:00 AM – 12:00 PM.',
    );
    await el.updateComplete;
    expect(eventsIn(el, 0).length).to.equal(0);
    expect(eventsIn(el, 1).length).to.equal(1);
  });

  it('resizes an event by its edges, in its own row', async () => {
    const el = await mount([review()]);
    const changes = collect<TimelineGridEventChangeDetail>(el, 'event-change');
    const handle = (edge: string) =>
      eventsIn(el, 0)[0].querySelector(`.resize-handle.${edge}`) as HTMLElement;
    drag(handle('end'), timePoint(el, 0, 10), timePoint(el, 2, 11.25));
    expect(changes[0].detail).to.deep.include({
      start: new Date(2026, 10, 4, 9),
      end: new Date(2026, 10, 4, 11, 15),
      resourceId: 'aspen',
      action: 'resize',
    });
    await el.updateComplete;
    drag(handle('start'), timePoint(el, 0, 9), timePoint(el, 0, 8.5));
    expect(changes[1].detail.start).to.deep.equal(new Date(2026, 10, 4, 8, 30));
  });

  it('adds events by dragging or clicking empty time in a row', async () => {
    const el = await mount([]);
    const added = collect<TimelineGridEventAddDetail>(el, 'event-add');
    drag(
      tracks(el)[2],
      timePoint(el, 2, 13 + 2 / 60),
      timePoint(el, 2, 14 + 28 / 60),
    );
    expect(added[0].detail).to.deep.equal({
      start: new Date(2026, 10, 4, 13),
      end: new Date(2026, 10, 4, 14, 30),
      allDay: false,
      resourceId: 'cedar',
    });
    tap(tracks(el)[1], timePoint(el, 1, 15 + 40 / 60));
    expect(added[1].detail).to.deep.equal({
      start: new Date(2026, 10, 4, 15, 30),
      end: new Date(2026, 10, 4, 16, 30),
      allDay: false,
      resourceId: 'birch',
    });
    await el.updateComplete;
    const placeholder = () => root(el).querySelector('.event.placeholder');
    expect(tracks(el)[1].contains(placeholder())).to.equal(true);
    el.clearPlaceholder();
    await el.updateComplete;
    expect(placeholder() === null).to.equal(true);
  });

  it('moves by whole days, keeping the time, in the week view', async () => {
    const offsite: TimelineGridEvent = {
      id: 2,
      resourceId: 'birch',
      title: 'Offsite',
      start: new Date(2026, 10, 2),
      end: new Date(2026, 10, 4),
    };
    const el = await mount([review(), offsite], 'editable addable view="week"');
    const changes = collect<TimelineGridEventChangeDetail>(el, 'event-change');
    const added = collect<TimelineGridEventAddDetail>(el, 'event-add');
    // The week runs Sunday, November 1, to Saturday, November 7.
    drag(eventsIn(el, 0)[0], dayPoint(el, 0, 3, 7), dayPoint(el, 2, 5, 7));
    expect(changes[0].detail).to.deep.include({
      start: new Date(2026, 10, 6, 9),
      end: new Date(2026, 10, 6, 10),
      resourceId: 'cedar',
    });
    await el.updateComplete;

    const end = eventsIn(el, 1)[0].querySelector(
      '.resize-handle.end',
    ) as HTMLElement;
    drag(end, dayPoint(el, 1, 2, 7), dayPoint(el, 1, 4, 7));
    expect(changes[1].detail).to.deep.include({
      start: new Date(2026, 10, 2),
      end: new Date(2026, 10, 6),
      action: 'resize',
    });
    await el.updateComplete;

    tap(tracks(el)[0], dayPoint(el, 0, 1, 7));
    expect(added[0].detail).to.deep.equal({
      start: new Date(2026, 10, 2),
      end: new Date(2026, 10, 3),
      allDay: true,
      resourceId: 'aspen',
    });
  });

  it('keeps the event when event-change is canceled, and does not drag locked events', async () => {
    const original = review();
    const locked: TimelineGridEvent = {
      ...review(),
      id: 2,
      resourceId: 'birch',
      editable: false,
    };
    const el = await mount([original, locked]);
    const list = el.events;
    el.addEventListener('event-change', event => event.preventDefault());
    drag(eventsIn(el, 0)[0], timePoint(el, 0, 9.5), timePoint(el, 0, 14));
    expect(el.events).to.equal(list);

    const changes = collect<TimelineGridEventChangeDetail>(el, 'event-change');
    const lockedBlock = eventsIn(el, 1)[0];
    expect(lockedBlock.querySelector('.resize-handle') === null).to.equal(true);
    drag(lockedBlock, timePoint(el, 1, 9.5), timePoint(el, 1, 14));
    expect(changes.length).to.equal(0);

    el.eventsReadonly = true;
    await el.updateComplete;
    drag(eventsIn(el, 0)[0], timePoint(el, 0, 9.5), timePoint(el, 0, 14));
    expect(changes.length).to.equal(0);
    expect(eventsIn(el, 0)[0].getAttribute('role')).to.equal('note');
  });

  it('runs the axis from the inline start in right-to-left layouts', async () => {
    const el = await mount([review()], 'editable dir="rtl"');
    const changes = collect<TimelineGridEventChangeDetail>(el, 'event-change');
    const from = timePoint(el, 0, 9.5);
    const to = timePoint(el, 0, 11.5);
    // Later times lie to the left.
    expect(to.x).to.be.lessThan(from.x);
    drag(eventsIn(el, 0)[0], from, to);
    expect(changes[0].detail.start).to.deep.equal(new Date(2026, 10, 4, 11));
  });

  // Holds in any time zone; with TZ=America/New_York the clocks go back on November 1, 2026.
  it('lands clicks on the hour under the pointer on the day the clocks go back', async () => {
    const el = await mount([], 'addable date="2026-11-01"');
    el.date = '2026-11-01';
    await el.updateComplete;
    const added = collect<TimelineGridEventAddDetail>(el, 'event-add');
    tap(tracks(el)[0], timePoint(el, 0, 9 + 10 / 60));
    expect(added[0].detail.start).to.deep.equal(new Date(2026, 10, 1, 9));
  });

  it('applyTimelineGridChange replaces the event, with its new resource', () => {
    const first = review();
    const second: TimelineGridEvent = { ...review(), id: 2 };
    const start = new Date(2026, 10, 5, 9);
    const end = new Date(2026, 10, 5, 10);
    const next = applyTimelineGridChange([first, second], {
      event: second,
      start,
      end,
      resourceId: 'cedar',
    });
    expect(next[0]).to.equal(first);
    expect(next[1]).to.deep.equal({
      ...second,
      start,
      end,
      resourceId: 'cedar',
    });
    expect(second.resourceId).to.equal('aspen');
  });
});

describe('timeline grid layout', () => {
  it('gives a view its days: a week from its first day, a month in full', () => {
    const date = new Date(2026, 10, 4);
    const week = viewRange({ value: 'week', slot: 'day', days: 7 }, date, 1);
    expect(week.start).to.deep.equal(new Date(2026, 10, 2));
    expect(week.days).to.equal(7);
    const month = viewRange({ value: 'month', slot: 'day' }, date, 1);
    expect(month.start).to.deep.equal(new Date(2026, 10, 1));
    expect(month.days).to.equal(30);
    const three = viewRange({ value: '3d', slot: 'hour', days: 3 }, date, 1);
    expect(three.start).to.deep.equal(date);
    expect(three.days).to.equal(3);
  });

  it('spans whole days in day views, through the day before a midnight end', () => {
    const range = { start: new Date(2026, 10, 1), days: 7 };
    expect(
      eventSpan(range, 'day', new Date(2026, 10, 2, 9), new Date(2026, 10, 4)),
    ).to.deep.equal({ from: 1440, to: 3 * 1440 });
    expect(
      eventSpan(
        range,
        'hour',
        new Date(2026, 10, 2, 9),
        new Date(2026, 10, 2, 10, 30),
      ),
    ).to.deep.equal({ from: 1440 + 540, to: 1440 + 630 });
  });

  it('puts events that only touch in the same lane', () => {
    const a = { from: 0, to: 60 };
    const b = { from: 30, to: 90 };
    const c = { from: 60, to: 120 };
    const { lanes, laneOf } = assignLanes([a, b, c]);
    expect(lanes).to.equal(2);
    expect([laneOf.get(a), laneOf.get(b), laneOf.get(c)]).to.deep.equal([
      0, 1, 0,
    ]);
  });
});
