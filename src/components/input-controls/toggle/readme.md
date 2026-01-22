# goat-checkbox



<!-- Auto Generated Below -->


## Properties

| Property     | Attribute     | Description                                                             | Type      | Default                      |
| ------------ | ------------- | ----------------------------------------------------------------------- | --------- | ---------------------------- |
| `configAria` | `config-aria` |                                                                         | `any`     | `{}`                         |
| `disabled`   | `disabled`    | If true, the user cannot interact with the button. Defaults to `false`. | `boolean` | `false`                      |
| `label`      | `label`       | The checkbox label.                                                     | `string`  | `undefined`                  |
| `name`       | `name`        | The input field name.                                                   | `string`  | `` `pc-input-${this.gid}` `` |
| `readonly`   | `readonly`    |                                                                         | `boolean` | `false`                      |
| `required`   | `required`    | If true, required icon is show. Defaults to `false`.                    | `boolean` | `false`                      |
| `rounded`    | `rounded`     |                                                                         | `boolean` | `true`                       |
| `value`      | `value`       | The input field value.                                                  | `boolean` | `false`                      |


## Events

| Event               | Description                                                                                                                         | Type               |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `pc-toggle--blur`   | Emitted when the input loses focus.                                                                                                 | `CustomEvent<any>` |
| `pc-toggle--change` | On change of input a CustomEvent 'goat-change' will be triggered. Event details contains parent event, oldValue, newValue of input. | `CustomEvent<any>` |
| `pc-toggle--focus`  | Emitted when the input has focus.                                                                                                   | `CustomEvent<any>` |


## Methods

### `getComponentId() => Promise<string>`



#### Returns

Type: `Promise<string>`



### `setBlur() => Promise<void>`

Sets blur on the native `input` in `pc-toggle`. Use this method instead of the global
`input.blur()`.

#### Returns

Type: `Promise<void>`



### `setFocus() => Promise<void>`

Sets focus on the native `input` in `pc-toggle`. Use this method instead of the global
`input.focus()`.

#### Returns

Type: `Promise<void>`




## Dependencies

### Used by

 - [goat-html-editor](../html-editor)

### Graph
```mermaid
graph TD;
  goat-html-editor --> pc-toggle
  style pc-toggle fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with love!*
