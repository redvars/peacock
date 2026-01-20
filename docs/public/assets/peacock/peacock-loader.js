import { I as Icon } from './index-1wpxQtrZ.js';

class LoaderUtils {
    constructor(loaderConfig) {
        this.loaderConfig = loaderConfig;
        this._loaderConfig = loaderConfig;
    }
    static registerComponent(tagName, CustomElementClass) {
        if (CustomElementClass && !customElements.get(tagName)) {
            customElements.define(tagName, CustomElementClass);
        }
    }
    start() {
        this.eagerLoadComponents();
        this.lazyLoadComponents(document);
    }
    eagerLoadComponents() {
        if (!this._loaderConfig.components)
            return;
        for (const [name, value] of Object.entries(this._loaderConfig.components)) {
            if (value.CustomElementClass)
                LoaderUtils.registerComponent(this.getFullTagName(name), value.CustomElementClass);
        }
    }
    getFullTagName(name) {
        return `${this._loaderConfig.prefix}-${name}`;
    }
    async registerAsync(tagName) {
        if (customElements.get(tagName))
            return;
        const baseName = tagName.replace(`${this._loaderConfig.prefix}-`, '');
        if (!this._loaderConfig.components)
            return;
        const config = this._loaderConfig.components[baseName];
        if (!config || !config.importPath)
            return;
        try {
            const module = await import(config.importPath);
            // Runtime definition: grabbing the class from the module
            const CustomElementClass = module.default || module[Object.keys(module)[0]];
            if (CustomElementClass && !customElements.get(tagName)) {
                customElements.define(tagName, CustomElementClass);
            }
            // Handle dependencies recursively
            if (config.dependencies) {
                for (const dep of config.dependencies) {
                    // eslint-disable-next-line no-await-in-loop
                    await this.registerAsync(this.getFullTagName(dep));
                }
            }
        }
        catch (error) {
            console.error(`Unable to load <${tagName}> from ${config.importPath}`, error);
        }
    }
    async load(root) {
        const rootTagName = root instanceof Element ? root.tagName.toLowerCase() : '';
        const tags = Array.from(root.querySelectorAll(':not(:defined)')).map(el => el.tagName.toLowerCase());
        if (rootTagName.includes('-') && !customElements.get(rootTagName)) {
            tags.push(rootTagName);
        }
        const tagsToRegister = [...new Set(tags)];
        await Promise.allSettled(tagsToRegister.map(tagName => this.registerAsync(tagName)));
    }
    lazyLoadComponents(root) {
        this._observer = new MutationObserver(mutations => {
            for (const { addedNodes } of mutations) {
                for (const node of addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.load(node);
                    }
                }
            }
        });
        const target = root instanceof Document ? root.documentElement : root;
        this.load(target);
        this._observer.observe(target, {
            subtree: true,
            childList: true,
        });
    }
}

// Eager loaded
const loaderConfig = {
    prefix: 'p',
    components: {
        icon: {
            CustomElementClass: Icon,
        },
        avatar: {
            importPath: './avatar/avatar.js',
        },
    },
};
new LoaderUtils(loaderConfig).start();
//# sourceMappingURL=peacock-loader.js.map
