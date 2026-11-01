interface ComponentConfig {
  CustomElementClass?: any; // earger load
  importPath?: string; // lazy load
  dependencies?: string[];
}

interface LoaderConfig {
  components?: Record<string, ComponentConfig>;
}

export { LoaderConfig };

type LoadRoot = Element | Document | DocumentFragment;

export class LoaderUtils {
  private _loaderConfig: LoaderConfig;

  private _observer = new MutationObserver(mutations => {
    for (const { addedNodes } of mutations) {
      for (const node of addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          this.load(node as Element);
        }
      }
    }
  });

  private _observed = new WeakSet<Node>();

  constructor(loaderConfig: LoaderConfig) {
    this._loaderConfig = loaderConfig;
  }

  static registerComponent(tagName: string, CustomElementClass: any) {
    if (CustomElementClass && !customElements.get(tagName)) {
      customElements.define(tagName, CustomElementClass);
    }
  }

  start() {
    // Before the eager components are defined, so their shadow roots are watched too.
    this.watchShadowRoots();
    this.eagerLoadComponents();
    this.lazyLoadComponents(document);
  }

  /**
   * Watches every shadow root attached from now on, as it is attached, so lazy components that a
   * component renders in its shadow root load as they do in the document.
   */
  watchShadowRoots() {
    const watch = (shadowRoot: ShadowRoot) =>
      this.lazyLoadComponents(shadowRoot);
    const { attachShadow } = Element.prototype;
    Element.prototype.attachShadow = function attachShadowAndWatch(init) {
      const shadowRoot = attachShadow.call(this, init);
      watch(shadowRoot);
      return shadowRoot;
    };
  }

  eagerLoadComponents() {
    if (!this._loaderConfig.components) return;
    for (const [name, value] of Object.entries(this._loaderConfig.components)) {
      if (value.CustomElementClass)
        LoaderUtils.registerComponent(name, value.CustomElementClass);
    }
  }

  async registerAsync(tagName: string): Promise<void> {
    if (customElements.get(tagName)) return;

    if (!this._loaderConfig.components) return;

    const config = this._loaderConfig.components[tagName];
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
          await this.registerAsync(dep);
        }
      }
    } catch (error) {
      console.error(
        `Unable to load <${tagName}> from ${config.importPath}`,
        error,
      );
    }
  }

  async load(root: LoadRoot): Promise<void> {
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

  /** Loads the lazy components in `root` (a document or a shadow root) and those added later. */
  lazyLoadComponents(root: Document | Element | ShadowRoot) {
    const target = root instanceof Document ? root.documentElement : root;
    if (this._observed.has(target)) return;
    this._observed.add(target);

    this.load(target);

    this._observer.observe(target, {
      subtree: true,
      childList: true,
    });

    // Shadow roots attached before watchShadowRoots() ran; later ones are watched as attached.
    for (const element of target.querySelectorAll('*')) {
      if (element.shadowRoot) this.lazyLoadComponents(element.shadowRoot);
    }
  }
}
