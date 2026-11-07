/**
 * Loads the Peacock components in `root` (a shadow root, element or document) and those added to
 * it later. Only needed with `loader.js?no-shadow-watch`.
 */
export declare function loadComponents(root: Document | Element | ShadowRoot): void;
export { setPeacockStrings, defaultStrings, } from '@/__internal/i18n/strings.js';
export type { PeacockStrings } from '@/__internal/i18n/strings.js';
