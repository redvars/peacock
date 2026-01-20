# `src/index.ts`:

## Exports

| Kind | Name     | Declaration | Module             | Package |
| ---- | -------- | ----------- | ------------------ | ------- |
| `js` | `Icon`   | Icon        | ./icon/icon.js     |         |
| `js` | `Avatar` | Avatar      | ./avatar/avatar.js |         |

# `src/LoaderUtils.ts`:

## class: `LoaderUtils`

### Static Methods

| Name                | Privacy | Description | Parameters                                 | Return | Inherited From |
| ------------------- | ------- | ----------- | ------------------------------------------ | ------ | -------------- |
| `registerComponent` |         |             | `tagName: string, CustomElementClass: any` |        |                |

### Methods

| Name                  | Privacy | Description | Parameters                  | Return          | Inherited From |
| --------------------- | ------- | ----------- | --------------------------- | --------------- | -------------- |
| `start`               |         |             |                             |                 |                |
| `eagerLoadComponents` |         |             |                             |                 |                |
| `getFullTagName`      |         |             | `name: string`              |                 |                |
| `registerAsync`       |         |             | `tagName: string`           | `Promise<void>` |                |
| `load`                |         |             | `root: Element \| Document` | `Promise<void>` |                |
| `lazyLoadComponents`  |         |             | `root: any`                 |                 |                |

<hr/>

## Variables

| Name                 | Description | Type |
| -------------------- | ----------- | ---- |
| `CustomElementClass` |             |      |

<hr/>

## Exports

| Kind                        | Name           | Declaration        | Module             | Package |
| --------------------------- | -------------- | ------------------ | ------------------ | ------- |
| `js`                        | `LoaderConfig` | LoaderConfig       | src/LoaderUtils.ts |         |
| `js`                        | `LoaderUtils`  | LoaderUtils        | src/LoaderUtils.ts |         |
| `custom-element-definition` | `tagName`      | CustomElementClass | src/LoaderUtils.ts |         |
| `custom-element-definition` | `tagName`      | CustomElementClass | src/LoaderUtils.ts |         |

# `src/utils.ts`:

## Functions

| Name               | Description | Parameters       | Return |
| ------------------ | ----------- | ---------------- | ------ |
| `createCacheFetch` |             | `name: string`   |        |
| `sanitizeSvg`      |             | `rawSvg: string` |        |
| `getTypography`    |             | `name: string`   |        |

<hr/>

## Exports

| Kind | Name               | Declaration      | Module       | Package |
| ---- | ------------------ | ---------------- | ------------ | ------- |
| `js` | `createCacheFetch` | createCacheFetch | src/utils.ts |         |
| `js` | `sanitizeSvg`      | sanitizeSvg      | src/utils.ts |         |
| `js` | `getTypography`    | getTypography    | src/utils.ts |         |

# `src/avatar/avatar.css.ts`:

## Variables

| Name     | Description | Type |
| -------- | ----------- | ---- |
| `styles` |             |      |

<hr/>

## Exports

| Kind | Name     | Declaration | Module                   | Package |
| ---- | -------- | ----------- | ------------------------ | ------- |
| `js` | `styles` | styles      | src/avatar/avatar.css.ts |         |

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

### CSS Properties

| Name           | Default | Description                     |
| -------------- | ------- | ------------------------------- |
| `--icon-color` |         | Controls the color of the icon. |
| `--icon-size`  |         | Controls the size of the icon.  |

<hr/>

## Exports

| Kind | Name     | Declaration | Module               | Package |
| ---- | -------- | ----------- | -------------------- | ------- |
| `js` | `Avatar` | Avatar      | src/avatar/avatar.ts |         |

# `src/avatar/index.ts`:

## Exports

| Kind | Name     | Declaration | Module      | Package |
| ---- | -------- | ----------- | ----------- | ------- |
| `js` | `Avatar` | Avatar      | ./avatar.js |         |

# `src/icon/datasource.ts`:

## Functions

| Name        | Description | Parameters                       | Return |
| ----------- | ----------- | -------------------------------- | ------ |
| `fetchSVG`  |             | `url: string`                    |        |
| `fetchIcon` |             | `name: string, provider: string` |        |

<hr/>

## Exports

| Kind | Name        | Declaration | Module                 | Package |
| ---- | ----------- | ----------- | ---------------------- | ------- |
| `js` | `fetchSVG`  | fetchSVG    | src/icon/datasource.ts |         |
| `js` | `fetchIcon` | fetchIcon   | src/icon/datasource.ts |         |

# `src/icon/icon.css.ts`:

## Variables

| Name     | Description | Type |
| -------- | ----------- | ---- |
| `styles` |             |      |

<hr/>

## Exports

| Kind | Name     | Declaration | Module               | Package |
| ---- | -------- | ----------- | -------------------- | ------- |
| `js` | `styles` | styles      | src/icon/icon.css.ts |         |

# `src/icon/icon.ts`:

## class: `Icon`

### Superclass

| Name         | Module | Package |
| ------------ | ------ | ------- |
| `LitElement` |        | lit     |

### Fields

| Name       | Privacy | Type                                          | Default              | Description | Inherited From |
| ---------- | ------- | --------------------------------------------- | -------------------- | ----------- | -------------- |
| `name`     |         | `string \| undefined`                         | `'home'`             |             |                |
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

### CSS Properties

| Name           | Default | Description                                       |
| -------------- | ------- | ------------------------------------------------- |
| `--icon-color` |         | Controls the color of the icon.                   |
| `--icon-size`  | `1rem`  | Controls the size of the icon. Defaults to "1rem" |

<hr/>

## Exports

| Kind | Name   | Declaration | Module           | Package |
| ---- | ------ | ----------- | ---------------- | ------- |
| `js` | `Icon` | Icon        | src/icon/icon.ts |         |

# `src/icon/index.ts`:

## Exports

| Kind | Name   | Declaration | Module    | Package |
| ---- | ------ | ----------- | --------- | ------- |
| `js` | `Icon` | Icon        | ./icon.js |         |

# `src/icon/p-icon.ts`:

## class: `IconComponent`, `p-icon`

### Superclass

| Name   | Module            | Package |
| ------ | ----------------- | ------- |
| `Icon` | /src/icon/icon.js |         |

### Fields

| Name       | Privacy | Type                                          | Default              | Description | Inherited From |
| ---------- | ------- | --------------------------------------------- | -------------------- | ----------- | -------------- |
| `name`     |         | `string \| undefined`                         | `'home'`             |             | Icon           |
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

| Kind                        | Name            | Declaration   | Module             | Package |
| --------------------------- | --------------- | ------------- | ------------------ | ------- |
| `js`                        | `IconComponent` | IconComponent | src/icon/p-icon.ts |         |
| `custom-element-definition` | `p-icon`        | IconComponent | src/icon/p-icon.ts |         |
