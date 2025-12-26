# pc-menu



<!-- Auto Generated Below -->


## Properties

| Property     | Attribute     | Description | Type               | Default                                                                                  |
| ------------ | ------------- | ----------- | ------------------ | ---------------------------------------------------------------------------------------- |
| `empty`      | `empty`       |             | `boolean`          | `false`                                                                                  |
| `emptyState` | `empty-state` |             | `any`              | ``{     "headline": "No items",     "description": "There are no items to display"   }`` |
| `showLoader` | `show-loader` |             | `boolean`          | `false`                                                                                  |
| `value`      | `value`       |             | `number \| string` | `undefined`                                                                              |


## Methods

### `setFocus() => Promise<void>`

Sets focus on first menu item. Use this method instead of the global
`element.focus()`.

#### Returns

Type: `Promise<void>`




## Dependencies

### Depends on

- [pc-empty-state](../empty-state)

### Graph
```mermaid
graph TD;
  goat-sidenav-menu --> pc-empty-state
  pc-empty-state --> pc-icon
  pc-empty-state --> pc-button
  pc-button --> pc-elevation
  style goat-sidenav-menu fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with love!*
