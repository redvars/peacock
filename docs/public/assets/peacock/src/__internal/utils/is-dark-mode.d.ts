/**
 * Whether Peacock is showing its dark theme, the same way the tokens decide it: `data-theme="dark"`
 * or `"light"` on the root element wins; without it, the system `prefers-color-scheme` applies.
 */
export declare function isDarkMode(): boolean;
