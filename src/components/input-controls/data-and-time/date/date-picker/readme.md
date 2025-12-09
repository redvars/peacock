# goat-date-picker



<!-- Auto Generated Below -->


## Properties

| Property      | Attribute      | Description                                                                                              | Type                   | Default                    |
| ------------- | -------------- | -------------------------------------------------------------------------------------------------------- | ---------------------- | -------------------------- |
| `configAria`  | `config-aria`  |                                                                                                          | `any`                  | `{}`                       |
| `debounce`    | `debounce`     | Set the amount of time, in milliseconds, to wait to trigger the `goatChange` event after each keystroke. | `number`               | `300`                      |
| `disabled`    | `disabled`     | If true, the user cannot interact with the button. Defaults to `false`.                                  | `boolean`              | `false`                    |
| `helperText`  | `helper-text`  |                                                                                                          | `string`               | `undefined`                |
| `inline`      | `inline`       |                                                                                                          | `boolean`              | `false`                    |
| `invalid`     | `invalid`      |                                                                                                          | `boolean`              | `false`                    |
| `invalidText` | `invalid-text` |                                                                                                          | `string`               | `undefined`                |
| `label`       | `label`        |                                                                                                          | `string`               | `undefined`                |
| `name`        | `name`         | The input field name.                                                                                    | `string`               | ``goat-input-${this.gid}`` |
| `placeholder` | `placeholder`  | The input field placeholder.                                                                             | `string`               | `undefined`                |
| `readonly`    | `readonly`     | If true, the user read the value cannot modify it. Defaults to `false`.                                  | `boolean`              | `false`                    |
| `required`    | `required`     | If true, required icon is show. Defaults to `false`.                                                     | `boolean`              | `false`                    |
| `size`        | `size`         | The input field size. Possible values are: `"sm"`, `"md"`, `"lg"`. Defaults to `"md"`.                   | `"lg" \| "md" \| "sm"` | `'md'`                     |
| `value`       | `value`        | The input field value.                                                                                   | `number \| string`     | `''`                       |
| `warn`        | `warn`         |                                                                                                          | `boolean`              | `false`                    |
| `warnText`    | `warn-text`    |                                                                                                          | `string`               | `undefined`                |


## Events

| Event                      | Description                             | Type               |
| -------------------------- | --------------------------------------- | ------------------ |
| `goat-date-picker--blur`   | Emitted when the input loses focus.     | `CustomEvent<any>` |
| `goat-date-picker--change` | Emitted when the value has changed.     | `CustomEvent<any>` |
| `goat-date-picker--focus`  | Emitted when the input has focus.       | `CustomEvent<any>` |
| `goat-date-picker--input`  | Emitted when a keyboard input occurred. | `CustomEvent<any>` |


## Methods

### `getComponentId() => Promise<string>`



#### Returns

Type: `Promise<string>`



### `setBlur() => Promise<void>`

Sets blur on the native `input` in `goat-input`. Use this method instead of the global
`input.blur()`.

#### Returns

Type: `Promise<void>`



### `setFocus() => Promise<void>`

Sets focus on the native `input` in `goat-input`. Use this method instead of the global
`input.focus()`.

#### Returns

Type: `Promise<void>`




## Dependencies

### Depends on

- [goat-button](../../../../button)

### Graph
```mermaid
graph TD;
  goat-date-picker --> goat-button
  goat-button --> goat-spinner
  goat-button --> pc-icon
  style goat-date-picker fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with love!*
