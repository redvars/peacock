// Every card on the Components overview shows a wireframe instead of the live example, in the
// style of the Blocks previews. Complex components are drawn in components/ComponentPreview.astro,
// the rest in components/ComponentPreviewControls.astro. A component missing from both shows its
// fallback icon until it gets one.

/** Components drawn in ComponentPreview.astro. */
export const COMPLEX_PREVIEWS = [
  'bottom-sheet',
  'calendar',
  'code-editor',
  'code-highlighter',
  'color-picker',
  'condition-builder',
  'flow',
  'focus-ring',
  'html-editor',
  'image',
  'markdown-editor',
  'modal',
  'navigation-drawer',
  'notification-manager',
  'side-sheet',
  'skeleton',
  'svg',
  'table',
] as const;

/** Components drawn in ComponentPreviewControls.astro. */
export const CONTROL_PREVIEWS = [
  'accordion',
  'alert',
  'app-bar',
  'avatar',
  'badge',
  'breadcrumb',
  'button',
  'button-group',
  'card',
  'checkbox',
  'chip',
  'circular-progress',
  'clock',
  'color-field',
  'container',
  'date-field',
  'date-picker',
  'datetime-field',
  'divider',
  'dropdown-button',
  'elevation',
  'illustration',
  'redvars-loader',
  'fab',
  'field',
  'icon',
  'icon-button',
  'input',
  'item',
  'linear-progress',
  'link',
  'list',
  'menu',
  'navigation-bar',
  'navigation-rail',
  'number-counter',
  'number-field',
  'pagination',
  'popover',
  'radio-group',
  'ripple',
  'search',
  'segmented-button-group',
  'select',
  'slider',
  'snackbar',
  'split-button',
  'switch',
  'tabs',
  'tag',
  'textarea',
  'time-field',
  'time-picker',
  'timeline',
  'toolbar',
  'tooltip',
  'tree',
  'url-field',
] as const;

export type ComplexPreview = (typeof COMPLEX_PREVIEWS)[number];

export function isComplexPreview(rawTag: string): rawTag is ComplexPreview {
  return (COMPLEX_PREVIEWS as readonly string[]).includes(rawTag);
}

export function isControlPreview(rawTag: string): boolean {
  return (CONTROL_PREVIEWS as readonly string[]).includes(rawTag);
}

/** Components added in 4.0, drawn in ComponentPreviewV4A.astro (inputs, forms, small controls). */
export const V4_PREVIEWS_A = [
  'anchor-nav',
  'checkbox-group',
  'chip-set',
  'copy-button',
  'currency-field',
  'date-range-field',
  'fieldset',
  'file-upload',
  'filter-bar',
  'form',
  'inline-edit',
  'kbd',
  'link-button',
  'listbox',
  'mention-input',
  'password-field',
  'password-rules',
  'phone-field',
  'pin-input',
  'rating',
  'relative-time',
  'signature-pad',
  'stepper',
  'transfer-list',
] as const;

/** Components added in 4.0, drawn in ComponentPreviewV4B.astro (layout, data, overlays, people). */
export const V4_PREVIEWS_B = [
  'app-shell',
  'avatar-group',
  'banner',
  'command-palette',
  'comment-thread',
  'confirm-dialog',
  'description-list',
  'diff-viewer',
  'grid',
  'hover-card',
  'json-viewer',
  'kanban',
  'notification-center',
  'page-header',
  'presence-indicator',
  'resizable-panels',
  'scroll-area',
  'sparkline',
  'stack',
  'stat',
  'status-indicator',
  'tour',
  'user-menu',
  'virtual-list',
  'workspace-switcher',
] as const;

export function isV4PreviewA(rawTag: string): boolean {
  return (V4_PREVIEWS_A as readonly string[]).includes(rawTag);
}

export function isV4PreviewB(rawTag: string): boolean {
  return (V4_PREVIEWS_B as readonly string[]).includes(rawTag);
}
