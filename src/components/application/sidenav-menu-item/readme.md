# pc-menu-item



<!-- Auto Generated Below -->


## Properties

| Property   | Attribute  | Description                                                             | Type               | Default     |
| ---------- | ---------- | ----------------------------------------------------------------------- | ------------------ | ----------- |
| `disabled` | `disabled` | If true, the user cannot interact with the button. Defaults to `false`. | `boolean`          | `false`     |
| `selected` | `selected` | Menu item selection state.                                              | `boolean`          | `false`     |
| `value`    | `value`    | The menu item value.                                                    | `number \| string` | `undefined` |


## Events

| Event                          | Description                            | Type               |
| ------------------------------ | -------------------------------------- | ------------------ |
| `goat:sidenav-menu-item-click` | Emitted when the menu item is clicked. | `CustomEvent<any>` |


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




----------------------------------------------

*Built with love!*
