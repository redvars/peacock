# goat-code-editor



<!-- Auto Generated Below -->


## Properties

| Property                  | Attribute                   | Description                                                                                            | Type                                  | Default                    |
| ------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------- | -------------------------- |
| `debounce`                | `debounce`                  | Set the amount of time, in milliseconds, to wait to trigger the `onChange` event after each keystroke. | `number`                              | `250`                      |
| `disabled`                | `disabled`                  | If true, the user cannot interact with the button. Defaults to `false`.                                | `boolean`                             | `false`                    |
| `layer`                   | `layer`                     |                                                                                                        | `"01" \| "02" \| "background"`        | `undefined`                |
| `lineNumbers`             | `line-numbers`              |                                                                                                        | `"off" \| "on"`                       | `'on'`                     |
| `mentions`                | --                          |                                                                                                        | `{ label: string; value: string; }[]` | `[]`                       |
| `mentionsSearch`          | `mentions-search`           |                                                                                                        | `"contains" \| "managed"`             | `'contains'`               |
| `name`                    | `name`                      | The input field name.                                                                                  | `string`                              | ``goat-input-${this.gid}`` |
| `placeholder`             | `placeholder`               | The input field placeholder.                                                                           | `string`                              | `undefined`                |
| `readonly`                | `readonly`                  |                                                                                                        | `boolean`                             | `false`                    |
| `required`                | `required`                  | If true, required icon is show. Defaults to `false`.                                                   | `boolean`                             | `false`                    |
| `showSuggestionCharacter` | `show-suggestion-character` |                                                                                                        | `boolean`                             | `true`                     |
| `showToolbar`             | `show-toolbar`              |                                                                                                        | `boolean`                             | `true`                     |
| `suggestionCharacter`     | `suggestion-character`      |                                                                                                        | `string`                              | `'@'`                      |
| `theme`                   | `theme`                     |                                                                                                        | `"vs-dark" \| "vs-light"`             | `'vs-light'`               |
| `value`                   | `value`                     | The input field value.                                                                                 | `string`                              | `undefined`                |


## Events

| Event                      | Description                             | Type               |
| -------------------------- | --------------------------------------- | ------------------ |
| `goat-html-editor--change` | Emitted when the value has changed..    | `CustomEvent<any>` |
| `goat-html-editor--search` | Emitted when a keyboard input occurred. | `CustomEvent<any>` |


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

- [pc-button](../../button)
- [pc-icon](../../icon)
- [goat-code-editor](../code-editor)
- [pc-toggle](../toggle)
- [goat-menu](../../menu/menu)
- [goat-menu-item](../../menu/menu-item)

### Graph
```mermaid
graph TD;
  goat-html-editor --> pc-button
  goat-html-editor --> pc-icon
  goat-html-editor --> goat-code-editor
  goat-html-editor --> pc-toggle
  goat-html-editor --> goat-menu
  goat-html-editor --> goat-menu-item
  pc-button --> pc-elevation
  goat-code-editor --> pc-tag
  pc-tag --> pc-icon
  goat-menu --> goat-empty-state
  goat-empty-state --> goat-svg
  goat-empty-state --> pc-button
  goat-empty-state --> pc-icon
  goat-menu-item --> pc-icon
  style goat-html-editor fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with love!*
