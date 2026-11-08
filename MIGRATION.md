# Migrating from Peacock 3.x to 4.0

Peacock 4.0 cleans up the component APIs so that every component follows the same conventions ([ADR-030001](docs/adr/030001-component-api-conventions.md)): one event contract, one vocabulary, one size scale and logical placements. It also adds more than 50 components. This guide lists everything you may need to change when you upgrade from 3.17.

## New in 4.1

4.1 adds components and changes nothing you must migrate: `npm install @redvars/peacock@4.1`, or change the CDN URLs to `@4.1.0`.

- **Diagrams,** on one shared infinite canvas with `wc-diagram-controls` (zoom, fit, back to start, undo) and `wc-diagram-minimap`:
  - `wc-workflow` builds business rules and processes from structured steps (branches that merge back, parallel paths, loops, waits, error paths, ends) with rich step cards, a step palette, drag-to-move, undo and an accessible tree. Its `debug` and `history` modes show a run from your engine (status per step, the path taken, breakpoints, a debug bar, loop iterations), and `wc-workflow-timeline` shows the run's timeline.
  - `wc-tree-chart` lays out org charts and other hierarchies as tidy trees (compact teams, lazy children, search, drag to reparent).
  - `wc-dependency-map` explores service meshes and asset relationships (force, layered and radial layouts, collapsible groups, health rings, traffic-weighted edges, upstream and downstream impact, focus on a node's neighbourhood).
  - `wc-erd` draws entity-relationship diagrams (column rows joined by crow's-foot relations, automatic layout, collapsible tables, schema filter) and, with `editable`, designs schemas (rename, add and remove columns, drag a column onto another to relate them, undo).
- **`wc-flow` is now `wc-diagram`,** an infinite canvas with an editor (`editable`: connect, marquee, multi-select, alignment guides, delete, copy and paste, undo). `wc-flow`, the `Flow*` types and the `--flow-*` custom properties keep working until 5.0; see [wc-flow → wc-diagram](#wc-flow--wc-diagram-41).
- **Fields:** the `outlined` variant of `wc-field` and the text fields is the Material 3 outlined text field, with its label floating into a notch in the outline. Checkbox, switch and radio toggle when clicked through an external `<label for>` or a wrapping `<label>`.

## How to upgrade

1. Update the package: `npm install @redvars/peacock@4`, or change the CDN URLs from `@3.x` to `@4.0.0`.
2. Search your code for the tags and attributes in [Removed components](#removed-components) and [Changes by component](#changes-by-component), and apply the replacements. Most are renames.
3. Check the [behaviour changes](#behaviour-changes-across-components): they need no code change, but you may see them in your tests or screenshots.

## Removed components

| 3.x | 4.0 |
|:--|:--|
| `wc-notification` | `wc-alert` for a message inside the page (`intent`, `dismissible`, an `action` slot), or `wc-snackbar` / `wc-notification-manager` for a toast. |
| `wc-sidebar-menu`, `wc-sidebar-menu-item`, `wc-sidebar-sub-menu` | `wc-navigation-drawer` with `wc-navigation-drawer-item` and `wc-navigation-drawer-group` for expandable groups. It fires `change` with `{ value, index, item }`. |
| `wc-spinner` | `<wc-circular-progress indeterminate>`. |
| `wc-empty-state` | Compose the empty, error or success message you need from `wc-illustration` (more than 15 ready-made illustrations: `empty`, `no-results`, `not-found`, `server-error`, `no-access`, `offline`, `success` and others), a heading, text and buttons. `wc-table` draws its own empty and error states the same way; its `empty` and `error` slots still take your own content. |

## Changes across all components

- **Sizes:** only `xs`, `sm`, `md`, `lg` and `xl` remain. The long names `extra-small`, `small`, `medium`, `large` and `extra-large` are no longer mapped.
- **Placements:** overlays (menu, popover, tooltip, dropdown and split buttons, hover card, tour, notification center) take `top`, `bottom`, `start` or `end`, optionally with `-start` or `-end`. The physical `left` and `right` are gone: `left` → `start`, `right` → `end` in left-to-right pages. `start` and `end` follow the writing direction.
- **Current item:** `active` → `current` on navigation bar, rail and drawer items and on breadcrumb items. They set `aria-current="page"`.
- **Toggles:** setting `value` to `true` or `false` on `wc-checkbox`, `wc-switch` or `wc-radio` no longer checks them. Use `checked`; `value` is only the string submitted with the form (default `"on"`).
- **Events:**
  - Value controls fire `input` and `change` as `CustomEvent`s with `detail.value`.
  - Overlays fire `open`, and `close` with `detail.reason`: `escape`, `light-dismiss`, `action`, `timeout` or `api`.
  - Component-prefixed events (`modal-close`, `snackbar-close`, `nav-change`, `tag--dismiss`, `wc-popover--open`, ...) are gone. Each component's section below lists its replacement.
  - Native events from inner elements no longer leak out of components.
- **Start and end slots:** `leading` → `start` and `trailing` → `end` on `wc-app-bar`, `wc-search` and `wc-list-item`.

## Behaviour changes across components

These need no code change in most apps.

- **Field height:** text fields, selects and pickers default to `size="sm"` (40px), the same height as a default button. Set `size="md"` for the old height.
- **Overlays:** modal, side sheet, bottom sheet, popover, menu, tooltip and snackbar render in the browser's top layer, above any `z-index`. Escape closes only the topmost overlay. Focus returns to where it was when an overlay closes, except after a click outside it.
- **Forms:** Peacock fields are form-associated. They take part in native constraint validation (`required`, `minlength`, `pattern`, `min`, `max`, ...), block form submission while invalid, show the message under the field, and reset with the form.
- **Attributes:** `value` is no longer reflected to an attribute on `wc-select`, `wc-color-field`, `wc-slider` and the pickers. Read the `value` property.
- **Text:** every string Peacock renders comes from one table. Translate it once with `setPeacockStrings()`; components follow the nearest `lang` attribute for dates and numbers.
- **Right to left:** components mirror in `dir="rtl"` pages.

## Changes by component

Each item reads `3.x` → `4.0`.


### wc-button
- `href` (and with it `target`, `rel`, `download`) → `wc-link-button`. `wc-button` always renders a native `<button>` now; an `href` attribute is ignored.
- `size="small|medium|large|extra-small|extra-large"` → `sm|md|lg|xs|xl` (long names are no longer mapped).

### wc-icon-button, wc-link-button, wc-button-group, wc-split-button
- `size="small|medium|large|extra-small|extra-large"` → `sm|md|lg|xs|xl` (long names are no longer mapped).

### wc-dropdown-button
- `toggle-menu` event (`detail.open`) → `open` and `close` events fired on the dropdown button. `close` carries `detail.reason` (`action` for an item pick, `escape`, `light-dismiss` for a press outside or Tab, `api` for `close()`); `open` has no detail.
- `placement="left…|right…"` → `start…|end…` (logical, follows the writing direction; `left` → `start`, `right` → `end` in left-to-right pages).

### wc-split-button
- `toggle-menu` event (`detail.open`) → `open` and `close` events fired on the split button. `close` carries `detail.reason` as on `wc-dropdown-button` (closing through the primary action is `api`).
- `placement="left…|right…"` → `start…|end…` (logical).

### wc-menu
- `opened` event → `open` (note: `open` bubbles and is composed; check `event.target` to skip submenus).
- `closed` event (`detail.reason` = menu reason object) → `close`. The menu reason object is now `detail.cause`; `detail.reason` is the shared overlay reason string (`action`, `escape`, `light-dismiss`, `api`). `close` bubbles and is composed.
- `placement="left…|right…"` → `start…|end…` (logical).

### wc-segmented-button-group
- `multi-select` attribute / `multiSelect` property → `multiple`.

### wc-segmented-button
- `segmented-button--change` event → `change` (same detail: `{ value, selected, originalEvent }`).

### wc-chip
- `tag--dismiss` event → `dismiss`.

### wc-tag
- `color` → `intent` (`red` → `danger`, `green` → `success`, `yellow` / `orange` → `warning`, `blue` → `info`) or `accent="purple"` for purple; `color="default"` → leave both unset.
- `dismissible` → use `wc-chip dismissible` (a tag is read-only and has no dismiss button).
- `dismiss` and `tag--dismiss` events → `dismiss` on `wc-chip`.
- `effectiveIntent` / `effectiveAccent` getters → read `intent` / `accent` (they only differed for the removed `color`).

### wc-divider
- `vertical` attribute → `orientation="vertical"`.

### wc-image
- `image-title` attribute / `imageTitle` property → `alt`.

### wc-svg
- `image-title` attribute / `imageTitle` property → `alt`.

### wc-list-item
- `selected` → `current` for the current row in a navigation list (also sets `aria-current`), or `wc-listbox` to let the person choose items.
- `slot="leading"` → `slot="start"`.
- `slot="trailing"` → `slot="end"`.


### wc-input
- `type="password"` → `wc-password-field` (the show/hide button moved with it; `type` is now `text | email | tel`)
- `inline` → removed (it had no effect)

### wc-textarea
- `inline` → removed (it had no effect)

### wc-number-field
- `inline` → removed (it had no effect)

### wc-field
- `help` → `helper-text` (`help` was never rendered)

### wc-url-field
- `editing` attribute and property → removed; editing is internal and starts when the field gets focus or the edit button is clicked
- `value-change` event → `input` / `change` (`detail` is now `{ value }`, not the string; there is no debounce)
- `debounce` → removed (it only timed `value-change`)
- `input-invalid` event → `validity` / `checkValidity()` (an invalid URL sets `validity.typeMismatch`)

### wc-search
- `leading` slot → `start`
- `trailing` slot → `end`

### wc-select
- `select-search` event → `search` (same `detail: { value }`)

### wc-date-field
- `range` → `wc-date-range-field`
- `months` → `wc-date-range-field` `months`
- `input` event in range mode → `wc-date-range-field` `input`; `wc-date-field` now fires `input` only before `change` when the clear button clears it

### wc-time-field
- `step` → `minute-step` (minutes, as before)

### wc-datetime-field
- `step` → `minute-step` (minutes, as before)

### wc-time-picker
- `step` → `minute-step` (minutes, as before)

### wc-slider
- `labeled` → `value-label="thumb"` (default) / `labeled="false"` → `value-label="none"`
- `show-value` → `value-label="end"`
- `valueLabel` now defaults to `'thumb'` instead of `undefined`

### wc-checkbox / wc-switch / wc-radio
- setting `value` to a boolean → `checked` (`value` is only the submitted string now)

### wc-code-editor
- `label` as the header title (a `label` without `file-name`) → `file-name`; `label` is now always the field label above the editor
- `fileName` now defaults to `''` instead of `undefined` (`file-name=""` and no `file-name` both mean no header)
- `line-numbers="on"` → `line-numbers` (or leave it out: on by default)
- `line-numbers="off"` → `line-numbers="false"`
- `lineNumbers = 'on' | 'off'` (property) → `lineNumbers = true | false`

### wc-html-editor
Rebuilt on the same editor as `wc-markdown-editor` (Tiptap 3), with its toolbar, selection bubble, slash menu, block handle, link editor and mention list.
- `show-toolbar` / `showToolbar = false` → `hide-toolbar`
- Mentions use the same API as `wc-mention-input`: `mentions` (`{ label, value }[]`), `mentions-search`, `suggestion-character` and `hide-suggestion-character` → `triggers` (default `@`), `suggestions` (`{ id, label, description?, avatar? }[]`) and `suggestions-loading`.
- `search` event with `detail.callback` → `search` event with `detail: { trigger, query }`; answer it by setting `suggestions`. A picked suggestion fires `mention`.
- A mention is stored as `<span data-type="mention" data-id="…" data-label="…">@…</span>`.
- The Visual / HTML switch below the editor → the **View source** button at the end of the toolbar.
- The value is the editor's HTML as is; it is no longer reformatted with js-beautify.
- The `HtmlEditorMention` type is removed; use `MentionSuggestion`.
- `--html-editor-min-height` → `rows` (and `max-rows`); `--html-editor-toolbar-background` and `--html-editor-toolbar-border-color` are removed.

### wc-markdown-editor
Rebuilt on Tiptap 3 and the shared rich-text core; the value is still Markdown.
- The Editor / Markdown switch below the editor → the **View source** button at the end of the toolbar.
- New fixed toolbar (text style, marks, link, lists, checklist, quote, code block, table, divider, mention); `hide-toolbar` hides it.
- Underline is no longer offered: Markdown cannot store it.
- New: mentions (`triggers`, `suggestions`, `suggestions-loading`, `search` and `mention` events), links, tables, checklists, `maxlength`, `rows` and `max-rows`.
- `--markdown-editor-min-height` → `rows` (and `max-rows`); `--markdown-editor-bubble-background` and `--markdown-editor-slash-background` are removed (the popups use the surface container color).
- Italic is written as `*text*` instead of `_text_`.
- Strings: `editorMode`, `markdownMode`, `visualMode`, `htmlMode`, `unorderedList` and `orderedList` → `viewSource`, `bulletedList` and `numberedList`.


### wc-modal
- `show-loader` → `loading`
- `no-scrim-close` → `no-light-dismiss`
- `modal-close` event → `close`. `detail.reason` values changed: `close-button` → `action`, `scrim` → `light-dismiss`, `escape` → `escape`, `programmatic` → `api`.

### wc-side-sheet
- `position` → `placement`: `left` → `start`, `right` → `end` (logical, so the edge flips in right-to-left pages).
- `side-sheet-close` event → `close`. Reasons: `close-button` → `action`, `scrim` → `light-dismiss`, `escape` → `escape`, `programmatic` → `api`.

### wc-bottom-sheet
- `show-handle` / `showHandle = false` → `hide-handle` (inverted: set `hide-handle` to hide the handle).
- `bottom-sheet-close` event → `close`. Reasons: `esc` → `escape`, `scrim` → `light-dismiss`, `drag` → `action`, `programmatic` → `api`.

### wc-popover
- `wc-popover--open` event → `open`
- `wc-popover--close` event → `close` (now with `detail.reason`)
- `placement="left" | "right"` (and `-start` / `-end` forms) → `start` / `end`

### wc-tooltip
- `variant="rich"` → `wc-popover` with `wc-popover-content`. The `variant` property is gone (only the plain tooltip remains), along with the rich-only `title` and `actions` slots.
- `placement="left" | "right"` → `start` / `end`

### wc-snackbar
- `show-close-icon` → `dismissible`
- `snackbar-close` event → `close`. Reasons: `timeout` → `timeout`, `action` → `action`, `dismiss` (close button) → `action`, `dismiss` (Escape) → `escape`, `programmatic` → `api`.
- `snackbar-action` event → `action`

### wc-notification-manager
- `position` → `placement`: `top-right` → `top-end`, `top-left` → `top-start`, `bottom-right` → `bottom-end`, `bottom-left` → `bottom-start`.
- Window event `notification` → `peacock-toast` (same `detail`).
- Window event `notification-dismiss` → `peacock-toast-dismiss` (same `detail.notifications`).
- Toast option `variant` → `intent` (`error` → `danger`).
- Toast option `timeout` → `duration`.
- `notification-manager-action` event → `action` (same `detail.id`).
- `notification-manager-dismiss` event → `close` (`detail.id` plus `detail.reason`; fires for every close, not only the close button and Escape).

### wc-alert
- `variant` (meaning) → `intent` (`error` → `danger`). The `variant` property is gone.

### wc-accordion-item
- `accordion-item-toggle` event → `open` / `close` (`detail.reason` instead of `detail.open`).


### wc-table
- `selection-type="checkbox"` → `selection="multiple"`
- `paginate` (the built-in pagination) → a `wc-pagination` in the `footer` slot. `page` and `page-size` stay on the table and follow the slotted pagination.
- `page-sizes` → `page-sizes` on the slotted `wc-pagination`
- `total-items` → `total-items` on the slotted `wc-pagination` (managed mode)
- `has-next` → `has-next` on the slotted `wc-pagination`
- `pagination-variant` → `variant` on the slotted `wc-pagination`
- `page` event fired by the table (built-in pagination only) → listen for the `page` event of the slotted `wc-pagination` (it bubbles through the table with the same `{ page, pageSize }` detail)

### wc-tab, wc-tabs, wc-tab-group
- `active` on `wc-tab` → `selected` (also no longer read by `wc-tab-group` to find the initial tab)
- `disabledreason` / `disabledReason` attribute → `disabled-reason`
- `throttledelay` / `throttleDelay` attribute → `throttle-delay`
- `tab-click` event on `wc-tabs` → `change` (same `{ index, value }` detail)
- Linking a panel to a tab by the tab's `target` in `wc-tab-group` → `value` on the tab and the panel (without values, tabs and panels match by position)

### wc-breadcrumb-item
- `active` → `current`

### wc-navigation-bar-item, wc-navigation-rail-item, wc-navigation-drawer-item
- `active` → `current` (the inner `.active` class is now `.current`)

### wc-navigation-rail
- `nav-change` event → `change` (same `{ value, index, item }` detail)

### wc-app-bar
- `slot="leading"` → `slot="start"`
- `slot="trailing"` → `slot="end"`

### wc-calendar (and the internal wc-calendar-column-view, wc-calendar-month-view)
- `show-loader` → `loading`
- `event-clickable` (`eventClickable = false`) → `events-readonly` (inverted: `events-readonly` makes events not clickable)

### wc-chart-bar, wc-chart-line, wc-chart-area
- `index` (category field) → `category-key`

### All charts (wc-chart-bar, wc-chart-line, wc-chart-area, wc-chart-pie, wc-chart-doughnut)
- `show-legend` → `legend="show"`
- `hide-legend` → `legend="hide"`
- `chart-select` event → `select` (same detail)

### wc-chart-pie
- `inner-radius` → use `wc-chart-doughnut`, which owns `inner-radius` and the centre label. A pie no longer draws a hole.

### wc-flow → wc-diagram (4.1)
- **Renamed:** `wc-flow` is now `wc-diagram` (class `Diagram`, entry `diagram.js`). `wc-flow` keeps working as a deprecated alias with a console warning until 5.0, but only `wc-diagram` gets React, Vue and Angular wrappers, so framework users switch to the `Diagram` component.
- **Types:** the `Flow*` types are now `Diagram*`: `DiagramNode`, `DiagramEdge`, `DiagramPort`, `DiagramIntent`, `DiagramStrokeVariant`, `DiagramHandlePosition`, `DiagramEdgeType`, `DiagramMarker`, `DiagramConnector`, `DiagramStartPosition`, `DiagramView`, `DiagramPoint` and the event details `DiagramNodeMoveDetail`, `DiagramSelectDetail`, `DiagramConnectDetail`, `DiagramChangeDetail`, `DiagramChangeReason`, `DiagramDeleteDetail`, `DiagramViewportDetail`. The `Flow*` names stay as deprecated aliases until 5.0.
- **Custom properties:** `--flow-*` → `--diagram-*` (`--diagram-background`, `--diagram-dot-color`, `--diagram-line-color`, `--diagram-hover-color`, `--diagram-port-size`, `--diagram-node-background`, `--diagram-node-border`, `--diagram-node-shadow`, `--diagram-node-active-shadow`). The old names are still read as fallbacks until 5.0.
- **Infinite canvas:** the diagram no longer grows to fit its nodes and scrolls. It fills its own size (give it a height), pans and zooms without limits, and opens at `start-position` (`fit` by default, which may zoom out). `padding` is the space kept around content when fitting. `zoom` now follows wheel and pinch zooming.
- **Ports:** `inputs` and `outputs` are deprecated in favour of `ports: [{ id, side, type }]`; they still work, with a console warning, until 5.0. `sourceHandle` and `targetHandle` name a port id; side names keep working for nodes without `ports`.
- **Node content:** an element in `data` (or `data.element`) is deprecated; put it in an element with `slot="node:<id>"`. `data.label` is deprecated; use `headline` (with `supportingText`, `icon`, `intent`).
- **Edges:** `type: 'smoothstep'` is deprecated; use `elbow`, the new default, with larger rounded corners. Edges draw their `label` and take `markerStart` and `markerEnd`.
- **Events:** `select` now carries `kind` (`node` or `edge`), and `node` is only set for nodes. `connect` is cancelable. New: `change`, `delete` and `viewport-change`.


## New in 4.0

These components are new, so there is nothing to migrate. The [README](readme.md#components) lists every component by group.

- **Forms:** `wc-form` (error summary, unsaved-changes tracking, server errors), `wc-fieldset`, `wc-checkbox-group`, `wc-file-upload`, `wc-signature-pad`.
- **Inputs:** `wc-password-field`, `wc-password-rules`, `wc-pin-input`, `wc-phone-field`, `wc-currency-field`, `wc-date-range-field`, `wc-mention-input`, `wc-inline-edit`, `wc-rating`, `wc-listbox`, `wc-transfer-list`, `wc-tree`.
- **Layout and navigation:** `wc-app-shell`, `wc-page-header`, `wc-stack`, `wc-grid`, `wc-resizable-panels`, `wc-scroll-area`, `wc-stepper`, `wc-anchor-nav`, `wc-command-palette`, `wc-workspace-switcher`, `wc-user-menu`, `wc-link-button`, `wc-copy-button`.
- **Data:** table column resize, reorder, show/hide, multi-sort, column groups, row details, inline editing, grouping, totals, virtual scrolling and CSV export; `wc-filter-bar`, `wc-description-list`, `wc-stat`, `wc-sparkline`, `wc-virtual-list`, `wc-kanban`, `wc-json-viewer`, `wc-diff-viewer`.
- **Feedback and overlays:** `wc-confirm-dialog`, `wc-banner`, `wc-notification-center`, `wc-tour`, `wc-hover-card`, `wc-illustration` (illustrations for empty, error and success screens), `wc-redvars-loader` (the Redvars r as a loading indicator).
- **People and status:** `wc-avatar-group`, `wc-presence-indicator`, `wc-status-indicator`, `wc-relative-time`, `wc-kbd`.
- **Rich text:** `wc-markdown`, which shows Markdown safely (raw HTML stays text, unsafe links are not followed) with mention chips, plus `extractMentions()` to find who a value mentions. The editors are built on Tiptap 3.
- **Discussion:** `wc-discussion` with `wc-discussion-comment` (Markdown comments, one level of replies, inline reply and edit) and `wc-discussion-activity` (field and status changes between the comments), and `wc-comment-composer`, a rich-text comment box with mentions that sends with Ctrl+Enter. They replace the `wc-comment-thread` and `wc-comment` of the 4.0 previews.
- **Documents:** `wc-document-editor`, a word processor with real pages (A4, Letter, Legal; portrait or landscape; margin presets), page breaks, a repeating header and footer with page numbers, tables, resizable images (stored by the app through `image-upload`), text color, alignment, an outline and print. The value is JSON (`DocumentValue`); `getMarkdown()` and `getHTML()` export the body. Inline comments highlight text and line up app-owned threads (such as `wc-discussion`) beside it. Realtime collaboration on Yjs (`collaboration = { document, provider, user }`) shares edits, the header, footer, page setup and comments, with named carets and presence; `yjs` is an optional peer dependency, loaded only when collaboration is used.
