# goat-progress-indicator



<!-- Auto Generated Below -->


## Properties

| Property    | Attribute   | Description                                                                                                        | Type      | Default     |
| ----------- | ----------- | ------------------------------------------------------------------------------------------------------------------ | --------- | ----------- |
| `clickable` | `clickable` | If true, steps are clickable and component emits `goatStepSelect`.                                                 | `boolean` | `false`     |
| `current`   | `current`   | Current active step (1-based).                                                                                     | `number`  | `1`         |
| `labels`    | `labels`    | Comma separated labels, e.g. "Start,Details,Confirm". If omitted, generic "Step 1", "Step 2", ... labels are used. | `string`  | `undefined` |
| `total`     | `total`     | Total number of steps. Ignored if `labels` is provided.                                                            | `number`  | `3`         |


## Events

| Event            | Description                                     | Type                  |
| ---------------- | ----------------------------------------------- | --------------------- |
| `goatStepSelect` | Emitted when a step is clicked (1-based index). | `CustomEvent<number>` |


----------------------------------------------

*Built with love!*
