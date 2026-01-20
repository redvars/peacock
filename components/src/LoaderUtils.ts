interface ComponentConfig {
  CustomElementClass?: any; // earger load
  importPath?: string; // lazy load
  dependencies?: string[];
}

interface LoaderConfig {
  prefix?: string;
  components?: Record<string, ComponentConfig>;
}

export { LoaderConfig };

export class LoaderUtils {
  private _loaderConfig: LoaderConfig;
  private _observer: MutationObserver | undefined;

  constructor(private loaderConfig: LoaderConfig) {
    this._loaderConfig = loaderConfig;
  }

  static registerComponent(tagName: string, CustomElementClass: any) {
    if (CustomElementClass && !customElements.get(tagName)) {
      customElements.define(tagName, CustomElementClass);
    }
  }

  start() {
    this.eagerLoadComponents();
    this.lazyLoadComponents(document);
  }

  eagerLoadComponents() {
    if (!this._loaderConfig.components) return;
    for (const [name, value] of Object.entries(this._loaderConfig.components)) {
      if (value.CustomElementClass)
        LoaderUtils.registerComponent(
          this.getFullTagName(name),
          value.CustomElementClass,
        );
    }
  }

  getFullTagName(name: string) {
    return `${this._loaderConfig.prefix}-${name}`;
  }

  async registerAsync(tagName: string): Promise<void> {
    if (customElements.get(tagName)) return;

    const baseName = tagName.replace(`${this._loaderConfig.prefix}-`, '');

    if (!this._loaderConfig.components) return;

    const config = this._loaderConfig.components[baseName];
    if (!config || !config.importPath) return;

    try {
      const module = await import(config.importPath);

      // Runtime definition: grabbing the class from the module
      const CustomElementClass =
        module.default || module[Object.keys(module)[0]];

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
    } catch (error) {
      console.error(
        `Unable to load <${tagName}> from ${config.importPath}`,
        error,
      );
    }
  }

  async load(root: Element | Document): Promise<void> {
    const rootTagName =
      root instanceof Element ? root.tagName.toLowerCase() : '';

    const tags = Array.from(root.querySelectorAll(':not(:defined)')).map(el =>
      el.tagName.toLowerCase(),
    );

    if (rootTagName.includes('-') && !customElements.get(rootTagName)) {
      tags.push(rootTagName);
    }

    const tagsToRegister = [...new Set(tags)];
    await Promise.allSettled(
      tagsToRegister.map(tagName => this.registerAsync(tagName)),
    );
  }

  lazyLoadComponents(root: any) {
    this._observer = new MutationObserver(mutations => {
      for (const { addedNodes } of mutations) {
        for (const node of addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.load(node as Element);
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
