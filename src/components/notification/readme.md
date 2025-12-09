# goat-alert



<!-- Auto Generated Below -->


## Properties

| Property       | Attribute       | Description                                                                               | Type                                          | Default     |
| -------------- | --------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------- | ----------- |
| `action`       | `action`        | Action to be displayed on the notification                                                | `string`                                      | `undefined` |
| `dismissible`  | `dismissible`   | Whether the notification is dismissible                                                   | `boolean`                                     | `false`     |
| `highContrast` | `high-contrast` | Whether to use high contrast mode                                                         | `boolean`                                     | `false`     |
| `inline`       | `inline`        | Whether the notification should be displayed inline                                       | `boolean`                                     | `false`     |
| `managed`      | `managed`       | Whether the notification is managed by the notification manager                           | `boolean`                                     | `false`     |
| `state`        | `state`         | The state of the notification. Possible values are: 'success', 'error', 'info', 'warning' | `"error" \| "info" \| "success" \| "warning"` | `'info'`    |


## Events

| Event                             | Description                                | Type               |
| --------------------------------- | ------------------------------------------ | ------------------ |
| `goat-notification--action-click` |                                            | `CustomEvent<any>` |
| `goat-notification--dismiss`      | Emitted when the notification is dismissed | `CustomEvent<any>` |


## Dependencies

### Used by

 - [goat-notification-manager](../notification-manager)

### Depends on

- [pc-icon](../icon)
- [goat-button](../button)

### Graph
```mermaid
graph TD;
  goat-notification --> pc-icon
  goat-notification --> goat-button
  goat-button --> goat-spinner
  goat-button --> pc-icon
  goat-notification-manager --> goat-notification
  style goat-notification fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with love!*
