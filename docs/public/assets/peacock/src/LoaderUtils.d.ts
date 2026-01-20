interface ComponentConfig {
    CustomElementClass?: any;
    importPath?: string;
    dependencies?: string[];
}
interface LoaderConfig {
    prefix?: string;
    components?: Record<string, ComponentConfig>;
}
export { LoaderConfig };
export declare class LoaderUtils {
    private loaderConfig;
    private _loaderConfig;
    private _observer;
    constructor(loaderConfig: LoaderConfig);
    static registerComponent(tagName: string, CustomElementClass: any): void;
    start(): void;
    eagerLoadComponents(): void;
    getFullTagName(name: string): string;
    registerAsync(tagName: string): Promise<void>;
    load(root: Element | Document): Promise<void>;
    lazyLoadComponents(root: any): void;
}
