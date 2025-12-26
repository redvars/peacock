# goat-url-input

A specialized input component for URL validation. This component provides real-time validation for URL inputs and visual feedback when an invalid URL is entered.

## Basic Usage

```html
<goat-url-input placeholder="Enter website URL"></goat-url-input>
```

## With initial value

```html
<goat-url-input value="https://example.com" placeholder="Enter website URL"></goat-url-input>
```

## Disabled state

```html
<goat-url-input disabled value="https://example.com"></goat-url-input>
```

<!-- Auto Generated Below -->


## Properties

| Property      | Attribute     | Description                                                                                               | Type                   | Default                      |
| ------------- | ------------- | --------------------------------------------------------------------------------------------------------- | ---------------------- | ---------------------------- |
| `debounce`    | `debounce`    | Set the amount of time, in milliseconds, to wait to trigger the `valueChange` event after each keystroke. | `number`               | `300`                        |
| `disabled`    | `disabled`    | If true, the user cannot interact with the input. Defaults to `false`.                                    | `boolean`              | `false`                      |
| `editing`     | `editing`     |                                                                                                           | `boolean`              | `false`                      |
| `label`       | `label`       |                                                                                                           | `string`               | `undefined`                  |
| `name`        | `name`        | The input field name.                                                                                     | `string`               | ``pc-input-url-${this.gid}`` |
| `placeholder` | `placeholder` | The input field placeholder.                                                                              | `string`               | `undefined`                  |
| `required`    | `required`    | If true, required icon is show. Defaults to `false`.                                                      | `boolean`              | `false`                      |
| `size`        | `size`        | The input field size. Possible values are: `"sm"`, `"md"`, `"lg"`. Defaults to `"md"`.                    | `"lg" \| "md" \| "sm"` | `'md'`                       |
| `skeleton`    | `skeleton`    |                                                                                                           | `boolean`              | `false`                      |
| `value`       | `value`       | The input field value.                                                                                    | `string`               | `undefined`                  |


## Events

| Event          | Description                             | Type                   |
| -------------- | --------------------------------------- | ---------------------- |
| `inputInvalid` | Emitted when the URL input is invalid.  | `CustomEvent<boolean>` |
| `valueChange`  | Emitted when a keyboard input occurred. | `CustomEvent<string>`  |


## Methods

### `getComponentId() => Promise<string>`

Get the component's unique ID

#### Returns

Type: `Promise<string>`



### `setBlur() => Promise<void>`

Sets blur on the native `input`. Use this method instead of the global
`input.blur()`.

#### Returns

Type: `Promise<void>`



### `setFocus() => Promise<void>`

Sets focus on the native `input`. Use this method instead of the global
`input.focus()`.

#### Returns

Type: `Promise<void>`




## Dependencies

### Depends on

- [pc-button](../../../button)
- [pc-icon](../../../icon)

### Graph
```mermaid
graph TD;
  pc-input-url --> pc-button
  pc-input-url --> pc-icon
  pc-button --> pc-elevation
  style pc-input-url fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with love!*
