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
    start(): void;
    /**
     * Watches every shadow root attached from now on, as it is attached, so lazy components that a
     * component renders in its shadow root load as they do in the document.
     */
    watchShadowRoots(): void;
    eagerLoadComponents(): void;
    registerAsync(tagName: string): Promise<void>;
    load(root: LoadRoot): Promise<void>;
    /** Loads the lazy components in `root` (a document or a shadow root) and those added later. */
    lazyLoadComponents(root: Document | Element | ShadowRoot): void;
}
