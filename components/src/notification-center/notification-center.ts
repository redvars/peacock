import { LitElement, html, nothing, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { repeat } from 'lit/directives/repeat.js';

import IndividualComponent from '@/IndividualComponent.js';
import { FloatingController } from '@/__internal/controllers/floating-controller.js';
import {
  type CloseReason,
  OverlayController,
} from '@/__internal/controllers/overlay-controller.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import {
  type OverlayPlacement,
  toPhysicalPlacement,
} from '@/__internal/utils/placement.js';
import styles from './notification-center.scss';

/** One notification. The app owns the list and replaces it to change anything. */
export interface NotificationCenterItem {
  /** Unique, stable id; events name notifications by it. */
  id: string;
  title: string;
  body?: string;
  /** When it happened, as an ISO 8601 string. */
  timestamp: string;
  read?: boolean;
  /** Meaning, shown as a colored icon when there is no `avatar`. */
  intent?: 'info' | 'success' | 'warning' | 'danger';
  /** Makes the notification a link. */
  href?: string;
  /** URL of an image shown at the start, such as the sender's picture. */
  avatar?: string;
}

/** Detail of `item-click` and `dismiss`. */
export interface NotificationCenterItemDetail {
  notification: NotificationCenterItem;
}

/** Detail of `read-change`. */
export interface NotificationCenterReadChangeDetail {
  /** The notifications to change. */
  ids: string[];
  /** Whether they should become read (true) or unread (false). */
  read: boolean;
}

/** Detail of `close`. */
export interface NotificationCenterCloseDetail {
  reason: CloseReason;
}

type Filter = 'all' | 'unread';

interface DayGroup {
  key: string;
  label: string;
  items: NotificationCenterItem[];
}

const INTENT_ICONS: Record<
  NonNullable<NotificationCenterItem['intent']>,
  string
> = {
  info: 'info',
  success: 'check_circle',
  warning: 'warning',
  danger: 'error',
};

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** The panel becomes a full-height side sheet at phone width (the `for-phone-only` breakpoint). */
const NARROW_QUERY = '(max-width: 671px)';

function startOfDay(time: number): number {
  const date = new Date(time);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/** Whole calendar days from `time` back to `now` (0 today, 1 yesterday). */
function daysAgo(time: number, now: number): number {
  return Math.round((startOfDay(now) - startOfDay(time)) / DAY);
}

/** "now", "5 min. ago", "3 hr. ago", "2 days ago"; older than a week, the date. */
export function formatRelativeTime(
  time: number,
  now: number,
  locale: string,
): string {
  const diff = time - now;
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat(locale, {
    numeric: 'auto',
    style: 'short',
  });
  if (abs < MINUTE) return rtf.format(0, 'second');
  if (abs < HOUR) return rtf.format(Math.round(diff / MINUTE), 'minute');
  if (abs < DAY) return rtf.format(Math.round(diff / HOUR), 'hour');
  if (abs < 7 * DAY) return rtf.format(Math.round(diff / DAY), 'day');
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(time);
}

/**
 * @label Notification Center
 * @tag wc-notification-center
 * @rawTag notification-center
 * @summary An in-app inbox behind a bell button: an unread count and a panel listing notifications by day.
 *
 * @overview
 * <p>The notification center is a bell <code>wc-icon-button</code> with a <code>wc-badge</code>
 * showing the unread count. Pressing it opens a panel anchored to the bell (a full-height side
 * sheet on phone-width screens) with the <code>notifications</code>, newest first, grouped under
 * Today, Yesterday and dates, each with a relative time ("5 min. ago") formatted with
 * <code>Intl</code> in the resolved locale. The panel has All and Unread filters and
 * Mark all as read.</p>
 * <p>The app owns the data. The component never changes <code>notifications</code>; it fires
 * events and the app updates the list (optimistically if it likes) and assigns a new array:</p>
 * <ul>
 * <li><code>item-click</code> (<code>detail.notification</code>, cancelable) when a notification
 * is activated. A notification with <code>href</code> is a link and navigates unless the event is
 * cancelled. Marking it read is up to the app.</li>
 * <li><code>read-change</code> (<code>detail.ids</code>, <code>detail.read</code>) from the
 * per-item Mark as read / unread buttons and Mark all as read.</li>
 * <li><code>dismiss</code> (<code>detail.notification</code>) from an item's dismiss button.</li>
 * <li><code>load-more</code> from the Load more button, shown while <code>has-more</code> is
 * set. Set <code>loading</code> while fetching; the panel shows a progress bar.</li>
 * </ul>
 * <p>The panel is a non-modal dialog named by <code>label</code> ("Notifications"); focus moves into
 * it on open and back to the bell on close. Escape, a press outside, the close button or the bell
 * close it. Each day is a list. The bell's name includes the unread count ("Notifications, 3
 * unread"). When unread notifications arrive while the panel is closed, a polite live region
 * announces "2 new notifications".</p>
 *
 * @fires {CustomEvent} open - Fired when the panel opens.
 * @fires {CustomEvent<{reason: 'escape' | 'light-dismiss' | 'action' | 'api'}>} close - Fired when the panel closes.
 * @fires {CustomEvent<{notification: NotificationCenterItem}>} item-click - Fired, cancelable, when a notification is activated. Cancelling stops a link from navigating.
 * @fires {CustomEvent<{ids: string[], read: boolean}>} read-change - Fired when the person marks notifications read or unread.
 * @fires {CustomEvent<{notification: NotificationCenterItem}>} dismiss - Fired when the person dismisses a notification.
 * @fires {CustomEvent} load-more - Fired when the person presses Load more.
 *
 * @cssprop --notification-center-panel-width - Width of the panel. Defaults to `24rem`.
 * @cssprop --notification-center-panel-max-height - Maximum height of the anchored panel. Defaults to `32rem`.
 * @cssprop --notification-center-unread-color - Color of the unread marker and the unread item tint.
 *
 * @example
 * ```html
 * <wc-notification-center id="inbox"></wc-notification-center>
 * <script>
 *   const inbox = document.querySelector('#inbox');
 *   inbox.notifications = [
 *     { id: '1', title: 'Build failed', body: 'main #4521', timestamp: new Date().toISOString(), intent: 'danger' },
 *     { id: '2', title: 'Ada commented', timestamp: '2026-11-01T09:30:00Z', read: true },
 *   ];
 *   inbox.addEventListener('read-change', e => {
 *     inbox.notifications = inbox.notifications.map(n =>
 *       e.detail.ids.includes(n.id) ? { ...n, read: e.detail.read } : n);
 *   });
 * </script>
 * ```
 * @tags feedback, overlay
 */
@IndividualComponent
export class NotificationCenter extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** The notifications, in any order; they show newest first. */
  @property({ attribute: false })
  notifications: NotificationCenterItem[] = [];

  /** Whether the panel is open. */
  @property({ type: Boolean, reflect: true })
  open = false;

  /** Shows a progress bar at the end of the list while notifications load. */
  @property({ type: Boolean, reflect: true })
  loading = false;

  /** Shows a Load more button at the end of the list, which fires `load-more`. */
  @property({ type: Boolean, reflect: true, attribute: 'has-more' })
  hasMore = false;

  /** Where the panel opens relative to the bell. */
  @property({ type: String, reflect: true })
  placement: OverlayPlacement = 'bottom-end';

  /** Name of the bell and the panel. Defaults to "Notifications". */
  @property({ type: String })
  label = '';

  /** Locale for dates and relative times. Defaults to the nearest `lang`. */
  @property({ type: String })
  locale?: string;

  // ── State ────────────────────────────────────────────────────────────────

  /** Which notifications the panel lists. */
  @state() private filter: Filter = 'all';

  /** The time relative times are measured from; refreshed every minute while open. */
  @state() private now = Date.now();

  /** Text of the polite live region. */
  @state() private announcement = '';

  /** Whether the open panel is a side sheet (phone width). */
  @state() private sheet = false;

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('.anchor') private anchorElement?: HTMLElement | null;

  @query('.panel') private panelElement?: HTMLElement | null;

  // ── Private fields ───────────────────────────────────────────────────────

  private readonly i18n = new I18nController(this);

  /** Ids seen so far, to tell new arrivals from changes. */
  private knownIds: Set<string> | null = null;

  /** Refreshes `now` while the panel is open. */
  private clock?: ReturnType<typeof setInterval>;

  /** Reason for the close in progress, sent with `close`. */
  private closeReason: CloseReason = 'api';

  /** Positions the anchored panel next to the bell. */
  private readonly floating = new FloatingController(this, {
    trigger: 'manual',
    strategy: 'fixed',
    closeOnClickOutside: false,
    fitViewport: true,
    viewportPadding: 8,
  });

  /** Top layer, Escape, light dismiss and focus return. */
  private readonly overlay = new OverlayController(this, {
    surface: () => this.panelElement,
    lightDismiss: () => true,
    focusOnOpen: () => true,
    initialFocus: () => this.panelElement,
    exitAnimationTargets: () => [],
    requestClose: reason => this.close(reason),
  });

  // ── Lifecycle ────────────────────────────────────────────────────────────

  disconnectedCallback() {
    this.stopClock();
    super.disconnectedCallback();
  }

  protected override firstUpdated() {
    if (this.anchorElement && this.panelElement) {
      this.floating.setElements(this.anchorElement, this.panelElement);
    }
  }

  protected override willUpdate(changed: PropertyValues<this>) {
    if (changed.has('notifications')) this.noteArrivals();
    if (changed.has('open') && this.open) {
      this.now = Date.now();
      this.sheet =
        typeof window.matchMedia === 'function' &&
        window.matchMedia(NARROW_QUERY).matches;
    }
  }

  protected override updated(changed: PropertyValues<this>) {
    if (changed.has('open')) this.syncOpen(changed.get('open') === true);
  }

  // ── Public methods ───────────────────────────────────────────────────────

  /** Opens the panel. */
  show() {
    this.open = true;
  }

  /** Closes the panel. */
  hide() {
    this.close('api');
  }

  /** Opens the panel when closed and closes it when open. */
  toggle() {
    if (this.open) this.close('action');
    else this.show();
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private get resolvedLabel(): string {
    return this.label || this.i18n.t('notificationCenterLabel');
  }

  private get unreadCount(): number {
    return this.notifications.filter(item => !item.read).length;
  }

  private formatNumber(count: number): string {
    return new Intl.NumberFormat(this.i18n.locale).format(count);
  }

  private close(reason: CloseReason) {
    if (!this.open) return;
    this.closeReason = reason;
    this.open = false;
  }

  private syncOpen(wasOpen: boolean) {
    if (this.open) {
      this.startClock();
      this.overlay.sync(true);
      if (this.sheet) {
        this.panelElement?.style.removeProperty('left');
        this.panelElement?.style.removeProperty('top');
      } else {
        // The floating controller re-renders its host; start it after this update.
        this.updateComplete.then(() => {
          if (!this.open || this.sheet) return;
          this.floating.setOptions({
            placement: toPhysicalPlacement(
              this.placement,
              this,
              'wc-notification-center',
            ),
          });
          this.floating.open();
        });
      }
      this.dispatch('open');
    } else {
      this.stopClock();
      this.updateComplete.then(() => {
        if (!this.open) this.floating.close();
      });
      this.overlay.sync(false);
      if (wasOpen) {
        const reason = this.closeReason;
        this.closeReason = 'api';
        this.dispatch('close', { reason });
      }
    }
  }

  private startClock() {
    this.stopClock();
    this.clock = setInterval(() => {
      this.now = Date.now();
    }, MINUTE);
  }

  private stopClock() {
    if (this.clock !== undefined) clearInterval(this.clock);
    this.clock = undefined;
  }

  /** Announces unread notifications that arrived while the panel is closed. */
  private noteArrivals() {
    const ids = new Set(this.notifications.map(item => item.id));
    const known = this.knownIds;
    this.knownIds = ids;
    if (!known || this.open) return;
    const arrived = this.notifications.filter(
      item => !item.read && !known.has(item.id),
    ).length;
    if (arrived === 0) return;
    const text = this.i18n.t('notificationCenterNew')(
      arrived,
      this.formatNumber(arrived),
    );
    // Clear first, so the same text twice in a row is announced twice.
    this.announcement = '';
    this.updateComplete.then(() => {
      this.announcement = text;
    });
  }

  private dispatch<T>(type: string, detail?: T, cancelable = false): boolean {
    return this.dispatchEvent(
      new CustomEvent<T>(type, {
        detail,
        bubbles: true,
        composed: true,
        cancelable,
      }),
    );
  }

  /** The listed notifications, newest first, grouped by calendar day. */
  private groups(): DayGroup[] {
    const shown = this.notifications.filter(
      item => this.filter === 'all' || !item.read,
    );
    const timed = shown.map((item, index) => ({
      item,
      index,
      time: Date.parse(item.timestamp),
    }));
    // Newest first; undated items last, in their given order.
    timed.sort((a, b) => {
      const aValid = !Number.isNaN(a.time);
      const bValid = !Number.isNaN(b.time);
      if (aValid && bValid && a.time !== b.time) return b.time - a.time;
      if (aValid !== bValid) return aValid ? -1 : 1;
      return a.index - b.index;
    });

    const groups: DayGroup[] = [];
    for (const { item, time } of timed) {
      const valid = !Number.isNaN(time);
      const key = valid ? String(startOfDay(time)) : 'undated';
      let group = groups[groups.length - 1];
      if (!group || group.key !== key) {
        group = { key, label: valid ? this.dayLabel(time) : '', items: [] };
        groups.push(group);
      }
      group.items.push(item);
    }
    return groups;
  }

  private dayLabel(time: number): string {
    const days = daysAgo(time, this.now);
    if (days === 0) return this.i18n.t('today');
    if (days === 1) return this.i18n.t('notificationCenterYesterday');
    const sameYear =
      new Date(time).getFullYear() === new Date(this.now).getFullYear();
    return new Intl.DateTimeFormat(this.i18n.locale, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: sameYear ? undefined : 'numeric',
    }).format(time);
  }

  private handleItemClick(event: Event, notification: NotificationCenterItem) {
    const proceed = this.dispatch<NotificationCenterItemDetail>(
      'item-click',
      { notification },
      true,
    );
    if (!proceed) event.preventDefault();
  }

  private handleReadToggle(notification: NotificationCenterItem) {
    this.dispatch<NotificationCenterReadChangeDetail>('read-change', {
      ids: [notification.id],
      read: !notification.read,
    });
  }

  private handleMarkAllRead() {
    const ids = this.notifications
      .filter(item => !item.read)
      .map(item => item.id);
    if (ids.length === 0) return;
    this.dispatch<NotificationCenterReadChangeDetail>('read-change', {
      ids,
      read: true,
    });
  }

  private handleDismiss(notification: NotificationCenterItem) {
    this.dispatch<NotificationCenterItemDetail>('dismiss', { notification });
  }

  private handleLoadMore() {
    this.dispatch('load-more');
  }

  private setFilter(filter: Filter) {
    this.filter = filter;
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  private renderBell() {
    const unread = this.unreadCount;
    return html`<div class="anchor">
      <wc-icon-button
        class="bell"
        variant="text"
        shape="round"
        aria-label=${this.i18n.t('notificationCenterBell')(
          this.resolvedLabel,
          unread,
          this.formatNumber(unread),
        )}
        aria-haspopup="dialog"
        aria-expanded=${String(this.open)}
        @click=${this.toggle}
      >
        <wc-icon name="notifications"></wc-icon>
      </wc-icon-button>
      ${unread > 0
        ? html`<wc-badge
            class="badge"
            value=${String(unread)}
            aria-hidden="true"
          ></wc-badge>`
        : nothing}
    </div>`;
  }

  private renderLeading(notification: NotificationCenterItem) {
    if (notification.avatar) {
      return html`<wc-avatar
        class="leading"
        size="md"
        src=${notification.avatar}
        aria-hidden="true"
      ></wc-avatar>`;
    }
    const icon = notification.intent
      ? INTENT_ICONS[notification.intent]
      : 'notifications';
    return html`<span
      class=${classMap({
        leading: true,
        'leading-icon': true,
        [notification.intent ?? 'neutral']: true,
      })}
      aria-hidden="true"
      ><wc-icon name=${icon}></wc-icon
    ></span>`;
  }

  private renderItem(notification: NotificationCenterItem) {
    const time = Date.parse(notification.timestamp);
    const valid = !Number.isNaN(time);
    const content = html`
      ${this.renderLeading(notification)}
      <span class="text">
        <span class="title">
          ${notification.read
            ? nothing
            : html`<span class="screen-reader-only"
                >${this.i18n.t('notificationCenterUnread')},
              </span>`}${notification.title}
        </span>
        ${notification.body
          ? html`<span class="body">${notification.body}</span>`
          : nothing}
        ${valid
          ? html`<time
              class="time"
              datetime=${notification.timestamp}
              title=${new Intl.DateTimeFormat(this.i18n.locale, {
                dateStyle: 'full',
                timeStyle: 'short',
              }).format(time)}
              >${formatRelativeTime(time, this.now, this.i18n.locale)}</time
            >`
          : nothing}
      </span>
    `;
    const main = notification.href
      ? html`<a
          class="main"
          href=${notification.href}
          @click=${(event: Event) => this.handleItemClick(event, notification)}
          >${content}</a
        >`
      : html`<button
          class="main"
          type="button"
          @click=${(event: Event) => this.handleItemClick(event, notification)}
        >
          ${content}
        </button>`;

    return html`<li
      class=${classMap({ item: true, unread: !notification.read })}
      data-id=${notification.id}
    >
      ${main}
      <span class="item-actions">
        <wc-icon-button
          class="read-toggle"
          variant="text"
          size="xs"
          shape="round"
          aria-label=${this.i18n.t(
            notification.read
              ? 'notificationCenterMarkUnread'
              : 'notificationCenterMarkRead',
          )}
          @click=${() => this.handleReadToggle(notification)}
        >
          <wc-icon
            name=${notification.read ? 'mark_email_unread' : 'mark_email_read'}
          ></wc-icon>
        </wc-icon-button>
        <wc-icon-button
          class="dismiss"
          variant="text"
          size="xs"
          shape="round"
          aria-label=${this.i18n.t('dismissNotification')}
          @click=${() => this.handleDismiss(notification)}
        >
          <wc-icon name="close"></wc-icon>
        </wc-icon-button>
      </span>
      ${notification.read
        ? nothing
        : html`<span class="unread-dot" aria-hidden="true"></span>`}
    </li>`;
  }

  private renderGroups(groups: DayGroup[]) {
    return repeat(
      groups,
      group => group.key,
      (group, index) => {
        const headingId = `group-${index}`;
        return html`<section class="group">
          ${group.label
            ? html`<h3 class="group-heading" id=${headingId}>
                ${group.label}
              </h3>`
            : nothing}
          <ul class="list" aria-labelledby=${group.label ? headingId : nothing}>
            ${repeat(
              group.items,
              item => item.id,
              item => this.renderItem(item),
            )}
          </ul>
        </section>`;
      },
    );
  }

  private renderEmpty() {
    return html`<div class="empty">
      <wc-icon name="notifications_off" aria-hidden="true"></wc-icon>
      <p>
        ${this.i18n.t(
          this.filter === 'unread'
            ? 'notificationCenterEmptyUnread'
            : 'notificationCenterEmpty',
        )}
      </p>
    </div>`;
  }

  private renderFooter() {
    if (this.loading) {
      return html`<div class="footer">
        <wc-linear-progress
          class="progress"
          indeterminate
          label=${this.i18n.t('loading')}
        ></wc-linear-progress>
      </div>`;
    }
    if (!this.hasMore) return nothing;
    return html`<div class="footer">
      <wc-button
        class="load-more"
        variant="text"
        size="sm"
        @click=${this.handleLoadMore}
        >${this.i18n.t('notificationCenterLoadMore')}</wc-button
      >
    </div>`;
  }

  private renderPanel() {
    const groups = this.groups();
    const unread = this.unreadCount;
    return html`<div
      class=${classMap({ panel: true, sheet: this.sheet })}
      popover="manual"
      role="dialog"
      aria-labelledby="headline"
      tabindex="-1"
    >
      <div class="header">
        <h2 class="headline" id="headline">${this.resolvedLabel}</h2>
        <wc-button
          class="mark-all"
          variant="text"
          size="sm"
          ?disabled=${unread === 0}
          @click=${this.handleMarkAllRead}
          >${this.i18n.t('notificationCenterMarkAllRead')}</wc-button
        >
        <wc-icon-button
          class="close"
          variant="text"
          size="sm"
          shape="round"
          aria-label=${this.i18n.t('close')}
          @click=${() => this.close('action')}
        >
          <wc-icon name="close"></wc-icon>
        </wc-icon-button>
      </div>
      <div
        class="filters"
        role="group"
        aria-label=${this.i18n.t('notificationCenterFilter')}
      >
        <button
          type="button"
          class=${classMap({ filter: true, active: this.filter === 'all' })}
          aria-pressed=${String(this.filter === 'all')}
          @click=${() => this.setFilter('all')}
        >
          ${this.i18n.t('notificationCenterAll')}
        </button>
        <button
          type="button"
          class=${classMap({
            filter: true,
            active: this.filter === 'unread',
          })}
          aria-pressed=${String(this.filter === 'unread')}
          @click=${() => this.setFilter('unread')}
        >
          ${this.i18n.t('notificationCenterUnread')}
          ${unread > 0
            ? html`<span class="filter-count"
                >${this.formatNumber(unread)}</span
              >`
            : nothing}
        </button>
      </div>
      <div class="content" aria-busy=${this.loading ? 'true' : nothing}>
        ${groups.length > 0 ? this.renderGroups(groups) : nothing}
        ${groups.length === 0 && !this.loading ? this.renderEmpty() : nothing}
        ${this.renderFooter()}
      </div>
    </div>`;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    return html`
      ${this.renderBell()}
      <div class="screen-reader-only" role="status">${this.announcement}</div>
      ${this.renderPanel()}
    `;
  }
}
