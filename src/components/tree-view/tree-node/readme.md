# pc-menu



<!-- Auto Generated Below -->


## Properties

| Property   | Attribute  | Description                                                             | Type               | Default     |
| ---------- | ---------- | ----------------------------------------------------------------------- | ------------------ | ----------- |
| `disabled` | `disabled` | If true, the user cannot interact with the button. Defaults to `false`. | `boolean`          | `false`     |
| `expanded` | `expanded` |                                                                         | `boolean`          | `true`      |
| `href`     | `href`     | Hyperlink to navigate to on click.                                      | `string`           | `undefined` |
| `icon`     | `icon`     | Icon which will displayed on button. Possible values are icon names.    | `string`           | `undefined` |
| `label`    | `label`    |                                                                         | `string`           | `''`        |
| `level`    | `level`    |                                                                         | `number`           | `0`         |
| `selected` | `selected` | Menu item selection state.                                              | `boolean`          | `undefined` |
| `target`   | `target`   | Sets or retrieves the window or frame at which to target content.       | `string`           | `'_self'`   |
| `value`    | `value`    | The menu item value.                                                    | `number \| string` | `undefined` |


## Events

| Event              | Description                            | Type               |
| ------------------ | -------------------------------------- | ------------------ |
| `tree-node--click` | Emitted when the menu item is clicked. | `CustomEvent<any>` |


## Methods

### `setBlur() => Promise<void>`

Sets blur on the native `input` in `pc-input`. Use this method instead of the global
`input.blur()`.

#### Returns

Type: `Promise<void>`



### `setFocus() => Promise<void>`

Sets focus on the native `input` in `pc-input`. Use this method instead of the global
`input.focus()`.

#### Returns

Type: `Promise<void>`




## Dependencies

### Depends on

- [pc-icon](../../icon)

### Graph
```mermaid
graph TD;
  pc-tree-node --> pc-icon
  style pc-tree-node fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with love!*
