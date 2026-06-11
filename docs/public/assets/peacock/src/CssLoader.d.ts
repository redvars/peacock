declare function loadCSS(url: string, options?: any): Promise<CSSStyleSheet>;
declare function loadMultipleCSS(urls: string[], options?: any): Promise<CSSStyleSheet[]>;
declare function unloadCSS(url: string): boolean;
declare function clearAllCSS(): void;
export { loadCSS, loadMultipleCSS, unloadCSS, clearAllCSS };
