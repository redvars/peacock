# goat-heading



<!-- Auto Generated Below -->


## Properties

| Property         | Attribute         | Description | Type                               | Default         |
| ---------------- | ----------------- | ----------- | ---------------------------------- | --------------- |
| `action`         | `action`          |             | `string`                           | `undefined`     |
| `actionDisabled` | `action-disabled` |             | `boolean`                          | `false`         |
| `actionUrl`      | `action-url`      |             | `string`                           | `undefined`     |
| `actionVariant`  | `action-variant`  |             | `"filled" \| "outlined" \| "text"` | `'filled'`      |
| `description`    | `description`     |             | `string`                           | `undefined`     |
| `headline`       | `headline`        |             | `string`                           | `undefined`     |
| `illustration`   | `illustration`    |             | `"no-document"`                    | `'no-document'` |


## Dependencies

### Used by

 - [goat-menu](../../menu/menu)
 - [goat-sidenav-menu](../sidenav-menu)
 - [goat-table](../../table)
 - [goat-tree-view](../../tree-view/tree-view)

### Depends on

- [goat-svg](../../svg)
- [goat-button](../../button)

### Graph
```mermaid
graph TD;
  goat-empty-state --> goat-svg
  goat-empty-state --> goat-button
  goat-button --> goat-spinner
  goat-menu --> goat-empty-state
  goat-sidenav-menu --> goat-empty-state
  goat-table --> goat-empty-state
  goat-tree-view --> goat-empty-state
  style goat-empty-state fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with love!*
