# goat-dropdown



<!-- Auto Generated Below -->


## Methods

### `setFocus() => Promise<void>`

Sets focus on first menu item. Use this method instead of the global
`element.focus()`.

#### Returns

Type: `Promise<void>`




## CSS Custom Properties

| Name                              | Description                |
| --------------------------------- | -------------------------- |
| `--goat-dropdown-menu-max-height` | Maximum height of the menu |


## Dependencies

### Depends on

- [goat-menu](../../menu/menu)

### Graph
```mermaid
graph TD;
  goat-dropdown-menu --> goat-menu
  goat-menu --> goat-empty-state
  goat-empty-state --> goat-svg
  goat-empty-state --> goat-button
  goat-button --> goat-spinner
  goat-button --> goat-icon
  style goat-dropdown-menu fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with love!*
