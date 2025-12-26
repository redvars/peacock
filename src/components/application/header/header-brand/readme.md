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

- [pc-button](../../../button)
- [pc-icon](../../../icon)
- [pc-divider](../../../divider)

### Graph
```mermaid
graph TD;
  goat-header-brand --> pc-button
  goat-header-brand --> pc-icon
  goat-header-brand --> pc-divider
  pc-button --> pc-elevation
  style goat-header-brand fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with love!*
