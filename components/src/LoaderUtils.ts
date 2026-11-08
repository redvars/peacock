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

/** Marks `Element.prototype` once its `attachShadow` is wrapped. */
const PATCHED = Symbol.for('peacock.attachShadowPatched');

const warnedTags = new Set<string>();

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
    if (!CustomElementClass) return;
    const existing = customElements.get(tagName);
    if (!existing) {
      customElements.define(tagName, CustomElementClass);
    } else if (existing !== CustomElementClass) {
      LoaderUtils.warnTaken(tagName);
    }
  }

  /**
   * Warns once that a tag is already defined by other code, such as a second copy or another
   * version of Peacock on the page. The existing definition stays; Peacock does not replace it.
   */
  static warnTaken(tagName: string) {
    if (warnedTags.has(tagName)) return;
    warnedTags.add(tagName);
    // eslint-disable-next-line no-console
    console.warn(
      `[peacock] <${tagName}> is already defined by other code, so Peacock's version was not registered. Load one copy of Peacock per page.`,
    );
  }

  /**
   * Defines the eager components and starts loading lazy ones as they appear.
   *
   * By default it also wraps `Element.prototype.attachShadow` so components rendered inside any
   * shadow root load too. Pass `watchShadowRoots: false` (or load `loader.js?no-shadow-watch`) to
   * leave `attachShadow` alone, and call `loadComponents(shadowRoot)` for your own shadow roots.
   */
  start({ watchShadowRoots = true }: { watchShadowRoots?: boolean } = {}) {
    // Before the eager components are defined, so their shadow roots are watched too.
    if (watchShadowRoots) this.watchShadowRoots();
    this.eagerLoadComponents();
    this.lazyLoadComponents(document);
  }

  /**
   * Watches every shadow root attached from now on, as it is attached, so lazy components that a
   * component renders in its shadow root load as they do in the document. Patches
   * `attachShadow` once per page, even when two loaders run.
   */
  watchShadowRoots() {
    const proto = Element.prototype as Element & { [PATCHED]?: boolean };
    if (proto[PATCHED]) return;
    proto[PATCHED] = true;

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

      // Runtime definition: the module's element class. A module may also export helpers (such as
      // a list of defaults), so pick the export that is a custom element class.
      const CustomElementClass =
        module.default ||
        Object.values(module).find(
          value =>
            typeof value === 'function' &&
            (value as { prototype: unknown }).prototype instanceof HTMLElement,
        ) ||
        module[Object.keys(module)[0]];

      LoaderUtils.registerComponent(tagName, CustomElementClass);

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
