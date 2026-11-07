import { html, nothing, type TemplateResult } from 'lit';

import {
  formatAbsoluteTime,
  formatRelativeTime,
} from '@/__internal/utils/relative-time.js';

/**
 * The time of a discussion entry: relative to now ("5 minutes ago"), the absolute date and time
 * as its tooltip, and a link to the entry when it has a permalink.
 */
export function renderEntryTime(
  date: Date | null,
  locale: string,
  href = '',
): TemplateResult | typeof nothing {
  if (!date) return nothing;
  const time = html`<time
    datetime=${date.toISOString()}
    title=${formatAbsoluteTime(date, locale)}
    >${formatRelativeTime(date, locale)}</time
  >`;
  return href
    ? html`<a class="time" href=${href}>${time}</a>`
    : html`<span class="time">${time}</span>`;
}
