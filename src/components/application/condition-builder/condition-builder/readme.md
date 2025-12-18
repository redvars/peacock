# pc-icon



<!-- Auto Generated Below -->


## Properties

| Property  | Attribute | Description | Type     | Default     |
| --------- | --------- | ----------- | -------- | ----------- |
| `content` | `content` |             | `string` | `undefined` |


## Dependencies

### Depends on

- [goat-select](../../../input-controls/select)
- [goat-input](../../../input-controls/input/input)
- [goat-cb-divider](../cb-divider)
- [goat-tag](../../../tag)

### Graph
```mermaid
graph TD;
  goat-condition-builder --> goat-select
  goat-condition-builder --> goat-input
  goat-condition-builder --> goat-cb-divider
  goat-condition-builder --> goat-tag
  goat-select --> pc-icon
  goat-select --> goat-tag
  goat-select --> pc-button
  goat-select --> goat-spinner
  goat-select --> goat-menu
  goat-select --> pc-text
  goat-select --> goat-menu-item
  goat-tag --> pc-icon
  pc-button --> pc-elevation
  goat-menu --> goat-empty-state
  goat-empty-state --> goat-svg
  goat-empty-state --> pc-button
  goat-empty-state --> pc-icon
  goat-menu-item --> pc-icon
  goat-input --> goat-tooltip
  goat-input --> pc-button
  goat-input --> pc-icon
  goat-tooltip --> goat-popover
  goat-tooltip --> goat-popover-content
  style goat-condition-builder fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with love!*
