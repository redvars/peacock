/// <reference types="mocha" />
import { html } from 'lit';
import { expect, fixture, oneEvent } from '@open-wc/testing';
import { Calendar } from '../src/calendar/calendar.js';
import { CalendarColumnView } from '../src/calendar/calendar-column-view.js';
import { CalendarMonthView } from '../src/calendar/calendar-month-view.js';
import type { CalendarDateChangeDetail } from '../src/calendar/calendar.js';
import type { EventType } from '../src/calendar/types.js';
import { toZonedWallClock, zonedParts } from '../src/calendar/utils.js';
import { resetDeprecationWarnings } from '../src/__internal/utils/deprecate.js';
import { dateToIso } from '../src/__internal/utils/date.js';

for (const [tag, element] of [
  ['wc-calendar', Calendar],
  ['wc-calendar-column-view', CalendarColumnView],
  ['wc-calendar-month-view', CalendarMonthView],
] as const) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

/** Replaces console.warn and records its messages. */
function stubWarn() {
  const original = console.warn;
  const messages: string[] = [];
  console.warn = (...args: unknown[]) => {
    messages.push(args.map(String).join(' '));
  };
  return {
    messages,
    restore() {
      console.warn = original;
    },
  };
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

  it('keeps show-loader working as a deprecated alias of loading', async () => {
    resetDeprecationWarnings();
    const warn = stubWarn();
    try {
      const el = await mount(html`<wc-calendar show-loader></wc-calendar>`);
      expect(root(el).querySelector('wc-linear-progress')).to.not.equal(null);
      expect(warn.messages.some(m => m.includes('show-loader'))).to.equal(true);
    } finally {
      warn.restore();
    }
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

  it('keeps event-clickable=false working with a deprecation warning', async () => {
    resetDeprecationWarnings();
    const warn = stubWarn();
    try {
      const el = await mount(
        html`<wc-calendar
          view="week"
          date="2026-11-04"
          .eventClickable=${false}
          .events=${events}
        ></wc-calendar>`,
      );
      const block = viewRoot(el).querySelector(
        '.events-container .event',
      ) as HTMLElement;
      expect(block.classList.contains('clickable')).to.equal(false);
      expect(warn.messages.some(m => m.includes('event-clickable'))).to.equal(
        true,
      );
    } finally {
      warn.restore();
    }
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
