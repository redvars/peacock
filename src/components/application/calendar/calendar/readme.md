# pc-avatar



<!-- Auto Generated Below -->


## Properties

| Property         | Attribute         | Description      | Type                 | Default                                                                                                                                                                                                                                                                     |
| ---------------- | ----------------- | ---------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `availableViews` | --                | Available views. | `CalendarViewType[]` | `[     {       label: 'Day',       value: 'day',       type: 'column',       days: 1,     },     {       label: 'Week',       value: 'week',       type: 'column',       days: 7,     },     {       label: 'Month',       value: 'month',       type: 'month',     },   ]` |
| `contextDate`    | --                | Context date.    | `Date`               | `undefined`                                                                                                                                                                                                                                                                 |
| `eventClickable` | `event-clickable` | Event clickable. | `boolean`            | `true`                                                                                                                                                                                                                                                                      |
| `events`         | --                | Calendar events. | `EventType[]`        | `[]`                                                                                                                                                                                                                                                                        |
| `showLoader`     | `show-loader`     | Show loader.     | `boolean`            | `false`                                                                                                                                                                                                                                                                     |
| `timezone`       | `timezone`        | Timezone.        | `string`             | `undefined`                                                                                                                                                                                                                                                                 |
| `view`           | `view`            | Calendar view.   | `string`             | `'week'`                                                                                                                                                                                                                                                                    |


## Events

| Event                        | Description           | Type               |
| ---------------------------- | --------------------- | ------------------ |
| `goat-calendar--event-click` | Calendar event click. | `CustomEvent<any>` |


## Dependencies

### Depends on

- [pc-button](../../../button)
- [pc-icon](../../../icon)
- [goat-select](../../../input-controls/select)
- [goat-calendar-column-view](column-view)
- [goat-calendar-month-view](month-view)

### Graph
```mermaid
graph TD;
  goat-calendar --> pc-button
  goat-calendar --> pc-icon
  goat-calendar --> goat-select
  goat-calendar --> goat-calendar-column-view
  goat-calendar --> goat-calendar-month-view
  pc-button --> pc-elevation
  goat-select --> pc-icon
  goat-select --> pc-tag
  goat-select --> pc-button
  goat-select --> goat-menu
  goat-select --> pc-text
  goat-select --> goat-menu-item
  pc-tag --> pc-icon
  goat-menu --> goat-empty-state
  goat-empty-state --> goat-svg
  goat-empty-state --> pc-button
  goat-empty-state --> pc-icon
  goat-menu-item --> pc-icon
  goat-calendar-column-view --> goat-calendar-column-view-background
  style goat-calendar fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with love!*
