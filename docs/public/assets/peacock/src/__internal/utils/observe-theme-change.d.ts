type ThemeChangeCallback = () => void;
/**
 * Calls back when the theme may have changed: `data-theme` on the root element changed, or the
 * system `prefers-color-scheme` flipped. Returns a function that stops the callback.
 */
export declare const observeThemeChange: (callback: ThemeChangeCallback) => (() => void);
export {};
