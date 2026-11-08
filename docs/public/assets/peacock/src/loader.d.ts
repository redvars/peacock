/**
 * Loads the Peacock components in `root` (a shadow root, element or document) and those added to
 * it later. Only needed with `loader.js?no-shadow-watch`.
 */
export declare function loadComponents(root: Document | Element | ShadowRoot): void;
export { setPeacockStrings, defaultStrings, } from './__internal/i18n/strings.js';
export type { PeacockStrings } from './__internal/i18n/strings.js';
export { setPeacockAi, peacockAi, onPeacockAiChange, isAiAvailable, } from './__internal/ai/config.js';
export { readStream } from './__internal/ai/stream.js';
export { generativeViewSchema } from './generative-view/schema.js';
export type { PeacockAiConfig, PeacockAiProvider, } from './__internal/ai/types.js';
