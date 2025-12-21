# pc-icon



<!-- Auto Generated Below -->


## Properties

| Property        | Attribute        | Description | Type     | Default |
| --------------- | ---------------- | ----------- | -------- | ------- |
| `operatorValue` | `operator-value` |             | `string` | `''`    |
| `operators`     | --               |             | `any[]`  | `[]`    |


## Dependencies

### Depends on

- [goat-select](../../../input-controls/select)

### Graph
```mermaid
graph TD;
  goat-cb-expression --> goat-select
  goat-select --> pc-icon
  goat-select --> pc-tag
  goat-select --> pc-button
  goat-select --> goat-menu
  goat-select --> pc-text
  goat-select --> goat-menu-item
  pc-tag --> pc-icon
  pc-button --> pc-elevation
  goat-menu --> goat-empty-state
  goat-empty-state --> goat-svg
  goat-empty-state --> pc-button
  goat-empty-state --> pc-icon
  goat-menu-item --> pc-icon
  style goat-cb-expression fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with love!*
