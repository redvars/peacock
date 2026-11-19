import { html } from 'lit';

/** One button of the header's view switcher. */
export interface CalendarHeaderView {
  value: string;
  label: string;
}

/** What the header shows, and what its controls do. */
export interface CalendarHeaderOptions {
  /** The period shown, read out when it changes. */
  title: string;
  views: CalendarHeaderView[];
  /** The `value` of the selected view. */
  view: string;
  labels: { today: string; previous: string; next: string };
  onToday: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onViewChange: (value: string) => void;
}

/**
 * The header `wc-calendar` and `wc-calendar-timeline` share: a Today button, Previous and Next, the
 * period shown (a polite live region) and the views as segmented buttons. Its styles are the
 * `styles` mixin of `_calendar-header.scss`.
 */
export function renderCalendarHeader(options: CalendarHeaderOptions) {
  const onChange = (event: CustomEvent<{ value: string | null }>) => {
    if (event.detail.value) options.onViewChange(event.detail.value);
  };
  return html`
    <div class="calendar-header-classic">
      <div class="header-left">
        <wc-button
          variant="outlined"
          size="sm"
          class="color-secondary"
          @click=${options.onToday}
        >
          ${options.labels.today}
        </wc-button>
        <wc-icon-button
          variant="text"
          size="sm"
          class="color-secondary"
          aria-label=${options.labels.previous}
          @click=${options.onPrevious}
        >
          <wc-icon name="chevron_left"></wc-icon>
        </wc-icon-button>
        <wc-icon-button
          variant="text"
          size="sm"
          class="color-secondary"
          aria-label=${options.labels.next}
          @click=${options.onNext}
        >
          <wc-icon name="chevron_right"></wc-icon>
        </wc-icon-button>
        <div class="title" aria-live="polite">${options.title}</div>
      </div>
      <div class="header-right">
        <wc-segmented-button-group @change=${onChange}>
          ${options.views.map(
            view =>
              html`<wc-segmented-button
                .value=${view.value}
                ?selected=${options.view === view.value}
              >
                ${view.label}
              </wc-segmented-button>`,
          )}
        </wc-segmented-button-group>
      </div>
    </div>
  `;
}
