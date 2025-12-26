# pc-input



<!-- Auto Generated Below -->


## Properties

| Property       | Attribute      | Description                                                                                                            | Type                                       | Default                  |
| -------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ------------------------ |
| `autocomplete` | `autocomplete` | Indicates whether the value of the control can be automatically completed by the browser.                              | `"off" \| "on"`                            | `'off'`                  |
| `configAria`   | `config-aria`  |                                                                                                                        | `any`                                      | `{}`                     |
| `debounce`     | `debounce`     | Set the amount of time, in milliseconds, to wait to trigger the `goatChange` event after each keystroke.               | `number`                                   | `300`                    |
| `disabled`     | `disabled`     | If true, the user cannot interact with the button. Defaults to `false`.                                                | `boolean`                                  | `false`                  |
| `helperText`   | `helper-text`  |                                                                                                                        | `string`                                   | `undefined`              |
| `inline`       | `inline`       |                                                                                                                        | `boolean`                                  | `false`                  |
| `invalid`      | `invalid`      |                                                                                                                        | `boolean`                                  | `false`                  |
| `invalidText`  | `invalid-text` |                                                                                                                        | `string`                                   | `undefined`              |
| `label`        | `label`        |                                                                                                                        | `string`                                   | `undefined`              |
| `name`         | `name`         | The input field name.                                                                                                  | `string`                                   | ``pc-input-${this.gid}`` |
| `placeholder`  | `placeholder`  | The input field placeholder.                                                                                           | `string`                                   | `undefined`              |
| `readonly`     | `readonly`     | If true, the user read the value cannot modify it. Defaults to `false`.                                                | `boolean`                                  | `false`                  |
| `required`     | `required`     | If true, required icon is show. Defaults to `false`.                                                                   | `boolean`                                  | `false`                  |
| `size`         | `size`         | The input field size. Possible values are: `"sm"`, `"md"`, `"lg"`. Defaults to `"md"`.                                 | `"lg" \| "md" \| "sm"`                     | `'md'`                   |
| `skeleton`     | `skeleton`     |                                                                                                                        | `boolean`                                  | `false`                  |
| `type`         | `type`         | The type of control to display. Possible values are: `"text"`, `"password"`, `"email"`, `"tel"`. Defaults to `"text"`. | `"email" \| "password" \| "tel" \| "text"` | `'text'`                 |
| `value`        | `value`        | The input field value.                                                                                                 | `string`                                   | `undefined`              |
| `warn`         | `warn`         |                                                                                                                        | `boolean`                                  | `false`                  |
| `warnText`     | `warn-text`    |                                                                                                                        | `string`                                   | `undefined`              |


## Events

| Event              | Description                             | Type               |
| ------------------ | --------------------------------------- | ------------------ |
| `pc-input--blur`   | Emitted when the input loses focus.     | `CustomEvent<any>` |
| `pc-input--change` | Emitted when the value has changed.     | `CustomEvent<any>` |
| `pc-input--focus`  | Emitted when the input has focus.       | `CustomEvent<any>` |
| `pc-input--input`  | Emitted when a keyboard input occurred. | `CustomEvent<any>` |


## Methods

### `getComponentId() => Promise<string>`



#### Returns

Type: `Promise<string>`



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

### Used by

 - [goat-condition-builder](../../../application/condition-builder/condition-builder)

### Depends on

- [pc-tooltip](../../../tooltip)
- [pc-button](../../../button)
- [pc-icon](../../../icon)

### Graph
```mermaid
graph TD;
  pc-input --> pc-tooltip
  pc-input --> pc-button
  pc-input --> pc-icon
  pc-tooltip --> pc-popover
  pc-tooltip --> pc-popover-content
  pc-button --> pc-elevation
  goat-condition-builder --> pc-input
  style pc-input fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with love!*
