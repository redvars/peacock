# goat-menu-item



<!-- Auto Generated Below -->


## Properties

| Property   | Attribute  | Description                                                             | Type      | Default     |
| ---------- | ---------- | ----------------------------------------------------------------------- | --------- | ----------- |
| `disabled` | `disabled` | If true, the user cannot interact with the button. Defaults to `false`. | `boolean` | `false`     |
| `heading`  | `heading`  | The menu item value.                                                    | `string`  | `undefined` |
| `open`     | `open`     | Menu item selection state.                                              | `boolean` | `false`     |


## Events

| Event                        | Description                            | Type               |
| ---------------------------- | -------------------------------------- | ------------------ |
| `goat-accordion-item--click` | Emitted when the menu item is clicked. | `CustomEvent<any>` |


## Shadow Parts

| Part      | Description |
| --------- | ----------- |
| `"title"` |             |


## CSS Custom Properties

| Name                                                                                                      | Description |
| --------------------------------------------------------------------------------------------------------- | ----------- |
| `--goat-accordion-item-heading-background - Background color of the accordion item header`                |             |
| `--goat-accordion-item-heading-background-hover - Background color of the accordion item header on hover` |             |
| `--goat-accordion-item-title-align - Alignment of the accordion title`                                    |             |


## Dependencies

### Depends on

- [goat-icon](../../icon)

### Graph
```mermaid
graph TD;
  goat-accordion-item --> goat-icon
  style goat-accordion-item fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with love!*
