# p4-modal



<!-- Auto Generated Below -->


## Properties

| Property     | Attribute     | Description                                                  | Type                   | Default     |
| ------------ | ------------- | ------------------------------------------------------------ | ---------------------- | ----------- |
| `heading`    | `heading`     |                                                              | `string`               | `undefined` |
| `hideClose`  | `hide-close`  |                                                              | `boolean`              | `false`     |
| `managed`    | `managed`     | Specify whether the Modal is managed by the parent component | `boolean`              | `false`     |
| `open`       | `open`        | Specify whether the Modal is currently open                  | `boolean`              | `false`     |
| `showLoader` | `show-loader` |                                                              | `boolean`              | `false`     |
| `size`       | `size`        |                                                              | `"lg" \| "md" \| "sm"` | `'md'`      |
| `subheading` | `subheading`  |                                                              | `string`               | `undefined` |


## Events

| Event             | Description                                                            | Type               |
| ----------------- | ---------------------------------------------------------------------- | ------------------ |
| `pc-modal--close` | On click of button, a CustomEvent 'pc-modal--close' will be triggered. | `CustomEvent<any>` |


## Dependencies

### Depends on

- [pc-elevation](../../elevation)
- [pc-button](../../button)
- [p-icon](../../icon)
- [pc-spinner](../../spinner)

### Graph
```mermaid
graph TD;
  pc-modal --> pc-elevation
  pc-modal --> pc-button
  pc-modal --> p-icon
  pc-modal --> pc-spinner
  pc-button --> pc-elevation
  style pc-modal fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with love!*
