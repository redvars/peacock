# goat-alert



<!-- Auto Generated Below -->


## Properties

| Property   | Attribute  | Description | Type                                                           | Default          |
| ---------- | ---------- | ----------- | -------------------------------------------------------------- | ---------------- |
| `name`     | `name`     |             | `string`                                                       | `'global'`       |
| `position` | `position` |             | `"bottom-left" \| "bottom-right" \| "top-left" \| "top-right"` | `'bottom-right'` |


## Dependencies

### Depends on

- [goat-notification](../notification)

### Graph
```mermaid
graph TD;
  goat-notification-manager --> goat-notification
  goat-notification --> pc-icon
  goat-notification --> goat-button
  goat-button --> goat-spinner
  goat-button --> pc-icon
  style goat-notification-manager fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with love!*
