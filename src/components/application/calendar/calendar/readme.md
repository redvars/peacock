# goat-avatar



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

- [goat-button](../../../button)
- [goat-select](../../../input-controls/select)
- [goat-calendar-column-view](column-view)
- [goat-calendar-month-view](month-view)

### Graph
```mermaid
graph TD;
  goat-calendar --> goat-button
  goat-calendar --> goat-select
  goat-calendar --> goat-calendar-column-view
  goat-calendar --> goat-calendar-month-view
  goat-button --> goat-spinner
  goat-button --> goat-icon
  goat-select --> goat-icon
  goat-select --> goat-tag
  goat-select --> goat-button
  goat-select --> goat-spinner
  goat-select --> goat-menu
  goat-select --> goat-text
  goat-select --> goat-menu-item
  goat-tag --> goat-icon
  goat-menu --> goat-empty-state
  goat-empty-state --> goat-svg
  goat-empty-state --> goat-button
  goat-menu-item --> goat-icon
  goat-calendar-column-view --> goat-calendar-column-view-background
  style goat-calendar fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with love!*
