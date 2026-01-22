# `src/badge/badge.ts`:

## class: `Badge`

### Superclass

| Name         | Module | Package |
| ------------ | ------ | ------- |
| `LitElement` |        | lit     |

### Fields

| Name             | Privacy | Type                  | Default | Description | Inherited From |
| ---------------- | ------- | --------------------- | ------- | ----------- | -------------- |
| `name`           |         | `string`              | `''`    |             |                |
| `src`            |         | `string \| undefined` |         |             |                |
| `slotHasContent` |         | `boolean`             | `false` |             |                |

### Attributes

| Name   | Field | Inherited From |
| ------ | ----- | -------------- |
| `name` | name  |                |
| `src`  | src   |                |

<hr/>

## Exports

| Kind | Name    | Declaration | Module             | Package |
| ---- | ------- | ----------- | ------------------ | ------- |
| `js` | `Badge` | Badge       | src/badge/badge.ts |         |

# `src/avatar/avatar.ts`:

## class: `Avatar`

### Superclass

| Name         | Module | Package |
| ------------ | ------ | ------- |
| `LitElement` |        | lit     |

### Fields

| Name   | Privacy | Type                  | Default | Description | Inherited From |
| ------ | ------- | --------------------- | ------- | ----------- | -------------- |
| `name` |         | `string`              | `''`    |             |                |
| `src`  |         | `string \| undefined` |         |             |                |

### Attributes

| Name   | Field | Inherited From |
| ------ | ----- | -------------- |
| `name` | name  |                |
| `src`  | src   |                |

<hr/>

## Exports

| Kind | Name     | Declaration | Module               | Package |
| ---- | -------- | ----------- | -------------------- | ------- |
| `js` | `Avatar` | Avatar      | src/avatar/avatar.ts |         |

# `src/avatar/p-avatar.ts`:

## class: `PAvatar`, `p-avatar`

### Superclass

| Name     | Module                | Package |
| -------- | --------------------- | ------- |
| `Avatar` | /src/avatar/avatar.js |         |

### Fields

| Name   | Privacy | Type                  | Default | Description | Inherited From |
| ------ | ------- | --------------------- | ------- | ----------- | -------------- |
| `name` |         | `string`              | `''`    |             | Avatar         |
| `src`  |         | `string \| undefined` |         |             | Avatar         |

### Attributes

| Name   | Field | Inherited From |
| ------ | ----- | -------------- |
| `name` | name  | Avatar         |
| `src`  | src   | Avatar         |

### CSS Properties

| Name                        | Default | Description                       |
| --------------------------- | ------- | --------------------------------- |
| `--avatar-background-color` |         | Controls the color of the avatar. |
| `--avatar-size`             |         | Controls the size of the avatar.  |

<hr/>

## Exports

| Kind                        | Name       | Declaration | Module                 | Package |
| --------------------------- | ---------- | ----------- | ---------------------- | ------- |
| `js`                        | `PAvatar`  | PAvatar     | src/avatar/p-avatar.ts |         |
| `custom-element-definition` | `p-avatar` | PAvatar     | src/avatar/p-avatar.ts |         |

# `src/icon/icon.ts`:

## class: `Icon`

### Superclass

| Name         | Module | Package |
| ------------ | ------ | ------- |
| `LitElement` |        | lit     |

### Fields

| Name       | Privacy | Type                                          | Default              | Description | Inherited From |
| ---------- | ------- | --------------------------------------------- | -------------------- | ----------- | -------------- |
| `name`     |         | `string \| undefined`                         |                      |             |                |
| `src`      |         | `string \| undefined`                         |                      |             |                |
| `provider` |         | `'material-symbols' \| 'carbon' \| undefined` | `'material-symbols'` |             |                |

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

<hr/>

## Exports

| Kind | Name   | Declaration | Module           | Package |
| ---- | ------ | ----------- | ---------------- | ------- |
| `js` | `Icon` | Icon        | src/icon/icon.ts |         |

# `src/icon/p-icon.ts`:

## class: `PIcon`, `p-icon`

### Superclass

| Name   | Module            | Package |
| ------ | ----------------- | ------- |
| `Icon` | /src/icon/icon.js |         |

### Fields

| Name       | Privacy | Type                                          | Default              | Description | Inherited From |
| ---------- | ------- | --------------------------------------------- | -------------------- | ----------- | -------------- |
| `name`     |         | `string \| undefined`                         |                      |             | Icon           |
| `src`      |         | `string \| undefined`                         |                      |             | Icon           |
| `provider` |         | `'material-symbols' \| 'carbon' \| undefined` | `'material-symbols'` |             | Icon           |

### Events

| Name         | Type          | Description | Inherited From |
| ------------ | ------------- | ----------- | -------------- |
| `icon-error` | `CustomEvent` |             | Icon           |

### Attributes

| Name       | Field    | Inherited From |
| ---------- | -------- | -------------- |
| `name`     | name     | Icon           |
| `src`      | src      | Icon           |
| `provider` | provider | Icon           |

### CSS Properties

| Name           | Default | Description                                       |
| -------------- | ------- | ------------------------------------------------- |
| `--icon-color` |         | Controls the color of the icon.                   |
| `--icon-size`  | `1rem`  | Controls the size of the icon. Defaults to "1rem" |

<hr/>

## Exports

| Kind                        | Name     | Declaration | Module             | Package |
| --------------------------- | -------- | ----------- | ------------------ | ------- |
| `js`                        | `PIcon`  | PIcon       | src/icon/p-icon.ts |         |
| `custom-element-definition` | `p-icon` | PIcon       | src/icon/p-icon.ts |         |
