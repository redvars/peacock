import { i, _ as __decorate, I as IndividualComponent } from './IndividualComponent-BK7XZjE2.js';
import { R as RichTextInput } from './rich-text-input-FjTrfe0N.js';
import './property-B2TG3KEE.js';
import './state-BCeDVCI9.js';
import './query-CHb9Ft_d.js';
import './base-Cl6v8-BZ.js';
import './class-map-NDIkZErE.js';
import './directive-ZPhl09Yt.js';
import './style-map-CHOg6N_R.js';
import './slash-controller-oDkAgSII.js';
import './diff-CT416thw.js';
import './ai-controller-DR_Tg0sN.js';
import './locale-DEsJZCQG.js';
import './sparkle-BmtM0vbq.js';
import './stream-C16hbcio.js';
import './floating-controller-CABF4tBT.js';
import './overlay-controller-BOk-kfil.js';
import './mention--NNhafc7.js';
import './url-BFUh__RO.js';
import './BaseInput-BqE3rprN.js';
import './element-internals-QME0yEz4.js';
import './form-associated-BHbg72PG.js';
import './strings-MXyrGrNs.js';
import './suggestion-controller-BKMbUhgq.js';
import './i18n-controller-DLJcJ5gO.js';

var css_248z = i`* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

.screen-reader-only {
  position: absolute !important;
  inline-size: 1px !important;
  block-size: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip-path: inset(50%) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

[hidden] {
  display: none !important;
}

@media (forced-colors: active) {
  .selected,
  [aria-selected=true],
  [aria-pressed=true],
  [aria-checked=true],
  [aria-current]:not([aria-current=false]) {
    outline: 2px solid Highlight;
    outline-offset: -2px;
  }
  .disabled,
  [aria-disabled=true] {
    color: GrayText;
  }
}
.ProseMirror {
  position: relative;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  white-space: break-spaces;
  font-variant-ligatures: none;
  font-feature-settings: "liga" 0;
}

.ProseMirror [contenteditable=false] {
  white-space: normal;
}

.ProseMirror [contenteditable=false] [contenteditable=true] {
  white-space: pre-wrap;
}

.ProseMirror pre {
  white-space: pre-wrap;
}

img.ProseMirror-separator {
  display: inline !important;
  border: none !important;
  margin: 0 !important;
  inline-size: 0 !important;
  block-size: 0 !important;
}

.ProseMirror-gapcursor {
  display: none;
  pointer-events: none;
  position: absolute;
  margin: 0;
}

.ProseMirror-focused .ProseMirror-gapcursor {
  display: block;
}

.ProseMirror-hideselection *::selection {
  background: transparent;
}

.ProseMirror-hideselection * {
  caret-color: transparent;
}

.mention-anchor {
  position: fixed;
  inline-size: 1px;
  pointer-events: none;
  visibility: hidden;
}

.mention-list {
  --_option-height: calc(2.75rem + var(--density, 0) * 0.25rem);
  margin: 0;
  border: 0;
  inset: auto;
  position: fixed;
  top: 0;
  left: 0;
  box-sizing: border-box;
  inline-size: var(--mention-list-width, 18rem);
  max-inline-size: calc(100vw - 2 * var(--spacing-100, 0.5rem));
  max-block-size: min(var(--mention-list-max-height, 16rem), var(--floating-available-height, 100vh));
  overflow-y: auto;
  padding: var(--spacing-050, 0.25rem);
  background-color: var(--color-surface-container);
  color: var(--color-on-surface);
  border-radius: var(--shape-corner-small);
  box-shadow: var(--elevation-level2);
}

.mention-option {
  align-items: center;
  border-radius: var(--shape-corner-extra-small);
  cursor: pointer;
  display: flex;
  gap: var(--spacing-100, 0.5rem);
  min-block-size: var(--_option-height);
  padding: var(--spacing-050, 0.25rem) var(--spacing-100, 0.5rem);
}
.mention-option.active {
  background-color: var(--color-secondary-container);
  color: var(--color-on-secondary-container);
}

.mention-option-avatar {
  flex: none;
}

.mention-option-text {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-inline-size: 0;
}

.mention-option-label {
  font-family: var(--typography-body-medium-font-family);
  font-size: var(--typography-body-medium-font-size);
  font-weight: var(--typography-body-medium-font-weight);
  line-height: var(--typography-body-medium-line-height);
  letter-spacing: var(--typography-body-medium-letter-spacing);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mention-option-description {
  font-family: var(--typography-body-small-font-family);
  font-size: var(--typography-body-small-font-size);
  font-weight: var(--typography-body-small-font-weight);
  line-height: var(--typography-body-small-line-height);
  letter-spacing: var(--typography-body-small-letter-spacing);
  color: var(--color-on-surface-variant);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mention-loading {
  font-family: var(--typography-body-medium-font-family);
  font-size: var(--typography-body-medium-font-size);
  font-weight: var(--typography-body-medium-font-weight);
  line-height: var(--typography-body-medium-line-height);
  letter-spacing: var(--typography-body-medium-letter-spacing);
  align-items: center;
  color: var(--color-on-surface-variant);
  display: flex;
  gap: var(--spacing-100, 0.5rem);
  padding: var(--spacing-100, 0.5rem);
}

.mention-loading-indicator {
  --progress-height: 1.25rem;
}

@media (forced-colors: active) {
  .mention-list {
    border: 1px solid CanvasText;
  }
  .mention-option.active {
    outline: 2px solid Highlight;
    outline-offset: -2px;
  }
}
:host {
  display: block;
  inline-size: 100%;
  min-inline-size: 0;
  position: relative;
  --_line: var(--typography-body-large-line-height, 1.5rem);
}

:host([size=sm]) {
  --_line: var(--typography-body-medium-line-height, 1.25rem);
}

.rich-text-field {
  --field-height: auto;
  --field-padding-block: 0;
  inline-size: 100%;
}

.shell {
  display: flex;
  flex-direction: column;
  min-inline-size: 0;
  position: relative;
}

.toolbar {
  --toolbar-gap: var(--spacing-025, 0.125rem);
  --toolbar-wrap: wrap;
  display: block;
  padding-block: var(--spacing-050, 0.25rem);
  border-block-end: 1px solid var(--color-outline-variant);
  border-radius: 0;
}

.toolbar wc-divider {
  block-size: 1.25rem;
  margin-inline: var(--spacing-050, 0.25rem);
}

.toolbar-spacer {
  flex: 1;
}

.read-only-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-050, 0.25rem);
  padding: 0 var(--spacing-100, 0.5rem);
  color: var(--color-on-surface-variant);
  font-family: var(--typography-label-small-font-family) !important;
  font-size: var(--typography-label-small-font-size) !important;
  font-weight: var(--typography-label-small-font-weight) !important;
  line-height: var(--typography-label-small-line-height) !important;
  letter-spacing: var(--typography-label-small-letter-spacing) !important;
}
.read-only-badge wc-icon {
  --icon-size: 0.875rem;
}

.editor-area {
  --_pad: var(--spacing-150, 0.75rem);
  position: relative;
  padding-block: var(--_pad);
  min-block-size: calc(var(--_rows, 4) * var(--_line) + 2 * var(--_pad));
  background: var(--rich-text-editor-background, transparent);
  cursor: text;
  font-family: var(--typography-body-large-font-family);
  font-size: var(--typography-body-large-font-size);
  font-weight: var(--typography-body-large-font-weight);
  line-height: var(--typography-body-large-line-height);
  letter-spacing: var(--typography-body-large-letter-spacing);
}
.editor-area.hidden {
  display: none;
}
.editor-area.with-handle {
  padding-inline-start: 2.75rem;
}

@media (hover: none) {
  .editor-area.with-handle {
    padding-inline-start: 0;
  }
  .block-handle {
    display: none;
  }
}
.max-rows .editor-area {
  max-block-size: calc(var(--_max-rows) * var(--_line) + 2 * var(--_pad));
  overflow-y: auto;
}

:host([size=sm]) .editor-area {
  font-family: var(--typography-body-medium-font-family);
  font-size: var(--typography-body-medium-font-size);
  font-weight: var(--typography-body-medium-font-weight);
  line-height: var(--typography-body-medium-line-height);
  letter-spacing: var(--typography-body-medium-letter-spacing);
}

.editor-root,
.ProseMirror {
  outline: none;
  min-block-size: calc(var(--_rows, 4) * var(--_line));
}

.ProseMirror {
  color: var(--color-on-surface);
  overflow-wrap: break-word;
}
.ProseMirror > :first-child {
  margin-block-start: 0;
}
.ProseMirror > :last-child {
  margin-block-end: 0;
}
.ProseMirror p {
  margin: 0 0 0.5em;
}
.ProseMirror h1,
.ProseMirror h2,
.ProseMirror h3,
.ProseMirror h4,
.ProseMirror h5,
.ProseMirror h6 {
  margin: 1.25em 0 0.4em;
  color: var(--color-on-surface);
}
.ProseMirror h1 {
  font-family: var(--typography-headline-small-font-family);
  font-size: var(--typography-headline-small-font-size);
  font-weight: var(--typography-headline-small-font-weight);
  line-height: var(--typography-headline-small-line-height);
  letter-spacing: var(--typography-headline-small-letter-spacing);
}
.ProseMirror h2 {
  font-family: var(--typography-title-large-font-family);
  font-size: var(--typography-title-large-font-size);
  font-weight: var(--typography-title-large-font-weight);
  line-height: var(--typography-title-large-line-height);
  letter-spacing: var(--typography-title-large-letter-spacing);
}
.ProseMirror h3,
.ProseMirror h4,
.ProseMirror h5,
.ProseMirror h6 {
  font-family: var(--typography-title-medium-font-family);
  font-size: var(--typography-title-medium-font-size);
  font-weight: var(--typography-title-medium-font-weight);
  line-height: var(--typography-title-medium-line-height);
  letter-spacing: var(--typography-title-medium-letter-spacing);
}
.ProseMirror ul,
.ProseMirror ol {
  margin: 0 0 0.5em;
  padding-inline-start: 1.5em;
}
.ProseMirror li > p {
  margin: 0;
}
.ProseMirror li + li {
  margin-block-start: 0.15em;
}
.ProseMirror ul[data-type=taskList],
.ProseMirror ul.task-list {
  list-style: none;
  padding-inline-start: 0.25em;
}
.ProseMirror ul[data-type=taskList] li,
.ProseMirror ul.task-list li {
  display: flex;
  align-items: flex-start;
  gap: 0.5em;
}
.ProseMirror ul[data-type=taskList] li > label,
.ProseMirror ul.task-list li > label {
  flex: none;
  margin-block-start: 0.2em;
}
.ProseMirror ul[data-type=taskList] li > div,
.ProseMirror ul.task-list li > div {
  flex: 1;
  min-inline-size: 0;
}
.ProseMirror blockquote {
  margin: 0 0 0.5em;
  padding-inline-start: 0.85em;
  border-inline-start: 3px solid var(--color-outline-variant);
  border-radius: 0;
  color: var(--color-on-surface-variant);
}
.ProseMirror code {
  font-family: var(--font-family-monospace, monospace);
  font-size: 0.875em;
  background: var(--prose-code-background, var(--color-surface-container-high));
  padding: 0.1em 0.35em;
  border-radius: var(--shape-corner-extra-small);
}
.ProseMirror pre {
  margin: 0 0 0.5em;
  padding: 0.75em 1em;
  overflow-x: auto;
  background: var(--prose-code-background, var(--color-surface-container-high));
  border-radius: var(--shape-corner-small);
  font-family: var(--font-family-monospace, monospace);
  font-size: 0.875em;
  line-height: 1.5;
}
.ProseMirror pre code {
  font-size: inherit;
  background: none;
  padding: 0;
  border-radius: 0;
}
.ProseMirror hr {
  border: none;
  border-block-start: 1px solid var(--color-outline-variant);
  border-radius: 0;
  margin: 1em 0;
}
.ProseMirror a {
  color: var(--prose-link-color, var(--color-primary));
  text-decoration: underline;
  text-underline-offset: 0.15em;
}
.ProseMirror strong {
  font-weight: 600;
}
.ProseMirror table {
  border-collapse: collapse;
  margin: 0 0 0.5em;
  inline-size: max-content;
  max-inline-size: 100%;
  display: block;
  overflow-x: auto;
}
.ProseMirror th,
.ProseMirror td {
  border: 1px solid var(--color-outline-variant);
  padding: 0.35em 0.65em;
  text-align: start;
  vertical-align: top;
}
.ProseMirror th {
  background: var(--color-surface-container-low);
  font-weight: 600;
}
.ProseMirror img {
  max-inline-size: 100%;
  block-size: auto;
}
.ProseMirror .mention {
  display: inline-block;
  padding: 0 0.35em;
  border-radius: var(--shape-corner-full);
  background: var(--prose-mention-background, var(--color-primary-container));
  color: var(--prose-mention-color, var(--color-on-primary-container));
  font-weight: 500;
  line-height: inherit;
  text-decoration: none;
  white-space: nowrap;
}
.ProseMirror {
  white-space: pre-wrap;
  word-break: break-word;
}
.ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: inline-start;
  block-size: 0;
  color: var(--color-on-surface-variant);
  pointer-events: none;
}
.ProseMirror ul[data-type=taskList] li > label input {
  cursor: pointer;
}
.ProseMirror .selectedCell {
  background: var(--color-secondary-container);
}
.ProseMirror .ProseMirror-selectednode {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
.ProseMirror .column-resize-handle {
  position: absolute;
  inset-block: 0;
  inset-inline-end: -2px;
  inline-size: 4px;
  background: var(--color-primary);
  pointer-events: none;
}
.ProseMirror .tableWrapper {
  overflow-x: auto;
}
.ProseMirror.resize-cursor {
  cursor: col-resize;
}

.ProseMirror-dropcursor {
  border-block-start: 2px solid var(--color-primary);
  border-radius: 0;
}

.ProseMirror-gapcursor::after {
  border-block-start: 1px solid var(--color-on-surface);
  border-radius: 0;
}

:host([disabled]) .toolbar,
:host([disabled]) .editor-area {
  opacity: var(--state-disabled-content-opacity, 0.38);
}
:host([disabled]) .editor-area {
  cursor: not-allowed;
}

:host([readonly]) .editor-area {
  cursor: default;
}

.source {
  --code-editor-height: calc(
    var(--_rows, 4) * var(--_line) + 2 * var(--spacing-150, 0.75rem) + 4rem
  );
  padding-block: var(--spacing-100, 0.5rem);
}

.slash-anchor,
.bubble-anchor,
.link-anchor {
  position: fixed;
  inline-size: 1px;
  pointer-events: none;
  visibility: hidden;
}

.slash-menu {
  margin: 0;
  border: 0;
  inset: auto;
  position: fixed;
  top: 0;
  left: 0;
  box-sizing: border-box;
  background-color: var(--color-surface-container);
  color: var(--color-on-surface);
  border-radius: var(--shape-corner-small);
  box-shadow: var(--elevation-level2);
  inline-size: 16rem;
  max-block-size: min(20rem, var(--floating-available-height, 100vh));
  overflow-y: auto;
  padding: var(--spacing-050, 0.25rem);
}

.slash-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-100, 0.5rem);
  min-block-size: 2.25rem;
  padding: 0 var(--spacing-100, 0.5rem);
  border-radius: var(--shape-corner-extra-small);
  cursor: pointer;
  font-family: var(--typography-body-medium-font-family);
  font-size: var(--typography-body-medium-font-size);
  font-weight: var(--typography-body-medium-font-weight);
  line-height: var(--typography-body-medium-line-height);
  letter-spacing: var(--typography-body-medium-letter-spacing);
}
.slash-item.active {
  background-color: var(--color-secondary-container);
  color: var(--color-on-secondary-container);
}

.slash-item-label {
  flex: 1;
}

.slash-item-hint {
  color: var(--color-on-surface-variant);
  font-family: var(--font-family-monospace, monospace);
  font-size: 0.75rem;
}

.slash-empty {
  padding: var(--spacing-100, 0.5rem);
  color: var(--color-on-surface-variant);
  font-family: var(--typography-body-medium-font-family);
  font-size: var(--typography-body-medium-font-size);
  font-weight: var(--typography-body-medium-font-weight);
  line-height: var(--typography-body-medium-line-height);
  letter-spacing: var(--typography-body-medium-letter-spacing);
}

.bubble-menu {
  margin: 0;
  border: 0;
  inset: auto;
  position: fixed;
  top: 0;
  left: 0;
  box-sizing: border-box;
  background-color: var(--color-surface-container);
  color: var(--color-on-surface);
  border-radius: var(--shape-corner-small);
  box-shadow: var(--elevation-level2);
  display: none;
  gap: var(--spacing-025, 0.125rem);
  padding: var(--spacing-050, 0.25rem);
  border-radius: var(--shape-corner-full);
}
.bubble-menu:popover-open {
  display: flex;
}

.sparkle {
  inline-size: 1.125rem;
  block-size: 1.125rem;
  flex: none;
  fill: currentColor;
}

.ghost-text {
  color: var(--color-on-surface-variant);
  opacity: 0.7;
  pointer-events: none;
  user-select: none;
}

.slash-group {
  padding: var(--spacing-100, 0.5rem) var(--spacing-100, 0.5rem) var(--spacing-050, 0.25rem);
  color: var(--color-on-surface-variant);
  font-family: var(--typography-label-small-font-family);
  font-size: var(--typography-label-small-font-size);
  font-weight: var(--typography-label-small-font-weight);
  line-height: var(--typography-label-small-line-height);
  letter-spacing: var(--typography-label-small-letter-spacing);
}

.slash-item-glyph {
  display: inline-grid;
  inline-size: 1.25rem;
  place-items: center;
  color: var(--color-primary);
}

.bubble-divider {
  align-self: center;
  inline-size: 1px;
  block-size: 1.25rem;
  margin-inline: var(--spacing-025, 0.125rem);
  background: var(--color-outline-variant);
}

.bubble-ai {
  background: transparent;
  border: none;
  appearance: none;
  margin: 0;
  outline: none;
  padding: 0;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-050, 0.25rem);
  block-size: 2rem;
  padding-inline: var(--spacing-100, 0.5rem) var(--spacing-150, 0.75rem);
  color: var(--color-on-primary-container);
  cursor: pointer;
  background: var(--color-primary-container);
  border-radius: var(--shape-corner-full);
  font-family: var(--typography-label-large-font-family);
  font-size: var(--typography-label-large-font-size);
  font-weight: var(--typography-label-large-font-weight);
  line-height: var(--typography-label-large-line-height);
  letter-spacing: var(--typography-label-large-letter-spacing);
}
.bubble-ai:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.ai-tool {
  color: var(--color-primary);
}

.ai-anchor {
  position: fixed;
  inline-size: 1px;
  pointer-events: none;
  visibility: hidden;
}

.ai-panel {
  margin: 0;
  border: 0;
  inset: auto;
  position: fixed;
  top: 0;
  left: 0;
  box-sizing: border-box;
  background-color: var(--color-surface-container);
  color: var(--color-on-surface);
  border-radius: var(--shape-corner-small);
  box-shadow: var(--elevation-level2);
  display: none;
  flex-direction: column;
  gap: var(--spacing-100, 0.5rem);
  inline-size: min(30rem, 100vw - 2rem);
  max-block-size: min(28rem, var(--floating-available-height, 100vh));
  overflow-y: auto;
  padding: var(--spacing-100, 0.5rem);
  border: 1px solid var(--color-primary);
  border-radius: var(--shape-corner-medium);
}
.ai-panel:popover-open {
  display: flex;
}
.ai-panel:has(.ai-menu) {
  inline-size: 16rem;
  border-color: transparent;
}

.ai-menu {
  display: flex;
  flex-direction: column;
}

.ai-menu-item {
  background: transparent;
  border: none;
  appearance: none;
  margin: 0;
  outline: none;
  padding: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-100, 0.5rem);
  min-block-size: 2.25rem;
  padding: 0 var(--spacing-100, 0.5rem);
  color: inherit;
  text-align: start;
  cursor: pointer;
  border-radius: var(--shape-corner-extra-small);
  font-family: var(--typography-body-medium-font-family);
  font-size: var(--typography-body-medium-font-size);
  font-weight: var(--typography-body-medium-font-weight);
  line-height: var(--typography-body-medium-line-height);
  letter-spacing: var(--typography-body-medium-letter-spacing);
}
.ai-menu-item .sparkle {
  color: var(--color-primary);
}
.ai-menu-item:hover, .ai-menu-item:focus-visible {
  background-color: var(--color-secondary-container);
  color: var(--color-on-secondary-container);
}

.ai-head {
  display: flex;
  align-items: center;
  gap: var(--spacing-100, 0.5rem);
  padding-inline: var(--spacing-050, 0.25rem);
  color: var(--color-on-surface-variant);
  font-family: var(--typography-body-small-font-family);
  font-size: var(--typography-body-small-font-size);
  font-weight: var(--typography-body-small-font-weight);
  line-height: var(--typography-body-small-line-height);
  letter-spacing: var(--typography-body-small-letter-spacing);
}

.ai-head-label {
  flex: 1;
}

.ai-result {
  padding: var(--spacing-100, 0.5rem) var(--spacing-150, 0.75rem);
  background: var(--color-surface);
  border-radius: var(--shape-corner-small);
}

.ai-changes {
  margin: 0;
  padding: var(--spacing-100, 0.5rem) var(--spacing-150, 0.75rem);
  white-space: pre-wrap;
  background: var(--color-surface);
  border-radius: var(--shape-corner-small);
  font-family: var(--typography-body-medium-font-family);
  font-size: var(--typography-body-medium-font-size);
  font-weight: var(--typography-body-medium-font-weight);
  line-height: var(--typography-body-medium-line-height);
  letter-spacing: var(--typography-body-medium-letter-spacing);
}
.ai-changes del {
  color: var(--color-on-error-container);
  background: var(--color-error-container);
  text-decoration: line-through;
}
.ai-changes ins {
  color: var(--color-on-success-container);
  background: var(--color-success-container);
  text-decoration: none;
}

@media (forced-colors: active) {
  .ai-changes ins {
    text-decoration: underline;
  }
}
.ai-error {
  margin: 0;
  padding: var(--spacing-100, 0.5rem) var(--spacing-150, 0.75rem);
  color: var(--color-on-error-container);
  background: var(--color-error-container);
  border-radius: var(--shape-corner-small);
  font-family: var(--typography-body-medium-font-family);
  font-size: var(--typography-body-medium-font-size);
  font-weight: var(--typography-body-medium-font-weight);
  line-height: var(--typography-body-medium-line-height);
  letter-spacing: var(--typography-body-medium-letter-spacing);
}

.ai-instruction-row {
  display: flex;
  gap: var(--spacing-100, 0.5rem);
  align-items: center;
}

.ai-instruction {
  flex: 1;
  min-inline-size: 0;
  block-size: 2.5rem;
  padding: 0 var(--spacing-150, 0.75rem);
  color: var(--color-on-surface);
  background: var(--color-surface);
  border: 1px solid var(--color-outline);
  border-radius: var(--shape-corner-extra-small);
  font-family: var(--typography-body-medium-font-family);
  font-size: var(--typography-body-medium-font-size);
  font-weight: var(--typography-body-medium-font-weight);
  line-height: var(--typography-body-medium-line-height);
  letter-spacing: var(--typography-body-medium-letter-spacing);
}
.ai-instruction:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -1px;
}

.ai-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-050, 0.25rem);
}

.ai-spacer {
  flex: 1;
}

@media (forced-colors: active) {
  .ghost-text {
    color: GrayText;
    opacity: 1;
  }
  .ai-panel {
    border-color: CanvasText;
  }
}
.link-editor {
  margin: 0;
  border: 0;
  inset: auto;
  position: fixed;
  top: 0;
  left: 0;
  box-sizing: border-box;
  background-color: var(--color-surface-container);
  color: var(--color-on-surface);
  border-radius: var(--shape-corner-small);
  box-shadow: var(--elevation-level2);
  inline-size: min(22rem, 100vw - 2rem);
  padding: var(--spacing-150, 0.75rem);
}

.link-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-100, 0.5rem);
  margin-block-start: var(--spacing-100, 0.5rem);
}

.block-handle {
  position: fixed;
  z-index: 2;
  display: flex;
  gap: 2px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.12s ease;
}
.block-handle.visible {
  opacity: 1;
  pointer-events: auto;
}

.drop-line {
  position: fixed;
  z-index: 3;
  block-size: 2px;
  background: var(--color-primary);
  border-radius: var(--shape-corner-full);
  pointer-events: none;
  display: none;
}
.drop-line.visible {
  display: block;
}

.block-handle-button {
  background: transparent;
  border: none;
  appearance: none;
  margin: 0;
  outline: none;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  inline-size: 1.5rem;
  block-size: 1.5rem;
  border-radius: var(--shape-corner-extra-small);
  color: var(--color-on-surface-variant);
  cursor: pointer;
}
.block-handle-button:first-child {
  cursor: grab;
}
.block-handle-button:hover:not(:disabled) {
  background: var(--color-surface-container-high);
  color: var(--color-on-surface);
}
.block-handle-button:focus-visible {
  outline: 2px solid var(--color-primary);
}
.block-handle-button:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

@media (forced-colors: active) {
  .slash-menu,
  .bubble-menu,
  .link-editor {
    border: 1px solid CanvasText;
  }
  .slash-item.active {
    outline: 2px solid Highlight;
    outline-offset: -2px;
  }
}`;

/**
 * @label Markdown Editor
 * @tag wc-markdown-editor
 * @rawTag markdown-editor
 *
 * @summary A rich-text field whose value is Markdown: people format text as they type, and can view the Markdown source.
 * @overview
 * <p>Use it where a form needs more than a textarea, such as a description, notes or a release
 * note. People edit formatted text directly; the value is Markdown, so it stores as plain text and
 * shows the same way in <code>wc-markdown</code>.</p>
 *
 * <ul>
 * <li><strong>Toolbar.</strong> Text style, bold, italic, strikethrough, inline code, link, lists,
 * checklist, quote, code block, table, divider and mention. While the caret is in a table, a
 * <em>Table</em> menu adds and removes rows and columns. <code>hide-toolbar</code> hides it.</li>
 * <li><strong>Selection bubble.</strong> Selecting text shows the inline formats and link.</li>
 * <li><strong>Slash menu.</strong> Typing <code>/</code> inserts a block; Markdown shortcuts such
 * as <code>## </code>, <code>- </code> and <code>**bold**</code> work too.</li>
 * <li><strong>Block handle.</strong> Hovering a block shows a handle to drag it and a + to insert
 * one below.</li>
 * <li><strong>View source.</strong> The last toolbar button shows the Markdown, editable, in
 * <code>wc-code-editor</code>.</li>
 * </ul>
 *
 * <p><strong>Mentions.</strong> Typing a character from <code>triggers</code> (<code>@</code> by
 * default) fires <code>search</code> with <code>{ trigger, query }</code>; answer by setting
 * <code>suggestions</code>, and <code>suggestions-loading</code> while you look. A chosen mention is
 * stored as <code>[@Ana Lima](mention:usr_142)</code> and fires <code>mention</code>. Set
 * <code>triggers=""</code> to turn mentions off.</p>
 *
 * <p>The editor is form-associated. It fires <code>input</code> with <code>{ value }</code> as the
 * content changes (after <code>debounce</code> milliseconds without typing) and <code>change</code>
 * when focus leaves after an edit. <code>required</code> blocks an empty submit, and
 * <code>maxlength</code> limits the number of characters and shows a count.</p>
 *
 * <p><code>rows</code> sets the height of the empty editor in lines; it grows with the text, up to
 * <code>max-rows</code> if set, and then scrolls.</p>
 *
 * <p><strong>Read-only and disabled.</strong> <code>readonly</code> keeps the text at full contrast
 * and leaves only <strong>View source</strong> in the toolbar, which shows the Markdown read-only.
 * <code>disabled</code> dims the toolbar and the text. <code>show-readonly-badge</code> adds a
 * lock badge to the toolbar in either state.</p>
 *
 * @cssprop --rich-text-editor-background - Background behind the text.
 * @cssprop --prose-link-color - Color of links.
 * @cssprop --prose-mention-background - Background of mention chips.
 * @cssprop --prose-mention-color - Text color of mention chips.
 * @cssprop --prose-code-background - Background of inline code and code blocks.
 * @cssprop --mention-list-width - Width of the mention suggestion list.
 * @cssprop --mention-list-max-height - Maximum height of the mention suggestion list.
 *
 * @fires {CustomEvent<{value: string}>} input - Dispatched as the content changes, after `debounce` milliseconds without typing.
 * @fires {CustomEvent<{value: string}>} change - Dispatched when focus leaves the editor after an edit.
 * @fires {CustomEvent<{trigger: string, query: string}>} search - Dispatched as a mention is typed; answer with `suggestions`.
 * @fires {CustomEvent<{mention: {id: string, label: string, trigger: string}, suggestion: MentionSuggestion}>} mention - Dispatched when a suggestion is inserted as a mention.
 *
 * @example
 * ```html
 * <wc-markdown-editor
 *   label="Description"
 *   value="## Steps\n\n1. Open **billing**"
 * ></wc-markdown-editor>
 * ```
 * @tags input editor
 */
let MarkdownEditor = class MarkdownEditor extends RichTextInput {
    constructor() {
        // ── Static ────────────────────────────────────────────────────────────────
        super(...arguments);
        // ── Protected fields ──────────────────────────────────────────────────────
        this.profile = 'markdown';
        this.sourceLanguage = 'markdown';
        this.sourceIcon = 'markdown';
    }
    // ── Protected methods ─────────────────────────────────────────────────────
    readFromEditor(editor) {
        return this.isEditorEmpty(editor) ? '' : editor.getMarkdown();
    }
    contentFor(value) {
        return { content: value ?? '', contentType: 'markdown' };
    }
    defaultPlaceholder() {
        return this.i18n.t('slashCommandsPlaceholder');
    }
};
MarkdownEditor.styles = [css_248z];
MarkdownEditor = __decorate([
    IndividualComponent
], MarkdownEditor);

export { MarkdownEditor };
//# sourceMappingURL=markdown-editor.js.map
