# goat-button



<!-- Auto Generated Below -->


## Properties

| Property         | Attribute         | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Type                                                                                                                                                                           | Default     |
| ---------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| `appendData`     | `append-data`     | The `appendData` property allows you to attach additional data to the button component. This data can be of any type, making it versatile for various use cases. It's particularly useful for passing extra context or information that can be accessed in event handlers or other component logic.                                                                                                                                                                                                       | `any`                                                                                                                                                                          | `undefined` |
| `color`          | `color`           | Defines the primary color of the button. This can be set to predefined color names to apply specific color themes.                                                                                                                                                                                                                                                                                                                                                                                        | `"black" \| "danger" \| "primary" \| "secondary" \| "success" \| "warning" \| "white"`                                                                                         | `'primary'` |
| `configAria`     | `config-aria`     |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | `any`                                                                                                                                                                          | `{}`        |
| `darkModeColor`  | `dark-mode-color` | Color variant for dark mode, applicable when [data-theme="dark"] is set.                                                                                                                                                                                                                                                                                                                                                                                                                                  | `"black" \| "danger" \| "primary" \| "secondary" \| "success" \| "warning" \| "white"`                                                                                         | `undefined` |
| `disabled`       | `disabled`        | If true, the user cannot interact with the button. Defaults to `false`.                                                                                                                                                                                                                                                                                                                                                                                                                                   | `boolean`                                                                                                                                                                      | `false`     |
| `disabledReason` | `disabled-reason` | If button is disabled, the reason why it is disabled.                                                                                                                                                                                                                                                                                                                                                                                                                                                     | `string`                                                                                                                                                                       | `''`        |
| `href`           | `href`            | Hyperlink to navigate to on click.                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | `string`                                                                                                                                                                       | `undefined` |
| `icon`           | `icon`            | Icon which will displayed on button. Possible values are icon names.                                                                                                                                                                                                                                                                                                                                                                                                                                      | `string`                                                                                                                                                                       | `undefined` |
| `iconAlign`      | `icon-align`      | Icon alignment. Possible values are `"start"`, `"end"`. Defaults to `"end"`.                                                                                                                                                                                                                                                                                                                                                                                                                              | `"end" \| "start"`                                                                                                                                                             | `'end'`     |
| `selected`       | `selected`        | Button selection state.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | `boolean`                                                                                                                                                                      | `false`     |
| `showLoader`     | `show-loader`     | If true, a loader will be displayed on button.                                                                                                                                                                                                                                                                                                                                                                                                                                                            | `boolean`                                                                                                                                                                      | `false`     |
| `size`           | `size`            | Button size. Possible values are `"sm"`, `"md"`, `"lg"`, `"xl"`, `"2xl"`, `"full"`. Defaults to `"md"`.                                                                                                                                                                                                                                                                                                                                                                                                   | `"2xl" \| "lg" \| "md" \| "sm" \| "xl" \| "xs"`                                                                                                                                | `'md'`      |
| `target`         | `target`          | Sets or retrieves the window or frame at which to target content.                                                                                                                                                                                                                                                                                                                                                                                                                                         | `string`                                                                                                                                                                       | `'_self'`   |
| `throttleDelay`  | `throttle-delay`  | Sets the delay for throttle in milliseconds. Defaults to 200 milliseconds.                                                                                                                                                                                                                                                                                                                                                                                                                                | `number`                                                                                                                                                                       | `200`       |
| `toggle`         | `toggle`          | If true, the button will be in a toggled state.                                                                                                                                                                                                                                                                                                                                                                                                                                                           | `boolean`                                                                                                                                                                      | `false`     |
| `type`           | `type`            | Button type based on which actions are performed when the button is clicked.                                                                                                                                                                                                                                                                                                                                                                                                                              | `"button" \| "reset" \| "submit"`                                                                                                                                              | `'button'`  |
| `variant`        | `variant`         | The visual style of the button.   Possible variant values: `"default"` is a filled button. `"outline"` is an outlined button. `"ghost"` is a transparent button. `"light"` is a light color button.  Possible sub-variant values: `"simple"` is a simple button without default padding at end. `"block"` is a full-width button that spans the full width of its container.    Mix and match the `variant` and `sub-variant` to create a variety of buttons.  `"default.simple"`, `"outline.block"` etc. | `"default" \| "default.simple" \| "ghost" \| "ghost.simple" \| "light" \| "light.simple" \| "link" \| "link.simple" \| "neo" \| "neo.simple" \| "outline" \| "outline.simple"` | `'default'` |


## Events

| Event                | Description                           | Type                                |
| -------------------- | ------------------------------------- | ----------------------------------- |
| `goat-button--click` | Triggered when the button is clicked. | `CustomEvent<{ appendData: any; }>` |


## Methods

### `setBlur() => Promise<void>`

Sets blur on the native `button` in `goat-button`. Use this method instead of the global
`button.blur()`.

#### Returns

Type: `Promise<void>`



### `setFocus() => Promise<void>`

Sets focus on the native `button` in `goat-button`. Use this method instead of the global
`button.focus()`.

#### Returns

Type: `Promise<void>`



### `triggerClick() => Promise<void>`

Triggers a click event on the native `button` in `goat-button`. Use this method instead of the global
`button.click()`.

#### Returns

Type: `Promise<void>`




## CSS Custom Properties

| Name                                   | Description                                                                                              |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `--goat-button-border-radius`          | Button border radius.                                                                                    |
| `--goat-button-border-style`           | Button border style.                                                                                     |
| `--goat-button-color`                  | Button filling color.                                                                                    |
| `--goat-button-color-active`           | Button filling color on active.                                                                          |
| `--goat-button-color-hover`            | Button filling color on hover.                                                                           |
| `--goat-button-color-light`            | Button filling color for light variant.                                                                  |
| `--goat-button-padding`                | Button padding.                                                                                          |
| `--goat-button-support-contrast-color` | Button support color (text or border). Should be white or black based on weight of button filling color. |
| `--goat-theme-button-border-radius`    | Theme level button border radius. (applies to all buttons)                                               |
| `--goat-theme-button-border-style`     | Theme level button border style. (applies to all buttons)                                                |


## Dependencies

### Used by

 - [goat-calendar](../../application/calendar/calendar)
 - [goat-code-highlighter](../../application/code-highlighter)
 - [goat-date-picker](../../input-controls/data-and-time/date/date-picker)
 - [goat-empty-state](../../application/empty-state)
 - [goat-flow-designer](../../application/flow-designer/flow-designer)
 - [goat-header-action](../../application/header/header-action)
 - [goat-header-brand](../../application/header/header-brand)
 - [goat-html-editor](../../input-controls/html-editor)
 - [goat-input](../../input-controls/input/input)
 - [goat-input-url](../../input-controls/input/input-url)
 - [goat-modal](../../modal/modal)
 - [goat-notification](../../notification)
 - [goat-number](../../input-controls/input/number)
 - [goat-select](../../input-controls/select)
 - [goat-table](../../table)
 - [goat-textarea](../../input-controls/input/textarea)
 - [goat-time-picker](../../input-controls/data-and-time/date/time-picker)

### Depends on

- [goat-spinner](../../spinner)
- [goat-icon](../../icon)

### Graph
```mermaid
graph TD;
  goat-button --> goat-spinner
  goat-button --> goat-icon
  goat-calendar --> goat-button
  goat-code-highlighter --> goat-button
  goat-date-picker --> goat-button
  goat-empty-state --> goat-button
  goat-flow-designer --> goat-button
  goat-header-action --> goat-button
  goat-header-brand --> goat-button
  goat-html-editor --> goat-button
  goat-input --> goat-button
  goat-input-url --> goat-button
  goat-modal --> goat-button
  goat-notification --> goat-button
  goat-number --> goat-button
  goat-select --> goat-button
  goat-table --> goat-button
  goat-textarea --> goat-button
  goat-time-picker --> goat-button
  style goat-button fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with love!*
