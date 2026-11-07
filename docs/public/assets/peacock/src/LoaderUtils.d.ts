interface ComponentConfig {
    CustomElementClass?: any;
    importPath?: string;
    dependencies?: string[];
}
interface LoaderConfig {
    components?: Record<string, ComponentConfig>;
}
export { LoaderConfig };
type LoadRoot = Element | Document | DocumentFragment;
export declare class LoaderUtils {
    private _loaderConfig;
    private _observer;
    private _observed;
    constructor(loaderConfig: LoaderConfig);
    static registerComponent(tagName: string, CustomElementClass: any): void;
    /**
     * Warns once that a tag is already defined by other code, such as a second copy or another
     * version of Peacock on the page. The existing definition stays; Peacock does not replace it.
     */
    static warnTaken(tagName: string): void;
    /**
     * Defines the eager components and starts loading lazy ones as they appear.
     *
     * By default it also wraps `Element.prototype.attachShadow` so components rendered inside any
     * shadow root load too. Pass `watchShadowRoots: false` (or load `loader.js?no-shadow-watch`) to
     * leave `attachShadow` alone, and call `loadComponents(shadowRoot)` for your own shadow roots.
     */
    start({ watchShadowRoots }?: {
        watchShadowRoots?: boolean;
    }): void;
    /**
     * Watches every shadow root attached from now on, as it is attached, so lazy components that a
     * component renders in its shadow root load as they do in the document. Patches
     * `attachShadow` once per page, even when two loaders run.
     */
    watchShadowRoots(): void;
    eagerLoadComponents(): void;
    registerAsync(tagName: string): Promise<void>;
    load(root: LoadRoot): Promise<void>;
    /** Loads the lazy components in `root` (a document or a shadow root) and those added later. */
    lazyLoadComponents(root: Document | Element | ShadowRoot): void;
}
