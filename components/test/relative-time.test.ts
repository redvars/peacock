/// <reference types="mocha" />
import { html } from 'lit';
import { expect, fixtureSync, waitUntil } from '@open-wc/testing';
import { RelativeTime } from '../src/relative-time/index.js';
import {
  DAY,
  HOUR,
  MINUTE,
  SECOND,
  formatAbsoluteDate,
  formatRelativeTime,
  formatTime,
  onTick,
  parseDuration,
  refreshInterval,
  tickerRunning,
  watchRelativeTime,
} from '../src/__internal/utils/relative-time.js';

if (!customElements.get('wc-relative-time')) {
  customElements.define('wc-relative-time', RelativeTime);
}

async function setup(template: ReturnType<typeof html>) {
  const el = fixtureSync<RelativeTime>(template);
  await el.updateComplete;
  return el;
}

function timeOf(el: RelativeTime) {
  return el.shadowRoot!.querySelector('time');
}

const ago = (ms: number) => new Date(Date.now() - ms).toISOString();

/** Counts the timers started while `action` runs (synchronously, so nothing else interferes). */
function timersStarted(action: () => void): number {
  const original = window.setTimeout;
  let started = 0;
  window.setTimeout = ((...args: Parameters<typeof window.setTimeout>) => {
    started += 1;
    return original.apply(window, args);
  }) as typeof window.setTimeout;
  try {
    action();
  } finally {
    window.setTimeout = original;
  }
  return started;
}

describe('relative time formatting', () => {
  const now = Date.parse('2026-11-07T12:00:00Z');

  it('formats past and future times in the locale', () => {
    const at = (iso: string) =>
      formatRelativeTime(new Date(iso), 'en', { now });
    expect(at('2026-11-07T11:59:50Z')).to.equal('now');
    expect(at('2026-11-07T11:55:00Z')).to.equal('5 minutes ago');
    expect(at('2026-11-07T09:00:00Z')).to.equal('3 hours ago');
    expect(at('2026-11-06T12:00:00Z')).to.equal('yesterday');
    expect(at('2026-11-10T12:00:00Z')).to.equal('in 3 days');
    expect(at('2026-10-24T12:00:00Z')).to.equal('2 weeks ago');
    expect(at('2026-08-07T12:00:00Z')).to.equal('3 months ago');
    expect(at('2024-11-07T12:00:00Z')).to.equal('2 years ago');
    expect(
      formatRelativeTime(Date.parse('2026-11-07T11:55:00Z'), 'de', { now }),
    ).to.equal('vor 5 Minuten');
  });

  it('takes numeric and style', () => {
    const yesterday = now - DAY;
    expect(
      formatRelativeTime(yesterday, 'en', { now, numeric: 'always' }),
    ).to.equal('1 day ago');
    expect(
      formatRelativeTime(now - 5 * MINUTE, 'en', { now, style: 'short' }),
    ).to.equal('5 min. ago');
  });

  it('switches to a date beyond absoluteAfter', () => {
    const fiveDays = now - 5 * DAY;
    expect(formatTime(fiveDays, 'en', { now })).to.equal('5 days ago');
    expect(
      formatTime(fiveDays, 'en', { now, absoluteAfter: 7 * DAY }),
    ).to.equal('5 days ago');
    expect(
      formatTime(Date.parse('2026-10-02T12:00:00Z'), 'en', {
        now,
        absoluteAfter: 7 * DAY,
      }),
    ).to.equal('Oct 2');
    expect(
      formatAbsoluteDate(Date.parse('2025-11-02T12:00:00Z'), 'en', now),
    ).to.equal('Nov 2, 2025');
  });

  it('parses ISO 8601 durations', () => {
    expect(parseDuration('P7D')).to.equal(7 * DAY);
    expect(parseDuration('PT12H')).to.equal(12 * HOUR);
    expect(parseDuration('P1DT30M')).to.equal(DAY + 30 * MINUTE);
    expect(parseDuration('P2W')).to.equal(14 * DAY);
    expect(parseDuration('P')).to.be.null;
    expect(parseDuration('PT')).to.be.null;
    expect(parseDuration('7 days')).to.be.null;
    expect(parseDuration('')).to.be.null;
  });

  it('refreshes often near now and rarely far away', () => {
    expect(refreshInterval(-20 * SECOND)).to.equal(10 * SECOND);
    expect(refreshInterval(-20 * MINUTE)).to.equal(MINUTE);
    expect(refreshInterval(-5 * HOUR)).to.equal(5 * MINUTE);
    expect(refreshInterval(-3 * DAY)).to.equal(HOUR);
  });
});

describe('shared ticker', () => {
  // Background test pages may be hidden; the ticker only runs on a visible page.
  let visibility: 'visible' | 'hidden' = 'visible';
  beforeEach(() => {
    visibility = 'visible';
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => visibility,
    });
  });
  afterEach(() => {
    delete (document as { visibilityState?: unknown }).visibilityState;
  });

  it('serves every subscriber with one timer and stops after the last leaves', async () => {
    let a = 0;
    let b = 0;
    let stopA = () => {};
    let stopB = () => {};
    expect(tickerRunning()).to.be.false;
    expect(
      timersStarted(() => {
        stopA = onTick(
          () => {
            a += 1;
          },
          () => SECOND,
        );
      }),
    ).to.equal(1);
    // A later subscriber is served by the same timer.
    expect(
      timersStarted(() => {
        stopB = onTick(
          () => {
            b += 1;
          },
          () => 10 * SECOND,
        );
      }),
    ).to.equal(0);
    await waitUntil(() => a > 0, 'the first subscriber ticks', {
      timeout: 3000,
    });
    expect(b).to.equal(0);
    expect(tickerRunning()).to.be.true;
    stopA();
    expect(tickerRunning()).to.be.true;
    stopB();
    expect(tickerRunning()).to.be.false;
  });

  it('pauses while the page is hidden and refreshes everyone when shown', () => {
    let calls = 0;
    const stop = watchRelativeTime(
      () => new Date(),
      () => {
        calls += 1;
      },
    );
    expect(tickerRunning()).to.be.true;
    visibility = 'hidden';
    document.dispatchEvent(new Event('visibilitychange'));
    expect(tickerRunning()).to.be.false;
    visibility = 'visible';
    document.dispatchEvent(new Event('visibilitychange'));
    expect(calls).to.equal(1);
    expect(tickerRunning()).to.be.true;
    stop();
    expect(tickerRunning()).to.be.false;
  });
});

describe('wc-relative-time', () => {
  it('renders the relative time in a time element titled with the absolute time', async () => {
    const datetime = ago(5 * MINUTE);
    const el = await setup(
      html`<wc-relative-time
        lang="en"
        datetime=${datetime}
      ></wc-relative-time>`,
    );
    const time = timeOf(el)!;
    expect(time.textContent).to.equal('5 minutes ago');
    expect(time.getAttribute('datetime')).to.equal(datetime);
    expect(time.title).to.equal(
      new Intl.DateTimeFormat('en', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(datetime)),
    );
  });

  it('takes numeric, format-style and the locale', async () => {
    const el = await setup(
      html`<wc-relative-time
        lang="en"
        datetime=${ago(DAY)}
        numeric="always"
      ></wc-relative-time>`,
    );
    expect(timeOf(el)!.textContent).to.equal('1 day ago');
    el.numeric = 'auto';
    await el.updateComplete;
    expect(timeOf(el)!.textContent).to.equal('yesterday');

    el.datetime = ago(5 * MINUTE);
    el.formatStyle = 'short';
    await el.updateComplete;
    expect(timeOf(el)!.textContent).to.equal('5 min. ago');

    el.locale = 'de';
    el.formatStyle = 'long';
    await el.updateComplete;
    expect(timeOf(el)!.textContent).to.equal('vor 5 Minuten');
  });

  it('shows a date beyond absolute-after', async () => {
    const date = new Date(Date.now() - 30 * DAY);
    const el = await setup(
      html`<wc-relative-time
        lang="en"
        datetime=${date.toISOString()}
        absolute-after="P7D"
      ></wc-relative-time>`,
    );
    expect(timeOf(el)!.textContent).to.equal(formatAbsoluteDate(date, 'en'));
    el.absoluteAfter = undefined;
    await el.updateComplete;
    expect(timeOf(el)!.textContent).to.equal('last month');
  });

  it('shows its content while the datetime is not a date', async () => {
    const el = await setup(
      html`<wc-relative-time datetime="soon">Nov 7, 2026</wc-relative-time>`,
    );
    expect(timeOf(el)).to.be.null;
    expect(el.shadowRoot!.querySelector('slot')).to.exist;
  });

  it('falls back to the long style for an unknown format-style', async () => {
    const el = await setup(
      html`<wc-relative-time
        lang="en"
        datetime=${ago(5 * MINUTE)}
        format-style="tiny"
      ></wc-relative-time>`,
    );
    expect(timeOf(el)!.textContent).to.equal('5 minutes ago');
  });
});
