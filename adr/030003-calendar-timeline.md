# ADR-030003: Calendar timeline

- **Status:** Proposed
- **Date:** 2026-11-19
- **Packages:** `@redvars/peacock` (`wc-calendar-timeline`, `wc-calendar`)
- **Links:** [ADR-030001](030001-component-api-conventions.md) (component API conventions); redvars/peacock#153 (calendar editing)

## Context

Apps schedule across many people, rooms or machines at once: which room is free on Tuesday afternoon, who is on shift tonight, when the van is booked. That view puts one row per resource against a horizontal time axis. `wc-calendar` shows one set of events by day, week or month, and since #153 people can drag to move, resize and add events in it. It has no rows.

Most of what a timeline needs already exists in the calendar: the pointer drag engine (a mouse drags after 5px, a finger after a hold, with auto-scroll, Escape and a swallowed click), time math that follows the wall clock on the days the clocks change, exclusive event ends, snapping to `minute-step`, the editing events and the header with Today, Previous and Next. The question is whether the timeline is a fourth calendar view or a component of its own.

## Options considered

1. **A `timeline` view of `wc-calendar`.** One element and one view switcher. But the timeline brings options that do nothing in the day, week and month views (`resources`, the resource column, slot widths), and dragging an event to another row changes which resource it belongs to, so `event-change` would carry a field the other views never set.
2. **A separate `wc-calendar-timeline` built on the calendar's engine.** Two elements with the same vocabulary, sharing the drag controller, the time math and the header.
3. **Grow `wc-workflow-timeline`.** It already draws bars on a shared time scale, but it shows the steps of one workflow run, read-only. Rows of resources and editing would change what it is for.

## Decision

Option 2. ADR-030001 makes a mode its own component when it changes the value the consumer reads or writes, or adds options that do nothing in the other modes; the timeline does both.

The component is `wc-calendar-timeline`, named after the calendar it extends. The name `timeline-grid` stays free for another component.

### Data
- `resources`: the rows, in order, as `{ id, title, supportingText? }`. The row header shows the title and the supporting text.
- `events`: the calendar's event objects with a `resourceId`. An event whose `resourceId` matches no resource is not shown. `end` is exclusive, as in the calendar.

### Groups
- The same contract as `wc-table`'s groups: `group-by` names a resource field (`team`, `floor`), `collapsed-groups` holds the keys of the collapsed groups (their values as strings, `""` for resources without one), and `group-toggle` fires with `{ group, expanded }`.
- Groups keep the order they first appear in, and their rows keep theirs. Each group has a header row with its name, its number of resources and a button that collapses it.
- A collapsed group's header shows its events as thin bars, darker where they overlap, so a scheduler still sees when the group is busy. Events can be dragged between rows of different groups; rows of collapsed groups take no drops.

### Views
- `available-views` entries are `{ value, label?, slot, days? }`. `slot` is what a column stands for: `hour` or `day`. Without `days`, the view is a calendar month.
- The defaults are `day` (24 hour columns), `week` (7 day columns, starting on the week's first day) and `month` (a column per day of the month). A view such as `{ value: 'week-hours', slot: 'hour', days: 7 }` puts a week on hour columns.
- In hour views an event is drawn from its start to its end. In day views it covers the days it touches, as in the calendar's month view, and its time is in its label.
- `date`, `contextDate`, `view`, `first-day`, `timezone`, `locale`, `previous()`, `next()`, `today()`, `date-change` and `view-change` work as in `wc-calendar`, so an app can swap the two components under one switcher and keep the date.

### Layout
- One scroll container. The header with the time columns stays at the top, and the resource column stays at the inline start.
- Columns share the width, never narrower than `--calendar-timeline-hour-width` or `--calendar-timeline-day-width`. A range that does not fit scrolls sideways.
- Events that overlap in a row stack in lanes, and the row grows to fit them.
- A line marks the current time. In day views, today is tinted and weekends are shaded.

### Editing
- The calendar's contract, with the row added:
  - `editable` lets people drag an event to another time or another row, and drag its edges to resize it. Hour views snap to `minute-step`; day views move by whole days.
  - `addable` lets people drag across empty time in a row, or click it, to fire `event-add` with `{ start, end, allDay, resourceId }`. The calendar does not add the event; the range stays marked as a new event until `events` changes or `clearPlaceholder()` is called.
  - `event-change` is cancelable and carries `{ event, start, end, resourceId, action }`. Unless it is canceled, the timeline applies the change. `applyCalendarTimelineChange()` applies one later.
  - An event with `editable: false` stays put, and `events-readonly` turns editing off.
- The drag controller, the whole-day drag math and the header are shared with `wc-calendar` from `src/calendar/`. The controller now auto-scrolls along both axes.

### Accessibility
- The timeline is a table: a row per resource, the resource's title as its row header and its events as buttons in its one cell. Each event's name includes its resource and time.
- Moves, resizes and new events are announced in a live region.
- Clicking empty time adds an event without dragging. Apps open the event on `event-click` to offer another way to change its time.
- Right-to-left layouts mirror the time axis.

### Not in the first version
- Groups within groups, and a custom group header (`wc-table`'s `groupTemplate`).
- Virtual scrolling for hundreds of rows.
- Keyboard editing (shared with the calendar's next phase).
- Per-row working hours.
- Highlighting double bookings.
- Dependencies between events: this is a scheduler, not a Gantt chart.

## Consequences

- **Easier:** people who know `wc-calendar` know the timeline. One drag engine and one set of time rules serve both. Apps that only show a personal calendar do not load resource layout.
- **Harder:** two components must keep their shared API in step. The shared pieces in `src/calendar/` must stay free of calendar-only assumptions, and they move to `src/__internal/` if a third component needs them.
- **Follow-up:** the list above, starting with virtual scrolling, which long resource lists need first.
