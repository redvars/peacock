# pc-dropdown



<!-- Auto Generated Below -->


## Methods

### `setFocus() => Promise<void>`

Sets focus on first menu item. Use this method instead of the global
`element.focus()`.

#### Returns

Type: `Promise<void>`




## Dependencies

### Depends on

- [pc-menu](../../menu/menu)

### Graph
```mermaid
graph TD;
  pc-dropdown-menu --> pc-menu
  pc-menu --> pc-empty-state
  pc-empty-state --> pc-icon
  pc-empty-state --> pc-button
  pc-button --> pc-elevation
  style pc-dropdown-menu fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with love!*
