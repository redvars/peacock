# p-icon



<!-- Auto Generated Below -->


## Properties

| Property  | Attribute | Description | Type     | Default     |
| --------- | --------- | ----------- | -------- | ----------- |
| `content` | `content` |             | `string` | `undefined` |


## Dependencies

### Depends on

- [pc-input](../../../input-controls/input/input)
- [goat-cb-divider](../cb-divider)
- [pc-tag](../../../tag)

### Graph
```mermaid
graph TD;
  goat-condition-builder --> pc-input
  goat-condition-builder --> goat-cb-divider
  goat-condition-builder --> pc-tag
  pc-input --> pc-tooltip
  pc-input --> pc-button
  pc-input --> p-icon
  pc-tooltip --> pc-popover
  pc-tooltip --> pc-popover-content
  pc-button --> pc-elevation
  pc-tag --> p-icon
  pc-tag --> pc-elevation
  style goat-condition-builder fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with love!*
