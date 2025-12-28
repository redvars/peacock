# `src/Icon.ts`:

## class: `Icon`

### Superclass

| Name         | Module | Package |
| ------------ | ------ | ------- |
| `LitElement` |        | lit     |

### Fields

| Name             | Privacy | Type                                          | Default              | Description | Inherited From |
| ---------------- | ------- | --------------------------------------------- | -------------------- | ----------- | -------------- |
| `name`           |         | `string`                                      | `'home'`             |             |                |
| `src`            |         | `string`                                      | `''`                 |             |                |
| `provider`       |         | `'material-symbols' \| 'carbon' \| undefined` | `'material-symbols'` |             |                |
| `label`          |         | `string`                                      | `''`                 |             |                |
| `svgContent`     | private | `string`                                      | `''`                 |             |                |
| `loading`        | private | `boolean`                                     | `false`              |             |                |
| `error`          | private | `Error \| null`                               | `null`               |             |                |
| `_fetchId`       | private | `number`                                      | `0`                  |             |                |
| `_debounceTimer` | private | `number \| undefined`                         |                      |             |                |

### Methods

| Name               | Privacy | Description | Parameters | Return | Inherited From |
| ------------------ | ------- | ----------- | ---------- | ------ | -------------- |
| `__scheduleUpdate` | private |             |            |        |                |

### Events

| Name         | Type          | Description | Inherited From |
| ------------ | ------------- | ----------- | -------------- |
| `icon-error` | `CustomEvent` |             |                |

### Attributes

| Name       | Field    | Inherited From |
| ---------- | -------- | -------------- |
| `name`     | name     |                |
| `src`      | src      |                |
| `provider` | provider |                |
| `label`    | label    |                |

### CSS Properties

| Name           | Default | Description                     |
| -------------- | ------- | ------------------------------- |
| `--icon-color` |         | Controls the color of the icon. |
| `--icon-size`  |         | Controls the size of the icon.  |

<hr/>

## Exports

| Kind | Name   | Declaration | Module      | Package |
| ---- | ------ | ----------- | ----------- | ------- |
| `js` | `Icon` | Icon        | src/Icon.ts |         |
