/// <reference types="mocha" />
import { html } from 'lit';
import { expect, fixture, oneEvent } from '@open-wc/testing';
import { Calendar } from '../src/calendar/calendar.js';
import { CalendarColumnView } from '../src/calendar/calendar-column-view.js';
import { CalendarMonthView } from '../src/calendar/calendar-month-view.js';
import {
  applyCalendarChange,
  type CalendarDateChangeDetail,
} from '../src/calendar/calendar.js';
import type {
  CalendarEventAddDetail,
  CalendarEventChangeDetail,
  EventType,
} from '../src/calendar/types.js';
import { toZonedWallClock, zonedParts } from '../src/calendar/utils.js';
import { dateToIso } from '../src/__internal/utils/date.js';

for (const [tag, element] of [
  ['wc-calendar', Calendar],
  ['wc-calendar-column-view', CalendarColumnView],
  ['wc-calendar-month-view', CalendarMonthView],
] as const) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

const events: EventType[] = [
  {
    start: new Date(2026, 10, 4, 9),
    end: new Date(2026, 10, 4, 10),
    title: 'Standup',
  },
];

function root(el: Element): ShadowRoot {
  return el.shadowRoot as ShadowRoot;
}

function view(el: Calendar): CalendarColumnView | CalendarMonthView | null {
  return root(el).querySelector<CalendarColumnView | CalendarMonthView>(
    'wc-calendar-column-view, wc-calendar-month-view',
  );
}

function viewRoot(el: Calendar): ShadowRoot {
  return root(view(el) as Element);
}

async function settle(el: Calendar) {
  await el.updateComplete;
  await view(el)?.updateComplete;
}

async function mount(template: ReturnType<typeof html>): Promise<Calendar> {
  const el = await fixture<Calendar>(template);
  await settle(el);
  return el;
}

describe('wc-calendar', () => {
  it('starts the week on first-day, else the locale week start', async () => {
    const el = await mount(
      html`<wc-calendar
        locale="en-US"
        view="week"
        date="2026-11-04"
        first-day="1"
      ></wc-calendar>`,
    );
    const first = () =>
      viewRoot(el).querySelector('.date')?.getAttribute('aria-label');
    expect(first()).to.contain('Monday, November 2, 2026');

    el.firstDay = 0;
    await settle(el);
    expect(first()).to.contain('Sunday, November 1, 2026');

    el.firstDay = undefined;
    el.locale = 'de-DE';
    await settle(el);
    // Germany starts the week on Monday.
    expect(first()).to.contain('2. November 2026');
  });

  it('starts the month grid on first-day', async () => {
    const el = await mount(
      html`<wc-calendar
        locale="en-US"
        view="month"
        date="2026-11-04"
        first-day="0"
      ></wc-calendar>`,
    );
    const cell = viewRoot(el).querySelector('[role="gridcell"]');
    expect(cell?.getAttribute('aria-label')).to.equal(
      'Sunday, November 1, 2026',
    );
  });

  it('keeps the ISO date attribute and contextDate in step', async () => {
    const el = await mount(
      html`<wc-calendar view="week" date="2026-11-04"></wc-calendar>`,
    );
    expect(el.contextDate && dateToIso(el.contextDate)).to.equal('2026-11-04');

    el.contextDate = new Date(2026, 0, 15);
    await settle(el);
    expect(el.date).to.equal('2026-01-15');

    setTimeout(() => el.next());
    const event = (await oneEvent(
      el,
      'date-change',
    )) as CustomEvent<CalendarDateChangeDetail>;
    expect(event.detail.value).to.equal('2026-01-22');
    expect(dateToIso(event.detail.date)).to.equal('2026-01-22');
    expect(el.date).to.equal('2026-01-22');
  });

  it('defaults the date to today', async () => {
    const el = await mount(html`<wc-calendar></wc-calendar>`);
    expect(el.date).to.equal(dateToIso(new Date()));
  });

  it('today() is public and moves back to today', async () => {
    const el = await mount(
      html`<wc-calendar view="week" date="2020-01-01"></wc-calendar>`,
    );
    setTimeout(() => el.today());
    const event = (await oneEvent(
      el,
      'date-change',
    )) as CustomEvent<CalendarDateChangeDetail>;
    expect(event.detail.value).to.equal(dateToIso(new Date()));
    expect(el.date).to.equal(dateToIso(new Date()));
  });

  it('shows a progress bar and aria-busy while loading', async () => {
    const el = await mount(html`<wc-calendar></wc-calendar>`);
    const body = () => root(el).querySelector('.calendar-body');
    expect(root(el).querySelector('wc-linear-progress')).to.equal(null);
    expect(body()?.getAttribute('aria-busy')).to.equal('false');
    el.loading = true;
    await settle(el);
    expect(root(el).querySelector('wc-linear-progress')).to.not.equal(null);
    expect(body()?.getAttribute('aria-busy')).to.equal('true');
  });

  it('fires event-click from a focusable event, unless events-readonly', async () => {
    const el = await mount(
      html`<wc-calendar
        view="week"
        date="2026-11-04"
        .events=${events}
      ></wc-calendar>`,
    );
    const block = () =>
      viewRoot(el).querySelector('.events-container .event') as HTMLElement;
    expect(block().getAttribute('role')).to.equal('button');
    expect(block().getAttribute('tabindex')).to.equal('0');
    expect(block().getAttribute('aria-label')).to.contain('Standup');

    setTimeout(() =>
      block().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' })),
    );
    const clicked = (await oneEvent(el, 'event-click')) as CustomEvent<{
      event: EventType;
    }>;
    expect(clicked.detail.event).to.equal(events[0]);

    el.eventsReadonly = true;
    await settle(el);
    let fired = false;
    el.addEventListener('event-click', () => {
      fired = true;
    });
    block().click();
    expect(block().hasAttribute('tabindex')).to.equal(false);
    expect(fired).to.equal(false);
  });

  it('labels the column view as a region and opens a day from its header', async () => {
    const el = await mount(
      html`<wc-calendar
        locale="en-US"
        view="week"
        date="2026-11-04"
        first-day="0"
      ></wc-calendar>`,
    );
    const region = viewRoot(el).querySelector('[role="region"]');
    expect(region?.getAttribute('aria-label')).to.contain('November 1');

    // The view's internal date-click stays inside the calendar.
    let leaked = false;
    el.addEventListener('date-click', () => {
      leaked = true;
    });
    const dates = viewRoot(el).querySelectorAll<HTMLElement>('.date');
    setTimeout(() =>
      dates[2].dispatchEvent(new KeyboardEvent('keydown', { key: ' ' })),
    );
    const change = (await oneEvent(
      el,
      'date-change',
    )) as CustomEvent<CalendarDateChangeDetail>;
    expect(change.detail.value).to.equal('2026-11-03');
    expect(el.view).to.equal('day');
    expect(leaked).to.equal(false);
  });

  it('renders the month as a grid of weeks and days', async () => {
    const el = await mount(
      html`<wc-calendar
        locale="en-US"
        view="month"
        date="2026-11-04"
        .events=${events}
      ></wc-calendar>`,
    );
    const grid = viewRoot(el).querySelector('[role="grid"]');
    expect(grid?.getAttribute('aria-label')).to.equal('November 2026');
    expect(viewRoot(el).querySelectorAll('[role="row"]').length).to.equal(7);
    expect(
      viewRoot(el).querySelectorAll('[role="columnheader"]').length,
    ).to.equal(7);
    expect(viewRoot(el).querySelectorAll('[role="gridcell"]').length).to.equal(
      42,
    );
    const event = viewRoot(el).querySelector('.event') as HTMLElement;
    const owner = viewRoot(el).querySelector(`[aria-owns~="${event.id}"]`);
    expect(owner?.getAttribute('aria-label')).to.contain('November 4, 2026');
  });

  it('labels the previous, next and today buttons', async () => {
    const el = await mount(html`<wc-calendar></wc-calendar>`);
    const labels = [...root(el).querySelectorAll('wc-icon-button')].map(b =>
      b.getAttribute('aria-label'),
    );
    expect(labels).to.deep.equal(['Previous', 'Next']);
    expect(root(el).querySelector('wc-button')?.textContent?.trim()).to.equal(
      'Today',
    );
  });
});

describe('calendar time zones', () => {
  it('reads wall-clock parts in a zone with formatToParts', () => {
    const instant = new Date(Date.UTC(2026, 0, 15, 12, 30, 15));
    expect(zonedParts(instant, 'America/New_York')).to.deep.equal({
      year: 2026,
      month: 1,
      day: 15,
      hour: 7,
      minute: 30,
      second: 15,
    });
    expect(zonedParts(instant, 'Asia/Tokyo').hour).to.equal(21);
    // Crosses the date line.
    expect(
      zonedParts(new Date(Date.UTC(2026, 0, 15, 20)), 'Pacific/Auckland'),
    ).to.include({ day: 16, hour: 9 });
    expect(zonedParts(new Date(Date.UTC(2026, 0, 15, 0)), 'UTC').hour).to.equal(
      0,
    );
  });

  it('builds a local date showing the zone wall clock', () => {
    const instant = new Date(Date.UTC(2026, 6, 1, 23, 5));
    const wall = toZonedWallClock(instant, 'Europe/Paris');
    expect(wall.getFullYear()).to.equal(2026);
    expect(wall.getMonth()).to.equal(6);
    expect(wall.getDate()).to.equal(2);
    expect(wall.getHours()).to.equal(1);
    expect(wall.getMinutes()).to.equal(5);
    expect(toZonedWallClock(instant, '').valueOf()).to.equal(instant.valueOf());
    expect(toZonedWallClock(instant, 'Not/AZone').valueOf()).to.equal(
      instant.valueOf(),
    );
  });
});

// ── Editing

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
function drag(target: Element, from: Point, to: Point, init: PointerInit = {}) {
  target.dispatchEvent(pointer('pointerdown', from, init));
  for (let step = 1; step <= 4; step += 1) {
    const at = {
      x: from.x + ((to.x - from.x) * step) / 4,
      y: from.y + ((to.y - from.y) * step) / 4,
    };
    document.body.dispatchEvent(pointer('pointermove', at, init));
  }
  document.body.dispatchEvent(pointer('pointerup', to, init));
}

/** Presses and releases `target` at `at` without moving. */
function tap(target: Element, at: Point) {
  target.dispatchEvent(pointer('pointerdown', at));
  document.body.dispatchEvent(pointer('pointerup', at));
}

function center(element: Element): Point {
  const rect = element.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

/** A point in the hours of a column view: in the column of day `index`, `hours` after midnight. */
function timedPoint(el: Calendar, index: number, hours: number): Point {
  const area = (
    viewRoot(el).querySelector('.events-container') as HTMLElement
  ).getBoundingClientRect();
  const column = viewRoot(el)
    .querySelectorAll('.events-container > .column')
    [index].getBoundingClientRect();
  return {
    x: column.left + column.width / 2,
    y: area.top + (hours / 24) * area.height,
  };
}

/** The centre of day `index` in the all-day row of a column view. */
function allDayPoint(el: Calendar, index: number): Point {
  const column = viewRoot(el).querySelectorAll(
    '.multi-day-background .columns > .column',
  )[index];
  return center(column);
}

function collect<T>(el: Element, type: string): CustomEvent<T>[] {
  const fired: CustomEvent<T>[] = [];
  el.addEventListener(type, event => fired.push(event as CustomEvent<T>));
  return fired;
}

/** Waits for the live region, which is filled after a tick. */
async function announcement(el: Calendar): Promise<string> {
  await new Promise(resolve => {
    setTimeout(resolve);
  });
  await el.updateComplete;
  return root(el).querySelector('[role="status"]')?.textContent?.trim() ?? '';
}

// Tall enough that the whole day fits without scrolling, so drags never auto-scroll.
const SIZE = 'height: 1900px; width: 1000px';

/** Mounts a calendar from markup, with `list` as its events. */
async function mountWith(template: string, list: EventType[]) {
  const host = document.createElement('div');
  host.innerHTML = template;
  const el = host.firstElementChild as Calendar;
  el.events = list;
  const mounted = await fixture<Calendar>(el);
  await settle(mounted);
  return mounted;
}

/** A week view of November 1–7, 2026 (Sunday to Saturday). */
function week(list: EventType[], attributes = 'editable addable') {
  const template = `<wc-calendar locale="en-US" view="week" date="2026-11-04" first-day="0" style="${SIZE}" ${attributes}></wc-calendar>`;
  return mountWith(template, list);
}

describe('calendar editing', () => {
  const standup = (): EventType => ({
    id: 'standup',
    title: 'Standup',
    start: new Date(2026, 10, 4, 9),
    end: new Date(2026, 10, 4, 10),
  });

  it('adds an event by dragging across empty time, snapped to minute-step', async () => {
    const el = await week([]);
    const added = collect<CalendarEventAddDetail>(el, 'event-add');
    const area = viewRoot(el).querySelector('.drawing-area') as HTMLElement;
    drag(area, timedPoint(el, 3, 13 + 2 / 60), timedPoint(el, 3, 14 + 28 / 60));
    expect(added.length).to.equal(1);
    expect(added[0].detail).to.deep.equal({
      start: new Date(2026, 10, 4, 13),
      end: new Date(2026, 10, 4, 14, 30),
      allDay: false,
    });

    // Dragging upwards keeps the slot pressed.
    drag(area, timedPoint(el, 1, 10 + 5 / 60), timedPoint(el, 1, 8 + 20 / 60));
    expect(added[1].detail.start).to.deep.equal(new Date(2026, 10, 2, 8, 15));
    expect(added[1].detail.end).to.deep.equal(new Date(2026, 10, 2, 10, 15));
  });

  it('adds a default-duration event by clicking empty time, and marks it until events change', async () => {
    const el = await week([], 'addable default-duration="30"');
    const added = collect<CalendarEventAddDetail>(el, 'event-add');
    const area = viewRoot(el).querySelector('.drawing-area') as HTMLElement;
    tap(area, timedPoint(el, 4, 9 + 40 / 60));
    expect(added.length).to.equal(1);
    expect(added[0].detail).to.deep.equal({
      start: new Date(2026, 10, 5, 9, 30),
      end: new Date(2026, 10, 5, 10),
      allDay: false,
    });
    expect(await announcement(el)).to.contain('New event, Nov 5, 2026');
    await settle(el);
    const placeholder = () => viewRoot(el).querySelector('.event.placeholder');
    expect(placeholder()?.textContent).to.contain('New event');

    el.clearPlaceholder();
    await settle(el);
    expect(placeholder() === null).to.equal(true);

    tap(area, timedPoint(el, 4, 15));
    await settle(el);
    expect(placeholder() !== null).to.equal(true);
    el.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    await settle(el);
    expect(placeholder() === null).to.equal(true);

    tap(area, timedPoint(el, 4, 15));
    await settle(el);
    el.events = [{ title: 'Review', ...added[2].detail }];
    await settle(el);
    expect(placeholder() === null).to.equal(true);
  });

  it('does not add events without addable, or by pressing an event', async () => {
    const el = await week([standup()], 'editable');
    const added = collect<CalendarEventAddDetail>(el, 'event-add');
    const area = viewRoot(el).querySelector('.drawing-area') as HTMLElement;
    tap(area, timedPoint(el, 2, 12));
    expect(added.length).to.equal(0);

    el.editable = false;
    el.addable = true;
    await settle(el);
    const block = viewRoot(el).querySelector('.events-container .event');
    tap(block as Element, timedPoint(el, 3, 9.5));
    expect(added.length).to.equal(0);
  });

  it('moves an event to another day and time, and applies the change', async () => {
    const original = standup();
    const el = await week([original]);
    const changes = collect<CalendarEventChangeDetail>(el, 'event-change');
    const clicks = collect(el, 'event-click');
    const block = viewRoot(el).querySelector(
      '.events-container .event',
    ) as HTMLElement;
    expect(block.classList.contains('editable')).to.equal(true);
    drag(block, timedPoint(el, 3, 9.5), timedPoint(el, 5, 11.5));
    // The click that ends a drag does not open the event.
    block.click();
    expect(clicks.length).to.equal(0);

    expect(changes.length).to.equal(1);
    expect(changes[0].cancelable).to.equal(true);
    expect(changes[0].detail).to.deep.equal({
      event: original,
      start: new Date(2026, 10, 6, 11),
      end: new Date(2026, 10, 6, 12),
      action: 'move',
    });
    expect(el.events[0]).to.not.equal(original);
    expect(el.events[0]).to.include({ id: 'standup', title: 'Standup' });
    expect(el.events[0].start).to.deep.equal(new Date(2026, 10, 6, 11));
    expect(original.start).to.deep.equal(new Date(2026, 10, 4, 9));
    expect(await announcement(el)).to.equal(
      'Moved Standup to Nov 6, 2026, 11:00 AM – 12:00 PM.',
    );
  });

  it('resizes an event by its end and start handles', async () => {
    const el = await week([standup()]);
    const changes = collect<CalendarEventChangeDetail>(el, 'event-change');
    const handle = (edge: string) =>
      viewRoot(el).querySelector(
        `.events-container .resize-handle.${edge}`,
      ) as HTMLElement;

    drag(handle('end'), timedPoint(el, 3, 10), timedPoint(el, 3, 11.25));
    expect(changes[0].detail.action).to.equal('resize');
    expect(changes[0].detail.start).to.deep.equal(new Date(2026, 10, 4, 9));
    expect(changes[0].detail.end).to.deep.equal(new Date(2026, 10, 4, 11, 15));
    await settle(el);

    drag(handle('start'), timedPoint(el, 3, 9), timedPoint(el, 3, 8.5));
    expect(changes[1].detail.start).to.deep.equal(new Date(2026, 10, 4, 8, 30));
    expect(changes[1].detail.end).to.deep.equal(new Date(2026, 10, 4, 11, 15));
    await settle(el);

    // An end dragged above the start stops one step after it.
    drag(handle('end'), timedPoint(el, 3, 11.25), timedPoint(el, 3, 6));
    expect(changes[2].detail.end).to.deep.equal(new Date(2026, 10, 4, 8, 45));
  });

  it('keeps the event when event-change is canceled, and on Escape', async () => {
    const original = standup();
    const el = await week([original]);
    const list = el.events;
    el.addEventListener('event-change', event => event.preventDefault());
    const block = () =>
      viewRoot(el).querySelector('.events-container .event') as HTMLElement;
    drag(block(), timedPoint(el, 3, 9.5), timedPoint(el, 3, 13));
    expect(el.events).to.equal(list);
    expect(el.events[0]).to.equal(original);

    const changes = collect<CalendarEventChangeDetail>(el, 'event-change');
    const start = timedPoint(el, 3, 9.5);
    block().dispatchEvent(pointer('pointerdown', start));
    document.body.dispatchEvent(pointer('pointermove', timedPoint(el, 3, 12)));
    await settle(el);
    expect(viewRoot(el).querySelector('.event.preview') !== null).to.equal(
      true,
    );
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    document.body.dispatchEvent(pointer('pointerup', timedPoint(el, 3, 12)));
    await settle(el);
    expect(changes.length).to.equal(0);
    expect(viewRoot(el).querySelector('.event.preview') === null).to.equal(
      true,
    );
  });

  it('still opens an editable event on a click without movement', async () => {
    const el = await week([standup()]);
    const block = viewRoot(el).querySelector(
      '.events-container .event',
    ) as HTMLElement;
    const at = timedPoint(el, 3, 9.5);
    setTimeout(() => {
      tap(block, at);
      block.click();
    });
    const clicked = (await oneEvent(el, 'event-click')) as CustomEvent<{
      event: EventType;
    }>;
    expect(clicked.detail.event.title).to.equal('Standup');
  });

  it('does not drag with events-readonly, or events with editable: false', async () => {
    const locked = { ...standup(), id: 'locked', editable: false };
    const el = await week([locked]);
    const changes = collect<CalendarEventChangeDetail>(el, 'event-change');
    const block = () =>
      viewRoot(el).querySelector('.events-container .event') as HTMLElement;
    expect(block().classList.contains('editable')).to.equal(false);
    expect(block().querySelector('.resize-handle') === null).to.equal(true);
    drag(block(), timedPoint(el, 3, 9.5), timedPoint(el, 3, 13));
    expect(changes.length).to.equal(0);

    el.events = [standup()];
    el.eventsReadonly = true;
    await settle(el);
    expect(block().querySelector('.resize-handle') === null).to.equal(true);
    drag(block(), timedPoint(el, 3, 9.5), timedPoint(el, 3, 13));
    expect(changes.length).to.equal(0);
  });

  it('drags an event on a touch screen only after holding it', async () => {
    const el = await week([standup()]);
    const changes = collect<CalendarEventChangeDetail>(el, 'event-change');
    const block = viewRoot(el).querySelector(
      '.events-container .event',
    ) as HTMLElement;
    const touch = { pointerType: 'touch' };

    // Moving at once is a scroll.
    drag(block, timedPoint(el, 3, 9.5), timedPoint(el, 3, 12), touch);
    expect(changes.length).to.equal(0);

    block.dispatchEvent(pointer('pointerdown', timedPoint(el, 3, 9.5), touch));
    await new Promise(resolve => {
      setTimeout(resolve, 350);
    });
    document.body.dispatchEvent(
      pointer('pointermove', timedPoint(el, 3, 12.5), touch),
    );
    document.body.dispatchEvent(
      pointer('pointerup', timedPoint(el, 3, 12.5), touch),
    );
    expect(changes.length).to.equal(1);
    expect(changes[0].detail.start).to.deep.equal(new Date(2026, 10, 4, 12));
  });

  it('draws all-day events through the day before a midnight end', async () => {
    const el = await week([
      {
        title: 'Offsite',
        start: new Date(2026, 10, 2),
        end: new Date(2026, 10, 4),
      },
      {
        title: 'Late call',
        start: new Date(2026, 10, 4, 23),
        end: new Date(2026, 10, 5),
      },
    ]);
    const bar = viewRoot(el).querySelector(
      '.multi-events .event',
    ) as HTMLElement;
    const columns = viewRoot(el).querySelectorAll(
      '.multi-day-background .columns > .column',
    );
    const { width } = bar.getBoundingClientRect();
    const twoDays =
      columns[2].getBoundingClientRect().right -
      columns[1].getBoundingClientRect().left;
    expect(Math.abs(width - twoDays)).to.be.lessThan(12);
    expect(bar.getAttribute('aria-label')).to.equal('Offsite, Nov 2 – 3, 2026');

    // An event ending at midnight leaves the next day's column empty.
    const thursday = viewRoot(el).querySelectorAll(
      '.events-container > .column',
    )[4];
    expect(thursday.querySelectorAll('.event').length).to.equal(0);
  });

  it('moves, resizes and adds all-day events by whole days', async () => {
    const offsite = {
      title: 'Offsite',
      start: new Date(2026, 10, 2),
      end: new Date(2026, 10, 4),
    };
    const el = await week([offsite]);
    const changes = collect<CalendarEventChangeDetail>(el, 'event-change');
    const added = collect<CalendarEventAddDetail>(el, 'event-add');
    const bar = () =>
      viewRoot(el).querySelector('.multi-events .event') as HTMLElement;

    drag(bar(), allDayPoint(el, 1), allDayPoint(el, 4));
    expect(changes[0].detail).to.deep.include({
      start: new Date(2026, 10, 5),
      end: new Date(2026, 10, 7),
      action: 'move',
    });
    await settle(el);

    const endHandle = bar().querySelector('.resize-handle.end') as HTMLElement;
    drag(endHandle, allDayPoint(el, 5), allDayPoint(el, 6));
    expect(changes[1].detail).to.deep.include({
      start: new Date(2026, 10, 5),
      end: new Date(2026, 10, 8),
      action: 'resize',
    });
    await settle(el);

    const strip = viewRoot(el).querySelector('.multi-events') as HTMLElement;
    const { y } = center(strip);
    drag(strip, { x: allDayPoint(el, 2).x, y }, { x: allDayPoint(el, 0).x, y });
    expect(added[0].detail).to.deep.equal({
      start: new Date(2026, 10, 1),
      end: new Date(2026, 10, 4),
      allDay: true,
    });
  });

  it('moves events between days, resizes and adds all-day events in the month view', async () => {
    const original = standup();
    const trip = {
      title: 'Trip',
      start: new Date(2026, 10, 16),
      end: new Date(2026, 10, 18),
    };
    const el = await mountWith(
      `<wc-calendar locale="en-US" view="month" date="2026-11-04" first-day="0" style="${SIZE}" editable addable></wc-calendar>`,
      [original, trip],
    );
    const changes = collect<CalendarEventChangeDetail>(el, 'event-change');
    const added = collect<CalendarEventAddDetail>(el, 'event-add');
    const cells = () =>
      viewRoot(el).querySelectorAll<HTMLElement>('[role="gridcell"]');
    // The grid starts on Sunday, November 1.
    const cell = (day: number) => cells()[day - 1];
    const eventTitled = (title: string) =>
      [...viewRoot(el).querySelectorAll<HTMLElement>('.event')].find(event =>
        event.textContent?.includes(title),
      ) as HTMLElement;

    const tripBar = eventTitled('Trip');
    const weekWidth = (
      viewRoot(el).querySelector('.multi-events') as HTMLElement
    ).getBoundingClientRect().width;
    expect(
      Math.abs(tripBar.getBoundingClientRect().width - (weekWidth * 2) / 7),
    ).to.be.lessThan(12);

    drag(eventTitled('Standup'), center(cell(4)), center(cell(12)));
    expect(changes[0].detail).to.deep.equal({
      event: original,
      start: new Date(2026, 10, 12, 9),
      end: new Date(2026, 10, 12, 10),
      action: 'move',
    });
    await settle(el);
    // Timed events have no handles in the month view.
    expect(
      eventTitled('Standup').querySelector('.resize-handle') === null,
    ).to.equal(true);

    const startHandle = eventTitled('Trip').querySelector(
      '.resize-handle.start',
    ) as HTMLElement;
    drag(startHandle, center(cell(16)), center(cell(14)));
    expect(changes[1].detail).to.deep.include({
      start: new Date(2026, 10, 14),
      end: new Date(2026, 10, 18),
      action: 'resize',
    });
    await settle(el);

    drag(cell(9), center(cell(9)), center(cell(11)));
    expect(added[0].detail).to.deep.equal({
      start: new Date(2026, 10, 9),
      end: new Date(2026, 10, 12),
      allDay: true,
    });
    await settle(el);
    const highlighted = [...cells()].filter(c =>
      c.classList.contains('drop-target'),
    );
    expect(highlighted.length).to.equal(3);

    tap(cell(20), center(cell(20)));
    expect(added[1].detail).to.deep.equal({
      start: new Date(2026, 10, 20),
      end: new Date(2026, 10, 21),
      allDay: true,
    });
  });

  it('moves an event that crosses midnight by the point it was grabbed', async () => {
    const late = {
      title: 'Late deploy',
      start: new Date(2026, 10, 4, 22),
      end: new Date(2026, 10, 5, 2),
    };
    const el = await week([late]);
    const changes = collect<CalendarEventChangeDetail>(el, 'event-change');
    const blocks = () =>
      viewRoot(el).querySelectorAll<HTMLElement>('.events-container .event');
    expect(blocks().length).to.equal(2);

    // The part after midnight, grabbed at 1:00 and dragged half an hour down.
    drag(blocks()[1], timedPoint(el, 4, 1), timedPoint(el, 4, 1.5));
    expect(changes[0].detail.start).to.deep.equal(
      new Date(2026, 10, 4, 22, 30),
    );
    expect(changes[0].detail.end).to.deep.equal(new Date(2026, 10, 5, 2, 30));
    await settle(el);

    // The part before midnight, dragged a quarter of an hour up.
    drag(blocks()[0], timedPoint(el, 3, 23.5), timedPoint(el, 3, 23.25));
    expect(changes[1].detail.start).to.deep.equal(
      new Date(2026, 10, 4, 22, 15),
    );
    expect(changes[1].detail.end).to.deep.equal(new Date(2026, 10, 5, 2, 15));
  });

  it('keeps the start handle while a resize makes the event short', async () => {
    const el = await week([standup()]);
    const changes = collect<CalendarEventChangeDetail>(el, 'event-change');
    const handle = viewRoot(el).querySelector(
      '.events-container .resize-handle.start',
    ) as HTMLElement;
    handle.dispatchEvent(pointer('pointerdown', timedPoint(el, 3, 9)));
    document.body.dispatchEvent(
      pointer('pointermove', timedPoint(el, 3, 9.75)),
    );
    await settle(el);
    // Touch events keep going to the element first touched; it must stay in the page.
    expect(handle.isConnected).to.equal(true);
    document.body.dispatchEvent(pointer('pointerup', timedPoint(el, 3, 9.75)));
    expect(changes[0].detail.start).to.deep.equal(new Date(2026, 10, 4, 9, 45));
  });

  it('ends a mouse drag whose button was released out of sight', async () => {
    const el = await week([standup()]);
    const changes = collect<CalendarEventChangeDetail>(el, 'event-change');
    const block = viewRoot(el).querySelector(
      '.events-container .event',
    ) as HTMLElement;
    block.dispatchEvent(pointer('pointerdown', timedPoint(el, 3, 9.5)));
    document.body.dispatchEvent(pointer('pointermove', timedPoint(el, 3, 12)));
    document.body.dispatchEvent(
      pointer('pointermove', timedPoint(el, 3, 13), { buttons: 0 }),
    );
    document.body.dispatchEvent(pointer('pointerup', timedPoint(el, 3, 13)));
    await settle(el);
    expect(changes.length).to.equal(0);
    expect(viewRoot(el).querySelector('.dragging') === null).to.equal(true);
  });

  it('does not open an event when a drag canceled with Escape is released on it', async () => {
    const el = await week([standup()]);
    const clicks = collect(el, 'event-click');
    const block = viewRoot(el).querySelector(
      '.events-container .event',
    ) as HTMLElement;
    const at = timedPoint(el, 3, 9.5);
    block.dispatchEvent(pointer('pointerdown', at));
    document.body.dispatchEvent(pointer('pointermove', timedPoint(el, 3, 11)));
    document.body.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    document.body.dispatchEvent(pointer('pointerup', at));
    block.click();
    expect(clicks.length).to.equal(0);
  });

  it('blurs the dragged event, so focus cannot land on another after the drop', async () => {
    const el = await week([
      standup(),
      {
        ...standup(),
        id: 'other',
        title: 'Other',
        start: new Date(2026, 10, 4, 11),
        end: new Date(2026, 10, 4, 12),
      },
    ]);
    const block = viewRoot(el).querySelector(
      '.events-container .event',
    ) as HTMLElement;
    block.focus();
    expect(viewRoot(el).activeElement === block).to.equal(true);
    drag(block, timedPoint(el, 3, 9.5), timedPoint(el, 6, 9.5));
    await settle(el);
    expect(viewRoot(el).activeElement === null).to.equal(true);
  });

  it('shows events changed in place after requestUpdate()', async () => {
    const el = await week([standup()], '');
    el.events.push({
      title: 'Review',
      start: new Date(2026, 10, 5, 9),
      end: new Date(2026, 10, 5, 10),
    });
    el.requestUpdate();
    await settle(el);
    expect(
      viewRoot(el).querySelectorAll('.events-container .event').length,
    ).to.equal(2);
  });

  it('clears the placeholder on Escape while focus is on the page', async () => {
    const el = await week([], 'addable');
    const area = viewRoot(el).querySelector('.drawing-area') as HTMLElement;
    tap(area, timedPoint(el, 2, 15));
    await settle(el);
    const placeholder = () => viewRoot(el).querySelector('.event.placeholder');
    expect(placeholder() !== null).to.equal(true);
    document.body.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    await settle(el);
    expect(placeholder() === null).to.equal(true);
  });

  // These hold in any time zone; run the suite with TZ=America/New_York (the clocks go back on
  // November 1, 2026) or TZ=America/Santiago (they skip midnight on September 6, 2026) to test the
  // days the clocks change.
  it('lands clicks on the row under the pointer on the day the clocks go back', async () => {
    const el = await week([], 'addable');
    const added = collect<CalendarEventAddDetail>(el, 'event-add');
    const area = viewRoot(el).querySelector('.drawing-area') as HTMLElement;
    tap(area, timedPoint(el, 0, 9 + 10 / 60));
    expect(added[0].detail.start).to.deep.equal(new Date(2026, 10, 1, 9));
    expect(added[0].detail.end).to.deep.equal(new Date(2026, 10, 1, 10));
  });

  it('drops events on the row under the pointer on the day the clocks go back', async () => {
    const monday = {
      title: 'Planning',
      start: new Date(2026, 10, 2, 9),
      end: new Date(2026, 10, 2, 10),
    };
    const el = await week([monday], 'editable');
    const changes = collect<CalendarEventChangeDetail>(el, 'event-change');
    const block = viewRoot(el).querySelector(
      '.events-container .event',
    ) as HTMLElement;
    drag(block, timedPoint(el, 1, 9.5), timedPoint(el, 0, 13.5));
    expect(changes[0].detail.start).to.deep.equal(new Date(2026, 10, 1, 13));
    expect(changes[0].detail.end).to.deep.equal(new Date(2026, 10, 1, 14));
  });

  it('adds whole days from midnight after a day whose midnight was skipped', async () => {
    const el = await mountWith(
      `<wc-calendar locale="en-US" view="week" date="2026-09-09" first-day="0" style="${SIZE}" addable></wc-calendar>`,
      [],
    );
    const added = collect<CalendarEventAddDetail>(el, 'event-add');
    const strip = viewRoot(el).querySelector('.multi-events') as HTMLElement;
    tap(strip, { x: allDayPoint(el, 1).x, y: center(strip).y });
    expect(added[0].detail).to.deep.equal({
      start: new Date(2026, 8, 7),
      end: new Date(2026, 8, 8),
      allDay: true,
    });
  });

  it('applyCalendarChange replaces the event by identity, else by id', () => {
    const first = standup();
    const second: EventType = {
      id: 2,
      title: 'Review',
      start: new Date(2026, 10, 5, 9),
      end: new Date(2026, 10, 5, 10),
    };
    const start = new Date(2026, 10, 6, 9);
    const end = new Date(2026, 10, 6, 11);
    const next = applyCalendarChange([first, second], {
      event: second,
      start,
      end,
    });
    expect(next[0]).to.equal(first);
    expect(next[1]).to.deep.equal({ ...second, start, end });
    expect(second.start).to.deep.equal(new Date(2026, 10, 5, 9));

    const byId = applyCalendarChange(next, { event: second, start: end, end });
    expect(byId[1].start).to.deep.equal(end);
  });
});
