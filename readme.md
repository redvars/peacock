# Peacock
**The foundation for beautiful user interfaces.**

[![Build](https://github.com/redvars/peacock/workflows/Build/badge.svg)](https://github.com/redvars/peacock/actions?workflow=Build)
[![GitHub license](https://img.shields.io/github/license/redvars/peacock.svg)](/LICENSE)
![Version](https://img.shields.io/npm/v/%40redvars%2Fpeacock)


<div align="center">
<img alt="Peacock LOGO" src="./logo.png" width="210">
</div>

Peacock gives you the tools and foundation to build beautiful, usable product interfaces. It’s the system you use to craft your own component library.

## What is Peacock?
Peacock is more than just a collection of components; it is an aesthetic philosophy. Like its avian namesake, it provides the core elements (the primitives) that allow the full, vibrant display (the design) to be unveiled.

**Opinionated Beauty:** We deliver pre-styled, beautiful components that follow modern design trends, significantly reducing the boilerplate needed to achieve a professional look.

**Foundation First:** Similar to projects like `shadcn/ui`, Peacock focuses on providing the foundational primitives, ensuring maximum flexibility for customization without sacrificing initial polish.

**Works in any framework:** The components are custom elements, so they work in plain HTML and every framework. React, Vue and Angular get packages with typed components and two-way binding (see [Frameworks](#frameworks)).

## Key Features
Vibrant & Consistent Design System: Every component—from buttons and cards to complex data tables—shares a cohesive, high-quality visual language.

**Highly Extensible:** The component structure is designed for easy overwriting and theme customization, allowing you to quickly adapt the style to your specific brand identity.

**Built for Accessibility:** Focus on semantic HTML and proper ARIA attributes to ensure that your beautiful interfaces are accessible to all users.

**Responsive by Default:** Components are built with responsiveness baked in, guaranteeing a graceful display across all screen sizes and devices.

## Documentation
Visit [https://peacock.redvars.com](https://peacock.redvars.com) to view the documentation.

## Getting Started


```html
<head>
  
   <!-- Default font : Noto Sans and Noto Sans Mono -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Mono:wght@100..900&family=Noto+Sans:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">

  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@redvars/peacock@4.0.0/dist/assets/styles.css"></link>
  <script type='module'
          src='https://cdn.jsdelivr.net/npm/@redvars/peacock@4.0.0/dist/loader.js'></script>
</head>

<wc-button>Button</wc-button>
```

### Frameworks

Each framework package is generated from `custom-elements.json`. It has typed props and events, two-way binding on fields and toggles, and it registers the elements you import, so no `loader.js` is needed:

| Package | Framework | Two-way binding |
|:--|:--|:--|
| [`@redvars/peacock-react`](https://github.com/redvars/peacock/tree/main/frameworks/react) | React 18 and 19 | `value` / `checked` with `onInput` / `onChange` |
| [`@redvars/peacock-vue`](https://github.com/redvars/peacock/tree/main/frameworks/vue) | Vue 3.3+ | `v-model` |
| [`@redvars/peacock-angular`](https://github.com/redvars/peacock/tree/main/frameworks/angular) | Angular 17+ | `ngModel`, `formControl`, `formControlName` |

```bash
npm install @redvars/peacock @redvars/peacock-react
```

```tsx
import '@redvars/peacock/styles.css';
import { Button, Input } from '@redvars/peacock-react';

<Input label="Name" value={name} onInput={event => setName(event.detail.value)} />
```

See [peacock.redvars.com/frameworks](https://peacock.redvars.com/frameworks/) for each framework.

### Icons without the CDN

`loader.js` fetches icons from cdn.jsdelivr.net. For a page that must stay on its own origin, such as an intranet or a page whose content security policy allows only `connect-src 'self'`, serve the package's `dist/` folder yourself and load `loader-full.js` instead. It loads the same components, and fetches Material Symbols from the copy it ships in `dist/icons/material-symbols/`:

```html
<script type='module' src='/assets/peacock/dist/loader-full.js'></script>
```

To keep icons somewhere else, call `setIconBase('material-symbols', '/my/icons/')` before the first icon renders; the folder holds one `<name>.svg` per icon.

`wc-code-editor` stays on the origin too: Monaco is bundled in the package and loaded when the first editor appears, and its language workers are `dist/monaco/*.worker.js`, which the page loads from beside the component. Serve the whole `dist/` folder.

### Translating Peacock's own text

Components render some text of their own: icon-button labels, screen-reader text, empty states, "3 selected". Every string has an English default, and `setPeacockStrings` replaces them for the whole page. Entries you leave out stay English, a string with values is a function, and connected components re-render.

```js
import { setPeacockStrings } from 'https://cdn.jsdelivr.net/npm/@redvars/peacock@4.0.0/dist/loader.js';

setPeacockStrings({
  dismiss: 'Fermer',
  noItems: 'Aucun élément',
  selectedCount: count => `${count} sélectionné(s)`,
});
```

`defaultStrings` lists every key. Components that render many strings (table, pagination, select, date picker, calendar, charts, code and rich-text editors, condition builder) also take a `strings` property that overrides the page's strings for that one instance.

Numbers and dates are formatted with `Intl` in a locale resolved per component: its `locale` property, else the `lang` of the nearest ancestor (across shadow roots), else `<html lang>`, else the browser's language.

### Forms and validation

Fields and toggles are form-associated and validate like native controls: `required` and each control's own rules (email, min/max, unreadable dates) block form submission, `:invalid` matches, and `checkValidity()`, `reportValidity()`, `setCustomValidity()`, `validity` and `validationMessage` work as on `<input>`. A field shows its message once the value is committed or the form is submitted. Fields fire `input` and `change` as `CustomEvent<{ value }>`; checkboxes, switches and radios fire `change` with `{ checked, value }`. Fields default to `size="sm"`, the height of a default button.

### Right to left

Set `dir="rtl"` on the page or any container. Components lay out with logical CSS properties, so they mirror; `npm run lint:css` rejects physical `left`/`right` properties in component styles.

### Density

Set `data-density="comfortable"` or `"compact"` on the page or any container (it needs `styles.css`). Each step takes 4px off the height of buttons, icon buttons, fields and table rows inside it.

### High contrast

In Windows high contrast (`forced-colors: active`), selected and current items are outlined in the system highlight color, and checkboxes, radios, switches and the tab indicator are drawn with system colors.

### Loader options

- `loader.js?styles` also loads `styles.css`.
- `loader.js` wraps `Element.prototype.attachShadow` once, so Peacock components rendered inside any shadow root load automatically. To leave `attachShadow` alone, load `loader.js?no-shadow-watch` and call `loadComponents(shadowRoot)` (exported from `loader.js`) for each shadow root that contains Peacock components.
- If a `wc-*` tag is already defined by other code, for example a second copy of Peacock, the loader keeps that definition and logs one warning.

# Components

Every component below ships in 4.0. Each name links to its page on [peacock.redvars.com](https://peacock.redvars.com/components), with live demos and the API reference. Upgrading from 3.x? Read the [migration guide](https://github.com/redvars/peacock/blob/main/MIGRATION.md).

## Layout and app shell

[App shell](https://peacock.redvars.com/components/app-shell) `wc-app-shell` ·
[App bar](https://peacock.redvars.com/components/app-bar) `wc-app-bar` ·
[Page header](https://peacock.redvars.com/components/page-header) `wc-page-header` ·
[Container](https://peacock.redvars.com/components/container) `wc-container` ·
[Stack](https://peacock.redvars.com/components/stack) `wc-stack` ·
[Grid](https://peacock.redvars.com/components/grid) `wc-grid` ·
[Card](https://peacock.redvars.com/components/card) `wc-card` ·
[Accordion](https://peacock.redvars.com/components/accordion) `wc-accordion` ·
[Resizable panels](https://peacock.redvars.com/components/resizable-panels) `wc-resizable-panels` ·
[Scroll area](https://peacock.redvars.com/components/scroll-area) `wc-scroll-area` ·
[Divider](https://peacock.redvars.com/components/divider) `wc-divider`

## Buttons

[Button](https://peacock.redvars.com/components/button) `wc-button` ·
[Link button](https://peacock.redvars.com/components/link-button) `wc-link-button` ·
[Icon button](https://peacock.redvars.com/components/icon-button) `wc-icon-button` ·
[FAB](https://peacock.redvars.com/components/fab) `wc-fab` ·
[Button group](https://peacock.redvars.com/components/button-group) `wc-button-group` ·
[Dropdown button](https://peacock.redvars.com/components/dropdown-button) `wc-dropdown-button` ·
[Split button](https://peacock.redvars.com/components/split-button) `wc-split-button` ·
[Segmented button](https://peacock.redvars.com/components/segmented-button-group) `wc-segmented-button-group` ·
[Copy button](https://peacock.redvars.com/components/copy-button) `wc-copy-button`

## Navigation

[Navigation drawer](https://peacock.redvars.com/components/navigation-drawer) `wc-navigation-drawer` ·
[Navigation rail](https://peacock.redvars.com/components/navigation-rail) `wc-navigation-rail` ·
[Navigation bar](https://peacock.redvars.com/components/navigation-bar) `wc-navigation-bar` ·
[Breadcrumb](https://peacock.redvars.com/components/breadcrumb) `wc-breadcrumb` ·
[Tabs](https://peacock.redvars.com/components/tabs) `wc-tabs` ·
[Pagination](https://peacock.redvars.com/components/pagination) `wc-pagination` ·
[Stepper](https://peacock.redvars.com/components/stepper) `wc-stepper` ·
[Anchor nav](https://peacock.redvars.com/components/anchor-nav) `wc-anchor-nav` ·
[Toolbar](https://peacock.redvars.com/components/toolbar) `wc-toolbar` ·
[Menu](https://peacock.redvars.com/components/menu) `wc-menu` ·
[Command palette](https://peacock.redvars.com/components/command-palette) `wc-command-palette` ·
[Workspace switcher](https://peacock.redvars.com/components/workspace-switcher) `wc-workspace-switcher` ·
[User menu](https://peacock.redvars.com/components/user-menu) `wc-user-menu` ·
[Link](https://peacock.redvars.com/components/link) `wc-link`

## Text inputs

[Input](https://peacock.redvars.com/components/input) `wc-input` ·
[Password field](https://peacock.redvars.com/components/password-field) `wc-password-field` ·
[Password rules](https://peacock.redvars.com/components/password-rules) `wc-password-rules` ·
[Number field](https://peacock.redvars.com/components/number-field) `wc-number-field` ·
[Currency field](https://peacock.redvars.com/components/currency-field) `wc-currency-field` ·
[Phone field](https://peacock.redvars.com/components/phone-field) `wc-phone-field` ·
[URL field](https://peacock.redvars.com/components/url-field) `wc-url-field` ·
[Textarea](https://peacock.redvars.com/components/textarea) `wc-textarea` ·
[Mention input](https://peacock.redvars.com/components/mention-input) `wc-mention-input` ·
[PIN input](https://peacock.redvars.com/components/pin-input) `wc-pin-input` ·
[Search](https://peacock.redvars.com/components/search) `wc-search` ·
[Inline edit](https://peacock.redvars.com/components/inline-edit) `wc-inline-edit`

## Selection

[Select](https://peacock.redvars.com/components/select) `wc-select` ·
[Listbox](https://peacock.redvars.com/components/listbox) `wc-listbox` ·
[Checkbox](https://peacock.redvars.com/components/checkbox) `wc-checkbox` ·
[Checkbox group](https://peacock.redvars.com/components/checkbox-group) `wc-checkbox-group` ·
[Radio](https://peacock.redvars.com/components/radio-group) `wc-radio`, `wc-radio-group` ·
[Switch](https://peacock.redvars.com/components/switch) `wc-switch` ·
[Slider](https://peacock.redvars.com/components/slider) `wc-slider` ·
[Rating](https://peacock.redvars.com/components/rating) `wc-rating` ·
[Chip set](https://peacock.redvars.com/components/chip) `wc-chip-set` ·
[Transfer list](https://peacock.redvars.com/components/transfer-list) `wc-transfer-list` ·
[Tree](https://peacock.redvars.com/components/tree) `wc-tree`

## Date and time

[Date field](https://peacock.redvars.com/components/date-field) `wc-date-field` ·
[Date range field](https://peacock.redvars.com/components/date-range-field) `wc-date-range-field` ·
[Date picker](https://peacock.redvars.com/components/date-picker) `wc-date-picker` ·
[Time field](https://peacock.redvars.com/components/time-field) `wc-time-field` ·
[Time picker](https://peacock.redvars.com/components/time-picker) `wc-time-picker` ·
[Date time field](https://peacock.redvars.com/components/datetime-field) `wc-datetime-field` ·
[Calendar](https://peacock.redvars.com/components/calendar) `wc-calendar` ·
[Clock](https://peacock.redvars.com/components/clock) `wc-clock` ·
[Relative time](https://peacock.redvars.com/components/relative-time) `wc-relative-time`

## Forms

[Form](https://peacock.redvars.com/components/form) `wc-form` ·
[Fieldset](https://peacock.redvars.com/components/fieldset) `wc-fieldset` ·
[Field](https://peacock.redvars.com/components/field) `wc-field` ·
[File upload](https://peacock.redvars.com/components/file-upload) `wc-file-upload` ·
[Signature pad](https://peacock.redvars.com/components/signature-pad) `wc-signature-pad` ·
[Color field](https://peacock.redvars.com/components/color-field) `wc-color-field` ·
[Color picker](https://peacock.redvars.com/components/color-picker) `wc-color-picker` ·
[Condition builder](https://peacock.redvars.com/components/condition-builder) `wc-condition-builder` ·
[Filter bar](https://peacock.redvars.com/components/filter-bar) `wc-filter-bar`

## Data display

[Table](https://peacock.redvars.com/components/table) `wc-table` ·
[List](https://peacock.redvars.com/components/list) `wc-list` ·
[Virtual list](https://peacock.redvars.com/components/virtual-list) `wc-virtual-list` ·
[Description list](https://peacock.redvars.com/components/description-list) `wc-description-list` ·
[Stat](https://peacock.redvars.com/components/stat) `wc-stat` ·
[Sparkline](https://peacock.redvars.com/components/sparkline) `wc-sparkline` ·
[Kanban](https://peacock.redvars.com/components/kanban) `wc-kanban` ·
[Timeline](https://peacock.redvars.com/components/timeline) `wc-timeline` ·
[JSON viewer](https://peacock.redvars.com/components/json-viewer) `wc-json-viewer` ·
[Diff viewer](https://peacock.redvars.com/components/diff-viewer) `wc-diff-viewer` ·
[Code highlighter](https://peacock.redvars.com/components/code-highlighter) `wc-code-highlighter` ·
[Number counter](https://peacock.redvars.com/components/number-counter) `wc-number-counter` ·
[Image](https://peacock.redvars.com/components/image) `wc-image` ·
SVG `wc-svg` ·
[Icon](https://peacock.redvars.com/components/icon) `wc-icon` ·
[Keyboard key](https://peacock.redvars.com/components/kbd) `wc-kbd`

## Charts

[Area](https://peacock.redvars.com/charts/area/) `wc-chart-area` ·
[Bar](https://peacock.redvars.com/charts/bar/) `wc-chart-bar` ·
[Line](https://peacock.redvars.com/charts/line/) `wc-chart-line` ·
[Pie](https://peacock.redvars.com/charts/pie/) `wc-chart-pie` ·
[Doughnut](https://peacock.redvars.com/charts/doughnut/) `wc-chart-doughnut`

## People and status

[Avatar](https://peacock.redvars.com/components/avatar) `wc-avatar` ·
[Avatar group](https://peacock.redvars.com/components/avatar-group) `wc-avatar-group` ·
[Presence indicator](https://peacock.redvars.com/components/presence-indicator) `wc-presence-indicator` ·
[Badge](https://peacock.redvars.com/components/badge) `wc-badge` ·
[Tag](https://peacock.redvars.com/components/tag) `wc-tag` ·
[Chip](https://peacock.redvars.com/components/chip) `wc-chip` ·
[Status indicator](https://peacock.redvars.com/components/status-indicator) `wc-status-indicator` ·
[Discussion](https://peacock.redvars.com/components/discussion) `wc-discussion`

## Feedback

[Alert](https://peacock.redvars.com/components/alert) `wc-alert` ·
[Banner](https://peacock.redvars.com/components/banner) `wc-banner` ·
[Snackbar](https://peacock.redvars.com/components/snackbar) `wc-snackbar` ·
[Notification manager](https://peacock.redvars.com/components/notification-manager) `wc-notification-manager` ·
[Notification center](https://peacock.redvars.com/components/notification-center) `wc-notification-center` ·
[Illustration](https://peacock.redvars.com/components/illustration) `wc-illustration` ·
[Skeleton](https://peacock.redvars.com/components/skeleton) `wc-skeleton` ·
[Circular progress](https://peacock.redvars.com/components/circular-progress) `wc-circular-progress` ·
[Linear progress](https://peacock.redvars.com/components/linear-progress) `wc-linear-progress` ·
[Redvars loader](https://peacock.redvars.com/components/redvars-loader) `wc-redvars-loader`

## Overlays

[Modal](https://peacock.redvars.com/components/modal) `wc-modal` ·
[Confirm dialog](https://peacock.redvars.com/components/confirm-dialog) `wc-confirm-dialog` ·
[Side sheet](https://peacock.redvars.com/components/side-sheet) `wc-side-sheet` ·
[Bottom sheet](https://peacock.redvars.com/components/bottom-sheet) `wc-bottom-sheet` ·
[Popover](https://peacock.redvars.com/components/popover) `wc-popover` ·
[Tooltip](https://peacock.redvars.com/components/tooltip) `wc-tooltip` ·
[Hover card](https://peacock.redvars.com/components/hover-card) `wc-hover-card` ·
[Tour](https://peacock.redvars.com/components/tour) `wc-tour`

## Editors

[Code editor](https://peacock.redvars.com/components/code-editor) `wc-code-editor` ·
[HTML editor](https://peacock.redvars.com/components/html-editor) `wc-html-editor` ·
[Markdown editor](https://peacock.redvars.com/components/markdown-editor) `wc-markdown-editor` ·
[Markdown](https://peacock.redvars.com/components/markdown) `wc-markdown` ·
[Comment composer](https://peacock.redvars.com/components/comment-composer) `wc-comment-composer` ·
[Document editor](https://peacock.redvars.com/components/document-editor) `wc-document-editor` ·
[Diagram](https://peacock.redvars.com/components/diagram) `wc-diagram`

## Primitives

[Ripple](https://peacock.redvars.com/components/ripple) `wc-ripple` ·
[Elevation](https://peacock.redvars.com/components/elevation) `wc-elevation` ·
[Focus ring](https://peacock.redvars.com/components/focus-ring) `wc-focus-ring`

## 📄 License

Peacock is open-source software licensed under the [Apache-2.0 License](LICENSE).

---

Made with 💖 by [Redvars](https://redvars.com).
