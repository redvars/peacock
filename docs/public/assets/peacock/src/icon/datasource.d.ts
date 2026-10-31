/**
 * Loads a provider's icons from `base`, a folder holding `<name>.svg`, instead of cdn.jsdelivr.net:
 * for pages that must not leave their own origin, such as an intranet or a page whose content
 * security policy allows only `connect-src 'self'`. A relative `base` resolves against the page.
 * `loader-full.js` does this for Material Symbols with the icons it ships in `icons/`.
 */
export declare function setIconBase(provider: string, base: string | URL): void;
export declare function fetchSVG(url: string): Promise<string>;
export declare function fetchIcon(name: string, provider?: string): Promise<string>;
