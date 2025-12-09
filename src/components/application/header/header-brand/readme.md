# p4-top-navigation



<!-- Auto Generated Below -->


## Properties

| Property   | Attribute   | Description | Type     | Default     |
| ---------- | ----------- | ----------- | -------- | ----------- |
| `href`     | `href`      |             | `string` | `'#'`       |
| `logo`     | `logo`      |             | `string` | `undefined` |
| `name`     | `name`      |             | `string` | `undefined` |
| `subTitle` | `sub-title` |             | `string` | `undefined` |


## Methods

### `setColor(color: string) => Promise<void>`



#### Parameters

| Name    | Type     | Description |
| ------- | -------- | ----------- |
| `color` | `string` |             |

#### Returns

Type: `Promise<void>`




## Dependencies

### Depends on

- [goat-button](../../../button)
- [goat-svg](../../../svg)
- [goat-divider](../../../divider)

### Graph
```mermaid
graph TD;
  goat-header-brand --> goat-button
  goat-header-brand --> goat-svg
  goat-header-brand --> goat-divider
  goat-button --> goat-spinner
  goat-button --> pc-icon
  style goat-header-brand fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with love!*
