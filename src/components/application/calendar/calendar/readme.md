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

| Event                      | Description           | Type               |
| -------------------------- | --------------------- | ------------------ |
| `pc-calendar--event-click` | Calendar event click. | `CustomEvent<any>` |


## Dependencies

### Depends on

- [pc-button](../../../button)
- [pc-icon](../../../icon)
- [pc-calendar-column-view](column-view)
- [pc-calendar-month-view](month-view)

### Graph
```mermaid
graph TD;
  pc-calendar --> pc-button
  pc-calendar --> pc-icon
  pc-calendar --> pc-calendar-column-view
  pc-calendar --> pc-calendar-month-view
  pc-button --> pc-elevation
  pc-calendar-column-view --> pc-calendar-column-view-background
  style pc-calendar fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with love!*
