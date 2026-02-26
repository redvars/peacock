# pc-menu



<!-- Auto Generated Below -->


## Properties

| Property                | Attribute                 | Description                                                                          | Type                           | Default                           |
| ----------------------- | ------------------------- | ------------------------------------------------------------------------------------ | ------------------------------ | --------------------------------- |
| `empty`                 | `empty`                   |                                                                                      | `boolean`                      | `false`                           |
| `emptyStateDescription` | `empty-state-description` |                                                                                      | `string`                       | `'There are no items to display'` |
| `emptyStateHeadline`    | `empty-state-headline`    |                                                                                      | `string`                       | `'No items'`                      |
| `layer`                 | `layer`                   |                                                                                      | `"01" \| "02" \| "background"` | `undefined`                       |
| `showLoader`            | `show-loader`             |                                                                                      | `boolean`                      | `false`                           |
| `size`                  | `size`                    | The menu item size. Possible values are: `"sm"`, `"md"`, `"lg"`. Defaults to `"md"`. | `"lg" \| "md" \| "sm"`         | `'md'`                            |
| `value`                 | `value`                   |                                                                                      | `number \| string`             | `undefined`                       |


## Methods

### `setFocus() => Promise<void>`

Sets focus on first menu item. Use this method instead of the global
`element.focus()`.

#### Returns

Type: `Promise<void>`




## CSS Custom Properties

| Name                | Description                  |
| ------------------- | ---------------------------- |
| `--menu-background` | Background color of the menu |
| `--menu-max-height` | Maximum height of the menu   |
| `--menu-shadow`     | Shadow of the menu           |


## Dependencies

### Used by

 - [goat-html-editor](../../input-controls/html-editor)
 - [pc-dropdown-menu](../../dropdown/dropdown-menu)
 - [pc-select](../../input-controls/select)

### Depends on

- [pc-empty-state](../../application/empty-state)

### Graph
```mermaid
graph TD;
  pc-menu --> pc-empty-state
  goat-html-editor --> pc-menu
  pc-dropdown-menu --> pc-menu
  pc-select --> pc-menu
  style pc-menu fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with love!*
