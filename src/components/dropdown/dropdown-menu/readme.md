# goat-dropdown



<!-- Auto Generated Below -->


## Methods

### `setFocus() => Promise<void>`

Sets focus on first menu item. Use this method instead of the global
`element.focus()`.

#### Returns

Type: `Promise<void>`




## Dependencies

### Depends on

- [goat-menu](../../menu/menu)

### Graph
```mermaid
graph TD;
  goat-dropdown-menu --> goat-menu
  goat-menu --> goat-empty-state
  goat-empty-state --> goat-svg
  goat-empty-state --> pc-button
  goat-empty-state --> pc-icon
  pc-button --> pc-elevation
  style goat-dropdown-menu fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with love!*
