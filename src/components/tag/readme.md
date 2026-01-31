# goat-heading



<!-- Auto Generated Below -->


## Properties

| Property      | Attribute     | Description                                                                                                                 | Type                                                                                                           | Default     |
| ------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ----------- |
| `color`       | `color`       | Tag color. Possible values are: 'gray', 'blue', 'green', 'red', 'yellow', 'primary', 'success', 'info', 'warning', 'error'. | `"blue" \| "error" \| "gray" \| "green" \| "info" \| "primary" \| "red" \| "success" \| "warning" \| "yellow"` | `'gray'`    |
| `dismissible` | `dismissible` | If true, the tag will have a close icon.                                                                                    | `boolean`                                                                                                      | `false`     |
| `imageSrc`    | `image-src`   | Image source.                                                                                                               | `string`                                                                                                       | `undefined` |
| `selected`    | `selected`    | If true, the tag will be selected.                                                                                          | `boolean`                                                                                                      | `false`     |
| `size`        | `size`        | Text size.                                                                                                                  | `"md" \| "sm"`                                                                                                 | `'md'`      |
| `value`       | `value`       | Tag value.                                                                                                                  | `string`                                                                                                       | `''`        |


## Events

| Event          | Description                             | Type               |
| -------------- | --------------------------------------- | ------------------ |
| `tag--click`   | Emitted when the tag is clicked.        | `CustomEvent<any>` |
| `tag--dismiss` | Emitted when the close icon is clicked. | `CustomEvent<any>` |


## Dependencies

### Used by

 - [goat-cb-compound-expression](../application/condition-builder/cb-compound-expression)
 - [goat-cb-predicate](../application/condition-builder/cb-predicate)
 - [goat-condition-builder](../application/condition-builder/condition-builder)
 - [pc-code-editor](../input-controls/code-editor)
 - [pc-flow-designer](../application/flow-designer/flow-designer)
 - [pc-select](../input-controls/select)

### Depends on

- [p-icon](../icon)
- [pc-elevation](../elevation)

### Graph
```mermaid
graph TD;
  pc-tag --> p-icon
  pc-tag --> pc-elevation
  goat-cb-compound-expression --> pc-tag
  goat-cb-predicate --> pc-tag
  goat-condition-builder --> pc-tag
  pc-code-editor --> pc-tag
  pc-flow-designer --> pc-tag
  pc-select --> pc-tag
  style pc-tag fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with love!*
