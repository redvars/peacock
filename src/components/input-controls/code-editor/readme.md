# pc-code-editor



<!-- Auto Generated Below -->


## Properties

| Property      | Attribute      | Description                                                                                            | Type                               | Default                  |
| ------------- | -------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------- | ------------------------ |
| `debounce`    | `debounce`     | Set the amount of time, in milliseconds, to wait to trigger the `onChange` event after each keystroke. | `number`                           | `250`                    |
| `disabled`    | `disabled`     | If true, the user cannot interact with the button. Defaults to `false`.                                | `boolean`                          | `false`                  |
| `language`    | `language`     |                                                                                                        | `"html" \| "javascript" \| "json"` | `'javascript'`           |
| `libSource`   | `lib-source`   |                                                                                                        | `any`                              | `undefined`              |
| `lineNumbers` | `line-numbers` |                                                                                                        | `"off" \| "on"`                    | `'on'`                   |
| `minimap`     | `minimap`      |                                                                                                        | `boolean`                          | `false`                  |
| `name`        | `name`         | The input field name.                                                                                  | `string`                           | ``pc-input-${this.gid}`` |
| `readonly`    | `readonly`     |                                                                                                        | `boolean`                          | `false`                  |
| `required`    | `required`     | If true, required icon is show. Defaults to `false`.                                                   | `boolean`                          | `false`                  |
| `value`       | `value`        | The input field value.                                                                                 | `string`                           | `undefined`              |


## Events

| Event                    | Description                         | Type               |
| ------------------------ | ----------------------------------- | ------------------ |
| `pc-code-editor--change` | Emitted when the value has changed. | `CustomEvent<any>` |


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

 - [goat-html-editor](../html-editor)

### Depends on

- [pc-tag](../../tag)
- [pc-spinner](../../spinner)

### Graph
```mermaid
graph TD;
  pc-code-editor --> pc-tag
  pc-code-editor --> pc-spinner
  pc-tag --> pc-icon
  pc-tag --> pc-elevation
  goat-html-editor --> pc-code-editor
  style pc-code-editor fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with love!*
