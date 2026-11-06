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
  'footer',
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
  'empty-state',
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
  'navigation-bar-item',
  'navigation-drawer-item',
  'navigation-rail',
  'notification',
  'number-counter',
  'number-field',
  'pagination',
  'popover',
  'radio-group',
  'ripple',
  'search',
  'segmented-button-group',
  'select',
  'sidebar-menu',
  'slider',
  'snackbar',
  'spinner',
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
  'url-field',
] as const;

export type ComplexPreview = (typeof COMPLEX_PREVIEWS)[number];

export function isComplexPreview(rawTag: string): rawTag is ComplexPreview {
  return (COMPLEX_PREVIEWS as readonly string[]).includes(rawTag);
}

export function isControlPreview(rawTag: string): boolean {
  return (CONTROL_PREVIEWS as readonly string[]).includes(rawTag);
}
