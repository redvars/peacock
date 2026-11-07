/// <reference types="mocha" />
import { html } from 'lit';
import { expect, fixtureSync, waitUntil } from '@open-wc/testing';
import {
  NotificationCenter,
  formatRelativeTime,
  type NotificationCenterItem,
} from '../src/notification-center/index.js';

if (!customElements.get('wc-notification-center')) {
  customElements.define('wc-notification-center', NotificationCenter);
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function iso(time: number) {
  return new Date(time).toISOString();
}

/** Noon today, so "an hour ago" and "a day ago" stay on today and yesterday. */
function noonToday() {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  return date.getTime();
}

function sample(): NotificationCenterItem[] {
  const noon = noonToday();
  return [
    { id: 'old', title: 'Old', timestamp: iso(noon - 10 * DAY), read: true },
    {
      id: 'today',
      title: 'Build failed',
      body: 'main #4521',
      timestamp: iso(noon - HOUR),
      intent: 'danger',
    },
    { id: 'yesterday', title: 'Comment', timestamp: iso(noon - DAY) },
    {
      id: 'link',
      title: 'Linked',
      timestamp: iso(noon - 2 * HOUR),
      href: '#nowhere',
      read: true,
    },
  ];
}

async function center(items = sample()) {
  const el = fixtureSync<NotificationCenter>(
    html`<wc-notification-center
      locale="en-US"
      .notifications=${items}
    ></wc-notification-center>`,
  );
  await el.updateComplete;
  return el;
}

function q<T extends Element = HTMLElement>(el: NotificationCenter, s: string) {
  return el.shadowRoot!.querySelector<T>(s as string) as T | null;
}

function qa(el: NotificationCenter, s: string) {
  return Array.from(el.shadowRoot!.querySelectorAll<HTMLElement>(s));
}

function record(el: Element, type: string) {
  const events: CustomEvent[] = [];
  el.addEventListener(type, e => events.push(e as CustomEvent));
  return events;
}

describe('wc-notification-center', () => {
  afterEach(() => {
    // Close any open panel so the overlay stack stays clean between tests.
    document
      .querySelectorAll<NotificationCenter>('wc-notification-center')
      .forEach(el => el.hide());
  });

  it('shows the unread count on the bell', async () => {
    const el = await center();
    const bell = q(el, '.bell')!;
    expect(bell.getAttribute('aria-label')).to.equal('Notifications, 2 unread');
    expect(bell.getAttribute('aria-haspopup')).to.equal('dialog');
    expect(bell.getAttribute('aria-expanded')).to.equal('false');
    expect(q(el, 'wc-badge')!.getAttribute('value')).to.equal('2');

    el.notifications = el.notifications.map(n => ({ ...n, read: true }));
    await el.updateComplete;
    expect(bell.getAttribute('aria-label')).to.equal('Notifications');
    expect(q(el, 'wc-badge')).to.be.null;
  });

  it('opens from the bell and closes with the close button', async () => {
    const el = await center();
    const opens = record(el, 'open');
    const closes = record(el, 'close');
    q(el, '.bell')!.click();
    await el.updateComplete;
    expect(el.open).to.be.true;
    expect(opens).to.have.length(1);
    const panel = q(el, '.panel')!;
    expect(panel.matches(':popover-open')).to.be.true;
    expect(panel.getAttribute('role')).to.equal('dialog');
    expect(panel.getAttribute('aria-labelledby')).to.equal('headline');
    expect(q(el, '.bell')!.getAttribute('aria-expanded')).to.equal('true');

    q(el, '.close')!.click();
    await el.updateComplete;
    expect(el.open).to.be.false;
    expect(closes.map(e => e.detail.reason)).to.deep.equal(['action']);
    expect(panel.matches(':popover-open')).to.be.false;
  });

  it('closes on Escape with reason escape', async () => {
    const el = await center();
    const closes = record(el, 'close');
    el.show();
    await el.updateComplete;
    document.body.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    await el.updateComplete;
    expect(el.open).to.be.false;
    expect(closes[0].detail.reason).to.equal('escape');
  });

  it('closes on a press outside with reason light-dismiss', async () => {
    const el = await center();
    const closes = record(el, 'close');
    el.show();
    await el.updateComplete;
    document.body.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, composed: true }),
    );
    await el.updateComplete;
    expect(closes[0]?.detail.reason).to.equal('light-dismiss');
  });

  it('lists newest first, grouped by day', async () => {
    const el = await center();
    const headings = qa(el, '.group-heading').map(h => h.textContent!.trim());
    expect(headings[0]).to.equal('Today');
    expect(headings[1]).to.equal('Yesterday');
    expect(headings).to.have.length(3);
    const ids = qa(el, '.item').map(item => item.dataset.id);
    expect(ids).to.deep.equal(['today', 'link', 'yesterday', 'old']);
    const lists = qa(el, '.list');
    expect(lists.every(list => list.localName === 'ul')).to.be.true;
    expect(lists[0].getAttribute('aria-labelledby')).to.equal('group-0');
  });

  it('formats relative times with Intl', () => {
    const now = Date.now();
    expect(formatRelativeTime(now - 10_000, now, 'en-US')).to.equal('now');
    expect(formatRelativeTime(now - 5 * MINUTE, now, 'en-US')).to.contain(
      '5 min',
    );
    expect(formatRelativeTime(now - 3 * HOUR, now, 'en-US')).to.contain('3 hr');
    expect(formatRelativeTime(now - DAY, now, 'en-US')).to.equal('yesterday');
    expect(formatRelativeTime(now - 10 * DAY, now, 'en-US')).to.match(/\d{4}/);
    expect(formatRelativeTime(now - 5 * MINUTE, now, 'de')).to.contain('5');
  });

  it('marks unread items and reads them out', async () => {
    const el = await center();
    const unread = qa(el, '.item.unread').map(item => item.dataset.id);
    expect(unread).to.deep.equal(['today', 'yesterday']);
    const title = q(el, '.item.unread .title')!.textContent!;
    expect(title).to.contain('Unread');
  });

  it('fires read-change from the item toggle and Mark all as read', async () => {
    const el = await center();
    const changes = record(el, 'read-change');
    const toggles = qa(el, '.read-toggle');
    expect(toggles[0].getAttribute('aria-label')).to.equal('Mark as read');
    toggles[0].click();
    expect(changes[0].detail).to.deep.equal({ ids: ['today'], read: true });
    expect(toggles[1].getAttribute('aria-label')).to.equal('Mark as unread');
    toggles[1].click();
    expect(changes[1].detail).to.deep.equal({ ids: ['link'], read: false });
    q(el, '.mark-all')!.click();
    expect(changes[2].detail.ids.sort()).to.deep.equal(['today', 'yesterday']);
    expect(changes[2].detail.read).to.be.true;
    // The component never changes the data itself.
    expect(el.notifications.filter(n => !n.read)).to.have.length(2);
  });

  it('fires dismiss and item-click', async () => {
    const el = await center();
    const dismisses = record(el, 'dismiss');
    const clicks = record(el, 'item-click');
    qa(el, '.dismiss')[0].click();
    expect(dismisses[0].detail.notification.id).to.equal('today');
    q(el, '.item .main')!.click();
    expect(clicks[0].detail.notification.id).to.equal('today');
  });

  it('cancelling item-click stops a link navigating', async () => {
    const el = await center();
    el.addEventListener('item-click', e => e.preventDefault());
    const link = q<HTMLAnchorElement>(el, 'a.main')!;
    expect(link.getAttribute('href')).to.equal('#nowhere');
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(click);
    expect(click.defaultPrevented).to.be.true;
  });

  it('filters to unread notifications and shows empty states', async () => {
    const el = await center();
    const [all, unread] = qa(el, '.filter');
    expect(all.getAttribute('aria-pressed')).to.equal('true');
    unread.click();
    await el.updateComplete;
    expect(unread.getAttribute('aria-pressed')).to.equal('true');
    expect(qa(el, '.item').map(i => i.dataset.id)).to.deep.equal([
      'today',
      'yesterday',
    ]);
    el.notifications = el.notifications.map(n => ({ ...n, read: true }));
    await el.updateComplete;
    expect(q(el, '.empty')!.textContent).to.contain('No unread notifications');
    all.click();
    el.notifications = [];
    await el.updateComplete;
    expect(q(el, '.empty')!.textContent).to.contain('No notifications');
  });

  it('shows loading and Load more', async () => {
    const el = await center();
    expect(q(el, '.load-more')).to.be.null;
    el.hasMore = true;
    await el.updateComplete;
    const loads = record(el, 'load-more');
    q(el, '.load-more')!.click();
    expect(loads).to.have.length(1);
    el.loading = true;
    await el.updateComplete;
    expect(q(el, '.load-more')).to.be.null;
    expect(q(el, 'wc-linear-progress')).to.exist;
    expect(q(el, '.content')!.getAttribute('aria-busy')).to.equal('true');
  });

  it('announces new unread notifications while closed', async () => {
    const el = await center();
    const status = q(el, '[role="status"]')!;
    expect(status.textContent!.trim()).to.equal('');
    el.notifications = [
      { id: 'new1', title: 'New', timestamp: iso(Date.now()) },
      { id: 'new2', title: 'New 2', timestamp: iso(Date.now()) },
      ...el.notifications,
    ];
    await waitUntil(
      () => status.textContent!.trim() === '2 new notifications',
      'announcement',
    );
    // Read changes are not arrivals.
    el.notifications = el.notifications.map(n => ({ ...n, read: true }));
    await el.updateComplete;
    expect(status.textContent!.trim()).to.equal('2 new notifications');
  });

  it('uses label for the bell and the panel', async () => {
    const el = await center();
    el.label = 'Inbox';
    await el.updateComplete;
    expect(q(el, '.headline')!.textContent).to.equal('Inbox');
    expect(q(el, '.bell')!.getAttribute('aria-label')).to.equal(
      'Inbox, 2 unread',
    );
  });
});
