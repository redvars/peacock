# pc-icon



<!-- Auto Generated Below -->


## Properties

| Property  | Attribute | Description | Type     | Default     |
| --------- | --------- | ----------- | -------- | ----------- |
| `content` | `content` |             | `string` | `undefined` |


## Dependencies

### Depends on

- [goat-select](../../../input-controls/select)
- [goat-cb-divider](../cb-divider)
- [pc-tag](../../../tag)

### Graph
```mermaid
graph TD;
  goat-condition-builder --> goat-select
  goat-condition-builder --> goat-cb-divider
  goat-condition-builder --> pc-tag
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
  style goat-condition-builder fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with love!*
